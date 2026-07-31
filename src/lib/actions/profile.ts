"use server";

import { revalidatePath } from "next/cache";
import { requireCurrentUser } from "@/lib/auth/session";
import { followUser, unfollowUser } from "@/lib/follows/service";
import { updateProfile } from "@/lib/users/service";

export async function updateProfileAction(input: Record<string, unknown>) {
  const user = await requireCurrentUser();
  const result = await updateProfile(user.id, input);
  if (result.ok) revalidatePath(`/users/${user.username}`);
  return result;
}

export async function followUserAction(targetUserId: string, targetUsername: string) {
  const user = await requireCurrentUser();
  await followUser(user.id, targetUserId);
  revalidatePath(`/users/${targetUsername}`);
}

export async function unfollowUserAction(targetUserId: string, targetUsername: string) {
  const user = await requireCurrentUser();
  await unfollowUser(user.id, targetUserId);
  revalidatePath(`/users/${targetUsername}`);
}
