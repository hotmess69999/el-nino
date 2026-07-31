import { notFound } from "next/navigation";
import { FollowButton } from "@/components/profile/FollowButton";
import { getCurrentSession } from "@/lib/auth/session";
import { isFollowing } from "@/lib/follows/service";
import { getPublicProfile } from "@/lib/users/service";
import styles from "@/components/profile/Profile.module.css";

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const profile = await getPublicProfile(handle);
  if (!profile) notFound();

  const session = await getCurrentSession();
  const viewerIsOwner = session?.user.id === profile.id;
  const alreadyFollowing =
    session && !viewerIsOwner ? await isFollowing(session.user.id, profile.id) : false;

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div className={styles.avatar} aria-hidden="true">
          {profile.displayName.charAt(0).toUpperCase()}
        </div>
        <div className={styles.identity}>
          <h1 className={styles.name}>{profile.displayName}</h1>
          <p className={styles.username}>@{profile.username}</p>
          {profile.verificationType !== "none" && (
            <span className={styles.badge}>{profile.verificationType.replace("_", " ")}</span>
          )}
        </div>
      </div>

      {profile.bio && <p className={styles.bio}>{profile.bio}</p>}

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{profile.followers}</span>
          <span className={styles.statLabel}>Followers</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{profile.following}</span>
          <span className={styles.statLabel}>Following</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{profile.weatherScore}</span>
          <span className={styles.statLabel}>Weather score</span>
        </div>
      </div>

      {session && !viewerIsOwner && (
        <FollowButton
          targetUserId={profile.id}
          targetUsername={profile.username}
          initiallyFollowing={alreadyFollowing}
        />
      )}
    </div>
  );
}
