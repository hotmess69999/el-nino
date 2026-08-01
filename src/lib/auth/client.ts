"use client";

import { createAuthClient } from "better-auth/react";

// No baseURL override — defaults to same-origin, which is correct for every
// environment this app runs in (dev/staging/production all serve the app
// and its /api/auth routes from the same host).
export const authClient = createAuthClient();

export const { useSession, signIn, signOut, signUp } = authClient;
