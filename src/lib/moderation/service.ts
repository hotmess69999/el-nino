import { prisma } from "@/lib/db/client";

export { isModeratorRole } from "./roles";

export const MODERATION_REASONS = [
  "off_topic",
  "false_context",
  "manipulated_media",
  "unsafe_personal_information",
  "harassment",
  "copyright",
  "illegal_content",
  "other",
] as const;
export type ModerationReason = (typeof MODERATION_REASONS)[number];

export async function fileModerationReport(
  reporterId: string,
  targetReportId: string,
  reason: string,
  note?: string,
) {
  if (!(MODERATION_REASONS as readonly string[]).includes(reason)) {
    throw new Error("Invalid report reason.");
  }
  return prisma.moderationReport.create({
    data: { reporterId, targetReportId, reason: reason as ModerationReason, note },
  });
}

/** Callers must check isModeratorRole(session.user.role) before calling this. */
export async function listOpenModerationReports() {
  return prisma.moderationReport.findMany({
    where: { status: "open" },
    orderBy: { createdAt: "asc" },
    include: {
      target: { include: { media: true, contributor: { select: { username: true } } } },
      reporter: { select: { username: true } },
    },
  });
}

export async function resolveModerationReport(
  reportId: string,
  reviewerId: string,
  status: "actioned" | "dismissed",
  reviewNote?: string,
) {
  await prisma.moderationReport.update({
    where: { id: reportId },
    data: { status, reviewerId, reviewNote },
  });
  if (status === "actioned") {
    const report = await prisma.moderationReport.findUniqueOrThrow({ where: { id: reportId } });
    await prisma.report.update({ where: { id: report.targetReportId }, data: { status: "rejected" } });
  }
}
