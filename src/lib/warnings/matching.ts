const EARTH_RADIUS_KM = 6371;

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * A warning "matches" a point when the distance between them is within the
 * sum of the warning's and the point's own radius — bounding-box +
 * haversine, not PostGIS (see docs/decisions/0004-database-and-orm.md
 * "Geospatial limitations"). Pure/no DB import so it's testable without a
 * database connection.
 */
export function warningMatchesPoint(
  warning: { latitude: number; longitude: number; radiusKm: number },
  point: { latitude: number; longitude: number; radiusKm?: number },
): boolean {
  const distance = haversineKm(warning.latitude, warning.longitude, point.latitude, point.longitude);
  return distance <= warning.radiusKm + (point.radiusKm ?? 0);
}
