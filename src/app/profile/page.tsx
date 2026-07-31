import { SignInForm } from "@/components/auth/SignInForm";
import { OwnProfile } from "@/components/profile/OwnProfile";
import { getCurrentSession } from "@/lib/auth/session";
import { listWatchZones } from "@/lib/watchZones/service";
import { followCounts } from "@/lib/follows/service";
import styles from "@/components/profile/Profile.module.css";

export default async function ProfilePage() {
  const session = await getCurrentSession();

  if (!session) {
    return (
      <div className={styles.signInPrompt}>
        <SignInForm />
      </div>
    );
  }

  const [zones, counts] = await Promise.all([
    listWatchZones(session.user.id),
    followCounts(session.user.id),
  ]);

  return (
    <OwnProfile
      user={{
        id: session.user.id,
        username: session.user.username,
        name: session.user.name,
        bio: session.user.bio ?? "",
        image: session.user.image ?? null,
        verificationType: session.user.verificationType ?? "none",
        weatherScore: session.user.weatherScore ?? 0,
      }}
      counts={counts}
      zones={zones.map((z) => ({
        id: z.id,
        label: z.label,
        latitude: z.latitude,
        longitude: z.longitude,
        radiusKm: z.radiusKm,
        categories: z.categories,
        minSeverity: z.minSeverity,
        notificationsEnabled: z.notificationsEnabled,
        quietHoursStart: z.quietHoursStart,
        quietHoursEnd: z.quietHoursEnd,
        paused: z.paused,
      }))}
    />
  );
}
