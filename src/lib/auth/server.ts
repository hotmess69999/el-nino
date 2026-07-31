import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/db/client";

/**
 * Email/password only for Phase 4 — per docs/checkpoints/PHASE-4-PLAN.md,
 * social providers/passkeys/SMS are explicitly out of scope for this phase.
 */
export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  secret: process.env["AUTH_SECRET"],
  baseURL: process.env["APP_BASE_URL"],
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  user: {
    additionalFields: {
      username: { type: "string", required: true, input: true },
      bio: { type: "string", required: false, input: true },
      verificationType: { type: "string", required: false, input: false, defaultValue: "none" },
      weatherScore: { type: "number", required: false, input: false, defaultValue: 0 },
    },
  },
  session: {
    // Section 22: short-lived sessions with rotation, not indefinite ones.
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh once per day of activity
  },
});

export type Session = typeof auth.$Infer.Session;
