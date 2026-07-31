import { Suspense } from "react";
import { GlobeMap } from "@/components/map/GlobeMap";
import { getCurrentSession } from "@/lib/auth/session";
import { listWatchZones } from "@/lib/watchZones/service";

export default async function GlobeHomePage() {
  const session = await getCurrentSession();
  const zones = session ? await listWatchZones(session.user.id) : [];

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
