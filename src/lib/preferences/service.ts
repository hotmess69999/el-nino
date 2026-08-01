import { prisma } from "@/lib/db/client";

const DEFAULTS = {
  autoplay: true,
  mutedPlayback: true,
  reducedData: false,
  localisedWarnings: true,
  distanceUnit: "km",
  timezone: "UTC",
} as const;

export async function getPreferences(userId: string) {
  const existing = await prisma.userPreference.findUnique({ where: { userId } });
  return existing ?? { userId, ...DEFAULTS, updatedAt: null };
}

export interface PreferencesUpdate {
  autoplay?: boolean;
  mutedPlayback?: boolean;
  reducedData?: boolean;
  localisedWarnings?: boolean;
  distanceUnit?: string;
  timezone?: string;
}

export async function updatePreferences(userId: string, update: PreferencesUpdate) {
  return prisma.userPreference.upsert({
    where: { userId },
    create: { userId, ...DEFAULTS, ...update },
    update,
  });
}
