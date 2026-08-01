// Zero-dependency static file server for the standalone repro — no bundler,
// no Next.js, no Turbopack in this path at all.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PORT = 4001;

const MIME = {
  ".html": "text/html",
  ".mjs": "text/javascript",
  ".css": "text/css",
  ".map": "application/json",
};

createServer(async (req, res) => {
  const urlPath = req.url === "/" ? "/index.html" : req.url;
  const filePath = path.join(ROOT, decodeURIComponent(urlPath));
  try {
    const data = await readFile(filePath);
    const ext = path.extname(filePath);
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end("not found: " + urlPath);
  }
}).listen(PORT, () => console.log(`Standalone repro server on http://localhost:${PORT}`));
