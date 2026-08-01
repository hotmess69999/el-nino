"use client";

import { useState } from "react";
import { fileModerationReportAction } from "@/lib/actions/moderation";
import { MODERATION_REASONS } from "@/lib/moderation/reasons";
import styles from "./FeedScreen.module.css";

interface ReportButtonProps {
  reportId: string;
  eventName: string;
}

/**
 * Files a Phase 8 ModerationReport against the seed Report row backing this
 * feed item (see src/lib/feed/reports.ts's reportId, prisma/seed.ts). Signed
 * out users are told to sign in rather than the control silently doing
 * nothing — requireCurrentUser() would otherwise throw an opaque error.
 */
export function ReportButton({ reportId, eventName }: ReportButtonProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string>(MODERATION_REASONS[0]);
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");

  async function submit() {
    setStatus("submitting");
    try {
      await fileModerationReportAction(reportId, reason);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <span className={styles.reportDone} role="status">
        Reported
      </span>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        className={styles.controlButton}
        aria-label={`Report ${eventName}`}
        onClick={() => setOpen(true)}
      >
        <ReportIcon />
      </button>
    );
  }

  return (
    <div className={styles.reportMenu} role="group" aria-label={`Report ${eventName}`}>
      <select
        className={styles.reportSelect}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        aria-label="Report reason"
      >
        {MODERATION_REASONS.map((r) => (
          <option key={r} value={r}>
            {r.replace(/_/g, " ")}
          </option>
        ))}
      </select>
      <button type="button" className={styles.controlButton} onClick={submit} disabled={status === "submitting"}>
        Submit
      </button>
      <button type="button" className={styles.controlButton} onClick={() => setOpen(false)}>
        Cancel
      </button>
      {status === "error" && (
        <p className={styles.reportError} role="alert">
          Sign in to report content.
        </p>
      )}
    </div>
  );
}

function ReportIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 9v4M12 16h.01M4.5 19h15a1 1 0 0 0 .87-1.5L13.87 4a1 1 0 0 0-1.74 0L4.63 17.5A1 1 0 0 0 4.5 19Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
