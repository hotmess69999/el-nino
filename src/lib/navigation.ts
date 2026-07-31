/**
 * Single source of truth for the primary navigation destinations, per
 * specs/El_Nino_FULL_MASTER_Production_Prompt.md section 6. Order and
 * labels must stay consistent between the mobile bottom nav and the
 * desktop side rail.
 */
export interface NavItem {
  readonly key: string;
  readonly label: string;
  readonly href: string;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { key: "globe", label: "Globe", href: "/" },
  { key: "feed", label: "Feed", href: "/feed" },
  { key: "upload", label: "Upload", href: "/upload" },
  { key: "alerts", label: "Alerts", href: "/alerts" },
  { key: "profile", label: "Profile", href: "/profile" },
] as const;

/**
 * Whether a nav item should render as the active destination for the given
 * pathname. The root ("/") only matches exactly, since every other route is
 * a non-empty prefix of "/" and would otherwise always match.
 */
export function isActiveNavItem(item: NavItem, pathname: string): boolean {
  if (item.href === "/") {
    return pathname === "/";
  }
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}
