/**
 * Integration tests against a real PostgreSQL database — schema
 * constraints, ownership enforcement, follow uniqueness, and preference
 * persistence can't be verified with pure-function unit tests since they
 * depend on actual DB behaviour (unique constraints, cascades).
 *
 * Skipped by default: this sandbox has no local Postgres available (no
 * docker, no local install — see docs/decisions/0004-database-and-orm.md
 * "Why not run in this pass"). Run for real with:
 *
 *   docker compose up -d postgres
 *   npx prisma migrate dev
 *   RUN_DB_TESTS=1 npx vitest run src/lib/db/integration.test.ts
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const shouldRun = process.env["RUN_DB_TESTS"] === "1" && Boolean(process.env["DATABASE_URL"]);

describe.skipIf(!shouldRun)("database integration", () => {
  let prisma: import("@/generated/prisma/client").PrismaClient;
  let ownerId: string;
  let otherUserId: string;

  beforeAll(async () => {
    const { prisma: client } = await import("@/lib/db/client");
    prisma = client;

    const owner = await prisma.user.create({
      data: { email: "it-owner@example.invalid", name: "IT Owner", username: "it_owner_test" },
    });
    const other = await prisma.user.create({
      data: { email: "it-other@example.invalid", name: "IT Other", username: "it_other_test" },
    });
    ownerId = owner.id;
    otherUserId = other.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { id: { in: [ownerId, otherUserId] } } });
    await prisma.$disconnect();
  });

  it("creates and lists a Watch Zone for its owner", async () => {
    const { createWatchZone, listWatchZones } = await import("@/lib/watchZones/service");
    await createWatchZone(ownerId, {
      label: "Test Zone",
      latitude: 10,
      longitude: 10,
      radiusKm: 10,
      categories: ["flood"],
      minSeverity: "watch",
      notificationsEnabled: true,
    });
    const zones = await listWatchZones(ownerId);
    expect(zones).toHaveLength(1);
    expect(zones[0]?.label).toBe("Test Zone");
  });

  it("refuses to update a Watch Zone owned by a different user", async () => {
    const { createWatchZone, updateWatchZone } = await import("@/lib/watchZones/service");
    await createWatchZone(ownerId, {
      label: "Owned",
      latitude: 1,
      longitude: 1,
      radiusKm: 5,
      categories: ["snow"],
      minSeverity: "advisory",
      notificationsEnabled: true,
    });
    const [zone] = await (await import("@/lib/watchZones/service")).listWatchZones(ownerId);
    await expect(
      updateWatchZone(zone!.id, otherUserId, { ...zone, label: "Hijacked" }),
    ).rejects.toThrow();
  });

  it("prevents a duplicate follow relationship", async () => {
    const { followUser, followCounts } = await import("@/lib/follows/service");
    await followUser(otherUserId, ownerId);
    await followUser(otherUserId, ownerId);
    const counts = await followCounts(ownerId);
    expect(counts.followers).toBe(1);
  });

  it("persists user preferences across reads", async () => {
    const { updatePreferences, getPreferences } = await import("@/lib/preferences/service");
    await updatePreferences(ownerId, { reducedData: true, distanceUnit: "mi" });
    const prefs = await getPreferences(ownerId);
    expect(prefs.reducedData).toBe(true);
    expect(prefs.distanceUnit).toBe("mi");
  });
});
