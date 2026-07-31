import { createHash } from "node:crypto";
import { prisma } from "@/lib/db/client";
import { putObject } from "@/lib/storage/local";
import {
  validateMediaFile,
  validateReportInput,
  type ReportValidationResult,
} from "./validation";

const EXTENSION_BY_MIME: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};

export interface FileInput {
  buffer: Buffer;
  mimeType: string;
}

/**
 * Smallest working pipeline: validate, store the original, publish
 * immediately — no transcoding/derivatives/moderation queue yet (see
 * docs/checkpoints/PHASE-5-6.md). `processing` exists as a real status for
 * a future async step to transition through, not a fake delay.
 */
export async function createReport(
  contributorId: string,
  rawInput: Record<string, unknown>,
  file: FileInput,
): Promise<ReportValidationResult> {
  const result = validateReportInput(rawInput);
  if (!result.ok) return result;

  const fileError = validateMediaFile(file.mimeType, file.buffer.byteLength);
  if (fileError) return { ok: false, errors: { file: fileError } };

  const extension = EXTENSION_BY_MIME[file.mimeType] ?? "mp4";
  const stored = await putObject(file.buffer, extension);
  const checksum = createHash("sha256").update(file.buffer).digest("hex");

  await prisma.report.create({
    data: {
      contributorId,
      status: "published",
      ...result.value,
      media: {
        create: {
          storageKey: stored.key,
          url: stored.url,
          mimeType: file.mimeType,
          byteSize: file.buffer.byteLength,
          checksum,
        },
      },
    },
  });

  return result;
}

export async function listPublishedReports(limit = 50) {
  return prisma.report.findMany({
    where: { status: "published" },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { media: true, contributor: { select: { username: true, name: true } } },
  });
}

export async function listOwnReports(contributorId: string) {
  return prisma.report.findMany({
    where: { contributorId },
    orderBy: { createdAt: "desc" },
    include: { media: true },
  });
}
