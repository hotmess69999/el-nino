import { Suspense } from "react";
import { GlobeMap } from "@/components/map/GlobeMap";
import { getCurrentSession } from "@/lib/auth/session";
import { listWatchZones } from "@/lib/watchZones/service";

export default async function GlobeHomePage() {
  const session = await getCurrentSession();
  // Watch Zone markers are a personalisation layer, not core map data — a
  // DB failure here must not take the globe down (section 23).
  const zones = session
    ? await listWatchZones(session.user.id).catch(() => [])
    : [];

  return (
    <Suspense fallback={null}>
      <GlobeMap
        watchZones={zones
          .filter((z) => !z.paused)
          .map((z) => ({ id: z.id, label: z.label, latitude: z.latitude, longitude: z.longitude }))}
      />
    </Suspense>
  );
}
