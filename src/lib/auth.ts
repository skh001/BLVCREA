// Edge-safe admin session helpers (used by middleware and route handlers).
//
// The session cookie holds a hash derived from ADMIN_PASSWORD rather than a
// fixed string, so it cannot be forged without knowing the password, and
// changing the password invalidates every existing session.

export const ADMIN_COOKIE = 'admin_session';

export async function computeSessionToken(): Promise<string | null> {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return null;
  const data = new TextEncoder().encode(`blvcrea-admin-session:${password}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function isValidSessionToken(value: string | undefined | null): Promise<boolean> {
  if (!value) return false;
  const expected = await computeSessionToken();
  return !!expected && value === expected;
}
