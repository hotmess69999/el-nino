"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CATEGORY_META } from "@/lib/map/categories";
import { FEED_REPORTS } from "@/lib/feed/reports";
import { GlobeIcon } from "@/components/nav/icons";
import styles from "./FeedScreen.module.css";

const VERIFICATION_LABEL: Record<string, string> = {
  official: "Official",
  verified: "Verified",
  unconfirmed: "Unconfirmed",
};

/**
 * The vertical weather-video feed. One report fills the viewport at a time
 * (CSS scroll-snap, not a carousel library); only the currently-visible
 * video plays, driven by an IntersectionObserver so hidden videos don't
 * keep decoding. Reports are the same seed events shown on the globe (see
 * src/lib/feed/reports.ts) — "View on globe" closes the loop.
 */
export function FeedScreen() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [muted, setMuted] = useState(true);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const index = Number((entry.target as HTMLElement).dataset["index"]);
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            setActiveIndex(index);
            setPaused(false);
          }
        }
      },
      { root: container, threshold: [0.6] },
    );

    for (const card of container.querySelectorAll<HTMLElement>("[data-index]")) {
      observer.observe(card);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (!video) return;
      if (index === activeIndex && !paused) {
        video.play().catch(() => {
          // Autoplay can be rejected before user interaction; muted
          // playback (the default) should always be allowed by browsers.
        });
      } else {
        video.pause();
      }
    });
  }, [activeIndex, paused]);

  function goTo(index: number) {
    const container = containerRef.current;
    if (!container) return;
    const target = container.querySelector<HTMLElement>(`[data-index="${index}"]`);
    target?.scrollIntoView({ block: "start", behavior: "smooth" });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      goTo(Math.min(activeIndex + 1, FEED_REPORTS.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      goTo(Math.max(activeIndex - 1, 0));
    }
  }

  return (
    <div
      ref={containerRef}
      className={styles.container}
      role="region"
      aria-label="Weather report feed"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <span className={styles.tag}>Generated media — not real footage</span>

      {FEED_REPORTS.map((report, index) => {
        const category = CATEGORY_META[report.event.category];
        const isActive = index === activeIndex;

        return (
          <div key={report.event.id} className={styles.card} data-index={index}>
            <video
              ref={(el) => {
                videoRefs.current[index] = el;
              }}
              className={styles.video}
              src={report.videoSrc}
              muted={muted}
              loop
              playsInline
              preload={Math.abs(index - activeIndex) <= 1 ? "auto" : "none"}
              aria-label={`${report.event.name} weather report video`}
              onClick={() => isActive && setPaused((p) => !p)}
            />

            {isActive && paused && (
              <div className={styles.playState}>
                <span className={styles.playIcon} aria-hidden="true">
                  ▶
                </span>
              </div>
            )}

            <div className={styles.topOverlay}>
              <div className={styles.locationBlock}>
                <p className={styles.location}>{report.event.locationLabel}</p>
                <span className={styles.categoryBadge} style={{ color: category.color }}>
                  <span className={styles.dot} />
                  {category.label}
                </span>
              </div>
              <span className={styles.verificationBadge}>
                {VERIFICATION_LABEL[report.event.verificationStatus]}
              </span>
            </div>

            <div className={styles.bottomOverlay}>
              <p className={styles.contributor}>{report.contributorHandle}</p>
              <p className={styles.caption}>{report.caption}</p>
              <Link href={`/?event=${report.event.id}`} className={styles.globeLink}>
                View on globe →
              </Link>
            </div>

            <div className={styles.sideControls}>
              <button
                type="button"
                className={styles.controlButton}
                aria-label={muted ? "Unmute" : "Mute"}
                aria-pressed={!muted}
                onClick={() => setMuted((m) => !m)}
              >
                {muted ? <MuteIcon /> : <UnmuteIcon />}
              </button>
              <Link
                href={`/?event=${report.event.id}`}
                className={styles.controlButton}
                aria-label="View this event on the globe"
              >
                <GlobeIcon width={20} height={20} />
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MuteIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 9v6h4l5 5V4L8 9H4Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function UnmuteIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 9v6h4l5 5V4L8 9H4Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
