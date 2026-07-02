export const DAY_MODE_START_HOUR = 6;
export const SUNSET_MODE_START_HOUR = 18;
export const NIGHT_MODE_START_HOUR = 20;

export function getTimeOfDay(date = new Date()) {
  const hour = date.getHours();
  if (hour < DAY_MODE_START_HOUR || hour >= NIGHT_MODE_START_HOUR) {
    return 'night';
  }
  if (hour >= SUNSET_MODE_START_HOUR) {
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
