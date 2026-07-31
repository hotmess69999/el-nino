"use client";

import { useState } from "react";
import { followUserAction, unfollowUserAction } from "@/lib/actions/profile";
import styles from "./Profile.module.css";

interface FollowButtonProps {
  targetUserId: string;
  targetUsername: string;
  initiallyFollowing: boolean;
}

export function FollowButton({ targetUserId, targetUsername, initiallyFollowing }: FollowButtonProps) {
  const [following, setFollowing] = useState(initiallyFollowing);
  const [pending, setPending] = useState(false);

  async function toggle() {
    setPending(true);
    if (following) {
      await unfollowUserAction(targetUserId, targetUsername);
      setFollowing(false);
    } else {
      await followUserAction(targetUserId, targetUsername);
      setFollowing(true);
    }
    setPending(false);
  }

  return (
    <button
      type="button"
      className={following ? styles.secondaryButton : styles.primaryButton}
      onClick={toggle}
      disabled={pending}
      aria-pressed={following}
    >
      {following ? "Following" : "Follow"}
    </button>
  );
}
