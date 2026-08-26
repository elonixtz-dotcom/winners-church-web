import {
  Users, ClipboardCheck, UserPlus, Sprout, Home, PlusCircle, BarChart3,
  CalendarDays, Megaphone, BookText, Library, PhoneCall, FileEdit,
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type {
  Member, Visitor, NewConvert, MeetingRecord, WeeklyReport, AttendanceRecord,
  HomeCell, ChurchEvent, Announcement, Sermon, Book,
} from "@/lib/db";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatCard from "@/components/dashboard/StatCard";
import HealthScore from "@/components/dashboard/HealthScore";
import AttentionList, { type AttentionItem } from "@/components/dashboard/AttentionList";
import QuickActions, { type QuickAction } from "@/components/dashboard/QuickActions";
import StatusBadge from "@/components/dashboard/StatusBadge";

// =========================================================================
// Real-data calculation helpers (no fabricated numbers - everything below
// is derived directly from the records passed in).
// =========================================================================
function pct(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0;
  return Math.round((numerator / denominator) * 100);
}

function withinDays(dateStr: string, days: number): boolean {
  const d = new Date(dateStr).getTime();
  const now = Date.now();
  return now - d <= days * 24 * 60 * 60 * 1000 && now - d >= 0;
}

function isThisMonth(dateStr: string): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

function last6MonthKeys(): string[] {
  const keys: string[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return keys;
}

function monthLabel(key: string): string {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-US", { month: "short" });
}

function memberGrowthSeries(members: Member[]) {
  return last6MonthKeys().map((key) => {
    const [y, m] = key.split("-").map(Number);
    const endOfMonth = new Date(y, m, 0, 23, 59, 59).getTime();
    const total = members.filter((mem) => new Date(mem.created_at).getTime() <= endOfMonth).length;
    return { month: monthLabel(key), total };
  });
}

function growthTrend(series: { total: number }[]): { value: number; label: string } | undefined {
  if (series.length < 2) return undefined;
  const prev = series[series.length - 2].total;
  const curr = series[series.length - 1].total;
  if (prev <= 0) return undefined;
  return { value: Math.round(((curr - prev) / prev) * 100), label: "this month" };
}

function attendanceTrendSeries(reports: WeeklyReport[]) {
  return [...reports]
    .sort((a, b) => new Date(a.report_date).getTime() - new Date(b.report_date).getTime())
    .slice(-8)
    .map((r) => ({
      date: new Date(r.report_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      attendance: r.members_present,
    }));
}

export function attendanceRateFromRecords(records: AttendanceRecord[]): number {
  if (records.length === 0) return 0;
  return pct(records.filter((r) => r.present).length, records.length);
}

function followUpRate(visitors: Visitor[]): number {
  if (visitors.length === 0) return 0;
  const resolved = visitors.filter((v) => v.follow_up_status === "Contacted" || v.follow_up_status === "Joined Church").length;
  return pct(resolved, visitors.length);
}

function visitorsNeedingFollowUp(visitors: Visitor[]): Visitor[] {
  return visitors.filter((v) => v.follow_up_status === "New" || v.follow_up_status === "Awaiting Visit");
}

function cellActivityRate(cells: HomeCell[], meetings: MeetingRecord[]): number {
  if (cells.length === 0) return 0;
  const activeCellIds = new Set(meetings.filter((m) => withinDays(m.meeting_date, 30)).map((m) => m.home_cell_id));
  return pct(activeCellIds.size, cells.length);
}

function reportingRate(cells: HomeCell[], reports: WeeklyReport[]): number {
  if (cells.length === 0) return 0;
  const reportedCellIds = new Set(reports.filter((r) => withinDays(r.report_date, 7)).map((r) => r.home_cell_id));
  return pct(reportedCellIds.size, cells.length);
}

function cellsMissingReports(cells: HomeCell[], reports: WeeklyReport[]): HomeCell[] {
  const reportedCellIds = new Set(reports.filter((r) => withinDays(r.report_date, 7)).map((r) => r.home_cell_id));
  return cells.filter((c) => !reportedCellIds.has(c.id));
}

function consecutivelyAbsentMembers(members: Member[], meetings: MeetingRecord[], attendance: AttendanceRecord[], threshold = 3): Member[] {
  const recentMeetings = [...meetings]
    .sort((a, b) => new Date(b.meeting_date).getTime() - new Date(a.meeting_date).getTime())
    .slice(0, threshold);
  if (recentMeetings.length < threshold) return [];
  const byMeeting = recentMeetings.map((m) => {
    const map = new Map<string, boolean>();
    attendance.filter((a) => a.meeting_record_id === m.id).forEach((a) => map.set(a.member_id, a.present));
    return map;
  });
  return members.filter((mem) => byMeeting.every((map) => map.get(mem.id) === false));
}

// =========================================================================
// SUPER ADMIN / CHURCH ADMIN OVERVIEW
// =========================================================================
interface OrgOverviewProps {
  title: string;
  subtitle: string;
  scopeLabel: string;
  userName: string;
  cells: HomeCell[];
  members: Member[];
  visitors: Visitor[];
  newConverts: NewConvert[];
  meetings: MeetingRecord[];
  reports: WeeklyReport[];
  attendance: AttendanceRecord[];
  onNavigate: (tab: string) => void;
  quickActions: QuickAction[];
  performance?: { title: string; rows: { label: string; members: number; attendanceRate: number; visitors: number }[] };
}

export function OrgOverview({
  title, subtitle, scopeLabel, userName, cells, members, visitors, newConverts,
  meetings, reports, attendance, onNavigate, quickActions, performance,
}: OrgOverviewProps) {
  const growth = memberGrowthSeries(members);
  const trend = growthTrend(growth);
  const attendanceTrend = attendanceTrendSeries(reports);
  const currentAttendanceRate = attendance.length > 0
    ? attendanceRateFromRecords(attendance)
    : (reports[0] ? pct(reports[0].members_present, reports[0].total_members) : 0);

  const followUp = followUpRate(visitors);
  const cellActivity = cellActivityRate(cells, meetings);
  const reporting = reportingRate(cells, reports);
  const overallHealth = Math.round((currentAttendanceRate + followUp + cellActivity + reporting) / 4);

  const needFollowUp = visitorsNeedingFollowUp(visitors);
  const missingReports = cellsMissingReports(cells, reports);
  const absentMembers = consecutivelyAbsentMembers(members, meetings, attendance);

  const attentionItems: AttentionItem[] = [];
  if (absentMembers.length > 0) {
    attentionItems.push({
      severity: "critical",
      title: `${absentMembers.length} member${absentMembers.length === 1 ? "" : "s"}`,
      description: "Absent for the last 3 consecutive meetings",
      actionLabel: "Review", onAction: () => onNavigate("members"),
    });
  }
  if (needFollowUp.length > 0) {
    attentionItems.push({
      severity: "warning",
      title: `${needFollowUp.length} visitor${needFollowUp.length === 1 ? "" : "s"}`,
      description: "Need follow-up",
      actionLabel: "Follow Up", onAction: () => onNavigate("visitors"),
    });
  }
  if (missingReports.length > 0 && cells.length > 0) {
    attentionItems.push({
      severity: "warning",
      title: `${missingReports.length} cell${missingReports.length === 1 ? "" : "s"}`,
      description: "Haven't submitted a weekly report in 7+ days",
      actionLabel: "Review", onAction: () => onNavigate("reports"),
    });
  }
  if (reports.some((r) => withinDays(r.report_date, 7))) {
    attentionItems.push({ severity: "success", title: "Attendance", description: "This week's attendance has been recorded" });
  }

  return (
    <div className="space-y-6">
      <DashboardHeader
        name={userName}
        subtitle={subtitle}
        scopeLabel={scopeLabel}
        actions={
          <>
            <button onClick={() => onNavigate("events")} className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition">
              <PlusCircle className="h-3.5 w-3.5" /> Create Event
            </button>
            <button onClick={() => onNavigate("reports")} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition">
              <BarChart3 className="h-3.5 w-3.5" /> View Reports
            </button>
          </>
        }
      />
      <p className="sr-only">{title}</p>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total Members" value={members.length} icon={Users} trend={trend} />
            <StatCard label="Attendance" value={`${currentAttendanceRate}%`} icon={ClipboardCheck} iconBg="bg-blue-50" iconColor="text-blue-600" />
            <StatCard label="Visitors" value={visitors.length} icon={UserPlus} iconBg="bg-emerald-50" iconColor="text-emerald-600" trend={{ value: visitors.filter((v) => isThisMonth(v.first_visit_date)).length, label: "new this month" }} />
            <StatCard label="New Converts" value={newConverts.length} icon={Sprout} iconBg="bg-amber-50" iconColor="text-amber-600" trend={{ value: newConverts.filter((c) => isThisMonth(c.date_of_salvation)).length, label: "this month" }} />
          </div>

          {(attendanceTrend.length > 0 || growth.length > 0) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {attendanceTrend.length > 0 && (
                <div className="bg-card rounded-2xl border border-border/40 p-5 shadow-sm">
                  <h3 className="font-heading text-sm font-bold text-foreground mb-4">Attendance Trend</h3>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={attendanceTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                        <Line type="monotone" dataKey="attendance" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
              <div className="bg-card rounded-2xl border border-border/40 p-5 shadow-sm">
                <h3 className="font-heading text-sm font-bold text-foreground mb-4">Member Growth</h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={growth}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                      <Bar dataKey="total" fill="hsl(var(--gold))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {performance && performance.rows.length > 0 && (
            <div className="bg-card rounded-2xl border border-border/40 p-5 shadow-sm">
              <h3 className="font-heading text-sm font-bold text-foreground mb-4">{performance.title}</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-muted-foreground border-b border-border/40">
                      <th className="pb-2 font-semibold">Name</th>
                      <th className="pb-2 font-semibold text-right">Members</th>
                      <th className="pb-2 font-semibold text-right">Attendance</th>
                      <th className="pb-2 font-semibold text-right">Visitors</th>
                      <th className="pb-2 font-semibold text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {performance.rows.map((row) => {
                      const status = row.attendanceRate >= 75 ? "healthy" : row.attendanceRate >= 50 ? "attention" : "critical";
                      return (
                        <tr key={row.label} className="border-b border-border/20 last:border-0">
                          <td className="py-2.5 font-medium text-foreground">{row.label}</td>
                          <td className="py-2.5 text-right">{row.members}</td>
                          <td className="py-2.5 text-right">{row.attendanceRate}%</td>
                          <td className="py-2.5 text-right">{row.visitors}</td>
                          <td className="py-2.5 text-right"><StatusBadge status={status} /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <AttentionList items={attentionItems} />
          <QuickActions actions={quickActions} />
        </div>

        <div className="space-y-6">
          <HealthScore
            title="Church Health"
            score={overallHealth}
            breakdown={[
              { label: "Attendance", value: currentAttendanceRate },
              { label: "Follow-up", value: followUp },
              { label: "Cell Activity", value: cellActivity },
              { label: "Reporting", value: reporting },
            ]}
          />
        </div>
      </div>
    </div>
  );
}

export function buildOrgAdminQuickActions(onNavigate: (tab: string) => void): QuickAction[] {
  return [
    { label: "Add Member", icon: Users, onClick: () => onNavigate("members"), tint: "primary" },
    { label: "Add Visitor", icon: UserPlus, onClick: () => onNavigate("visitors"), tint: "emerald" },
    { label: "Create Event", icon: CalendarDays, onClick: () => onNavigate("events"), tint: "rose" },
    { label: "Record Attendance", icon: ClipboardCheck, onClick: () => onNavigate("attendance"), tint: "blue" },
    { label: "Create Announcement", icon: Megaphone, onClick: () => onNavigate("announcements"), tint: "gold" },
    { label: "View Reports", icon: BarChart3, onClick: () => onNavigate("reports"), tint: "violet" },
  ];
}

export function buildSupervisorQuickActions(onNavigate: (tab: string) => void): QuickAction[] {
  return [
    { label: "Review Cells", icon: Home, onClick: () => onNavigate("cells"), tint: "primary" },
    { label: "Review Attendance", icon: ClipboardCheck, onClick: () => onNavigate("meetings"), tint: "blue" },
    { label: "View Follow-ups", icon: PhoneCall, onClick: () => onNavigate("followups"), tint: "emerald" },
    { label: "View Reports", icon: BarChart3, onClick: () => onNavigate("reports"), tint: "violet" },
  ];
}

// =========================================================================
// CELL LEADER / ASSISTANT LEADER OVERVIEW
// =========================================================================
interface CellOverviewProps {
  userName: string;
  cell: HomeCell;
  members: Member[];
  visitors: Visitor[];
  newConverts: NewConvert[];
  meetings: MeetingRecord[];
  reports: WeeklyReport[];
  attendance: AttendanceRecord[];
  followUps: { follow_up_date: string }[];
  onNavigate: (tab: string) => void;
}

export function CellLeaderOverview({
  userName, cell, members, visitors, newConverts, meetings, reports, attendance, onNavigate,
}: CellOverviewProps) {
  const currentAttendanceRate = attendanceRateFromRecords(attendance);
  const followUp = followUpRate(visitors);
  const reporting = reports.some((r) => withinDays(r.report_date, 7)) ? 100 : 0;
  const memberActivity = (() => {
    const recent3 = [...meetings].sort((a, b) => new Date(b.meeting_date).getTime() - new Date(a.meeting_date).getTime()).slice(0, 3);
    if (recent3.length === 0 || members.length === 0) return 0;
    const activeIds = new Set(
      attendance.filter((a) => recent3.some((m) => m.id === a.meeting_record_id) && a.present).map((a) => a.member_id)
    );
    return pct(activeIds.size, members.length);
  })();
  const overallHealth = Math.round((currentAttendanceRate + followUp + memberActivity + reporting) / 4);

  const needFollowUp = visitorsNeedingFollowUp(visitors);
  const absentMembers = consecutivelyAbsentMembers(members, meetings, attendance);
  const pendingConverts = newConverts.filter((c) => c.foundation_class_status === "not_started");
  const upcomingMeeting = [...meetings]
    .filter((m) => new Date(m.meeting_date).getTime() >= Date.now() - 24 * 60 * 60 * 1000)
    .sort((a, b) => new Date(a.meeting_date).getTime() - new Date(b.meeting_date).getTime())[0];

  const attentionItems: AttentionItem[] = [];
  if (absentMembers.length > 0) {
    attentionItems.push({
      severity: "critical",
      title: `${absentMembers.length} member${absentMembers.length === 1 ? "" : "s"}`,
      description: "Haven't attended the last 3 meetings",
      actionLabel: "Review", onAction: () => onNavigate("members"),
    });
  }
  if (needFollowUp.length > 0) {
    attentionItems.push({
      severity: "warning",
      title: `${needFollowUp.length} visitor${needFollowUp.length === 1 ? "" : "s"}`,
      description: "Need follow-up",
      actionLabel: "Follow Up", onAction: () => onNavigate("visitors"),
    });
  }
  if (pendingConverts.length > 0) {
    attentionItems.push({
      severity: "info",
      title: `${pendingConverts.length} new convert${pendingConverts.length === 1 ? "" : "s"}`,
      description: "Haven't started foundation class",
      actionLabel: "Review", onAction: () => onNavigate("converts"),
    });
  }
  if (reporting === 0) {
    attentionItems.push({
      severity: "warning",
      title: "Weekly report",
      description: "Not yet submitted for this week",
      actionLabel: "Submit", onAction: () => onNavigate("reports"),
    });
  } else {
    attentionItems.push({ severity: "success", title: "Weekly report", description: "Submitted this week" });
  }

  return (
    <div className="space-y-6">
      <DashboardHeader name={userName} subtitle="Here's how your cell is doing this week." scopeLabel={`My Cell: ${cell.name}`} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Members" value={members.length} icon={Users} />
            <StatCard label="Attendance" value={`${currentAttendanceRate}%`} icon={ClipboardCheck} iconBg="bg-blue-50" iconColor="text-blue-600" />
            <StatCard label="Visitors" value={visitors.length} icon={UserPlus} iconBg="bg-emerald-50" iconColor="text-emerald-600" />
            <StatCard label="New Converts" value={newConverts.length} icon={Sprout} iconBg="bg-amber-50" iconColor="text-amber-600" />
          </div>

          <AttentionList items={attentionItems} />

          <QuickActions
            actions={[
              { label: "Record Attendance", icon: ClipboardCheck, onClick: () => onNavigate("attendance"), tint: "blue" },
              { label: "Add Visitor", icon: UserPlus, onClick: () => onNavigate("visitors"), tint: "emerald" },
              { label: "Add Member", icon: Users, onClick: () => onNavigate("members"), tint: "primary" },
              { label: "Add Follow-up", icon: PhoneCall, onClick: () => onNavigate("followups"), tint: "rose" },
              { label: "Submit Report", icon: FileEdit, onClick: () => onNavigate("reports"), tint: "violet" },
            ]}
          />
        </div>

        <div className="space-y-6">
          <HealthScore
            title="Cell Health"
            score={overallHealth}
            breakdown={[
              { label: "Attendance", value: currentAttendanceRate },
              { label: "Follow-up", value: followUp },
              { label: "Member Activity", value: memberActivity },
              { label: "Reporting", value: reporting },
            ]}
          />
          <div className="bg-card rounded-2xl border border-border/40 p-5 shadow-sm">
            <h3 className="font-heading text-sm font-bold text-foreground mb-3">Upcoming</h3>
            {upcomingMeeting ? (
              <div className="text-xs">
                <div className="font-semibold text-foreground">{upcomingMeeting.meeting_topic || "Home Cell Meeting"}</div>
                <div className="text-muted-foreground mt-1">
                  {new Date(upcomingMeeting.meeting_date).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No upcoming meetings scheduled.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// MEDIA TEAM OVERVIEW
// =========================================================================
interface MediaOverviewProps {
  userName: string;
  events: ChurchEvent[];
  announcements: Announcement[];
  sermons: Sermon[];
  books: Book[];
  onNavigate: (tab: string) => void;
}

export function MediaTeamOverview({ userName, events, announcements, sermons, books, onNavigate }: MediaOverviewProps) {
  const upcomingEvents = events.filter((e) => new Date(e.event_date).getTime() >= Date.now());
  const pendingBooks = books.filter((b) => !b.is_approved);
  const nextEvent = [...upcomingEvents].sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())[0];

  const attentionItems: AttentionItem[] = [];
  if (pendingBooks.length > 0) {
    attentionItems.push({
      severity: "warning",
      title: `${pendingBooks.length} book${pendingBooks.length === 1 ? "" : "s"}`,
      description: "Awaiting approval before publishing",
      actionLabel: "Review", onAction: () => onNavigate("books"),
    });
  }
  if (nextEvent) {
    const daysAway = Math.round((new Date(nextEvent.event_date).getTime() - Date.now()) / (24 * 60 * 60 * 1000));
    attentionItems.push({
      severity: daysAway <= 1 ? "critical" : "info",
      title: nextEvent.title,
      description: daysAway <= 0 ? "Happening today" : daysAway === 1 ? "Starts tomorrow" : `In ${daysAway} days`,
      actionLabel: "View", onAction: () => onNavigate("events"),
    });
  }

  return (
    <div className="space-y-6">
      <DashboardHeader name={userName} subtitle="Here's what's happening across content and media." scopeLabel="Media Command Center" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Upcoming Events" value={upcomingEvents.length} icon={CalendarDays} iconBg="bg-rose-50" iconColor="text-rose-600" />
        <StatCard label="Announcements" value={announcements.length} icon={Megaphone} iconBg="bg-gold/15" iconColor="text-gold-foreground" />
        <StatCard label="Sermons" value={sermons.length} icon={BookText} iconBg="bg-blue-50" iconColor="text-blue-600" />
        <StatCard label="Books" value={books.length} icon={Library} iconBg="bg-emerald-50" iconColor="text-emerald-600" />
      </div>

      <div className="bg-card rounded-2xl border border-border/40 p-5 shadow-sm">
        <h3 className="font-heading text-sm font-bold text-foreground mb-4">Books Pipeline</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl bg-amber-50 p-4 text-center">
            <div className="text-2xl font-bold text-amber-700">{pendingBooks.length}</div>
            <div className="text-xs font-semibold text-amber-700/80 mt-1">Pending Approval</div>
          </div>
          <div className="rounded-xl bg-emerald-50 p-4 text-center">
            <div className="text-2xl font-bold text-emerald-700">{books.length - pendingBooks.length}</div>
            <div className="text-xs font-semibold text-emerald-700/80 mt-1">Approved & Published</div>
          </div>
        </div>
      </div>

      <AttentionList items={attentionItems} />

      <QuickActions
        actions={[
          { label: "Create Announcement", icon: Megaphone, onClick: () => onNavigate("announcements"), tint: "gold" },
          { label: "Create Event", icon: CalendarDays, onClick: () => onNavigate("events"), tint: "rose" },
          { label: "Upload Sermon", icon: BookText, onClick: () => onNavigate("sermons"), tint: "blue" },
          { label: "Manage Books", icon: Library, onClick: () => onNavigate("books"), tint: "emerald" },
        ]}
      />
    </div>
  );
}
