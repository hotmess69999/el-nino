import { prisma } from "@/lib/db/client";
import { MODERATION_REASONS, type ModerationReason } from "./reasons";

export { isModeratorRole } from "./roles";
export { MODERATION_REASONS, type ModerationReason } from "./reasons";

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
