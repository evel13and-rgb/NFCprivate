export const DAWN_MODE_START_MINUTE = 6 * 60;
export const DAY_MODE_START_MINUTE = 7 * 60 + 30;
export const SUNSET_MODE_START_HOUR = 18;
export const NIGHT_MODE_START_HOUR = 20;

export function getTimeOfDay(date = new Date()) {
  const minutes = date.getHours() * 60 + date.getMinutes();
  if (minutes < DAWN_MODE_START_MINUTE || minutes >= NIGHT_MODE_START_HOUR * 60) {
    return 'night';
  }
  if (minutes < DAY_MODE_START_MINUTE) {
    return 'dawn';
  }
  if (minutes >= SUNSET_MODE_START_HOUR * 60) {
    return 'sunset';
  }
  return 'day';
}

export function isNightTime(date = new Date()) {
  return getTimeOfDay(date) === 'night';
}

export function isDayTime(date = new Date()) {
  return !isNightTime(date);
}
