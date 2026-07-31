/**
 * Lightweight WebGL support probe, used instead of MapLibre's removed
 * `supported()` helper (not present in maplibre-gl 6.x's public API).
 * Client-only — callers must guard against SSR themselves.
 */
export function isWebglSupported(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGL2RenderingContext && (canvas.getContext("webgl2") || canvas.getContext("webgl")),
    );
  } catch {
    return false;
  }
}
