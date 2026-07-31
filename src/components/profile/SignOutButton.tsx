"use client";

import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth/client";
import styles from "./Profile.module.css";

export function SignOutButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      className={styles.secondaryButton}
      onClick={async () => {
        await signOut();
        router.push("/");
        router.refresh();
      }}
    >
      Sign out
    </button>
  );
}
