import type { UserProfile } from "@/lib/db";

export type Role = UserProfile["role"];

export type Permission =
  | "dashboard.view"
  | "members.view"
  | "visitors.view"
  | "converts.view"
  | "cells.view"
  | "meetings.view"
  | "attendance.view"
  | "followups.view"
  | "prayers.view"
  | "testimonies.view"
  | "zones.view"
  | "districts.view"
  | "events.view"
  | "announcements.view"
  | "sermons.view"
  | "books.view"
  | "finance.view"
  | "reports.view"
  | "users.manage"
  | "requests.view"
  | "settings.manage";

// Frontend permissions drive navigation and UX only. Supabase RLS remains the
// real security boundary - see supabase_schema.sql for the enforced policies.
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  super_admin: [
    "dashboard.view", "members.view", "visitors.view", "converts.view", "cells.view",
    "meetings.view", "attendance.view", "followups.view", "prayers.view", "testimonies.view",
    "zones.view", "districts.view", "events.view", "announcements.view", "sermons.view",
    "books.view", "finance.view", "reports.view", "users.manage", "settings.manage",
  ],
  church_admin: [
    "dashboard.view", "members.view", "visitors.view", "converts.view", "cells.view",
    "meetings.view", "attendance.view", "followups.view", "prayers.view", "testimonies.view",
    "zones.view", "districts.view", "events.view", "announcements.view", "sermons.view",
    "books.view", "finance.view", "reports.view", "users.manage",
  ],
  district_pastor: [
    "dashboard.view", "members.view", "visitors.view", "converts.view", "cells.view",
    "meetings.view", "attendance.view", "followups.view", "prayers.view", "testimonies.view",
    "finance.view", "reports.view",
  ],
  zone_pastor: [
    "dashboard.view", "members.view", "visitors.view", "converts.view", "cells.view",
    "meetings.view", "attendance.view", "followups.view", "prayers.view", "testimonies.view",
    "finance.view", "reports.view",
  ],
  cell_leader: [
    "dashboard.view", "members.view", "visitors.view", "converts.view", "cells.view",
    "meetings.view", "attendance.view", "followups.view", "prayers.view", "testimonies.view",
    "finance.view", "reports.view", "requests.view",
  ],
  // Assistant leaders get the same day-to-day people/ministry access as a
  // cell leader, but not "finance.view" (offerings) - see the RLS policies
  // in supabase_schema.sql, which are the layer that actually enforces this.
  assistant_leader: [
    "dashboard.view", "members.view", "visitors.view", "converts.view", "cells.view",
    "meetings.view", "attendance.view", "followups.view", "prayers.view", "testimonies.view",
    "reports.view", "requests.view",
  ],
  media_team: [
    "dashboard.view", "events.view", "announcements.view", "sermons.view", "books.view",
  ],
};

export function getPermissions(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

export function can(role: Role | undefined | null, permission: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function hasRole(role: Role | undefined | null, target: Role): boolean {
  return role === target;
}

export function hasAnyRole(role: Role | undefined | null, targets: Role[]): boolean {
  return !!role && targets.includes(role);
}

// Human-friendly scope label for a role (used in dashboard headers/badges).
export function roleLabel(role: Role): string {
  switch (role) {
    case "super_admin": return "Super Admin";
    case "church_admin": return "Church Admin";
    case "zone_pastor": return "Zone Pastor";
    case "district_pastor": return "District Pastor";
    case "cell_leader": return "Home Cell Leader";
    case "assistant_leader": return "Assistant Leader";
    case "media_team": return "Media Coordinator";
    default: return "Church Member";
  }
}
