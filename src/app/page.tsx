import { Suspense } from "react";
import { GlobeMap } from "@/components/map/GlobeMap";

export default function GlobeHomePage() {
  return (
    <Suspense fallback={null}>
      <GlobeMap />
    </Suspense>
  );
}
