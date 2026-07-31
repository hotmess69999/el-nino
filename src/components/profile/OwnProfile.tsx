"use client";

import { useState } from "react";
import Link from "next/link";
import { ProfileEditor } from "./ProfileEditor";
import { SignOutButton } from "./SignOutButton";
import { WatchZoneManager, type WatchZoneData } from "./WatchZoneManager";
import styles from "./Profile.module.css";

interface OwnProfileProps {
  user: {
    id: string;
    username: string;
    name: string;
    bio: string;
    image: string | null;
    verificationType: string;
    weatherScore: number;
  };
  counts: { followers: number; following: number };
  zones: WatchZoneData[];
}

export function OwnProfile({ user, counts, zones }: OwnProfileProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio);

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div className={styles.avatar} aria-hidden="true">
          {name.charAt(0).toUpperCase()}
        </div>
        <div className={styles.identity}>
          <h1 className={styles.name}>{name}</h1>
          <p className={styles.username}>
            <Link href={`/users/${user.username}`}>@{user.username}</Link>
          </p>
          {user.verificationType !== "none" && (
            <span className={styles.badge}>{user.verificationType.replace("_", " ")}</span>
          )}
        </div>
      </div>

      {editing ? (
        <ProfileEditor
          initialName={name}
          initialBio={bio}
          onDone={(saved) => {
            if (saved) {
              setName(saved.displayName);
              setBio(saved.bio);
            }
            setEditing(false);
          }}
        />
      ) : (
        <>
          {bio && <p className={styles.bio}>{bio}</p>}
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statValue}>{counts.followers}</span>
              <span className={styles.statLabel}>Followers</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>{counts.following}</span>
              <span className={styles.statLabel}>Following</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>{user.weatherScore}</span>
              <span className={styles.statLabel}>Weather score</span>
            </div>
          </div>
          <div className={styles.actions}>
            <button type="button" className={styles.secondaryButton} onClick={() => setEditing(true)}>
              Edit profile
            </button>
            <SignOutButton />
          </div>
        </>
      )}

      <WatchZoneManager zones={zones} />
    </div>
  );
}
