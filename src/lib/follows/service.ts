import { prisma } from "@/lib/db/client";

export async function followUser(followerId: string, followingId: string) {
  if (followerId === followingId) {
    throw new Error("Cannot follow yourself.");
  }
  // Unique constraint on [followerId, followingId] makes double-follow a
  // no-op rather than a duplicate row or a thrown error the UI has to
  // special-case.
  await prisma.follow.upsert({
    where: { followerId_followingId: { followerId, followingId } },
    create: { followerId, followingId },
    update: {},
  });
}

export async function unfollowUser(followerId: string, followingId: string) {
  await prisma.follow.deleteMany({ where: { followerId, followingId } });
}

export async function isFollowing(followerId: string, followingId: string): Promise<boolean> {
  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId, followingId } },
  });
  return existing !== null;
}

export async function followCounts(userId: string) {
  const [followers, following] = await Promise.all([
    prisma.follow.count({ where: { followingId: userId } }),
    prisma.follow.count({ where: { followerId: userId } }),
  ]);
  return { followers, following };
}
