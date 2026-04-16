/**
 * Server-only validation for /admin dashboard API routes.
 *
 * Defaults (when env vars are unset): username `admin`, password `mattandseong`.
 * Override in production with ADMIN_DASHBOARD_USERNAME and ADMIN_DASHBOARD_PASSWORD.
 * Legacy: ADMIN_EXPORT_SECRET is accepted as the password if ADMIN_DASHBOARD_PASSWORD is empty.
 */

export function getExpectedAdminCredentials(): {
  username: string;
  password: string;
} {
  const username =
    process.env.ADMIN_DASHBOARD_USERNAME?.trim() || "admin";
  const password =
    process.env.ADMIN_DASHBOARD_PASSWORD?.trim() ||
    process.env.ADMIN_EXPORT_SECRET?.trim() ||
    "mattandseong";
  return { username, password };
}

export function validateAdminCredentials(
  username: string,
  password: string,
): boolean {
  const expected = getExpectedAdminCredentials();
  return username === expected.username && password === expected.password;
}
