import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Storage abstraction — swap for an S3-compatible client later without
 * touching callers. Local disk under public/uploads for Phase 5's "smallest
 * working" pipeline; not resumable/chunked yet (see docs/checkpoints/
 * PHASE-5-6.md).
 */
export interface StoredObject {
  readonly key: string;
  readonly url: string;
}

const UPLOAD_DIR = join(process.cwd(), "public", "uploads");

export async function putObject(buffer: Buffer, extension: string): Promise<StoredObject> {
  await mkdir(UPLOAD_DIR, { recursive: true });
  const key = `${randomUUID()}.${extension}`;
  await writeFile(join(UPLOAD_DIR, key), buffer);
  return { key, url: `/uploads/${key}` };
}
