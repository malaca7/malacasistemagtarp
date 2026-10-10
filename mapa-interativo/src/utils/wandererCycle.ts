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

/**
 * Calcula com precisão o ciclo ativo do Andarilho e a contagem regressiva para a próxima virada.
 * A virada ocorre estritamente todos os dias às 06:00 (manhã) e 18:00 (noite).
 */
export function calculateWandererCycle(now: Date = new Date()): WandererCycleInfo {
  const currentHours = now.getHours();

  const startTime = new Date(now);
  const endTime = new Date(now);
  let cycleHour: 6 | 18;
  let cycleLabel: string;
  let formattedStartTime: string;
  let formattedEndTime: string;

  if (currentHours >= 6 && currentHours < 18) {
    // Ciclo Diurno: iniciou hoje às 06:00:00, encerra hoje às 18:00:00
    startTime.setHours(6, 0, 0, 0);
    endTime.setHours(18, 0, 0, 0);
    cycleHour = 6;
    cycleLabel = 'Ciclo Diurno (06h - 18h)';
    formattedStartTime = '06:00';
    formattedEndTime = '18:00';
  } else if (currentHours >= 18) {
    // Ciclo Noturno (parte 1): iniciou hoje às 18:00:00, encerra amanhã às 06:00:00
    startTime.setHours(18, 0, 0, 0);
    endTime.setDate(endTime.getDate() + 1);
    endTime.setHours(6, 0, 0, 0);
    cycleHour = 18;
    cycleLabel = 'Ciclo Noturno (18h - 06h)';
    formattedStartTime = '18:00';
    formattedEndTime = '06:00';
  } else {
    // Ciclo Noturno (parte 2 - madrugada antes das 06h): iniciou ontem às 18:00:00, encerra hoje às 06:00:00
    startTime.setDate(startTime.getDate() - 1);
    startTime.setHours(18, 0, 0, 0);
    endTime.setHours(6, 0, 0, 0);
    cycleHour = 18;
    cycleLabel = 'Ciclo Noturno (18h - 06h)';
    formattedStartTime = '18:00';
    formattedEndTime = '06:00';
  }

  const year = startTime.getFullYear();
  const month = String(startTime.getMonth() + 1).padStart(2, '0');
  const day = String(startTime.getDate()).padStart(2, '0');
  const cycleKey = `${year}-${month}-${day}_${cycleHour === 6 ? '06h' : '18h'}`;

  const diffMs = Math.max(0, endTime.getTime() - now.getTime());
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const diffSecs = Math.floor((diffMs % (1000 * 60)) / 1000);

  const formattedTimeLeft = `${String(diffHrs).padStart(2, '0')}:${String(diffMins).padStart(2, '0')}:${String(diffSecs).padStart(2, '0')}`;

  const totalCycleMs = 12 * 60 * 60 * 1000; // 12 horas exatas
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
