/** Pure/no-DB import so it's unit-testable without a database connection. */
export function isModeratorRole(role: string | null | undefined): boolean {
  return role === "moderator" || role === "admin";
}
