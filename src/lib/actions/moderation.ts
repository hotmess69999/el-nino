"use server";

import { revalidatePath } from "next/cache";
import { requireCurrentUser } from "@/lib/auth/session";
import {
  fileModerationReport,
  isModeratorRole,
  resolveModerationReport,
} from "@/lib/moderation/service";

export async function fileModerationReportAction(targetReportId: string, reason: string, note?: string) {
  const user = await requireCurrentUser();
  await fileModerationReport(user.id, targetReportId, reason, note);
  return { ok: true as const };
}

export async function resolveModerationReportAction(
  reportId: string,
  status: "actioned" | "dismissed",
  reviewNote?: string,
) {
  const user = await requireCurrentUser();
  if (!isModeratorRole(user.role)) {
    throw new Error("Not authorised.");
  }
  await resolveModerationReport(reportId, user.id, status, reviewNote);
  revalidatePath("/admin/moderation");
}
