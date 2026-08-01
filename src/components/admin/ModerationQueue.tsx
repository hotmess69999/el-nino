"use client";

import { useState } from "react";
import { resolveModerationReportAction } from "@/lib/actions/moderation";
import styles from "./ModerationQueue.module.css";

export interface ModerationQueueItem {
  id: string;
  reason: string;
  note: string | null;
  createdAt: string;
  reporterUsername: string;
  targetCaption: string;
  targetContributorUsername: string;
}

export function ModerationQueue({ items }: { items: ModerationQueueItem[] }) {
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function resolve(id: string, status: "actioned" | "dismissed") {
    setPendingId(id);
    await resolveModerationReportAction(id, status);
    setPendingId(null);
  }

  if (items.length === 0) {
    return <p className={styles.emptyState}>No open reports.</p>;
  }

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>Reported</th>
          <th>Reason</th>
          <th>Reporter</th>
          <th>Contributor</th>
          <th>Filed</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.id}>
            <td>{item.targetCaption}</td>
            <td>{item.reason.replace(/_/g, " ")}</td>
            <td>@{item.reporterUsername}</td>
            <td>@{item.targetContributorUsername}</td>
            <td>{item.createdAt}</td>
            <td>
              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.button}
                  disabled={pendingId === item.id}
                  onClick={() => resolve(item.id, "actioned")}
                >
                  Remove content
                </button>
                <button
                  type="button"
                  className={styles.button}
                  disabled={pendingId === item.id}
                  onClick={() => resolve(item.id, "dismissed")}
                >
                  Dismiss
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
