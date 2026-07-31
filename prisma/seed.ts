import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Deterministic local dev/test data — fixed IDs and fields so this can be
 * rerun safely (upsert, not create) without producing duplicates. No real
 * people: usernames/emails are clearly fictional, same posture as
 * src/lib/map/seedEvents.ts. Passwords are set directly via Better Auth's
 * own account table shape is NOT replicated here — these seed users have no
 * password/account row, so they can't sign in through the UI. They exist
 * only to give follow/Watch-Zone relations something to point at. Use the
 * sign-up form to create a real, sign-in-able local dev account.
 */
async function main() {
  const connectionString = process.env["DATABASE_URL"];
  if (!connectionString) throw new Error("DATABASE_URL is not set.");
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

  const stormWatcher = await prisma.user.upsert({
    where: { username: "dfw_stormwatch" },
    update: {},
    create: {
      id: "seed-user-stormwatch",
      email: "dfw.stormwatch@example.invalid",
      name: "DFW Storm Watch",
      username: "dfw_stormwatch",
      bio: "Amateur storm chaser, North Texas.",
      verificationType: "none",
    },
  });

  const auroraChaser = await prisma.user.upsert({
    where: { username: "tromso_aurora_chaser" },
    update: {},
    create: {
      id: "seed-user-aurorachaser",
      email: "tromso.aurora@example.invalid",
      name: "Tromsø Aurora Chaser",
      username: "tromso_aurora_chaser",
      bio: "Aurora photography, northern Norway.",
      verificationType: "none",
    },
  });

  await prisma.follow.upsert({
    where: { followerId_followingId: { followerId: stormWatcher.id, followingId: auroraChaser.id } },
    update: {},
    create: { followerId: stormWatcher.id, followingId: auroraChaser.id },
  });

  await prisma.watchZone.upsert({
    where: { id: "seed-zone-dfw-home" },
    update: {},
    create: {
      id: "seed-zone-dfw-home",
      ownerId: stormWatcher.id,
      label: "Home",
      latitude: 32.7767,
      longitude: -96.797,
      radiusKm: 25,
      categories: ["severe-storm", "flood"],
      minSeverity: "watch",
      notificationsEnabled: true,
    },
  });

  await prisma.watchZone.upsert({
    where: { id: "seed-zone-tromso-home" },
    update: {},
    create: {
      id: "seed-zone-tromso-home",
      ownerId: auroraChaser.id,
      label: "Home",
      latitude: 69.6492,
      longitude: 18.9553,
      radiusKm: 15,
      categories: ["space-weather", "snow"],
      minSeverity: "advisory",
      notificationsEnabled: true,
    },
  });

  console.log("Seed complete:", { stormWatcher: stormWatcher.username, auroraChaser: auroraChaser.username });
  await prisma.$disconnect();
}

main().catch((err: unknown) => {
  console.error(err);
  process.exitCode = 1;
});
