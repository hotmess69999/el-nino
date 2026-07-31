"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, isActiveNavItem } from "@/lib/navigation";
import styles from "./NavShell.module.css";
import { AlertsIcon, FeedIcon, GlobeIcon, ProfileIcon, UploadIcon } from "./icons";

const ICONS = {
  globe: GlobeIcon,
  feed: FeedIcon,
  upload: UploadIcon,
  alerts: AlertsIcon,
  profile: ProfileIcon,
} as const;

export function NavShell() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav} aria-label="Primary">
      {NAV_ITEMS.map((item) => {
        const Icon = ICONS[item.key as keyof typeof ICONS];
        const active = isActiveNavItem(item, pathname);
        return (
          <Link
            key={item.key}
            href={item.href}
            className={active ? `${styles.link} ${styles.linkActive}` : styles.link}
            aria-current={active ? "page" : undefined}
          >
            <Icon />
            <span className={styles.label}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
