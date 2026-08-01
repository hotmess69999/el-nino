"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth/client";
import { isValidUsername, normalizeUsername } from "@/lib/users/validation";
import styles from "./AuthForm.module.css";

/**
 * Development sign-up path: email/password only (Phase 4 scope — see
 * docs/checkpoints/PHASE-4-PLAN.md). No email delivery is configured yet,
 * so accounts are created and signed in immediately without a verification
 * step.
 */
export function SignUpForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const normalized = normalizeUsername(username);
    if (!isValidUsername(normalized)) {
      setError("Username must be 3-24 characters: lowercase letters, numbers, underscores.");
      return;
    }
    if (!name.trim()) {
      setError("Display name is required.");
      return;
    }

    setSubmitting(true);
    // authClient isn't typed with the server's additionalFields (username) —
    // better-auth still accepts and stores it at runtime; see
    // src/lib/auth/server.ts's user.additionalFields.username.
    const { error: signUpError } = await authClient.signUp.email({
      email,
      password,
      name: name.trim(),
      username: normalized,
    } as Parameters<typeof authClient.signUp.email>[0]);
    setSubmitting(false);

    if (signUpError) {
      setError(signUpError.message ?? "Couldn't create your account.");
      return;
    }
    router.push("/profile");
    router.refresh();
  }

  return (
    <div className={styles.wrap}>
      <h1 className={styles.title}>Create your account</h1>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="name">
            Display name
          </label>
          <input
            id="name"
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            required
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="username">
            Username
          </label>
          <input
            id="username"
            className={styles.input}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            className={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
          />
        </div>

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        <button type="submit" className={styles.submit} disabled={submitting}>
          {submitting ? "Creating account…" : "Create account"}
        </button>
      </form>
      <Link href="/sign-in" className={styles.switchLink}>
        Already have an account? Sign in
      </Link>
    </div>
  );
}
