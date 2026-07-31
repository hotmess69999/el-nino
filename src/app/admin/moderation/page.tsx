import { notFound } from "next/navigation";
import { getCurrentSession } from "@/lib/auth/session";
import { isModeratorRole, listOpenModerationReports } from "@/lib/moderation/service";
import { ModerationQueue } from "@/components/admin/ModerationQueue";
import styles from "@/components/admin/ModerationQueue.module.css";

/**
 * Section 16: no consumer user can access admin routes or data — checked
 * server-side against the User.role column (never verificationType, a
 * public trust badge). notFound() rather than a 403 page so the route's
 * existence isn't confirmed to unauthorised visitors.
 */
export default async function AdminModerationPage() {
  const session = await getCurrentSession();
  if (!session || !isModeratorRole(session.user.role)) {
    notFound();
  }

  const reports = await listOpenModerationReports();

  return (
    <div className={styles.wrap}>
      <h1 className={styles.title}>Moderation queue</h1>
      <ModerationQueue
        items={reports.map((r) => ({
          id: r.id,
          reason: r.reason,
          note: r.note,
          createdAt: r.createdAt.toISOString(),
          reporterUsername: r.reporter.username,
          targetCaption: r.target.caption,
          targetContributorUsername: r.target.contributor.username,
        }))}
      />
    </div>
  );
}
