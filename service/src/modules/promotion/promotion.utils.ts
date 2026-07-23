export const MAX_PROMO_LEVEL = 5;

export function getRelativeLevel(path: string, parentUserId: number, ancestorId: number): number | null {
  if (parentUserId === ancestorId) return 1;
  const segments = path.split('/').filter(Boolean).map(Number);
  const idx = segments.indexOf(ancestorId);
  if (idx === -1) return null;
  return segments.length - idx;
}

export function maskUsername(username: string): string {
  if (!username) return '***';
  if (username.length <= 1) return `${username}*`;
  return `${username[0]}${'*'.repeat(Math.min(username.length - 1, 3))}`;
}

export function containsPath(path: string, userId: number): boolean {
  if (!path) return false;
  const segments = path.split('/').filter(Boolean).map(Number);
  return segments.includes(userId);
}

export function levelFromPath(path: string): number {
  return path.split('/').filter(Boolean).length;
}
