import { prisma } from "@/lib/db/client";
import { followCounts } from "@/lib/follows/service";
import { validateProfileEdit } from "./validation";

/**
 * Fields safe to return from any public-profile lookup. Deliberately
 * excludes email — never expose it through a public-facing query, even
 * though Prisma would happily return it if selected.
 */
const PUBLIC_PROFILE_SELECT = {
  id: true,
  username: true,
  name: true,
  image: true,
  bio: true,
  verificationType: true,
  weatherScore: true,
  createdAt: true,
} as const;

export async function getPublicProfile(username: string) {
  const user = await prisma.user.findUnique({
    where: { username },
    select: PUBLIC_PROFILE_SELECT,
  });
  if (!user) return null;

  const counts = await followCounts(user.id);
  // "name" is Better Auth's core field — exposed as displayName here for
  // clarity at the app boundary, since every other layer in this codebase
  // calls it that.
  const { name, ...rest } = user;
  return { ...rest, displayName: name, ...counts };
}

export async function updateProfile(userId: string, rawInput: Record<string, unknown>) {
  const result = validateProfileEdit(rawInput);
  if (!result.ok) return result;

  await prisma.user.update({
    where: { id: userId },
    data: { name: result.value.displayName, bio: result.value.bio },
  });
  return result;
}
