import { supabase } from '../lib/supabase';
import { calculateWandererCycle, WandererCycleInfo } from '../utils/wandererCycle';

export type WandererSyncAction = 'vote_added' | 'vote_removed' | 'cycle_reset';

export interface WandererSyncPayload {
  action: WandererSyncAction;
  serverId?: string;
  locationId?: string;
  cycleKey: string;
  count?: number;
  reason?: string;
  timestamp: number;
}

export type RealtimeChangeType = 'INSERT' | 'UPDATE' | 'DELETE' | 'SYNC';

export interface RealtimeEntityPayload<T = any> {
  entity: 'locations' | 'comments' | 'suggestions' | 'servers' | 'wanderer' | 'profiles' | 'settings';
  action: RealtimeChangeType;
  serverId?: string;
  data?: T;
  id?: string;
  timestamp: number;
}

type SyncCallback = (payload: WandererSyncPayload) => void;
type ResetCallback = (info: WandererCycleInfo, reason: string) => void;
type EntityCallback<T = any> = (payload: RealtimeEntityPayload<T>) => void;

class RealtimeSyncManager {
  private broadcastChannel: BroadcastChannel | null = null;
  private changeListeners: Set<SyncCallback> = new Set();
  private resetListeners: Set<ResetCallback> = new Set();
  private locationListeners: Set<EntityCallback> = new Set();
  private commentListeners: Set<EntityCallback> = new Set();
  private suggestionListeners: Set<EntityCallback> = new Set();
  private serverListeners: Set<EntityCallback> = new Set();
  private profileListeners: Set<EntityCallback> = new Set();
  private settingsListeners: Set<EntityCallback> = new Set();

  private supabaseChannel: any = null;
  private currentCycleInfo: WandererCycleInfo;
  private watcherTimer: any = null;
  private isConnected: boolean = false;

  constructor() {
    this.currentCycleInfo = calculateWandererCycle();
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
        }
      });
    }
  }

  private initSupabaseChannel() {
    try {
      this.supabaseChannel = supabase
        .channel('malaca_realtime_global_hub')
        // 1. BroadCast Multi-Client Events
        .on('broadcast', { event: 'wanderer_sync' }, (response) => {
          if (response?.payload) {
            this.handleIncomingSync(response.payload as WandererSyncPayload);
          }
        })
        .on('broadcast', { event: 'entity_sync' }, (response) => {
          if (response?.payload) {
            this.handleIncomingEntitySync(response.payload as RealtimeEntityPayload);
          }
        })
        // 2. Postgres Database Changes: wanderer_confirmations
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
        // 3. Postgres Database Changes: map_locations
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
        // 4. Postgres Database Changes: comments
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
        // 5. Postgres Database Changes: suggestions
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
        // 6. Postgres Database Changes: servers
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
        // 7. Postgres Database Changes: profiles
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
        // 8. Postgres Database Changes: platform_settings
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
        });

    } catch (e) {
      console.warn('Supabase Realtime Channel init error:', e);
    }
  }

  private startCycleWatcher() {
    if (typeof window === 'undefined') return;

    this.watcherTimer = setInterval(() => {
      const freshCycle = calculateWandererCycle();
      if (freshCycle.cycleKey !== this.currentCycleInfo.cycleKey) {
        this.currentCycleInfo = freshCycle;
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
      this.resetListeners.forEach((cb) => {
        try {
          cb(this.currentCycleInfo, payload.reason || 'cycle_reset');
        } catch (e) {
          console.error('Error in resetListener:', e);
        }
      });
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

  // --- Broadcast Methods ---

  public broadcastVoteChange(action: 'vote_added' | 'vote_removed', locationId: string, serverId?: string, count?: number) {
    const cycle = calculateWandererCycle();
    const payload: WandererSyncPayload = {
      action,
      locationId,
      serverId,
      cycleKey: cycle.cycleKey,
      count,
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

    this.notifyWandererChange(payload);
  }

  public broadcastCycleReset(reason: string = 'automatic_06_18') {
    const cycle = calculateWandererCycle();
    this.currentCycleInfo = cycle;

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
    entity: 'locations' | 'comments' | 'suggestions' | 'servers' | 'profiles' | 'settings',
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
