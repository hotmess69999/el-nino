"use server";

import { revalidatePath } from "next/cache";
import { requireCurrentUser } from "@/lib/auth/session";
import {
  createWatchZone,
  deleteWatchZone,
  setWatchZonePaused,
  updateWatchZone,
} from "@/lib/watchZones/service";

export async function createWatchZoneAction(input: Record<string, unknown>) {
  const user = await requireCurrentUser();
  const result = await createWatchZone(user.id, input);
  if (result.ok) revalidatePath("/profile");
  return result;
}

export async function updateWatchZoneAction(zoneId: string, input: Record<string, unknown>) {
  const user = await requireCurrentUser();
  const result = await updateWatchZone(zoneId, user.id, input);
  if (result.ok) revalidatePath("/profile");
  return result;
}

export async function toggleWatchZonePausedAction(zoneId: string, paused: boolean) {
  const user = await requireCurrentUser();
  await setWatchZonePaused(zoneId, user.id, paused);
  revalidatePath("/profile");
}

export async function deleteWatchZoneAction(zoneId: string) {
  const user = await requireCurrentUser();
  await deleteWatchZone(zoneId, user.id);
  revalidatePath("/profile");
}
