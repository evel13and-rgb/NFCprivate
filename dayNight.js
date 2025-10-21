export const DAY_MODE_START_HOUR = 6;
export const NIGHT_MODE_START_HOUR = 20;

export function isNightTime(date = new Date()) {
  const hour = date.getHours();
  return hour < DAY_MODE_START_HOUR || hour >= NIGHT_MODE_START_HOUR;
}

export function isDayTime(date = new Date()) {
  return !isNightTime(date);
}
