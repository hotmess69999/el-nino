"use server";

import { revalidatePath } from "next/cache";
import { requireCurrentUser } from "@/lib/auth/session";
import { updatePreferences, type PreferencesUpdate } from "@/lib/preferences/service";

export async function updatePreferencesAction(update: PreferencesUpdate) {
  const user = await requireCurrentUser();
  await updatePreferences(user.id, update);
  revalidatePath("/profile");
}
