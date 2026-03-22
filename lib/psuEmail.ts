/** Penn State student / faculty email pattern for this study. */
export function isPennStateEmail(email: string): boolean {
  const e = email.trim().toLowerCase();
  return e.endsWith("@psu.edu");
}
