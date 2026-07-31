import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const projectRoot = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Pin the workspace root explicitly: this project can be checked out as a
  // git worktree nested under the main checkout, which also has its own
  // package-lock.json — without this, Next/Turbopack's root inference picks
  // up that sibling lockfile and warns.
  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;
