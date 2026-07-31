// Regenerates public/map/graticule.png — the globe's lat/lon grid texture.
// Run from the repository root: node scripts/generate-graticule-image.mjs
//
// This is a pre-rendered raster image, not a GeoJSON source, because
// GeoJSON sources never finish loading in this project's Next.js/Turbopack
// bundler setup (see src/lib/map/config.ts and docs/dependency-security-log.md
// for the investigation). If that's ever fixed upstream, src/lib/map/graticule.ts
// has the equivalent pure-function GeoJSON generator ready to swap back in.
import sharp from "sharp";

const WIDTH = 2048;
const HEIGHT = 1024; // equirectangular, full world: 360deg x 180deg
const STEP_DEG = 30;
const COLOR = "#4a5568";
const OPACITY = 0.85;

let lines = "";
for (let lon = -180; lon <= 180; lon += STEP_DEG) {
  const x = ((lon + 180) / 360) * WIDTH;
  lines += `<line x1="${x}" y1="0" x2="${x}" y2="${HEIGHT}" stroke="${COLOR}" stroke-width="2" stroke-opacity="${OPACITY}" />`;
}
for (let lat = -60; lat <= 60; lat += STEP_DEG) {
  const y = ((90 - lat) / 180) * HEIGHT;
  lines += `<line x1="0" y1="${y}" x2="${WIDTH}" y2="${y}" stroke="${COLOR}" stroke-width="2" stroke-opacity="${OPACITY}" />`;
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
  <rect width="${WIDTH}" height="${HEIGHT}" fill="transparent" />
  ${lines}
</svg>`;

await sharp(Buffer.from(svg)).png().toFile("public/map/graticule.png");
console.log("Written public/map/graticule.png");
