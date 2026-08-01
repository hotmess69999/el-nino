"use client";

import { useState } from "react";
import { updateProfileAction } from "@/lib/actions/profile";
import authStyles from "@/components/auth/AuthForm.module.css";
import styles from "./Profile.module.css";

interface ProfileEditorProps {
  initialName: string;
  initialBio: string;
  onDone: (saved?: { displayName: string; bio: string }) => void;
}

export function ProfileEditor({ initialName, initialBio, onDone }: ProfileEditorProps) {
  const [displayName, setDisplayName] = useState(initialName);
  const [bio, setBio] = useState(initialBio);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const result = await updateProfileAction({ displayName, bio });
    setSubmitting(false);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    onDone(result.value);
  }

  return (
    <form className={authStyles.form} onSubmit={handleSubmit} noValidate>
      <div className={authStyles.field}>
        <label className={authStyles.label} htmlFor="edit-name">
          Display name
        </label>
        <input
          id="edit-name"
          className={authStyles.input}
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
        {errors["displayName"] && <p className={authStyles.error}>{errors["displayName"]}</p>}
      </div>
      <div className={authStyles.field}>
        <label className={authStyles.label} htmlFor="edit-bio">
          Bio
        </label>
        <input
          id="edit-bio"
          className={authStyles.input}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Weather-focused bio"
        />
        {errors["bio"] && <p className={authStyles.error}>{errors["bio"]}</p>}
      </div>
      <div className={styles.actions}>
        <button type="submit" className={styles.primaryButton} disabled={submitting}>
          {submitting ? "Saving…" : "Save"}
        </button>
        <button type="button" className={styles.secondaryButton} onClick={() => onDone()}>
          Cancel
        </button>
      </div>
    </form>
  );
}
