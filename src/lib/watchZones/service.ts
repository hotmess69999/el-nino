import { prisma } from "@/lib/db/client";
import { validateWatchZoneInput, type ValidationResult } from "./validation";

export async function listWatchZones(ownerId: string) {
  return prisma.watchZone.findMany({ where: { ownerId }, orderBy: { createdAt: "asc" } });
}

export async function createWatchZone(
  ownerId: string,
  rawInput: Record<string, unknown>,
): Promise<ValidationResult> {
  const result = validateWatchZoneInput(rawInput);
  if (!result.ok) return result;

  await prisma.watchZone.create({
    data: { ownerId, paused: false, ...result.value },
  });
  return result;
}

/** Throws if the zone doesn't exist or isn't owned by `ownerId` — callers must not leak which. */
async function assertOwnedZone(zoneId: string, ownerId: string) {
  const zone = await prisma.watchZone.findUnique({ where: { id: zoneId } });
  if (!zone || zone.ownerId !== ownerId) {
    throw new Error("Watch Zone not found.");
  }
  return zone;
}

export async function updateWatchZone(
  zoneId: string,
  ownerId: string,
  rawInput: Record<string, unknown>,
): Promise<ValidationResult> {
  await assertOwnedZone(zoneId, ownerId);
  const result = validateWatchZoneInput(rawInput);
  if (!result.ok) return result;

  await prisma.watchZone.update({ where: { id: zoneId }, data: result.value });
  return result;
}

export async function setWatchZonePaused(zoneId: string, ownerId: string, paused: boolean) {
  await assertOwnedZone(zoneId, ownerId);
  await prisma.watchZone.update({ where: { id: zoneId }, data: { paused } });
}

export async function deleteWatchZone(zoneId: string, ownerId: string) {
  await assertOwnedZone(zoneId, ownerId);
  await prisma.watchZone.delete({ where: { id: zoneId } });
}
