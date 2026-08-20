const KNOWN_PROFILE_STATUSES = new Set([
  'empty',
  'draft',
  'reviewed',
  'ready',
  'hidden',
]);

const PUBLISHABLE_PROFILE_STATUSES = new Set([
  'draft',
  'reviewed',
  'ready',
]);

export function isPublishableProfile(profile) {
  const status = profile?.profile_status;
  if (!KNOWN_PROFILE_STATUSES.has(status)) {
    throw new Error(`Estado de ficha desconocido: ${status}`);
  }
  return PUBLISHABLE_PROFILE_STATUSES.has(status);
}
