import { headers } from "next/headers";
import { auth } from "./server";

/** Server-side session lookup — use in Server Components and Server Actions. */
export async function getCurrentSession() {
  return auth.api.getSession({ headers: await headers() });
}

export async function requireCurrentUser() {
  const session = await getCurrentSession();
  if (!session) throw new Error("Not authenticated");
  return session.user;
}
