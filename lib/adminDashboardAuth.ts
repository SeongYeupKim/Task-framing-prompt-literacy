/**
 * Server-only validation for /admin dashboard API routes.
 * Set ADMIN_DASHBOARD_USERNAME and ADMIN_DASHBOARD_PASSWORD in .env.local / Vercel.
 */

export function validateAdminCredentials(
  username: string,
  password: string,
): boolean {
  const u = process.env.ADMIN_DASHBOARD_USERNAME?.trim();
  const p = process.env.ADMIN_DASHBOARD_PASSWORD?.trim();
  if (!u || !p) return false;
  return username === u && password === p;
}

export function adminAuthEnvConfigured(): boolean {
  return !!(
    process.env.ADMIN_DASHBOARD_USERNAME?.trim() &&
    process.env.ADMIN_DASHBOARD_PASSWORD?.trim()
  );
}
