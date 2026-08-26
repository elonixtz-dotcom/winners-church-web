import {
  LayoutDashboard, Users, UserPlus, Sprout, Home, Calendar, ClipboardCheck,
  PhoneCall, HandHeart, BookOpen, Globe2, Map, CalendarDays, Megaphone,
  BookText, Library, Wallet, BarChart3, UserCog, ClipboardList,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "@/lib/permissions";

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

export interface NavGroup {
  group: string;
  items: NavItem[];
}

const OVERVIEW = (label = "Dashboard"): NavItem => ({ id: "overview", label, icon: LayoutDashboard });

export function getDashboardNav(role: Role): NavGroup[] {
  switch (role) {
    case "super_admin":
    case "church_admin":
      return [
        { group: "Overview", items: [OVERVIEW()] },
        {
          group: "People", items: [
            { id: "members", label: "Members", icon: Users },
            { id: "visitors", label: "Visitors", icon: UserPlus },
            { id: "converts", label: "New Converts", icon: Sprout },
          ],
        },
        {
          group: "Ministry", items: [
            { id: "cells", label: "Home Cells", icon: Home },
            { id: "meetings", label: "Meetings", icon: Calendar },
            { id: "attendance", label: "Attendance", icon: ClipboardCheck },
            { id: "followups", label: "Follow-ups", icon: PhoneCall },
            { id: "prayers", label: "Prayer Requests", icon: HandHeart },
            { id: "testimonies", label: "Testimonies", icon: BookOpen },
          ],
        },
        {
          group: "Organization", items: [
            { id: "zones", label: "Zones", icon: Globe2 },
            { id: "districts", label: "Districts", icon: Map },
          ],
        },
        {
          group: "Content", items: [
            { id: "events", label: "Events", icon: CalendarDays },
            { id: "announcements", label: "Announcements", icon: Megaphone },
            { id: "sermons", label: "Sermons", icon: BookText },
            { id: "books", label: "Books", icon: Library },
          ],
        },
        { group: "Finance", items: [{ id: "offerings", label: "Offerings", icon: Wallet }] },
        { group: "Insights", items: [{ id: "reports", label: "Reports", icon: BarChart3 }] },
        { group: "System", items: [{ id: "users", label: "Users", icon: UserCog }] },
      ];

    case "district_pastor":
    case "zone_pastor":
      return [
        { group: "Overview", items: [OVERVIEW()] },
        { group: "Organization", items: [{ id: "cells", label: "Home Cells", icon: Home }] },
        {
          group: "People", items: [
            { id: "members", label: "Members", icon: Users },
            { id: "visitors", label: "Visitors", icon: UserPlus },
            { id: "converts", label: "New Converts", icon: Sprout },
          ],
        },
        {
          group: "Ministry", items: [
            { id: "meetings", label: "Meetings", icon: Calendar },
            { id: "followups", label: "Follow-ups", icon: PhoneCall },
            { id: "prayers", label: "Prayer Requests", icon: HandHeart },
            { id: "testimonies", label: "Testimonies", icon: BookOpen },
          ],
        },
        { group: "Finance", items: [{ id: "offerings", label: "Offerings", icon: Wallet }] },
        { group: "Insights", items: [{ id: "reports", label: "Reports", icon: BarChart3 }] },
      ];

    case "cell_leader":
    case "assistant_leader":
      return [
        { group: "Overview", items: [OVERVIEW()] },
        { group: "My Cell", items: [{ id: "cell", label: "My Cell", icon: Home }] },
        {
          group: "People", items: [
            { id: "members", label: "Members", icon: Users },
            { id: "visitors", label: "Visitors", icon: UserPlus },
            { id: "converts", label: "New Converts", icon: Sprout },
          ],
        },
        {
          group: "Ministry", items: [
            { id: "meetings", label: "Meetings", icon: Calendar },
            { id: "attendance", label: "Attendance", icon: ClipboardCheck },
            { id: "followups", label: "Follow-ups", icon: PhoneCall },
            { id: "prayers", label: "Prayer Requests", icon: HandHeart },
            { id: "testimonies", label: "Testimonies", icon: BookOpen },
          ],
        },
        { group: "Finance", items: [{ id: "offerings", label: "Offerings", icon: Wallet }] },
        {
          group: "Insights", items: [
            { id: "reports", label: "Reports", icon: BarChart3 },
            { id: "requests", label: "Requests", icon: ClipboardList },
          ],
        },
      ];

    case "media_team":
      return [
        { group: "Overview", items: [OVERVIEW("Command Center")] },
        {
          group: "Content", items: [
            { id: "events", label: "Events", icon: CalendarDays },
            { id: "announcements", label: "Announcements", icon: Megaphone },
            { id: "sermons", label: "Sermons", icon: BookText },
            { id: "books", label: "Books", icon: Library },
          ],
        },
      ];

    default:
      return [{ group: "Overview", items: [OVERVIEW()] }];
  }
}
