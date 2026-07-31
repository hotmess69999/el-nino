import { prisma } from "@/lib/db/client";
import { fetchLocalWarnings, type WarningRecord } from "./localAdapter";
import { warningMatchesPoint } from "./matching";

export { warningMatchesPoint } from "./matching";

/** Idempotent — reprocessing the same provider record never duplicates a warning (section 17). */
export async function ingestWarnings(records: WarningRecord[] = fetchLocalWarnings()) {
  for (const record of records) {
    await prisma.officialWarning.upsert({
      where: {
        providerId_providerWarningId: {
          providerId: record.providerId,
          providerWarningId: record.providerWarningId,
        },
      },
      create: { ...record, cancelled: false },
      update: { ...record },
    });
  }
}

export async function listActiveWarnings() {
  return prisma.officialWarning.findMany({
    where: { cancelled: false, expiresAt: { gt: new Date() } },
    orderBy: { effectiveAt: "asc" },
  });
}

export async function listWarningsForWatchZones(userId: string) {
  const [warnings, zones] = await Promise.all([
    listActiveWarnings(),
    prisma.watchZone.findMany({ where: { ownerId: userId, paused: false } }),
  ]);

  return warnings
    .map((warning) => {
      const matchedZones = zones.filter(
        (zone) =>
          zone.categories.includes(warning.category) &&
          warningMatchesPoint(warning, { latitude: zone.latitude, longitude: zone.longitude, radiusKm: zone.radiusKm }),
      );
      return matchedZones.length > 0 ? { warning, matchedZoneLabels: matchedZones.map((z) => z.label) } : null;
    })
    .filter((entry): entry is { warning: (typeof warnings)[number]; matchedZoneLabels: string[] } => entry !== null);
}
