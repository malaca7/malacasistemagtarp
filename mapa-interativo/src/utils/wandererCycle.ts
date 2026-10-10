export interface WandererCycleInfo {
  cycleKey: string;           // Ex: "2026-10-09_18h"
  cycleLabel: string;         // Ex: "Ciclo Noturno (18h)" ou "Ciclo Diurno (06h)"
  cycleHour: 6 | 18;          // 6 ou 18
  startTime: Date;            // Data/hora em que este ciclo iniciou (06:00 ou 18:00)
  endTime: Date;              // Data/hora da próxima virada (18:00 ou 06:00)
  formattedTimeLeft: string;  // "HH:MM:SS"
  diffMs: number;             // Milissegundos restantes
  progressPercent: number;    // Progresso do ciclo de 12 horas (0 a 100%)
  formattedStartTime: string; // Ex: "18:00"
  formattedEndTime: string;   // Ex: "06:00"
}

export interface StoredWandererCycleState {
  cycleKey: string;
  userConfirmedIds: string[];
  counts: Record<string, number>;
  latestConfirmations?: Record<string, { username: string; confirmed_at: string }>;
  confirmedUsersByLocation?: Record<string, any[]>;
}

export function getBrasiliaParts(date: Date = new Date()) {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });
  const parts = Object.fromEntries(fmt.formatToParts(date).map((p) => [p.type, p.value]));
  return {
    year: parseInt(parts.year, 10),
    month: parseInt(parts.month, 10),
    day: parseInt(parts.day, 10),
    hour: parseInt(parts.hour, 10),
    minute: parseInt(parts.minute, 10),
    second: parseInt(parts.second, 10),
  };
}

/**
 * Calcula com precisão o ciclo ativo do Andarilho e a contagem regressiva para a próxima virada.
 * A virada ocorre estritamente todos os dias às 06:00 (manhã) e 18:00 (noite) no Horário de Brasília.
 */
export function calculateWandererCycle(now: Date = new Date()): WandererCycleInfo {
  const b = getBrasiliaParts(now);
  const currentHours = b.hour;

  let cycleHour: 6 | 18;
  let cycleLabel: string;
  let formattedStartTime: string;
  let formattedEndTime: string;

  let startYear = b.year;
  let startMonth = b.month;
  let startDay = b.day;

  if (currentHours >= 6 && currentHours < 18) {
    cycleHour = 6;
    cycleLabel = 'Ciclo Diurno (06h - 18h)';
    formattedStartTime = '06:00';
    formattedEndTime = '18:00';
  } else if (currentHours >= 18) {
    cycleHour = 18;
    cycleLabel = 'Ciclo Noturno (18h - 06h)';
    formattedStartTime = '18:00';
    formattedEndTime = '06:00';
  } else {
    cycleHour = 18;
    cycleLabel = 'Ciclo Noturno (18h - 06h)';
    formattedStartTime = '18:00';
    formattedEndTime = '06:00';
    const prevDay = new Date(Date.UTC(b.year, b.month - 1, b.day - 1));
    startYear = prevDay.getUTCFullYear();
    startMonth = prevDay.getUTCMonth() + 1;
    startDay = prevDay.getUTCDate();
  }

  // 06:00 BRT = 09:00 UTC, 18:00 BRT = 21:00 UTC
  const startUtcHour = cycleHour === 6 ? 9 : 21;
  const startTime = new Date(Date.UTC(startYear, startMonth - 1, startDay, startUtcHour, 0, 0, 0));
  const endTime = new Date(startTime.getTime() + 12 * 60 * 60 * 1000);

  const monthStr = String(startMonth).padStart(2, '0');
  const dayStr = String(startDay).padStart(2, '0');
  const cycleKey = `${startYear}-${monthStr}-${dayStr}_${cycleHour === 6 ? '06h' : '18h'}`;

  const diffMs = Math.max(0, endTime.getTime() - now.getTime());
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const diffSecs = Math.floor((diffMs % (1000 * 60)) / 1000);

  const formattedTimeLeft = `${String(diffHrs).padStart(2, '0')}:${String(diffMins).padStart(2, '0')}:${String(diffSecs).padStart(2, '0')}`;

  const totalCycleMs = 12 * 60 * 60 * 1000;
  const elapsedMs = Math.max(0, now.getTime() - startTime.getTime());
  const progressPercent = Math.min(100, Math.max(0, Math.round((elapsedMs / totalCycleMs) * 100)));

  return {
    cycleKey,
    cycleLabel,
    cycleHour,
    startTime,
    endTime,
    formattedTimeLeft,
    diffMs,
    progressPercent,
    formattedStartTime,
    formattedEndTime,
  };
}

/**
 * Retorna true se a chave de ciclo fornecida for anterior ao ciclo atual (isto é, expirou).
 */
export function isCycleExpired(storedCycleKey: string | null | undefined): boolean {
  if (!storedCycleKey) return true;
  const current = calculateWandererCycle();
  return storedCycleKey !== current.cycleKey;
}

export function getLocalWandererCycleState(): StoredWandererCycleState {
  const current = calculateWandererCycle();
  try {
    const raw = localStorage.getItem('cidade_alta_wanderer_cycle_state');
    if (raw) {
      const parsed: StoredWandererCycleState = JSON.parse(raw);
      if (parsed && parsed.cycleKey === current.cycleKey) {
        return parsed;
      }
    }
  } catch {}

  const fresh: StoredWandererCycleState = {
    cycleKey: current.cycleKey,
    userConfirmedIds: [],
    counts: {},
  };
  saveLocalWandererCycleState(fresh);
  try {
    localStorage.removeItem('cidade_alta_user_confirmations');
  } catch {}
  return fresh;
}

export function saveLocalWandererCycleState(state: StoredWandererCycleState) {
  try {
    localStorage.setItem('cidade_alta_wanderer_cycle_state', JSON.stringify(state));
  } catch {}
}
