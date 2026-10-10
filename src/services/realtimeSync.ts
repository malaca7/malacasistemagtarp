import { supabase } from '../lib/supabase';
import {
  calculateWandererCycle,
  WandererCycleInfo,
  getLocalWandererCycleState,
  saveLocalWandererCycleState,
} from '../utils/wandererCycle';
import { getAnonymousUserId } from '../utils/anonymousId';

export type WandererSyncAction = 'vote_added' | 'vote_removed' | 'cycle_reset';

export interface WandererSyncPayload {
  action: WandererSyncAction;
  serverId?: string;
  locationId?: string;
  cycleKey: string;
  count?: number;
  reason?: string;
  username?: string;
  confirmed_at?: string;
  user?: any;
  timestamp: number;
}

export type RealtimeChangeType = 'INSERT' | 'UPDATE' | 'DELETE' | 'SYNC';

export interface RealtimeEntityPayload<T = any> {
  entity: 'locations' | 'comments' | 'suggestions' | 'servers' | 'systems' | 'wanderer' | 'profiles' | 'settings';
  action: RealtimeChangeType;
  serverId?: string;
  data?: T;
  id?: string;
  timestamp: number;
}

type SyncCallback = (payload: WandererSyncPayload) => void;
type ResetCallback = (info: WandererCycleInfo, reason: string) => void;
type EntityCallback<T = any> = (payload: RealtimeEntityPayload<T>) => void;
type PresenceCallback = (counts: Record<string, number>) => void;

class RealtimeSyncManager {
  private broadcastChannel: BroadcastChannel | null = null;
  private changeListeners: Set<SyncCallback> = new Set();
  private resetListeners: Set<ResetCallback> = new Set();
  private locationListeners: Set<EntityCallback> = new Set();
  private commentListeners: Set<EntityCallback> = new Set();
  private suggestionListeners: Set<EntityCallback> = new Set();
  private serverListeners: Set<EntityCallback> = new Set();
  private systemListeners: Set<EntityCallback> = new Set();
  private profileListeners: Set<EntityCallback> = new Set();
  private settingsListeners: Set<EntityCallback> = new Set();
  private presenceListeners: Set<PresenceCallback> = new Set();

  private supabaseChannel: any = null;
  private currentCycleInfo: WandererCycleInfo;
  private watcherTimer: any = null;
  private isConnected: boolean = false;
  private clientSessionId: string;
  private myConfirmedIds: string[] = [];
  private presenceCounts: Record<string, number> = {};
  private broadcastCounts: Record<string, number> = {};

  constructor() {
    this.currentCycleInfo = calculateWandererCycle();
    this.clientSessionId = `client_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    
    // Inicializa com dados persistidos do ciclo atual
    const initialCycleState = getLocalWandererCycleState();
    this.myConfirmedIds = initialCycleState.userConfirmedIds || [];
    this.broadcastCounts = { ...(initialCycleState.counts || {}) };

    this.initBroadcastChannel();
    this.initStorageListener();
    this.initSupabaseChannel();
    this.startCycleWatcher();
    this.initWindowFocusReconnect();
  }

  private initBroadcastChannel() {
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        this.broadcastChannel = new BroadcastChannel('malaca_map_realtime_sync');
        this.broadcastChannel.onmessage = (event) => {
          if (event?.data) {
            this.handleIncomingBroadcast(event.data);
          }
        };
      }
    } catch (e) {
      console.warn('BroadcastChannel not supported or error:', e);
    }
  }

  private initStorageListener() {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === 'malaca_map_realtime_event' && e.newValue) {
          try {
            const payload = JSON.parse(e.newValue);
            this.handleIncomingBroadcast(payload);
          } catch {}
        }
      });
    }
  }

  private initWindowFocusReconnect() {
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', () => {
        // Re-check cycle and channel health on tab focus
        const fresh = calculateWandererCycle();
        if (fresh.cycleKey !== this.currentCycleInfo.cycleKey) {
          this.broadcastCycleReset('automatic_rotation_06_18');
        } else {
          // Re-announce presence on tab focus
          this.syncPresence(this.myConfirmedIds);
          this.requestStateSnapshot();
        }
      });
    }
  }

  private initSupabaseChannel() {
    try {
      this.supabaseChannel = supabase
        .channel('malaca_realtime_global_hub', {
          config: {
            broadcast: { self: false },
            presence: { key: this.clientSessionId },
          },
        })
        // 1. Supabase Realtime Presence (Sincroniza todos os jogadores conectados)
        .on('presence', { event: 'sync' }, () => {
          this.handlePresenceSync();
        })
        .on('presence', { event: 'join' }, () => {
          this.handlePresenceSync();
        })
        .on('presence', { event: 'leave' }, () => {
          this.handlePresenceSync();
        })
        // 2. Broadcast de votos em tempo real (<50ms de latência)
        .on('broadcast', { event: 'wanderer_sync' }, (response) => {
          if (response?.payload) {
            this.handleIncomingSync(response.payload as WandererSyncPayload);
          }
        })
        // 3. Snapshot de estado entre pares (para novos visitantes)
        .on('broadcast', { event: 'request_state' }, () => {
          this.sendStateSnapshot();
        })
        .on('broadcast', { event: 'state_snapshot' }, (response) => {
          if (response?.payload?.counts) {
            this.handleIncomingSnapshot(response.payload.counts);
          }
        })
        // 4. Broadcast de Entidades (Pins, Comentários, Sugestões, Opções)
        .on('broadcast', { event: 'entity_sync' }, (response) => {
          if (response?.payload) {
            this.handleIncomingEntitySync(response.payload as RealtimeEntityPayload);
          }
        })
        .on('broadcast', { event: 'servers_updated' }, (response) => {
          if (response?.payload?.servers) {
            this.notifyEntityChange('servers', {
              entity: 'servers',
              action: 'SYNC',
              data: response.payload.servers,
              timestamp: Date.now(),
            });
          }
        })
        .on('broadcast', { event: 'systems_updated' }, (response) => {
          if (response?.payload?.systems) {
            this.notifyEntityChange('systems', {
              entity: 'systems',
              action: 'SYNC',
              data: response.payload.systems,
              timestamp: Date.now(),
            });
          }
        })
        .on('broadcast', { event: 'settings_updated' }, (response) => {
          this.notifyEntityChange('settings', {
            entity: 'settings',
            action: 'SYNC',
            data: response?.payload,
            timestamp: Date.now(),
          });
        })
        .on('broadcast', { event: 'wanderer_cycle_reset' }, (response) => {
          this.broadcastCycleReset(response?.payload?.reason || 'admin_cycle_reset');
        })
        // 5. Postgres Changes (Se as tabelas existirem no Supabase)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'wanderer_confirmations' },
          (payload) => {
            const current = calculateWandererCycle();
            this.notifyWandererChange({
              action: payload.eventType === 'DELETE' ? 'vote_removed' : 'vote_added',
              locationId: (payload.new as any)?.location_id || (payload.old as any)?.location_id,
              cycleKey: current.cycleKey,
              timestamp: Date.now(),
            });
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'map_locations' },
          (payload) => {
            this.notifyEntityChange('locations', {
              entity: 'locations',
              action: payload.eventType as RealtimeChangeType,
              id: (payload.new as any)?.id || (payload.old as any)?.id,
              serverId: (payload.new as any)?.server_id || (payload.old as any)?.server_id,
              data: payload.new || payload.old,
              timestamp: Date.now(),
            });
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'comments' },
          (payload) => {
            this.notifyEntityChange('comments', {
              entity: 'comments',
              action: payload.eventType as RealtimeChangeType,
              id: (payload.new as any)?.id || (payload.old as any)?.id,
              serverId: (payload.new as any)?.server_id || (payload.old as any)?.server_id,
              data: payload.new || payload.old,
              timestamp: Date.now(),
            });
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'suggestions' },
          (payload) => {
            this.notifyEntityChange('suggestions', {
              entity: 'suggestions',
              action: payload.eventType as RealtimeChangeType,
              id: (payload.new as any)?.id || (payload.old as any)?.id,
              serverId: (payload.new as any)?.server_id || (payload.old as any)?.server_id,
              data: payload.new || payload.old,
              timestamp: Date.now(),
            });
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'servers' },
          (payload) => {
            this.notifyEntityChange('servers', {
              entity: 'servers',
              action: payload.eventType as RealtimeChangeType,
              id: (payload.new as any)?.id || (payload.old as any)?.id,
              data: payload.new || payload.old,
              timestamp: Date.now(),
            });
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'systems' },
          (payload) => {
            this.notifyEntityChange('systems', {
              entity: 'systems',
              action: payload.eventType as RealtimeChangeType,
              id: (payload.new as any)?.id || (payload.old as any)?.id,
              data: payload.new || payload.old,
              timestamp: Date.now(),
            });
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'profiles' },
          (payload) => {
            this.notifyEntityChange('profiles', {
              entity: 'profiles',
              action: payload.eventType as RealtimeChangeType,
              id: (payload.new as any)?.id || (payload.old as any)?.id,
              data: payload.new || payload.old,
              timestamp: Date.now(),
            });
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'platform_settings' },
          (payload) => {
            this.notifyEntityChange('settings', {
              entity: 'settings',
              action: payload.eventType as RealtimeChangeType,
              id: (payload.new as any)?.id || (payload.old as any)?.id,
              data: payload.new || payload.old,
              timestamp: Date.now(),
            });
          }
        )
        .subscribe((status) => {
          this.isConnected = status === 'SUBSCRIBED';
          if (this.isConnected) {
            // Sincroniza presença imediatamente após conexão
            this.syncPresence(this.myConfirmedIds);
            // Pede votos atuais de outros usuários conectados
            this.requestStateSnapshot();
          }
        });
    } catch (e) {
      console.warn('Supabase Realtime Channel init error:', e);
    }
  }

  private handlePresenceSync() {
    if (!this.supabaseChannel) return;
    try {
      const state = this.supabaseChannel.presenceState();
      const counts: Record<string, number> = {};

      Object.values(state).forEach((presences: any) => {
        if (Array.isArray(presences)) {
          presences.forEach((p) => {
            // Aceita presenças do ciclo atual ou recentes (tolerância a pequenos desvios de fuso)
            const isCurrent =
              !p.cycle_key ||
              p.cycle_key === this.currentCycleInfo.cycleKey ||
              (p.updated_at && Date.now() - p.updated_at < 12 * 3600 * 1000);

            if (isCurrent && Array.isArray(p.confirmed_ids)) {
              p.confirmed_ids.forEach((id: string) => {
                counts[id] = (counts[id] || 0) + 1;
              });
            }
          });
        }
      });

      this.presenceCounts = counts;
      const combined = this.getAggregatedCounts();

      // Persiste no ciclo local para manter consistência
      const localState = getLocalWandererCycleState();
      Object.entries(combined).forEach(([id, val]) => {
        localState.counts[id] = Math.max(localState.counts[id] || 0, val);
      });
      saveLocalWandererCycleState(localState);

      this.presenceListeners.forEach((cb) => {
        try {
          cb(combined);
        } catch (e) {
          console.error('Error in presenceListener:', e);
        }
      });
    } catch (e) {
      console.warn('Error processing presenceState:', e);
    }
  }

  private sendStateSnapshot() {
    const combined = this.getAggregatedCounts();
    if (Object.keys(combined).length === 0) return;

    try {
      if (this.supabaseChannel && this.isConnected) {
        this.supabaseChannel.send({
          type: 'broadcast',
          event: 'state_snapshot',
          payload: { counts: combined, timestamp: Date.now() },
        });
      }
    } catch {}
  }

  private requestStateSnapshot() {
    try {
      if (this.supabaseChannel && this.isConnected) {
        this.supabaseChannel.send({
          type: 'broadcast',
          event: 'request_state',
          payload: { clientId: this.clientSessionId },
        });
      }
    } catch {}
  }

  private handleIncomingSnapshot(counts: Record<string, number>) {
    if (!counts || typeof counts !== 'object') return;
    Object.entries(counts).forEach(([id, val]) => {
      this.broadcastCounts[id] = Math.max(this.broadcastCounts[id] || 0, val);
    });

    const combined = this.getAggregatedCounts();
    const localState = getLocalWandererCycleState();
    Object.entries(combined).forEach(([id, val]) => {
      localState.counts[id] = Math.max(localState.counts[id] || 0, val);
    });
    saveLocalWandererCycleState(localState);

    this.presenceListeners.forEach((cb) => {
      try {
        cb(combined);
      } catch (e) {
        console.error('Error in presenceListener (snapshot):', e);
      }
    });
  }

  private startCycleWatcher() {
    if (typeof window === 'undefined') return;

    this.watcherTimer = setInterval(() => {
      const freshCycle = calculateWandererCycle();
      if (freshCycle.cycleKey !== this.currentCycleInfo.cycleKey) {
        this.currentCycleInfo = freshCycle;
        this.broadcastCounts = {};
        this.presenceCounts = {};
        this.myConfirmedIds = [];
        this.broadcastCycleReset('automatic_rotation_06_18');
      }
    }, 1000);
  }

  private handleIncomingBroadcast(data: any) {
    if (!data) return;
    if (data.entity) {
      this.handleIncomingEntitySync(data as RealtimeEntityPayload);
    } else if (data.action) {
      this.handleIncomingSync(data as WandererSyncPayload);
    }
  }

  private handleIncomingSync(payload: WandererSyncPayload) {
    if (!payload || !payload.action) return;

    if (payload.action === 'cycle_reset') {
      this.currentCycleInfo = calculateWandererCycle();
      this.broadcastCounts = {};
      this.presenceCounts = {};
      this.myConfirmedIds = [];
      this.resetListeners.forEach((cb) => {
        try {
          cb(this.currentCycleInfo, payload.reason || 'cycle_reset');
        } catch (e) {
          console.error('Error in resetListener:', e);
        }
      });
    }

    if (payload.locationId) {
      if (typeof payload.count === 'number') {
        this.broadcastCounts[payload.locationId] = payload.count;
      } else if (payload.action === 'vote_added') {
        this.broadcastCounts[payload.locationId] = (this.broadcastCounts[payload.locationId] || 0) + 1;
      } else if (payload.action === 'vote_removed') {
        this.broadcastCounts[payload.locationId] = Math.max(0, (this.broadcastCounts[payload.locationId] || 1) - 1);
      }

      const localState = getLocalWandererCycleState();
      localState.counts[payload.locationId] = this.broadcastCounts[payload.locationId];
      if (payload.action === 'vote_added') {
        const uName = payload.username || payload.user?.username;
        if (uName) {
          if (!localState.latestConfirmations) localState.latestConfirmations = {};
          localState.latestConfirmations[payload.locationId] = {
            username: uName,
            confirmed_at: payload.confirmed_at || new Date().toISOString(),
          };
        }
        if (payload.user) {
          if (!localState.confirmedUsersByLocation) localState.confirmedUsersByLocation = {};
          if (!localState.confirmedUsersByLocation[payload.locationId]) {
            localState.confirmedUsersByLocation[payload.locationId] = [];
          }
          const list = localState.confirmedUsersByLocation[payload.locationId];
          if (!list.some((u: any) => u.username === payload.user.username)) {
            list.unshift(payload.user);
          }
        }
      } else if (payload.action === 'vote_removed' && payload.username) {
        if (localState.confirmedUsersByLocation && localState.confirmedUsersByLocation[payload.locationId]) {
          localState.confirmedUsersByLocation[payload.locationId] = localState.confirmedUsersByLocation[payload.locationId].filter(
            (u: any) => u.username !== payload.username
          );
        }
      }
      saveLocalWandererCycleState(localState);
    }

    this.changeListeners.forEach((cb) => {
      try {
        cb(payload);
      } catch (e) {
        console.error('Error in changeListener:', e);
      }
    });
  }

  private handleIncomingEntitySync(payload: RealtimeEntityPayload) {
    if (!payload || !payload.entity) return;
    this.notifyEntityChange(payload.entity, payload);
  }

  private notifyWandererChange(payload: WandererSyncPayload) {
    this.changeListeners.forEach((cb) => {
      try {
        cb(payload);
      } catch (e) {
        console.error('Error in changeListener:', e);
      }
    });
  }

  private notifyEntityChange(entity: string, payload: RealtimeEntityPayload) {
    let targetSet: Set<EntityCallback> | null = null;
    if (entity === 'locations') targetSet = this.locationListeners;
    else if (entity === 'comments') targetSet = this.commentListeners;
    else if (entity === 'suggestions') targetSet = this.suggestionListeners;
    else if (entity === 'servers') targetSet = this.serverListeners;
    else if (entity === 'systems') targetSet = this.systemListeners;
    else if (entity === 'profiles') targetSet = this.profileListeners;
    else if (entity === 'settings') targetSet = this.settingsListeners;

    if (targetSet) {
      targetSet.forEach((cb) => {
        try {
          cb(payload);
        } catch (e) {
          console.error(`Error in ${entity} listener:`, e);
        }
      });
    }
  }

  // --- Public Realtime Methods ---

  public syncPresence(confirmedIds: string[]) {
    this.myConfirmedIds = confirmedIds;
    try {
      if (this.supabaseChannel && this.isConnected) {
        this.supabaseChannel.track({
          user_id: getAnonymousUserId(),
          confirmed_ids: confirmedIds,
          cycle_key: this.currentCycleInfo.cycleKey,
          updated_at: Date.now(),
        });
      }
    } catch (e) {
      console.warn('Presence track error:', e);
    }
  }

  public getAggregatedCounts(): Record<string, number> {
    const combined: Record<string, number> = { ...this.broadcastCounts };
    Object.entries(this.presenceCounts).forEach(([id, val]) => {
      combined[id] = Math.max(combined[id] || 0, val);
    });
    return combined;
  }

  public broadcastVoteChange(
    action: 'vote_added' | 'vote_removed',
    locationId: string,
    serverId?: string,
    count?: number,
    meta?: { username?: string; confirmed_at?: string; user?: any },
    confirmedUser?: any
  ) {
    const cycle = calculateWandererCycle();
    if (locationId) {
      if (typeof count === 'number') {
        this.broadcastCounts[locationId] = count;
      } else if (action === 'vote_added') {
        this.broadcastCounts[locationId] = (this.broadcastCounts[locationId] || 0) + 1;
      } else if (action === 'vote_removed') {
        this.broadcastCounts[locationId] = Math.max(0, (this.broadcastCounts[locationId] || 1) - 1);
      }
    }

    const payload: WandererSyncPayload = {
      action,
      locationId,
      serverId,
      cycleKey: cycle.cycleKey,
      count: this.broadcastCounts[locationId],
      username: meta?.username,
      confirmed_at: meta?.confirmed_at,
      user: confirmedUser || meta?.user,
      timestamp: Date.now(),
    };

    // 1. Local tabs
    try { this.broadcastChannel?.postMessage(payload); } catch {}
    try { localStorage.setItem('malaca_map_realtime_event', JSON.stringify(payload)); } catch {}

    // 2. Supabase Realtime WebSocket Broadcast
    try {
      if (this.supabaseChannel) {
        this.supabaseChannel.send({
          type: 'broadcast',
          event: 'wanderer_sync',
          payload,
        });
      }
    } catch {}

    // 3. Local listeners
    this.notifyWandererChange(payload);
  }

  public broadcastCycleReset(reason: string = 'automatic_06_18') {
    const cycle = calculateWandererCycle();
    this.currentCycleInfo = cycle;
    this.broadcastCounts = {};
    this.presenceCounts = {};
    this.myConfirmedIds = [];

    const payload: WandererSyncPayload = {
      action: 'cycle_reset',
      cycleKey: cycle.cycleKey,
      reason,
      timestamp: Date.now(),
    };

    try { this.broadcastChannel?.postMessage(payload); } catch {}
    try { localStorage.setItem('malaca_map_realtime_event', JSON.stringify(payload)); } catch {}

    try {
      if (this.supabaseChannel) {
        this.supabaseChannel.send({
          type: 'broadcast',
          event: 'wanderer_sync',
          payload,
        });
      }
    } catch {}

    this.resetListeners.forEach((cb) => {
      try { cb(cycle, reason); } catch (e) { console.error('Error in resetListener:', e); }
    });

    this.notifyWandererChange(payload);
  }

  public broadcastEntityChange(
    entity: 'locations' | 'comments' | 'suggestions' | 'servers' | 'systems' | 'profiles' | 'settings',
    action: RealtimeChangeType,
    data?: any,
    id?: string,
    serverId?: string
  ) {
    const payload: RealtimeEntityPayload = {
      entity,
      action,
      data,
      id,
      serverId,
      timestamp: Date.now(),
    };

    try { this.broadcastChannel?.postMessage(payload); } catch {}
    try { localStorage.setItem('malaca_map_realtime_event', JSON.stringify(payload)); } catch {}

    try {
      if (this.supabaseChannel) {
        this.supabaseChannel.send({
          type: 'broadcast',
          event: 'entity_sync',
          payload,
        });
      }
    } catch {}

    this.notifyEntityChange(entity, payload);
  }

  // --- Subscriptions ---

  public onWandererChange(callback: SyncCallback): () => void {
    this.changeListeners.add(callback);
    return () => { this.changeListeners.delete(callback); };
  }

  public onPresenceSync(callback: PresenceCallback): () => void {
    this.presenceListeners.add(callback);
    // Dispara imediatamente com o estado atual se disponível
    const current = this.getAggregatedCounts();
    if (Object.keys(current).length > 0) {
      try { callback(current); } catch {}
    }
    return () => { this.presenceListeners.delete(callback); };
  }

  public onCycleReset(callback: ResetCallback): () => void {
    this.resetListeners.add(callback);
    return () => { this.resetListeners.delete(callback); };
  }

  public onLocationsChange(callback: EntityCallback): () => void {
    this.locationListeners.add(callback);
    return () => { this.locationListeners.delete(callback); };
  }

  public onCommentsChange(callback: EntityCallback): () => void {
    this.commentListeners.add(callback);
    return () => { this.commentListeners.delete(callback); };
  }

  public onSuggestionsChange(callback: EntityCallback): () => void {
    this.suggestionListeners.add(callback);
    return () => { this.suggestionListeners.delete(callback); };
  }

  public onServersChange(callback: EntityCallback): () => void {
    this.serverListeners.add(callback);
    return () => { this.serverListeners.delete(callback); };
  }

  public onSystemsChange(callback: EntityCallback): () => void {
    this.systemListeners.add(callback);
    return () => { this.systemListeners.delete(callback); };
  }

  public onProfilesChange(callback: EntityCallback): () => void {
    this.profileListeners.add(callback);
    return () => { this.profileListeners.delete(callback); };
  }

  public onSettingsChange(callback: EntityCallback): () => void {
    this.settingsListeners.add(callback);
    return () => { this.settingsListeners.delete(callback); };
  }

  public getCurrentCycle(): WandererCycleInfo {
    return calculateWandererCycle();
  }

  public isRealtimeConnected(): boolean {
    return this.isConnected;
  }
}

export const RealtimeSync = new RealtimeSyncManager();
