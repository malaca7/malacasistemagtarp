export interface WandererCycleTime {
  hours: number;
  minutes: number;
  seconds: number;
  formatted: string;
  nextResetLabel: string;
}

/**
 * Calculates time remaining until the next Andarilho shift reset.
 * Standard shift times: 06:00 AM and 18:00 PM (6:00 PM) BRT.
 */
export function getNextWandererReset(): WandererCycleTime {
  const now = new Date();
  
  const today6am = new Date(now);
  today6am.setHours(6, 0, 0, 0);

  const today6pm = new Date(now);
  today6pm.setHours(18, 0, 0, 0);

  const tomorrow6am = new Date(now);
  tomorrow6am.setDate(tomorrow6am.getDate() + 1);
  tomorrow6am.setHours(6, 0, 0, 0);

  let targetTime: Date;
  let nextResetLabel = '18:00';

  if (now < today6am) {
    targetTime = today6am;
    nextResetLabel = '06:00';
  } else if (now < today6pm) {
    targetTime = today6pm;
    nextResetLabel = '18:00';
  } else {
    targetTime = tomorrow6am;
    nextResetLabel = '06:00 (Amanhã)';
  }

  const diffMs = targetTime.getTime() - now.getTime();
  const totalSeconds = Math.floor(diffMs / 1000);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (num: number) => String(num).padStart(2, '0');
  const formatted = `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;

  return {
    hours,
    minutes,
    seconds,
    formatted,
    nextResetLabel
  };
}
