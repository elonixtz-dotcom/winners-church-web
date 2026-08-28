import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Menu, LogOut, Home, BookOpen } from "lucide-react";
import {
  db,
  uploadMediaImage,
  UserProfile,
  HomeCell,
  Member,
  AttendanceRecord,
  Visitor,
  ChurchEvent,
  Announcement,
  WeeklyReport,
  Sermon,
  CellMembershipRequest,
  Book,
  MeetingRecord,
  NewConvert,
  PrayerRequest,
  PrayerWallRequest,
  ContactMessage,
  FollowUp,
  Testimony,
  Offering,
  Zone,
  District,
} from "@/lib/db";
import { roleLabel } from "@/lib/permissions";
import Sidebar from "@/components/dashboard/Sidebar";
import { DashboardSkeleton } from "@/components/dashboard/Skeletons";
import ErrorState from "@/components/dashboard/ErrorState";
import EmptyState from "@/components/dashboard/EmptyState";
import StatusBadge from "@/components/dashboard/StatusBadge";
import DetailDrawer, { DetailSection, DetailRow } from "@/components/dashboard/DetailDrawer";
import {
  OrgOverview, CellLeaderOverview, MediaTeamOverview,
  buildOrgAdminQuickActions, buildSupervisorQuickActions, attendanceRateFromRecords,
  buildOrgAttentionItems, buildCellAttentionItems, buildMediaAttentionItems,
} from "@/components/dashboard/RoleOverviews";
import NotificationBell from "@/components/dashboard/NotificationBell";
import GlobalSearch, { type SearchResult } from "@/components/dashboard/GlobalSearch";
import type { AttentionItem } from "@/components/dashboard/AttentionList";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardHome,
});

function DashboardHome() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleLogoutClick = async () => {
    try {
      await db.logout();
      toast.success("Signed out successfully.");
      navigate({ to: "/" });
    } catch {
      toast.error("Logout failed.");
    }
  };

  // Common state
  const [cells, setCells] = useState<HomeCell[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);
  const [triggerRefresh, setTriggerRefresh] = useState(0);
  const refresh = () => setTriggerRefresh((prev) => prev + 1);

  // Role-specific state
  const [pastorData, setPastorData] = useState<any>(null);
  const [cellLeaderData, setCellLeaderData] = useState<any>(null);
  const [mediaData, setMediaData] = useState<any>(null);

  // Load user session
  useEffect(() => {
    const fetchUser = async () => {
      const u = await db.getCurrentUser();
      setUser(u);
    };
    fetchUser();
  }, []);

  // Fetch role-specific data dynamically
  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      setDataLoading(true);
      setDataError(null);
      try {
        // Load common data
        const [allCells, allZones, allDistricts, allUsers] = await Promise.all([
          db.getHomeCells(),
          db.getZones(),
          db.getDistricts(),
          db.getUsers(),
        ]);
        setCells(allCells);
        setZones(allZones);
        setDistricts(allDistricts);
        setUsers(allUsers);

        if (user.role === "super_admin" || user.role === "church_admin" || user.role === "district_pastor" || user.role === "zone_pastor") {
          // Load pastor/admin data
          const [members, reports, visitors, meetings, newConverts, prayers, wallPrayers, followUps, testimonies, offerings, requests, contactMessages, books, attendance] = await Promise.all([
            db.getMembers(),
            db.getWeeklyReports(),
            db.getVisitors(),
            db.getMeetingRecords(),
            db.getNewConverts(),
            db.getPrayerRequests(),
            db.getPrayerWallRequests(),
            db.getFollowUps(),
            db.getAllTestimonies(),
            db.getOfferings(),
            db.getCellMembershipRequests(),
            db.getContactMessages(),
            db.getBooks(),
            db.getAllAttendance(),
          ]);

          setPastorData({ members, reports, visitors, meetings, newConverts, prayers, wallPrayers, followUps, testimonies, offerings, requests, contactMessages, books, attendance });
        } else if (user.role === "media_team") {
          // Load media data
          const [events, announcements, sermons, books] = await Promise.all([
            db.getEvents(),
            db.getAnnouncements(),
            db.getSermons(),
            db.getAllBooksForAdmin(),
          ]);
          setMediaData({ events, announcements, sermons, books });
        } else if (user.role === "cell_leader" || user.role === "assistant_leader") {
          // Load cell leader data
          let cell = allCells.find((c) => c.leader_id === user.id);
          if (!cell && user.home_cell_id) {
            cell = allCells.find((c) => c.id === user.home_cell_id);
          }
          
          if (cell) {
            const [members, visitors, reports, meetings, newConverts, prayers, followUps, testimonies, offerings, attendanceRecords, requests] = await Promise.all([
              db.getMembersByCell(cell.id),
              db.getVisitorsByCell(cell.id),
              db.getWeeklyReportsByCell(cell.id),
              db.getMeetingRecordsByCell(cell.id),
              db.getNewConvertsByCell(cell.id),
              db.getPrayerRequestsByCell(cell.id),
              db.getFollowUpsByCell(cell.id),
              db.getTestimoniesByCell(cell.id),
              db.getOfferingsByCell(cell.id),
              db.getAttendanceByHomeCellAll(cell.id),
              db.getCellMembershipRequestsByCell(cell.id),
            ]);
            
            setCellLeaderData({ cell, members, visitors, reports, meetings, newConverts, prayers, followUps, testimonies, offerings, attendanceRecords, requests });
          } else {
            setCellLeaderData(null);
          }
        }
      } catch (err) {
        console.error("Error loading dashboard data", err);
        // Supabase's PostgrestError is a plain object with a .message, not an
        // Error instance, so `err instanceof Error` misses it and was always
        // falling back to the generic message below - check for .message too.
        const message =
          err instanceof Error ? err.message
          : (err && typeof err === "object" && "message" in err && typeof (err as any).message === "string") ? (err as any).message
          : "Failed to load dashboard data.";
        setDataError(message);
      } finally {
        setDataLoading(false);
      }
    };

    loadData();
  }, [user, triggerRefresh]);

  // Real notification items, reusing the exact same calculations the overview
  // pages use - no separate/fabricated notification data source.
  const attentionItems: AttentionItem[] = useMemo(() => {
    if (!user) return [];
    if ((user.role === "super_admin" || user.role === "church_admin" || user.role === "district_pastor" || user.role === "zone_pastor") && pastorData) {
      return buildOrgAttentionItems(
        { cells, members: pastorData.members, visitors: pastorData.visitors, meetings: pastorData.meetings, reports: pastorData.reports, attendance: pastorData.attendance },
        setActiveTab
      );
    }
    if ((user.role === "cell_leader" || user.role === "assistant_leader") && cellLeaderData) {
      return buildCellAttentionItems(
        { members: cellLeaderData.members, visitors: cellLeaderData.visitors, newConverts: cellLeaderData.newConverts, meetings: cellLeaderData.meetings, reports: cellLeaderData.reports, attendance: cellLeaderData.attendanceRecords },
        setActiveTab
      );
    }
    if (user.role === "media_team" && mediaData) {
      return buildMediaAttentionItems({ events: mediaData.events, books: mediaData.books }, setActiveTab);
    }
    return [];
  }, [user, cells, pastorData, cellLeaderData, mediaData]);

  // Real search index built from whatever data this role has actually loaded.
  const searchItems: SearchResult[] = useMemo(() => {
    const results: SearchResult[] = [];
    if (pastorData) {
      cells.forEach((c: HomeCell) => results.push({ id: `cell-${c.id}`, label: c.name, sublabel: c.location, group: "Home Cells", tabId: "cells" }));
      pastorData.members.forEach((m: Member) => results.push({ id: `member-${m.id}`, label: `${m.first_name} ${m.last_name}`, sublabel: m.phone_number, group: "Members", tabId: "members" }));
      pastorData.visitors.forEach((v: Visitor) => results.push({ id: `visitor-${v.id}`, label: v.full_name, sublabel: v.phone_number, group: "Visitors", tabId: "visitors" }));
    }
    if (cellLeaderData?.cell) {
      cellLeaderData.members.forEach((m: Member) => results.push({ id: `member-${m.id}`, label: `${m.first_name} ${m.last_name}`, sublabel: m.phone_number, group: "Members", tabId: "members" }));
      cellLeaderData.visitors.forEach((v: Visitor) => results.push({ id: `visitor-${v.id}`, label: v.full_name, sublabel: v.phone_number, group: "Visitors", tabId: "visitors" }));
    }
    if (mediaData) {
      mediaData.events.forEach((e: ChurchEvent) => results.push({ id: `event-${e.id}`, label: e.title, sublabel: e.event_date, group: "Events", tabId: "events" }));
      mediaData.announcements.forEach((a: Announcement) => results.push({ id: `ann-${a.id}`, label: a.title, group: "Announcements", tabId: "announcements" }));
      mediaData.sermons.forEach((s: Sermon) => results.push({ id: `sermon-${s.id}`, label: s.title, sublabel: s.preacher, group: "Sermons", tabId: "sermons" }));
      mediaData.books.forEach((b: Book) => results.push({ id: `book-${b.id}`, label: b.title, sublabel: b.author, group: "Books", tabId: "books" }));
    }
    return results;
  }, [cells, pastorData, cellLeaderData, mediaData]);

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        role={user.role}
        activeTab={activeTab}
        onSelect={(id) => { setActiveTab(id); setMobileNavOpen(false); }}
        collapsed={sidebarCollapsed}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />

      <div className="flex-1 min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border/40 bg-card/95 backdrop-blur px-4 sm:px-6 py-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setMobileNavOpen(true);
                setSidebarCollapsed((c) => !c);
              }}
              className="rounded-lg p-2 text-foreground hover:bg-muted transition-colors"
              aria-label="Toggle navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
            <GlobalSearch items={searchItems} onSelect={setActiveTab} />
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <NotificationBell items={attentionItems} />
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-foreground leading-tight">{user.full_name}</div>
              <div className="text-[10px] text-muted-foreground font-medium">{roleLabel(user.role)}</div>
            </div>
            <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
              {user.full_name.charAt(0).toUpperCase()}
            </div>
            <button
              onClick={handleLogoutClick}
              className="rounded-lg p-2 text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
              title="Sign Out"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          {dataLoading && <DashboardSkeleton />}

          {!dataLoading && dataError && <ErrorState message={dataError} onRetry={refresh} />}

          {!dataLoading && !dataError && (user.role === "super_admin" || user.role === "church_admin" || user.role === "district_pastor" || user.role === "zone_pastor") && pastorData && (
            <PastorDashboard
              activeTab={activeTab}
              user={user}
              cells={cells}
              zones={zones}
              districts={districts}
              users={users}
              data={pastorData}
              refresh={refresh}
              onNavigate={setActiveTab}
            />
          )}
          {!dataLoading && !dataError && (user.role === "cell_leader" || user.role === "assistant_leader") && (
            <CellLeaderDashboard
              activeTab={activeTab}
              user={user}
              data={cellLeaderData}
              refresh={refresh}
              onNavigate={setActiveTab}
            />
          )}
          {!dataLoading && !dataError && user.role === "media_team" && mediaData && (
            <MediaDashboard
              activeTab={activeTab}
              data={mediaData}
              refresh={refresh}
              onNavigate={setActiveTab}
              userName={user.full_name}
            />
          )}
        </main>
      </div>
    </div>
  );
}

// =========================================================================
// PASTOR / ADMIN DASHBOARD PANEL
// =========================================================================
interface PastorDashboardProps {
  activeTab: string;
  user: UserProfile;
  cells: HomeCell[];
  zones: Zone[];
  districts: District[];
  users: UserProfile[];
  data: any;
  refresh: () => void;
  onNavigate: (tab: string) => void;
}
function PastorDashboard({ activeTab, user, cells, zones, districts, users, data, refresh, onNavigate }: PastorDashboardProps) {
  const {
    members: allMembers, reports: allReports, visitors: allVisitors, meetings: allMeetings,
    newConverts: allNewConverts, prayers, wallPrayers, followUps, testimonies, offerings: allOfferings,
    requests: allRequests, contactMessages, books, attendance: allAttendance,
  } = data;

  // Zone/district pastors get a scope computed client-side from the org hierarchy
  // (RLS currently grants these roles org-wide read on these tables - see supabase_schema.sql -
  // this narrows what's *displayed* to their area of responsibility).
  let scopedCellIds: Set<string> | null = null;
  let scopeLabel = "Church Scope: Winners Church";
  let performance: { title: string; rows: { label: string; members: number; attendanceRate: number; visitors: number }[] } | undefined;

  if (user.role === "district_pastor") {
    const myDistrict = districts.find((d: District) => d.district_pastor_id === user.id);
    const districtCells = myDistrict ? cells.filter((c: HomeCell) => c.district_id === myDistrict.id) : [];
    scopedCellIds = new Set(districtCells.map((c: HomeCell) => c.id));
    scopeLabel = myDistrict ? `My District: ${myDistrict.name}` : "No District Assigned";
    performance = {
      title: "Cell Performance",
      rows: districtCells.map((c: HomeCell) => ({
        label: c.name,
        members: allMembers.filter((m: Member) => m.home_cell_id === c.id).length,
        attendanceRate: attendanceRateFromRecords(allAttendance.filter((a: AttendanceRecord) => a.home_cell_id === c.id)),
        visitors: allVisitors.filter((v: Visitor) => v.home_cell_id === c.id).length,
      })),
    };
  } else if (user.role === "zone_pastor") {
    const myZone = zones.find((z: Zone) => z.zone_pastor_id === user.id);
    const zoneDistricts = myZone ? districts.filter((d: District) => d.zone_id === myZone.id) : [];
    const zoneDistrictIds = new Set(zoneDistricts.map((d: District) => d.id));
    const zoneCells = cells.filter((c: HomeCell) => c.district_id && zoneDistrictIds.has(c.district_id));
    scopedCellIds = new Set(zoneCells.map((c: HomeCell) => c.id));
    scopeLabel = myZone ? `My Zone: ${myZone.name}` : "No Zone Assigned";
    performance = {
      title: "District Performance",
      rows: zoneDistricts.map((d: District) => {
        const districtCellIds = new Set(cells.filter((c: HomeCell) => c.district_id === d.id).map((c: HomeCell) => c.id));
        return {
          label: d.name,
          members: allMembers.filter((m: Member) => districtCellIds.has(m.home_cell_id)).length,
          attendanceRate: attendanceRateFromRecords(allAttendance.filter((a: AttendanceRecord) => districtCellIds.has(a.home_cell_id))),
          visitors: allVisitors.filter((v: Visitor) => districtCellIds.has(v.home_cell_id)).length,
        };
      }),
    };
  }

  const scopedCells = scopedCellIds ? cells.filter((c: HomeCell) => scopedCellIds!.has(c.id)) : cells;
  const members = scopedCellIds ? allMembers.filter((m: Member) => scopedCellIds!.has(m.home_cell_id)) : allMembers;
  const visitors = scopedCellIds ? allVisitors.filter((v: Visitor) => scopedCellIds!.has(v.home_cell_id)) : allVisitors;
  const meetings = scopedCellIds ? allMeetings.filter((m: MeetingRecord) => scopedCellIds!.has(m.home_cell_id)) : allMeetings;
  const newConverts = scopedCellIds ? allNewConverts.filter((c: NewConvert) => scopedCellIds!.has(c.home_cell_id)) : allNewConverts;
  const offerings = scopedCellIds ? allOfferings.filter((o: Offering) => scopedCellIds!.has(o.home_cell_id)) : allOfferings;
  const reports = scopedCellIds ? allReports.filter((r: WeeklyReport) => scopedCellIds!.has(r.home_cell_id)) : allReports;
  const attendance = scopedCellIds ? allAttendance.filter((a: AttendanceRecord) => scopedCellIds!.has(a.home_cell_id)) : allAttendance;
  const requests = scopedCellIds ? allRequests.filter((r: CellMembershipRequest) => scopedCellIds!.has(r.home_cell_id)) : allRequests;

  const isSupervisor = user.role === "zone_pastor" || user.role === "district_pastor";
  const quickActions = isSupervisor ? buildSupervisorQuickActions(onNavigate) : buildOrgAdminQuickActions(onNavigate);
  const title = user.role === "super_admin" ? "Church Command Center" : user.role === "church_admin" ? "Church Operations" : scopeLabel;

  return (
    <>
      {activeTab === "overview" && (
        <OrgOverview
          title={title}
          subtitle="Here's what's happening in Winners Church today."
          scopeLabel={scopeLabel}
          userName={user.full_name}
          cells={scopedCells}
          members={members}
          visitors={visitors}
          newConverts={newConverts}
          meetings={meetings}
          reports={reports}
          attendance={attendance}
          onNavigate={onNavigate}
          quickActions={quickActions}
          performance={performance}
        />
      )}

      {activeTab === "cells" && <CellsTab cells={cells} districts={districts} users={users} refresh={refresh} zones={zones} members={allMembers} visitors={allVisitors} attendance={allAttendance} onNavigate={onNavigate} />}
      {activeTab === "zones" && <ZonesTab zones={zones} users={users} refresh={refresh} districts={districts} cells={cells} members={allMembers} onNavigate={onNavigate} />}
      {activeTab === "districts" && <DistrictsTab districts={districts} zones={zones} users={users} refresh={refresh} cells={cells} members={allMembers} onNavigate={onNavigate} />}
      {activeTab === "users" && <UsersTab users={users} cells={cells} refresh={refresh} />}
      {activeTab === "members" && <MembersTab members={members} cells={scopedCells} attendance={attendance} followUps={followUps} onNavigate={onNavigate} />}
      {activeTab === "meetings" && <MeetingsTab meetings={meetings} cells={scopedCells} />}
      {activeTab === "attendance" && <AdminAttendanceTab cells={scopedCells} members={members} meetings={meetings} />}
      {activeTab === "visitors" && <VisitorsTab visitors={visitors} cells={scopedCells} followUps={followUps} onNavigate={onNavigate} />}
      {activeTab === "converts" && <NewConvertsTab converts={newConverts} cells={scopedCells} followUps={followUps} onNavigate={onNavigate} />}
      {activeTab === "prayers" && <PrayerRequestsTab prayers={prayers} wallPrayers={wallPrayers} cells={scopedCells} refresh={refresh} />}
      {activeTab === "requests" && <RequestsTab requests={requests} cells={scopedCells} refresh={refresh} />}
      {activeTab === "messages" && <ContactMessagesTab messages={contactMessages} refresh={refresh} />}
      {activeTab === "followups" && <FollowUpsTab followUps={followUps} cells={scopedCells} />}
      {activeTab === "testimonies" && <TestimoniesTab testimonies={testimonies} cells={scopedCells} />}
      {activeTab === "offerings" && <OfferingsTab offerings={offerings} cells={scopedCells} />}
      {activeTab === "reports" && <ReportsTab reports={reports} cells={scopedCells} />}
      {activeTab === "books" && <BooksTab books={books} refresh={refresh} />}
    </>
  );
}

// =========================================================================
// CELL LEADER DASHBOARD PANEL
// =========================================================================
interface CellLeaderDashboardProps {
  activeTab: string;
  user: UserProfile;
  data: any;
  refresh: () => void;
  onNavigate: (tab: string) => void;
}
function CellLeaderDashboard({ activeTab, user, data, refresh, onNavigate }: CellLeaderDashboardProps) {
  if (!data || !data.cell) {
    return (
      <EmptyState
        icon={Home}
        title="No Cell Assigned"
        description="Please contact your administrator to be assigned to a home cell."
      />
    );
  }

  const { cell, members, visitors, reports, meetings, newConverts, prayers, followUps, testimonies, offerings, requests, attendanceRecords } = data;

  return (
    <>
      {activeTab === "overview" && (
        <CellLeaderOverview
          userName={user.full_name}
          cell={cell}
          members={members}
          visitors={visitors}
          newConverts={newConverts}
          meetings={meetings}
          reports={reports}
          attendance={attendanceRecords}
          followUps={followUps}
          onNavigate={onNavigate}
        />
      )}

      {activeTab === "cell" && <CellDetailsTab cell={cell} refresh={refresh} canEdit={user.role === "cell_leader"} />}
      {activeTab === "meetings" && <MeetingsTab meetings={meetings} cells={[cell]} cellId={cell.id} refresh={refresh} />}
      {activeTab === "attendance" && <AttendanceTab cell={cell} members={members} meetings={meetings} refresh={refresh} />}
      {activeTab === "members" && <MembersTab members={members} cells={[cell]} cellId={cell.id} refresh={refresh} attendance={attendanceRecords} followUps={followUps} onNavigate={onNavigate} />}
      {activeTab === "visitors" && <VisitorsTab visitors={visitors} cells={[cell]} cellId={cell.id} refresh={refresh} followUps={followUps} onNavigate={onNavigate} />}
      {activeTab === "converts" && <NewConvertsTab converts={newConverts} cells={[cell]} cellId={cell.id} refresh={refresh} followUps={followUps} onNavigate={onNavigate} />}
      {activeTab === "prayers" && <PrayerRequestsTab prayers={prayers} cells={[cell]} cellId={cell.id} refresh={refresh} />}
      {activeTab === "followups" && <FollowUpsTab followUps={followUps} cells={[cell]} cellId={cell.id} refresh={refresh} />}
      {activeTab === "testimonies" && <TestimoniesTab testimonies={testimonies} cells={[cell]} cellId={cell.id} refresh={refresh} />}
      {activeTab === "offerings" && user.role === "cell_leader" && <OfferingsTab offerings={offerings} cells={[cell]} cellId={cell.id} refresh={refresh} />}
      {activeTab === "reports" && <ReportsTab reports={reports} cells={[cell]} cellId={cell.id} refresh={refresh} />}
      {activeTab === "requests" && <RequestsTab requests={requests} cell={cell} refresh={refresh} />}
    </>
  );
}

// =========================================================================
// MEDIA TEAM DASHBOARD PANEL
// =========================================================================
interface MediaDashboardProps {
  activeTab: string;
  data: any;
  refresh: () => void;
  onNavigate: (tab: string) => void;
  userName: string;
}
function MediaDashboard({ activeTab, data, refresh, onNavigate, userName }: MediaDashboardProps) {
  const { events, announcements, sermons, books } = data;

  return (
    <>
      {activeTab === "overview" && (
        <MediaTeamOverview
          userName={userName}
          events={events}
          announcements={announcements}
          sermons={sermons}
          books={books}
          onNavigate={onNavigate}
        />
      )}

      {activeTab === "events" && <EventsTab events={events} refresh={refresh} />}
      {activeTab === "announcements" && <AnnouncementsTab announcements={announcements} refresh={refresh} />}
      {activeTab === "sermons" && <SermonsTab sermons={sermons} refresh={refresh} />}
      {activeTab === "books" && <BooksTab books={books} refresh={refresh} />}
    </>
  );
}

// =========================================================================
// SUB-COMPONENTS FOR EACH TAB
// =========================================================================

// Cells Tab
function CellsTab({
  cells, districts, users, refresh, cellId, zones = [], members = [], visitors = [], attendance = [], onNavigate,
}: {
  cells: HomeCell[], districts: District[], users: UserProfile[], refresh: () => void, cellId?: string,
  zones?: Zone[], members?: Member[], visitors?: Visitor[], attendance?: AttendanceRecord[], onNavigate?: (tab: string) => void,
}) {
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<HomeCell>>({ meeting_day: "Saturday", meeting_time: "17:00" });
  const [selectedCell, setSelectedCell] = useState<HomeCell | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await db.updateHomeCell(editing, form as any);
        toast.success("Cell updated successfully!");
      } else {
        await db.addHomeCell(form as any);
        toast.success("Cell created successfully!");
      }
      setEditing(null);
      setForm({ meeting_day: "Saturday", meeting_time: "17:00" });
      refresh();
    } catch (err) {
      toast.error("Failed to save cell");
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-2xl border border-border/40 p-5 shadow-sm">
        <h3 className="font-heading text-base font-bold text-foreground mb-4">
          {editing ? "Edit Home Cell" : "Add New Home Cell"}
        </h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-muted-foreground uppercase mb-1">Cell Name</label>
            <input
              type="text"
              required
              value={form.name || ""}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground"
            />
          </div>
          <div>
            <label className="block font-bold text-muted-foreground uppercase mb-1">Cell Code</label>
            <input
              type="text"
              value={form.cell_code || ""}
              onChange={(e) => setForm({ ...form, cell_code: e.target.value })}
              className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground"
            />
          </div>
          <div>
            <label className="block font-bold text-muted-foreground uppercase mb-1">Location</label>
            <input
              type="text"
              required
              value={form.location || ""}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground"
            />
          </div>
          <div>
            <label className="block font-bold text-muted-foreground uppercase mb-1">Address</label>
            <input
              type="text"
              required
              value={form.address || ""}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground"
            />
          </div>
          <div>
            <label className="block font-bold text-muted-foreground uppercase mb-1">Meeting Day</label>
            <select
              value={form.meeting_day || "Saturday"}
              onChange={(e) => setForm({ ...form, meeting_day: e.target.value })}
              className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground"
            >
              <option>Sunday</option>
              <option>Monday</option>
              <option>Tuesday</option>
              <option>Wednesday</option>
              <option>Thursday</option>
              <option>Friday</option>
              <option>Saturday</option>
            </select>
          </div>
          <div>
            <label className="block font-bold text-muted-foreground uppercase mb-1">Meeting Time</label>
            <input
              type="time"
              required
              value={form.meeting_time || "17:00"}
              onChange={(e) => setForm({ ...form, meeting_time: e.target.value })}
              className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground"
            />
          </div>
          <div>
            <label className="block font-bold text-muted-foreground uppercase mb-1">Cell Leader</label>
            <select
              value={form.leader_id || ""}
              onChange={(e) => setForm({ ...form, leader_id: e.target.value || null })}
              className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground"
            >
              <option value="">Unassigned</option>
              {users.filter((u) => u.role === "cell_leader").map((u) => (
                <option key={u.id} value={u.id}>{u.full_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-bold text-muted-foreground uppercase mb-1">Assistant Leader</label>
            <select
              value={form.assistant_leader_id || ""}
              onChange={(e) => setForm({ ...form, assistant_leader_id: e.target.value || null })}
              className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground"
            >
              <option value="">Unassigned</option>
              {users.filter((u) => u.role === "assistant_leader").map((u) => (
                <option key={u.id} value={u.id}>{u.full_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-bold text-muted-foreground uppercase mb-1">District</label>
            <select
              value={form.district_id || ""}
              onChange={(e) => setForm({ ...form, district_id: e.target.value || null })}
              className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground"
            >
              <option value="">Unassigned</option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2 flex gap-2">
            <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold">
              {editing ? "Update Cell" : "Create Cell"}
            </button>
            {editing && (
              <button
                type="button"
                onClick={() => {
                  setEditing(null);
                  setForm({ meeting_day: "Saturday", meeting_time: "17:00" });
                }}
                className="px-4 py-2 bg-muted text-foreground rounded-lg font-semibold"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-card rounded-2xl border border-border/40 p-5 shadow-sm">
        <h3 className="font-heading text-base font-bold text-foreground mb-4">Home Cells ({cells.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cells.map((cell) => (
            <div key={cell.id} onClick={() => setSelectedCell(cell)} className="p-4 bg-muted/10 rounded-xl border border-border/20 cursor-pointer hover:border-primary/30 transition-colors">
              <h4 className="font-bold text-foreground">{cell.name}</h4>
              <p className="text-xs text-muted-foreground">{cell.location}</p>
              <p className="text-xs text-muted-foreground mt-1">{cell.meeting_day} at {cell.meeting_time}</p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditing(cell.id);
                    setForm(cell);
                  }}
                  className="text-xs px-2 py-1 bg-primary/10 text-primary rounded"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedCell && (() => {
        const district = districts.find((d) => d.id === selectedCell.district_id);
        const zone = district ? zones.find((z) => z.id === district.zone_id) : undefined;
        const leader = users.find((u) => u.id === selectedCell.leader_id);
        const assistant = users.find((u) => u.id === selectedCell.assistant_leader_id);
        const cellMembers = members.filter((m) => m.home_cell_id === selectedCell.id);
        const cellVisitors = visitors.filter((v) => v.home_cell_id === selectedCell.id);
        const cellAttendance = attendance.filter((a) => a.home_cell_id === selectedCell.id);
        const rate = attendanceRateFromRecords(cellAttendance);

        return (
          <DetailDrawer
            open
            onClose={() => setSelectedCell(null)}
            title={selectedCell.name}
            subtitle={district?.name}
            actions={onNavigate ? (
              <>
                <button onClick={() => { onNavigate("members"); setSelectedCell(null); }} className="rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors">View Members</button>
                <button onClick={() => { onNavigate("attendance"); setSelectedCell(null); }} className="rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors">View Attendance</button>
              </>
            ) : undefined}
          >
            <DetailSection label="Leadership">
              <DetailRow label="Cell Leader" value={leader?.full_name || "Unassigned"} />
              <DetailRow label="Assistant Leader" value={assistant?.full_name || "Unassigned"} />
            </DetailSection>

            <DetailSection label="Organization">
              <DetailRow label="District" value={district?.name || "—"} />
              <DetailRow label="Zone" value={zone?.name || "—"} />
              <DetailRow label="Location" value={selectedCell.location} />
              <DetailRow label="Address" value={selectedCell.address} />
              <DetailRow label="Meeting Schedule" value={`${selectedCell.meeting_day} at ${selectedCell.meeting_time}`} />
              <DetailRow label="Cell Code" value={selectedCell.cell_code} />
            </DetailSection>

            <DetailSection label="Health">
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-muted/10 p-3 text-center">
                  <div className="text-lg font-bold text-foreground">{cellMembers.length}</div>
                  <div className="text-[10px] text-muted-foreground font-semibold uppercase">Members</div>
                </div>
                <div className="rounded-xl bg-muted/10 p-3 text-center">
                  <div className="text-lg font-bold text-foreground">{cellVisitors.length}</div>
                  <div className="text-[10px] text-muted-foreground font-semibold uppercase">Visitors</div>
                </div>
                <div className="rounded-xl bg-muted/10 p-3 text-center">
                  <div className="text-lg font-bold text-foreground">{cellAttendance.length > 0 ? `${rate}%` : "—"}</div>
                  <div className="text-[10px] text-muted-foreground font-semibold uppercase">Attendance</div>
                </div>
              </div>
            </DetailSection>
          </DetailDrawer>
        );
      })()}
    </div>
  );
}

// Zones Tab
function ZonesTab({
  zones, users, refresh, districts = [], cells = [], members = [], onNavigate,
}: {
  zones: Zone[], users: UserProfile[], refresh: () => void,
  districts?: District[], cells?: HomeCell[], members?: Member[], onNavigate?: (tab: string) => void,
}) {
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Zone>>({});
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await db.updateZone(editing, form as any);
        toast.success("Zone updated!");
      } else {
        await db.addZone(form as any);
        toast.success("Zone created!");
      }
      refresh();
      setEditing(null);
      setForm({});
    } catch {
      toast.error("Failed to save zone");
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-2xl border border-border/40 p-5 shadow-sm">
        <h3 className="font-heading text-base font-bold text-foreground mb-4">
          {editing ? "Edit Zone" : "Add New Zone"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-muted-foreground uppercase mb-1">Zone Name</label>
            <input
              type="text"
              required
              value={form.name || ""}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground"
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold">
              {editing ? "Update Zone" : "Create Zone"}
            </button>
            {editing && (
              <button
                type="button"
                onClick={() => {
                  setEditing(null);
                  setForm({});
                }}
                className="px-4 py-2 bg-muted text-foreground rounded-lg font-semibold"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
      <div className="bg-card rounded-2xl border border-border/40 p-5 shadow-sm">
        <h3 className="font-heading text-base font-bold text-foreground mb-4">Zones ({zones.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {zones.map((zone) => (
            <div key={zone.id} onClick={() => setSelectedZone(zone)} className="p-4 bg-muted/10 rounded-xl border border-border/20 cursor-pointer hover:border-primary/30 transition-colors">
              <h4 className="font-bold text-foreground">{zone.name}</h4>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditing(zone.id);
                  setForm(zone);
                }}
                className="text-xs px-2 py-1 bg-primary/10 text-primary rounded mt-2"
              >
                Edit
              </button>
            </div>
          ))}
        </div>
      </div>

      {selectedZone && (() => {
        const zoneDistricts = districts.filter((d) => d.zone_id === selectedZone.id);
        const zoneDistrictIds = new Set(zoneDistricts.map((d) => d.id));
        const zoneCells = cells.filter((c) => c.district_id && zoneDistrictIds.has(c.district_id));
        const zoneCellIds = new Set(zoneCells.map((c) => c.id));
        const zoneMembers = members.filter((m) => zoneCellIds.has(m.home_cell_id));
        const pastor = users.find((u) => u.id === selectedZone.zone_pastor_id);

        return (
          <DetailDrawer
            open
            onClose={() => setSelectedZone(null)}
            title={selectedZone.name}
            subtitle="Zone"
            actions={onNavigate ? (
              <button onClick={() => { onNavigate("districts"); setSelectedZone(null); }} className="rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors">View Districts</button>
            ) : undefined}
          >
            <DetailSection label="Leadership">
              <DetailRow label="Zone Pastor" value={pastor?.full_name || "Unassigned"} />
            </DetailSection>
            <DetailSection label="Overview">
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-muted/10 p-3 text-center">
                  <div className="text-lg font-bold text-foreground">{zoneDistricts.length}</div>
                  <div className="text-[10px] text-muted-foreground font-semibold uppercase">Districts</div>
                </div>
                <div className="rounded-xl bg-muted/10 p-3 text-center">
                  <div className="text-lg font-bold text-foreground">{zoneCells.length}</div>
                  <div className="text-[10px] text-muted-foreground font-semibold uppercase">Cells</div>
                </div>
                <div className="rounded-xl bg-muted/10 p-3 text-center">
                  <div className="text-lg font-bold text-foreground">{zoneMembers.length}</div>
                  <div className="text-[10px] text-muted-foreground font-semibold uppercase">Members</div>
                </div>
              </div>
            </DetailSection>
            <DetailSection label="Districts">
              {zoneDistricts.length > 0 ? (
                <div className="space-y-1.5">
                  {zoneDistricts.map((d) => (
                    <div key={d.id} className="text-xs bg-muted/10 rounded-lg px-3 py-2 font-medium text-foreground">{d.name}</div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No districts in this zone yet.</p>
              )}
            </DetailSection>
          </DetailDrawer>
        );
      })()}
    </div>
  );
}

// Districts Tab
function DistrictsTab({
  districts, zones, users, refresh, cells = [], members = [], onNavigate,
}: {
  districts: District[], zones: Zone[], users: UserProfile[], refresh: () => void,
  cells?: HomeCell[], members?: Member[], onNavigate?: (tab: string) => void,
}) {
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<District>>({});
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await db.updateDistrict(editing, form as any);
        toast.success("District updated!");
      } else {
        await db.addDistrict(form as any);
        toast.success("District created!");
      }
      refresh();
      setEditing(null);
      setForm({});
    } catch {
      toast.error("Failed to save district");
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-2xl border border-border/40 p-5 shadow-sm">
        <h3 className="font-heading text-base font-bold text-foreground mb-4">
          {editing ? "Edit District" : "Add New District"}
        </h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-muted-foreground uppercase mb-1">District Name</label>
            <input
              type="text"
              required
              value={form.name || ""}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground"
            />
          </div>
          <div>
            <label className="block font-bold text-muted-foreground uppercase mb-1">Zone</label>
            <select
              value={form.zone_id || ""}
              onChange={(e) => setForm({ ...form, zone_id: e.target.value })}
              className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground"
            >
              <option value="">Select Zone</option>
              {zones.map((z) => (
                <option key={z.id} value={z.id}>{z.name}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2 flex gap-2">
            <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold">
              {editing ? "Update District" : "Create District"}
            </button>
            {editing && (
              <button
                type="button"
                onClick={() => {
                  setEditing(null);
                  setForm({});
                }}
                className="px-4 py-2 bg-muted text-foreground rounded-lg font-semibold"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
      <div className="bg-card rounded-2xl border border-border/40 p-5 shadow-sm">
        <h3 className="font-heading text-base font-bold text-foreground mb-4">Districts ({districts.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {districts.map((district) => (
            <div key={district.id} onClick={() => setSelectedDistrict(district)} className="p-4 bg-muted/10 rounded-xl border border-border/20 cursor-pointer hover:border-primary/30 transition-colors">
              <h4 className="font-bold text-foreground">{district.name}</h4>
              <p className="text-xs text-muted-foreground">
                Zone: {zones.find((z) => z.id === district.zone_id)?.name || "Unassigned"}
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditing(district.id);
                  setForm(district);
                }}
                className="text-xs px-2 py-1 bg-primary/10 text-primary rounded mt-2"
              >
                Edit
              </button>
            </div>
          ))}
        </div>
      </div>

      {selectedDistrict && (() => {
        const zone = zones.find((z) => z.id === selectedDistrict.zone_id);
        const districtCells = cells.filter((c) => c.district_id === selectedDistrict.id);
        const districtCellIds = new Set(districtCells.map((c) => c.id));
        const districtMembers = members.filter((m) => districtCellIds.has(m.home_cell_id));
        const pastor = users.find((u) => u.id === selectedDistrict.district_pastor_id);

        return (
          <DetailDrawer
            open
            onClose={() => setSelectedDistrict(null)}
            title={selectedDistrict.name}
            subtitle={zone?.name}
            actions={onNavigate ? (
              <button onClick={() => { onNavigate("cells"); setSelectedDistrict(null); }} className="rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors">View Cells</button>
            ) : undefined}
          >
            <DetailSection label="Leadership">
              <DetailRow label="District Pastor" value={pastor?.full_name || "Unassigned"} />
              <DetailRow label="Zone" value={zone?.name || "—"} />
            </DetailSection>
            <DetailSection label="Overview">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-muted/10 p-3 text-center">
                  <div className="text-lg font-bold text-foreground">{districtCells.length}</div>
                  <div className="text-[10px] text-muted-foreground font-semibold uppercase">Cells</div>
                </div>
                <div className="rounded-xl bg-muted/10 p-3 text-center">
                  <div className="text-lg font-bold text-foreground">{districtMembers.length}</div>
                  <div className="text-[10px] text-muted-foreground font-semibold uppercase">Members</div>
                </div>
              </div>
            </DetailSection>
            <DetailSection label="Home Cells">
              {districtCells.length > 0 ? (
                <div className="space-y-1.5">
                  {districtCells.map((c) => (
                    <div key={c.id} className="text-xs bg-muted/10 rounded-lg px-3 py-2 font-medium text-foreground">{c.name}</div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No home cells in this district yet.</p>
              )}
            </DetailSection>
          </DetailDrawer>
        );
      })()}
    </div>
  );
}

// Users Tab
function UsersTab({ users, cells, refresh }: { users: UserProfile[], cells: HomeCell[], refresh: () => void }) {
  const ROLE_OPTIONS: UserProfile["role"][] = [
    "super_admin", "church_admin", "zone_pastor", "district_pastor", "cell_leader", "assistant_leader", "media_team",
  ];

  const handleApprove = async (id: string) => {
    try {
      await db.updateUser(id, { is_approved: true });
      toast.success("User approved.");
      refresh();
    } catch {
      toast.error("Failed to approve user");
    }
  };

  const handleToggleApproval = async (u: UserProfile) => {
    try {
      await db.updateUser(u.id, { is_approved: !u.is_approved });
      toast.success(u.is_approved ? "User access revoked." : "User approved.");
      refresh();
    } catch {
      toast.error("Failed to update user");
    }
  };

  const handleRoleChange = async (id: string, role: UserProfile["role"]) => {
    try {
      await db.updateUser(id, { role });
      toast.success("Role updated.");
      refresh();
    } catch {
      toast.error("Failed to update role");
    }
  };

  return (
    <div className="bg-card rounded-2xl border border-border/40 p-5 shadow-sm">
      <h3 className="font-heading text-base font-bold text-foreground mb-4">Users ({users.length})</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border/40 bg-muted/15">
              <th className="py-2 px-3 text-left font-bold text-muted-foreground">Name</th>
              <th className="py-2 px-3 text-left font-bold text-muted-foreground">Email</th>
              <th className="py-2 px-3 text-left font-bold text-muted-foreground">Role</th>
              <th className="py-2 px-3 text-left font-bold text-muted-foreground">Status</th>
              <th className="py-2 px-3 text-left font-bold text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/20">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-muted/5">
                <td className="py-3 px-3 font-bold text-foreground">{u.full_name}</td>
                <td className="py-3 px-3">{u.email}</td>
                <td className="py-3 px-3">
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value as UserProfile["role"])}
                    className="rounded-lg border border-border px-2 py-1 bg-card text-foreground text-xs capitalize"
                  >
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r} value={r}>{r.replace("_", " ")}</option>
                    ))}
                  </select>
                </td>
                <td className="py-3 px-3">
                  <StatusBadge status={u.is_approved ? "approved" : "pending"} />
                </td>
                <td className="py-3 px-3">
                  {!u.is_approved ? (
                    <button onClick={() => handleApprove(u.id)} className="text-xs px-2 py-1 bg-primary text-primary-foreground rounded font-semibold">
                      Approve
                    </button>
                  ) : (
                    <button onClick={() => handleToggleApproval(u)} className="text-xs px-2 py-1 bg-destructive/10 text-destructive rounded font-semibold">
                      Revoke Access
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[11px] text-muted-foreground mt-3">
        To connect a Cell Leader or Assistant Leader to a specific home cell, assign them from the Home Cells tab.
      </p>
    </div>
  );
}

// Members Tab
function MembersTab({
  members, cells, cellId, refresh, attendance = [], followUps = [], onNavigate,
}: {
  members: Member[], cells: HomeCell[], cellId?: string, refresh?: () => void,
  attendance?: AttendanceRecord[], followUps?: FollowUp[], onNavigate?: (tab: string) => void,
}) {
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Member>>({ gender: "Male", marital_status: "Single", membership_status: "active" });
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cellId && !refresh) return; // Only for cell leaders
    try {
      if (editing) {
        await db.updateMember(editing, form as any);
        toast.success("Member updated!");
      } else if (cellId) {
        await db.addMember({ ...form, home_cell_id: cellId, date_joined: new Date().toISOString().split("T")[0] } as any);
        toast.success("Member added!");
      }
      refresh?.();
      setEditing(null);
      setForm({ gender: "Male", marital_status: "Single", membership_status: "active" });
    } catch {
      toast.error("Failed to save member");
    }
  };

  return (
    <div className="space-y-4">
      {cellId && refresh && (
        <div className="bg-card rounded-2xl border border-border/40 p-5 shadow-sm">
          <h3 className="font-heading text-base font-bold text-foreground mb-4">
            {editing ? "Edit Member" : "Add New Member"}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-muted-foreground uppercase mb-1">First Name</label>
              <input
                type="text"
                required
                value={form.first_name || ""}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground"
              />
            </div>
            <div>
              <label className="block font-bold text-muted-foreground uppercase mb-1">Last Name</label>
              <input
                type="text"
                required
                value={form.last_name || ""}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground"
              />
            </div>
            <div>
              <label className="block font-bold text-muted-foreground uppercase mb-1">Gender</label>
              <select
                value={form.gender || "Male"}
                onChange={(e) => setForm({ ...form, gender: e.target.value as any })}
                className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground"
              >
                <option>Male</option>
                <option>Female</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-muted-foreground uppercase mb-1">Phone Number</label>
              <input
                type="text"
                required
                value={form.phone_number || ""}
                onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
                className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground"
              />
            </div>
            <div>
              <label className="block font-bold text-muted-foreground uppercase mb-1">Email</label>
              <input
                type="email"
                value={form.email || ""}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground"
              />
            </div>
            <div>
              <label className="block font-bold text-muted-foreground uppercase mb-1">Date of Birth</label>
              <input
                type="date"
                value={form.date_of_birth || ""}
                onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
                className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground"
              />
            </div>
            <div>
              <label className="block font-bold text-muted-foreground uppercase mb-1">Marital Status</label>
              <select
                value={form.marital_status || "Single"}
                onChange={(e) => setForm({ ...form, marital_status: e.target.value as any })}
                className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground"
              >
                <option>Single</option>
                <option>Married</option>
                <option>Widowed</option>
                <option>Divorced</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-muted-foreground uppercase mb-1">Occupation</label>
              <input
                type="text"
                value={form.occupation || ""}
                onChange={(e) => setForm({ ...form, occupation: e.target.value })}
                className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block font-bold text-muted-foreground uppercase mb-1">Address</label>
              <input
                type="text"
                required
                value={form.address || ""}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground"
              />
            </div>
            <div className="md:col-span-2 flex gap-2">
              <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold">
                {editing ? "Update Member" : "Add Member"}
              </button>
              {editing && (
                <button
                  type="button"
                  onClick={() => {
                    setEditing(null);
                    setForm({ gender: "Male", marital_status: "Single", membership_status: "active" });
                  }}
                  className="px-4 py-2 bg-muted text-foreground rounded-lg font-semibold"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      <div className="bg-card rounded-2xl border border-border/40 p-5 shadow-sm">
        <h3 className="font-heading text-base font-bold text-foreground mb-4">Members ({members.length})</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/40 bg-muted/15">
                <th className="py-2 px-3 text-left font-bold text-muted-foreground">Name</th>
                <th className="py-2 px-3 text-left font-bold text-muted-foreground">Gender</th>
                <th className="py-2 px-3 text-left font-bold text-muted-foreground">Phone</th>
                <th className="py-2 px-3 text-left font-bold text-muted-foreground">Status</th>
                {refresh && <th className="py-2 px-3 text-left font-bold text-muted-foreground">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {members.map((m) => (
                <tr key={m.id} onClick={() => setSelectedMember(m)} className="hover:bg-muted/5 cursor-pointer">
                  <td className="py-3 px-3 font-bold text-foreground">{m.first_name} {m.last_name}</td>
                  <td className="py-3 px-3">{m.gender}</td>
                  <td className="py-3 px-3">{m.phone_number}</td>
                  <td className="py-3 px-3 capitalize">{m.membership_status}</td>
                  {refresh && (
                    <td className="py-3 px-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditing(m.id);
                          setForm(m);
                        }}
                        className="text-xs px-2 py-1 bg-primary/10 text-primary rounded mr-1"
                      >
                        Edit
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedMember && (() => {
        const memberAttendance = attendance.filter((a) => a.member_id === selectedMember.id);
        const presentCount = memberAttendance.filter((a) => a.present).length;
        const memberFollowUps = followUps
          .filter((f) => f.person_type === "member" && f.person_id === selectedMember.id)
          .sort((a, b) => new Date(b.follow_up_date).getTime() - new Date(a.follow_up_date).getTime());
        const cell = cells.find((c) => c.id === selectedMember.home_cell_id);

        return (
          <DetailDrawer
            open
            onClose={() => setSelectedMember(null)}
            title={`${selectedMember.first_name} ${selectedMember.last_name}`}
            subtitle={cell?.name}
            actions={
              <>
                {refresh && (
                  <button
                    onClick={() => { setEditing(selectedMember.id); setForm(selectedMember); setSelectedMember(null); }}
                    className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    Edit Member
                  </button>
                )}
                {onNavigate && (
                  <button
                    onClick={() => { onNavigate("followups"); setSelectedMember(null); }}
                    className="rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                  >
                    Add Follow-up
                  </button>
                )}
              </>
            }
          >
            <DetailSection label="Profile">
              <DetailRow label="Gender" value={selectedMember.gender} />
              <DetailRow label="Phone" value={selectedMember.phone_number} />
              <DetailRow label="Email" value={selectedMember.email} />
              <DetailRow label="Date of Birth" value={selectedMember.date_of_birth} />
              <DetailRow label="Marital Status" value={selectedMember.marital_status} />
              <DetailRow label="Occupation" value={selectedMember.occupation} />
              <DetailRow label="Address" value={selectedMember.address} />
            </DetailSection>

            <DetailSection label="Church Information">
              <DetailRow label="Home Cell" value={cell?.name || "—"} />
              <DetailRow label="Date Joined" value={selectedMember.date_joined} />
              <DetailRow label="Status" value={<StatusBadge status={selectedMember.membership_status === "active" ? "active" : "inactive"} label={selectedMember.membership_status} />} />
            </DetailSection>

            <DetailSection label="Attendance">
              {memberAttendance.length > 0 ? (
                <p className="text-xs text-foreground">
                  Present at <span className="font-bold">{presentCount}</span> of <span className="font-bold">{memberAttendance.length}</span> recorded meetings
                  ({Math.round((presentCount / memberAttendance.length) * 100)}%)
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">No attendance recorded yet.</p>
              )}
            </DetailSection>

            <DetailSection label="Follow-up History">
              {memberFollowUps.length > 0 ? (
                <div className="space-y-2">
                  {memberFollowUps.slice(0, 5).map((f) => (
                    <div key={f.id} className="text-xs bg-muted/10 rounded-lg p-2.5">
                      <div className="font-semibold text-foreground">{f.follow_up_date} • {f.follow_up_method}</div>
                      <div className="text-muted-foreground mt-0.5">{f.outcome}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No follow-ups recorded yet.</p>
              )}
            </DetailSection>
          </DetailDrawer>
        );
      })()}
    </div>
  );
}

// Meetings Tab
function MeetingsTab({ meetings, cells, cellId, refresh }: { meetings: MeetingRecord[], cells: HomeCell[], cellId?: string, refresh?: () => void }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<MeetingRecord>>({ meeting_status: "completed", total_attendance: 0 });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cellId && !refresh) return;
    try {
      if (editing) {
        await db.updateMeetingRecord(editing, form as any);
        toast.success("Meeting updated!");
      } else if (cellId) {
        await db.addMeetingRecord({ ...form, home_cell_id: cellId } as any);
        toast.success("Meeting added!");
      }
      refresh?.();
      setEditing(null);
      setForm({ meeting_status: "completed", total_attendance: 0 });
    } catch {
      toast.error("Failed to save meeting");
    }
  };

  return (
    <div className="space-y-4">
      {cellId && refresh && (
        <div className="bg-card rounded-2xl border border-border/40 p-5 shadow-sm">
          <h3 className="font-heading text-base font-bold text-foreground mb-4">
            {editing ? "Edit Meeting" : "Record New Meeting"}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-muted-foreground uppercase mb-1">Meeting Date</label>
              <input
                type="date"
                required
                value={form.meeting_date || ""}
                onChange={(e) => setForm({ ...form, meeting_date: e.target.value })}
                className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground"
              />
            </div>
            <div>
              <label className="block font-bold text-muted-foreground uppercase mb-1">Topic</label>
              <input
                type="text"
                required
                value={form.meeting_topic || ""}
                onChange={(e) => setForm({ ...form, meeting_topic: e.target.value })}
                className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground"
              />
            </div>
            <div>
              <label className="block font-bold text-muted-foreground uppercase mb-1">Bible Scripture</label>
              <input
                type="text"
                value={form.bible_scripture || ""}
                onChange={(e) => setForm({ ...form, bible_scripture: e.target.value })}
                className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground"
              />
            </div>
            <div>
              <label className="block font-bold text-muted-foreground uppercase mb-1">Total Attendance</label>
              <input
                type="number"
                min="0"
                value={form.total_attendance || 0}
                onChange={(e) => setForm({ ...form, total_attendance: parseInt(e.target.value) || 0 })}
                className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block font-bold text-muted-foreground uppercase mb-1">Meeting Notes</label>
              <textarea
                value={form.meeting_notes || ""}
                onChange={(e) => setForm({ ...form, meeting_notes: e.target.value })}
                rows={3}
                className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground"
              />
            </div>
            <div className="md:col-span-2 flex gap-2">
              <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold">
                {editing ? "Update Meeting" : "Save Meeting"}
              </button>
              {editing && (
                <button
                  type="button"
                  onClick={() => {
                    setEditing(null);
                    setForm({ meeting_status: "completed", total_attendance: 0 });
                  }}
                  className="px-4 py-2 bg-muted text-foreground rounded-lg font-semibold"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      <div className="bg-card rounded-2xl border border-border/40 p-5 shadow-sm">
        <h3 className="font-heading text-base font-bold text-foreground mb-4">Meetings ({meetings.length})</h3>
        <div className="space-y-3">
          {meetings.map((m) => (
            <div key={m.id} className="p-4 bg-muted/10 rounded-xl border border-border/20">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-foreground">{m.meeting_topic}</h4>
                  <p className="text-xs text-muted-foreground">
                    {m.meeting_date} • {cells.find((c) => c.id === m.home_cell_id)?.name || "Unknown Cell"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Attendance: {m.total_attendance}</p>
                  {m.bible_scripture && (
                    <p className="text-xs text-primary mt-1">📖 {m.bible_scripture}</p>
                  )}
                </div>
                {refresh && (
                  <button
                    onClick={() => {
                      setEditing(m.id);
                      setForm(m);
                    }}
                    className="text-xs px-2 py-1 bg-primary/10 text-primary rounded"
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Attendance Tab
function AttendanceTab({ cell, members, meetings, refresh }: { cell: HomeCell, members: Member[], meetings: MeetingRecord[], refresh: () => void }) {
  const [selectedMeeting, setSelectedMeeting] = useState<string | null>(null);
  const [attendance, setAttendance] = useState<{ [key: string]: boolean }>({});

  const handleSaveAttendance = async () => {
    if (!selectedMeeting) return;
    toast.success("Attendance saved locally! (Full sync with database coming soon)");
    refresh();
  };

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-2xl border border-border/40 p-5 shadow-sm">
        <h3 className="font-heading text-base font-bold text-foreground mb-4">Record Attendance</h3>
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-muted-foreground uppercase mb-1">Select Meeting</label>
            <select
              value={selectedMeeting || ""}
              onChange={(e) => setSelectedMeeting(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground"
            >
              <option value="">-- Select a Meeting --</option>
              {meetings.map((m) => (
                <option key={m.id} value={m.id}>{m.meeting_date} - {m.meeting_topic}</option>
              ))}
            </select>
          </div>
          {selectedMeeting && (
            <>
              <div className="border-t border-border/30 pt-4">
                <h4 className="font-bold text-foreground mb-3">Mark Attendance</h4>
                <div className="space-y-2">
                  {members.map((m) => (
                    <label key={m.id} className="flex items-center gap-3 p-2 bg-muted/5 rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={attendance[m.id] || false}
                        onChange={(e) => setAttendance({ ...attendance, [m.id]: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <span className="font-medium">{m.first_name} {m.last_name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <button
                onClick={handleSaveAttendance}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold"
              >
                Save Attendance
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Admin/Pastor read-only Attendance Tab: pick a cell, pick a meeting, view who was marked present
function AdminAttendanceTab({ cells, members, meetings }: { cells: HomeCell[], members: Member[], meetings: MeetingRecord[] }) {
  const [selectedCellId, setSelectedCellId] = useState("");
  const [selectedMeetingId, setSelectedMeetingId] = useState("");
  const [records, setRecords] = useState<AttendanceRecord[] | null>(null);
  const [loading, setLoading] = useState(false);

  const cellMeetings = meetings.filter((m) => m.home_cell_id === selectedCellId);
  const memberById = new Map(members.map((m) => [m.id, m]));

  useEffect(() => {
    if (!selectedMeetingId) {
      setRecords(null);
      return;
    }
    setLoading(true);
    db.getAttendanceByMeeting(selectedMeetingId)
      .then(setRecords)
      .catch(() => {
        toast.error("Failed to load attendance records");
        setRecords([]);
      })
      .finally(() => setLoading(false));
  }, [selectedMeetingId]);

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-2xl border border-border/40 p-5 shadow-sm">
        <h3 className="font-heading text-base font-bold text-foreground mb-4">Attendance Records</h3>
        {cells.length === 0 ? (
          <p className="text-xs text-muted-foreground">No home cells yet. Add a home cell first.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-muted-foreground uppercase mb-1">Home Cell</label>
              <select
                value={selectedCellId}
                onChange={(e) => {
                  setSelectedCellId(e.target.value);
                  setSelectedMeetingId("");
                }}
                className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground"
              >
                <option value="">-- Select a Cell --</option>
                {cells.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-muted-foreground uppercase mb-1">Meeting</label>
              <select
                value={selectedMeetingId}
                onChange={(e) => setSelectedMeetingId(e.target.value)}
                disabled={!selectedCellId}
                className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground disabled:opacity-50"
              >
                <option value="">-- Select a Meeting --</option>
                {cellMeetings.map((m) => (
                  <option key={m.id} value={m.id}>{m.meeting_date} - {m.meeting_topic}</option>
                ))}
              </select>
              {selectedCellId && cellMeetings.length === 0 && (
                <p className="mt-1 text-[11px] text-muted-foreground">No meetings recorded for this cell yet.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {selectedMeetingId && (
        <div className="bg-card rounded-2xl border border-border/40 p-5 shadow-sm">
          <h4 className="font-bold text-foreground mb-3 text-xs uppercase tracking-wide">Attendance</h4>
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
            </div>
          ) : records && records.length > 0 ? (
            <div className="space-y-2">
              {records.map((r) => {
                const m = memberById.get(r.member_id);
                return (
                  <div key={r.id} className="flex items-center justify-between p-2.5 bg-muted/5 rounded-lg text-xs">
                    <span className="font-medium">{m ? `${m.first_name} ${m.last_name}` : "Unknown Member"}</span>
                    <span className={r.present ? "font-bold text-green-600" : "font-medium text-muted-foreground"}>
                      {r.present ? "Present" : "Absent"}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-6">No attendance recorded for this meeting yet.</p>
          )}
        </div>
      )}
    </div>
  );
}

// Visitors Tab
function VisitorsTab({
  visitors, cells, cellId, refresh, followUps = [], onNavigate,
}: {
  visitors: Visitor[], cells: HomeCell[], cellId?: string, refresh?: () => void,
  followUps?: FollowUp[], onNavigate?: (tab: string) => void,
}) {
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Visitor>>({ gender: "Male", follow_up_status: "New", number_of_visits: 1 });
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cellId && !refresh) return;
    try {
      if (editing) {
        await db.updateVisitor(editing, form as any);
        toast.success("Visitor updated!");
      } else if (cellId) {
        await db.addVisitor({ ...form, home_cell_id: cellId, first_visit_date: new Date().toISOString().split("T")[0] } as any);
        toast.success("Visitor added!");
      }
      refresh?.();
      setEditing(null);
      setForm({ gender: "Male", follow_up_status: "New", number_of_visits: 1 });
    } catch {
      toast.error("Failed to save visitor");
    }
  };

  return (
    <div className="space-y-4">
      {cellId && refresh && (
        <div className="bg-card rounded-2xl border border-border/40 p-5 shadow-sm">
          <h3 className="font-heading text-base font-bold text-foreground mb-4">
            {editing ? "Edit Visitor" : "Add New Visitor"}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-muted-foreground uppercase mb-1">Full Name</label>
              <input
                type="text"
                required
                value={form.full_name || ""}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground"
              />
            </div>
            <div>
              <label className="block font-bold text-muted-foreground uppercase mb-1">Phone Number</label>
              <input
                type="text"
                required
                value={form.phone_number || ""}
                onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
                className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground"
              />
            </div>
            <div>
              <label className="block font-bold text-muted-foreground uppercase mb-1">Gender</label>
              <select
                value={form.gender || "Male"}
                onChange={(e) => setForm({ ...form, gender: e.target.value as any })}
                className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground"
              >
                <option>Male</option>
                <option>Female</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-muted-foreground uppercase mb-1">Number of Visits</label>
              <input
                type="number"
                min="1"
                value={form.number_of_visits || 1}
                onChange={(e) => setForm({ ...form, number_of_visits: parseInt(e.target.value) || 1 })}
                className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground"
              />
            </div>
            <div>
              <label className="block font-bold text-muted-foreground uppercase mb-1">Follow Up Status</label>
              <select
                value={form.follow_up_status || "New"}
                onChange={(e) => setForm({ ...form, follow_up_status: e.target.value as any })}
                className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground"
              >
                <option>New</option>
                <option>Contacted</option>
                <option>Awaiting Visit</option>
                <option>Joined Church</option>
                <option>Not Interested</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-muted-foreground uppercase mb-1">Invited By</label>
              <input
                type="text"
                value={form.invited_by || ""}
                onChange={(e) => setForm({ ...form, invited_by: e.target.value })}
                className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block font-bold text-muted-foreground uppercase mb-1">Address</label>
              <input
                type="text"
                value={form.address || ""}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground"
              />
            </div>
            <div className="md:col-span-2 flex gap-2">
              <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold">
                {editing ? "Update Visitor" : "Add Visitor"}
              </button>
              {editing && (
                <button
                  type="button"
                  onClick={() => {
                    setEditing(null);
                    setForm({ gender: "Male", follow_up_status: "New", number_of_visits: 1 });
                  }}
                  className="px-4 py-2 bg-muted text-foreground rounded-lg font-semibold"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      <div className="bg-card rounded-2xl border border-border/40 p-5 shadow-sm">
        <h3 className="font-heading text-base font-bold text-foreground mb-4">Visitors ({visitors.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {visitors.map((v) => (
            <div key={v.id} onClick={() => setSelectedVisitor(v)} className="p-4 bg-muted/10 rounded-xl border border-border/20 cursor-pointer hover:border-primary/30 transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-foreground">{v.full_name}</h4>
                  <p className="text-xs text-muted-foreground">{v.phone_number}</p>
                  <p className="text-xs text-muted-foreground">Visits: {v.number_of_visits}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full mt-2 inline-block ${
                    v.follow_up_status === "Joined Church" ? "bg-green-100 text-green-800" :
                    v.follow_up_status === "Not Interested" ? "bg-red-100 text-red-800" :
                    "bg-yellow-100 text-yellow-800"
                  }`}>
                    {v.follow_up_status}
                  </span>
                </div>
                {refresh && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditing(v.id);
                      setForm(v);
                    }}
                    className="text-xs px-2 py-1 bg-primary/10 text-primary rounded"
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedVisitor && (() => {
        const visitorFollowUps = followUps
          .filter((f) => f.person_type === "visitor" && f.person_id === selectedVisitor.id)
          .sort((a, b) => new Date(b.follow_up_date).getTime() - new Date(a.follow_up_date).getTime());
        const cell = cells.find((c) => c.id === selectedVisitor.home_cell_id);

        return (
          <DetailDrawer
            open
            onClose={() => setSelectedVisitor(null)}
            title={selectedVisitor.full_name}
            subtitle={cell?.name}
            actions={
              <>
                {refresh && selectedVisitor.follow_up_status !== "Joined Church" && (
                  <button
                    onClick={async () => {
                      try {
                        await db.updateVisitor(selectedVisitor.id, { follow_up_status: "Joined Church" });
                        toast.success(`${selectedVisitor.full_name} marked as joined!`);
                        refresh?.();
                        setSelectedVisitor(null);
                      } catch {
                        toast.error("Failed to update visitor");
                      }
                    }}
                    className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    Convert to Member
                  </button>
                )}
                {onNavigate && (
                  <button
                    onClick={() => { onNavigate("followups"); setSelectedVisitor(null); }}
                    className="rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                  >
                    Add Follow-up
                  </button>
                )}
              </>
            }
          >
            <DetailSection label="Profile">
              <DetailRow label="Gender" value={selectedVisitor.gender} />
              <DetailRow label="Phone" value={selectedVisitor.phone_number} />
              <DetailRow label="Address" value={selectedVisitor.address} />
              <DetailRow label="Invited By" value={selectedVisitor.invited_by} />
            </DetailSection>

            <DetailSection label="Visit Information">
              <DetailRow label="Home Cell" value={cell?.name || "—"} />
              <DetailRow label="First Visit" value={selectedVisitor.first_visit_date} />
              <DetailRow label="Number of Visits" value={selectedVisitor.number_of_visits} />
              <DetailRow label="Follow-up Status" value={selectedVisitor.follow_up_status} />
            </DetailSection>

            <DetailSection label="Follow-up History">
              {visitorFollowUps.length > 0 ? (
                <div className="space-y-2">
                  {visitorFollowUps.slice(0, 5).map((f) => (
                    <div key={f.id} className="text-xs bg-muted/10 rounded-lg p-2.5">
                      <div className="font-semibold text-foreground">{f.follow_up_date} • {f.follow_up_method}</div>
                      <div className="text-muted-foreground mt-0.5">{f.outcome}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No follow-ups recorded yet.</p>
              )}
            </DetailSection>
          </DetailDrawer>
        );
      })()}
    </div>
  );
}

// New Converts Tab
function NewConvertsTab({
  converts, cells, cellId, refresh, followUps = [], onNavigate,
}: {
  converts: NewConvert[], cells: HomeCell[], cellId?: string, refresh?: () => void,
  followUps?: FollowUp[], onNavigate?: (tab: string) => void,
}) {
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<NewConvert>>({ baptism_status: "not_baptized", foundation_class_status: "not_started" });
  const [selectedConvert, setSelectedConvert] = useState<NewConvert | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cellId && !refresh) return;
    try {
      if (editing) {
        await db.updateNewConvert(editing, form as any);
        toast.success("Convert updated!");
      } else if (cellId) {
        await db.addNewConvert({ ...form, home_cell_id: cellId, date_of_salvation: new Date().toISOString().split("T")[0] } as any);
        toast.success("Convert added!");
      }
      refresh?.();
      setEditing(null);
      setForm({ baptism_status: "not_baptized", foundation_class_status: "not_started" });
    } catch {
      toast.error("Failed to save convert");
    }
  };

  return (
    <div className="space-y-4">
      {cellId && refresh && (
        <div className="bg-card rounded-2xl border border-border/40 p-5 shadow-sm">
          <h3 className="font-heading text-base font-bold text-foreground mb-4">
            {editing ? "Edit Convert" : "Add New Convert"}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-muted-foreground uppercase mb-1">Full Name</label>
              <input
                type="text"
                required
                value={form.full_name || ""}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground"
              />
            </div>
            <div>
              <label className="block font-bold text-muted-foreground uppercase mb-1">Phone Number</label>
              <input
                type="text"
                required
                value={form.phone_number || ""}
                onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
                className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground"
              />
            </div>
            <div>
              <label className="block font-bold text-muted-foreground uppercase mb-1">Date of Salvation</label>
              <input
                type="date"
                value={form.date_of_salvation || ""}
                onChange={(e) => setForm({ ...form, date_of_salvation: e.target.value })}
                className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground"
              />
            </div>
            <div>
              <label className="block font-bold text-muted-foreground uppercase mb-1">Baptism Status</label>
              <select
                value={form.baptism_status || "not_baptized"}
                onChange={(e) => setForm({ ...form, baptism_status: e.target.value as any })}
                className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground"
              >
                <option value="not_baptized">Not Baptized</option>
                <option value="scheduled">Scheduled</option>
                <option value="baptized">Baptized</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-muted-foreground uppercase mb-1">Foundation Class</label>
              <select
                value={form.foundation_class_status || "not_started"}
                onChange={(e) => setForm({ ...form, foundation_class_status: e.target.value as any })}
                className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground"
              >
                <option value="not_started">Not Started</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-muted-foreground uppercase mb-1">Baptism Date</label>
              <input
                type="date"
                value={form.baptism_date || ""}
                onChange={(e) => setForm({ ...form, baptism_date: e.target.value })}
                className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground"
              />
            </div>
            <div className="md:col-span-2 flex gap-2">
              <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold">
                {editing ? "Update Convert" : "Add Convert"}
              </button>
              {editing && (
                <button
                  type="button"
                  onClick={() => {
                    setEditing(null);
                    setForm({ baptism_status: "not_baptized", foundation_class_status: "not_started" });
                  }}
                  className="px-4 py-2 bg-muted text-foreground rounded-lg font-semibold"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      <div className="bg-card rounded-2xl border border-border/40 p-5 shadow-sm">
        <h3 className="font-heading text-base font-bold text-foreground mb-4">New Converts ({converts.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {converts.map((c) => (
            <div key={c.id} onClick={() => setSelectedConvert(c)} className="p-4 bg-muted/10 rounded-xl border border-border/20 cursor-pointer hover:border-primary/30 transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-foreground">{c.full_name}</h4>
                  <p className="text-xs text-muted-foreground">{c.phone_number}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Saved: {c.date_of_salvation}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      c.baptism_status === "baptized" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {c.baptism_status.replace("_", " ")}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      c.foundation_class_status === "completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                    }`}>
                      Foundation: {c.foundation_class_status.replace("_", " ")}
                    </span>
                  </div>
                </div>
                {refresh && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditing(c.id);
                      setForm(c);
                    }}
                    className="text-xs px-2 py-1 bg-primary/10 text-primary rounded"
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedConvert && (() => {
        const convertFollowUps = followUps
          .filter((f) => f.person_type === "new_convert" && f.person_id === selectedConvert.id)
          .sort((a, b) => new Date(b.follow_up_date).getTime() - new Date(a.follow_up_date).getTime());
        const cell = cells.find((c) => c.id === selectedConvert.home_cell_id);
        const nextClassStatus = selectedConvert.foundation_class_status === "not_started" ? "in_progress"
          : selectedConvert.foundation_class_status === "in_progress" ? "completed" : null;

        return (
          <DetailDrawer
            open
            onClose={() => setSelectedConvert(null)}
            title={selectedConvert.full_name}
            subtitle={cell?.name}
            actions={
              <>
                {refresh && nextClassStatus && (
                  <button
                    onClick={async () => {
                      try {
                        await db.updateNewConvert(selectedConvert.id, { foundation_class_status: nextClassStatus as any });
                        toast.success(`Foundation class marked ${nextClassStatus.replace("_", " ")}!`);
                        refresh?.();
                        setSelectedConvert(null);
                      } catch {
                        toast.error("Failed to update convert");
                      }
                    }}
                    className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    Mark {nextClassStatus === "in_progress" ? "Class Started" : "Class Completed"}
                  </button>
                )}
                {onNavigate && (
                  <button
                    onClick={() => { onNavigate("followups"); setSelectedConvert(null); }}
                    className="rounded-lg border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                  >
                    Add Follow-up
                  </button>
                )}
              </>
            }
          >
            <DetailSection label="Profile">
              <DetailRow label="Phone" value={selectedConvert.phone_number} />
              <DetailRow label="Home Cell" value={cell?.name || "—"} />
              <DetailRow label="Date of Salvation" value={selectedConvert.date_of_salvation} />
            </DetailSection>

            <DetailSection label="Discipleship">
              <DetailRow label="Baptism Status" value={selectedConvert.baptism_status.replace("_", " ")} />
              <DetailRow label="Baptism Date" value={selectedConvert.baptism_date} />
              <DetailRow label="Foundation Class" value={selectedConvert.foundation_class_status.replace("_", " ")} />
              <DetailRow label="Notes" value={selectedConvert.notes} />
            </DetailSection>

            <DetailSection label="Follow-up History">
              {convertFollowUps.length > 0 ? (
                <div className="space-y-2">
                  {convertFollowUps.slice(0, 5).map((f) => (
                    <div key={f.id} className="text-xs bg-muted/10 rounded-lg p-2.5">
                      <div className="font-semibold text-foreground">{f.follow_up_date} • {f.follow_up_method}</div>
                      <div className="text-muted-foreground mt-0.5">{f.outcome}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No follow-ups recorded yet.</p>
              )}
            </DetailSection>
          </DetailDrawer>
        );
      })()}
    </div>
  );
}

// Prayer Requests Tab
function PrayerRequestsTab({ prayers, wallPrayers, cells, cellId, refresh }: { prayers: PrayerRequest[], wallPrayers?: PrayerWallRequest[], cells: HomeCell[], cellId?: string, refresh?: () => void }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<PrayerRequest>>({ category: "general", status: "pending", testimony_received: false });
  const [wallStatusSaving, setWallStatusSaving] = useState<string | null>(null);

  const handleWallStatusChange = async (id: string, status: PrayerWallRequest["status"]) => {
    setWallStatusSaving(id);
    try {
      await db.updatePrayerWallRequest(id, { status });
      refresh?.();
    } catch {
      toast.error("Failed to update prayer request status");
    } finally {
      setWallStatusSaving(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cellId && !refresh) return;
    try {
      if (editing) {
        await db.updatePrayerRequest(editing, form as any);
        toast.success("Prayer request updated!");
      } else if (cellId) {
        await db.addPrayerRequest({ ...form, home_cell_id: cellId, member_name: "Anonymous", date_submitted: new Date().toISOString().split("T")[0] } as any);
        toast.success("Prayer request added!");
      }
      refresh?.();
      setEditing(null);
      setForm({ category: "general", status: "pending", testimony_received: false });
    } catch {
      toast.error("Failed to save prayer request");
    }
  };

  return (
    <div className="space-y-4">
      {cellId && refresh && (
        <div className="bg-card rounded-2xl border border-border/40 p-5 shadow-sm">
          <h3 className="font-heading text-base font-bold text-foreground mb-4">
            {editing ? "Edit Prayer Request" : "Add New Prayer Request"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-muted-foreground uppercase mb-1">Member Name</label>
              <input
                type="text"
                required
                value={form.member_name || ""}
                onChange={(e) => setForm({ ...form, member_name: e.target.value })}
                className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground"
              />
            </div>
            <div>
              <label className="block font-bold text-muted-foreground uppercase mb-1">Category</label>
              <select
                value={form.category || "general"}
                onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground"
              >
                <option value="salvation">Salvation</option>
                <option value="healing">Healing</option>
                <option value="deliverance">Deliverance</option>
                <option value="finances">Finances</option>
                <option value="family">Family</option>
                <option value="career">Career</option>
                <option value="spiritual_growth">Spiritual Growth</option>
                <option value="general">General</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-muted-foreground uppercase mb-1">Description</label>
              <textarea
                required
                value={form.description || ""}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground"
              />
            </div>
            <div>
              <label className="block font-bold text-muted-foreground uppercase mb-1">Status</label>
              <select
                value={form.status || "pending"}
                onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground"
              >
                <option value="pending">Pending</option>
                <option value="in_prayer">In Prayer</option>
                <option value="answered">Answered</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.testimony_received || false}
                onChange={(e) => setForm({ ...form, testimony_received: e.target.checked })}
                className="w-4 h-4"
              />
              <span>Testimony Received</span>
            </label>
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold">
                {editing ? "Update Request" : "Add Request"}
              </button>
              {editing && (
                <button
                  type="button"
                  onClick={() => {
                    setEditing(null);
                    setForm({ category: "general", status: "pending", testimony_received: false });
                  }}
                  className="px-4 py-2 bg-muted text-foreground rounded-lg font-semibold"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      <div className="bg-card rounded-2xl border border-border/40 p-5 shadow-sm">
        <h3 className="font-heading text-base font-bold text-foreground mb-4">Prayer Requests ({prayers.length})</h3>
        <div className="space-y-3">
          {prayers.map((p) => (
            <div key={p.id} className="p-4 bg-muted/10 rounded-xl border border-border/20">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-foreground">{p.member_name}</h4>
                    <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full capitalize">
                      {p.category}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{p.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      p.status === "answered" ? "bg-green-100 text-green-800" :
                      p.status === "in_prayer" ? "bg-blue-100 text-blue-800" :
                      "bg-yellow-100 text-yellow-800"
                    }`}>
                      {p.status.replace("_", " ")}
                    </span>
                    {p.testimony_received && (
                      <span className="text-xs px-2 py-0.5 bg-green-100 text-green-800 rounded-full">
                        ✝️ Testimony
                      </span>
                    )}
                  </div>
                </div>
                {refresh && (
                  <button
                    onClick={() => {
                      setEditing(p.id);
                      setForm(p);
                    }}
                    className="text-xs px-2 py-1 bg-primary/10 text-primary rounded"
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {wallPrayers && (
        <div className="bg-card rounded-2xl border border-border/40 p-5 shadow-sm">
          <h3 className="font-heading text-base font-bold text-foreground mb-1">Public Website Prayer Requests ({wallPrayers.length})</h3>
          <p className="text-xs text-muted-foreground mb-4">Submitted via the church website's Prayer Request form - not tied to a home cell.</p>
          <div className="space-y-3">
            {wallPrayers.length === 0 && (
              <p className="text-sm text-muted-foreground">No prayer requests submitted from the website yet.</p>
            )}
            {wallPrayers.map((p) => (
              <div key={p.id} className="p-4 bg-muted/10 rounded-xl border border-border/20">
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-foreground">{p.full_name}</h4>
                      <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full capitalize">
                        {p.category.replace("_", " ")}
                      </span>
                      {p.is_confidential && (
                        <span className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded-full">
                          🔒 Confidential
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{p.request}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {[p.phone_number, p.email].filter(Boolean).join(" · ") || "No contact info provided"}
                    </p>
                  </div>
                  <select
                    value={p.status}
                    disabled={!refresh || wallStatusSaving === p.id}
                    onChange={(e) => handleWallStatusChange(p.id, e.target.value as PrayerWallRequest["status"])}
                    className={`text-xs px-2 py-1 rounded-full border-0 shrink-0 ${
                      p.status === "answered" ? "bg-green-100 text-green-800" :
                      p.status === "in_prayer" ? "bg-blue-100 text-blue-800" :
                      p.status === "closed" ? "bg-muted text-muted-foreground" :
                      "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    <option value="new">New</option>
                    <option value="in_prayer">In Prayer</option>
                    <option value="answered">Answered</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Follow Ups Tab
function FollowUpsTab({ followUps, cells, cellId, refresh }: { followUps: FollowUp[], cells: HomeCell[], cellId?: string, refresh?: () => void }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<FollowUp>>({ person_type: "visitor", follow_up_method: "phone_call" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cellId && !refresh) return;
    try {
      if (editing) {
        await db.updateFollowUp(editing, form as any);
        toast.success("Follow up updated!");
      } else if (cellId) {
        await db.addFollowUp({ ...form, home_cell_id: cellId, follow_up_date: new Date().toISOString().split("T")[0] } as any);
        toast.success("Follow up added!");
      }
      refresh?.();
      setEditing(null);
      setForm({ person_type: "visitor", follow_up_method: "phone_call" });
    } catch {
      toast.error("Failed to save follow up");
    }
  };

  return (
    <div className="space-y-4">
      {cellId && refresh && (
        <div className="bg-card rounded-2xl border border-border/40 p-5 shadow-sm">
          <h3 className="font-heading text-base font-bold text-foreground mb-4">
            {editing ? "Edit Follow Up" : "Add New Follow Up"}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-muted-foreground uppercase mb-1">Person Name</label>
              <input
                type="text"
                required
                value={form.person_name || ""}
                onChange={(e) => setForm({ ...form, person_name: e.target.value })}
                className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground"
              />
            </div>
            <div>
              <label className="block font-bold text-muted-foreground uppercase mb-1">Person Type</label>
              <select
                value={form.person_type || "visitor"}
                onChange={(e) => setForm({ ...form, person_type: e.target.value as any })}
                className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground"
              >
                <option value="member">Member</option>
                <option value="visitor">Visitor</option>
                <option value="new_convert">New Convert</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-muted-foreground uppercase mb-1">Follow Up Date</label>
              <input
                type="date"
                value={form.follow_up_date || ""}
                onChange={(e) => setForm({ ...form, follow_up_date: e.target.value })}
                className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground"
              />
            </div>
            <div>
              <label className="block font-bold text-muted-foreground uppercase mb-1">Method</label>
              <select
                value={form.follow_up_method || "phone_call"}
                onChange={(e) => setForm({ ...form, follow_up_method: e.target.value as any })}
                className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground"
              >
                <option value="phone_call">Phone Call</option>
                <option value="text_message">Text Message</option>
                <option value="home_visit">Home Visit</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block font-bold text-muted-foreground uppercase mb-1">Outcome</label>
              <textarea
                required
                value={form.outcome || ""}
                onChange={(e) => setForm({ ...form, outcome: e.target.value })}
                rows={2}
                className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground"
              />
            </div>
            <div>
              <label className="block font-bold text-muted-foreground uppercase mb-1">Next Action</label>
              <input
                type="text"
                value={form.next_action || ""}
                onChange={(e) => setForm({ ...form, next_action: e.target.value })}
                className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground"
              />
            </div>
            <div>
              <label className="block font-bold text-muted-foreground uppercase mb-1">Next Follow Up Date</label>
              <input
                type="date"
                value={form.next_follow_up_date || ""}
                onChange={(e) => setForm({ ...form, next_follow_up_date: e.target.value })}
                className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground"
              />
            </div>
            <div className="md:col-span-2 flex gap-2">
              <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold">
                {editing ? "Update Follow Up" : "Add Follow Up"}
              </button>
              {editing && (
                <button
                  type="button"
                  onClick={() => {
                    setEditing(null);
                    setForm({ person_type: "visitor", follow_up_method: "phone_call" });
                  }}
                  className="px-4 py-2 bg-muted text-foreground rounded-lg font-semibold"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      <div className="bg-card rounded-2xl border border-border/40 p-5 shadow-sm">
        <h3 className="font-heading text-base font-bold text-foreground mb-4">Follow Ups ({followUps.length})</h3>
        <div className="space-y-3">
          {followUps.map((f) => (
            <div key={f.id} className="p-4 bg-muted/10 rounded-xl border border-border/20">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-foreground">{f.person_name}</h4>
                    <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full capitalize">
                      {f.person_type.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {f.follow_up_date} • {f.follow_up_method.replace("_", " ")}
                  </p>
                  <p className="text-xs mt-1">{f.outcome}</p>
                  {f.next_action && (
                    <p className="text-xs text-primary mt-1">→ {f.next_action}</p>
                  )}
                </div>
                {refresh && (
                  <button
                    onClick={() => {
                      setEditing(f.id);
                      setForm(f);
                    }}
                    className="text-xs px-2 py-1 bg-primary/10 text-primary rounded"
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Testimonies Tab
function TestimoniesTab({ testimonies, cells, cellId, refresh }: { testimonies: Testimony[], cells: HomeCell[], cellId?: string, refresh?: () => void }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Testimony>>({ is_approved: false, is_public: false });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cellId && !refresh) return;
    try {
      if (editing) {
        await db.updateTestimony(editing, form as any);
        toast.success("Testimony updated!");
      } else if (cellId) {
        await db.addTestimony({ ...form, home_cell_id: cellId, member_name: "Anonymous", date_shared: new Date().toISOString().split("T")[0] } as any);
        toast.success("Testimony added!");
      }
      refresh?.();
      setEditing(null);
      setForm({ is_approved: false, is_public: false });
    } catch {
      toast.error("Failed to save testimony");
    }
  };

  return (
    <div className="space-y-4">
      {cellId && refresh && (
        <div className="bg-card rounded-2xl border border-border/40 p-5 shadow-sm">
          <h3 className="font-heading text-base font-bold text-foreground mb-4">
            {editing ? "Edit Testimony" : "Add New Testimony"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-muted-foreground uppercase mb-1">Member Name</label>
              <input
                type="text"
                required
                value={form.member_name || ""}
                onChange={(e) => setForm({ ...form, member_name: e.target.value })}
                className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground"
              />
            </div>
            <div>
              <label className="block font-bold text-muted-foreground uppercase mb-1">Testimony Title</label>
              <input
                type="text"
                required
                value={form.testimony_title || ""}
                onChange={(e) => setForm({ ...form, testimony_title: e.target.value })}
                className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground"
              />
            </div>
            <div>
              <label className="block font-bold text-muted-foreground uppercase mb-1">Description</label>
              <textarea
                required
                value={form.description || ""}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={4}
                className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground"
              />
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.is_approved || false}
                  onChange={(e) => setForm({ ...form, is_approved: e.target.checked })}
                  className="w-4 h-4"
                />
                <span>Approved</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.is_public || false}
                  onChange={(e) => setForm({ ...form, is_public: e.target.checked })}
                  className="w-4 h-4"
                />
                <span>Public</span>
              </label>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold">
                {editing ? "Update Testimony" : "Add Testimony"}
              </button>
              {editing && (
                <button
                  type="button"
                  onClick={() => {
                    setEditing(null);
                    setForm({ is_approved: false, is_public: false });
                  }}
                  className="px-4 py-2 bg-muted text-foreground rounded-lg font-semibold"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      <div className="bg-card rounded-2xl border border-border/40 p-5 shadow-sm">
        <h3 className="font-heading text-base font-bold text-foreground mb-4">Testimonies ({testimonies.length})</h3>
        <div className="space-y-3">
          {testimonies.map((t) => (
            <div key={t.id} className="p-4 bg-muted/10 rounded-xl border border-border/20">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-foreground">{t.testimony_title}</h4>
                  <p className="text-xs text-muted-foreground">By {t.member_name} • {t.date_shared}</p>
                  <p className="text-sm mt-2">{t.description}</p>
                  <div className="flex gap-2 mt-2">
                    {t.is_approved && (
                      <span className="text-xs px-2 py-0.5 bg-green-100 text-green-800 rounded-full">
                        Approved
                      </span>
                    )}
                    {t.is_public && (
                      <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                        Public
                      </span>
                    )}
                  </div>
                </div>
                {refresh && (
                  <button
                    onClick={() => {
                      setEditing(t.id);
                      setForm(t);
                    }}
                    className="text-xs px-2 py-1 bg-primary/10 text-primary rounded"
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Offerings Tab
function OfferingsTab({ offerings, cells, cellId, refresh }: { offerings: Offering[], cells: HomeCell[], cellId?: string, refresh?: () => void }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Offering>>({ offering_amount: 0, special_contributions: 0, submission_status: "pending" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cellId && !refresh) return;
    try {
      if (editing) {
        await db.updateOffering(editing, form as any);
        toast.success("Offering updated!");
      } else if (cellId) {
        await db.addOffering({ ...form, home_cell_id: cellId, meeting_date: new Date().toISOString().split("T")[0] } as any);
        toast.success("Offering added!");
      }
      refresh?.();
      setEditing(null);
      setForm({ offering_amount: 0, special_contributions: 0, submission_status: "pending" });
    } catch {
      toast.error("Failed to save offering");
    }
  };

  return (
    <div className="space-y-4">
      {cellId && refresh && (
        <div className="bg-card rounded-2xl border border-border/40 p-5 shadow-sm">
          <h3 className="font-heading text-base font-bold text-foreground mb-4">
            {editing ? "Edit Offering" : "Record New Offering"}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-muted-foreground uppercase mb-1">Meeting Date</label>
              <input
                type="date"
                required
                value={form.meeting_date || ""}
                onChange={(e) => setForm({ ...form, meeting_date: e.target.value })}
                className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground"
              />
            </div>
            <div>
              <label className="block font-bold text-muted-foreground uppercase mb-1">Offering Amount</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.offering_amount || 0}
                onChange={(e) => setForm({ ...form, offering_amount: parseFloat(e.target.value) || 0 })}
                className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground"
              />
            </div>
            <div>
              <label className="block font-bold text-muted-foreground uppercase mb-1">Special Contributions</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.special_contributions || 0}
                onChange={(e) => setForm({ ...form, special_contributions: parseFloat(e.target.value) || 0 })}
                className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground"
              />
            </div>
            <div>
              <label className="block font-bold text-muted-foreground uppercase mb-1">Submission Status</label>
              <select
                value={form.submission_status || "pending"}
                onChange={(e) => setForm({ ...form, submission_status: e.target.value as any })}
                className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground"
              >
                <option value="pending">Pending</option>
                <option value="submitted">Submitted</option>
                <option value="approved">Approved</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block font-bold text-muted-foreground uppercase mb-1">Notes</label>
              <textarea
                value={form.notes || ""}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
                className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground"
              />
            </div>
            <div className="md:col-span-2 flex gap-2">
              <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold">
                {editing ? "Update Offering" : "Save Offering"}
              </button>
              {editing && (
                <button
                  type="button"
                  onClick={() => {
                    setEditing(null);
                    setForm({ offering_amount: 0, special_contributions: 0, submission_status: "pending" });
                  }}
                  className="px-4 py-2 bg-muted text-foreground rounded-lg font-semibold"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      <div className="bg-card rounded-2xl border border-border/40 p-5 shadow-sm">
        <h3 className="font-heading text-base font-bold text-foreground mb-4">Offerings ({offerings.length})</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/40 bg-muted/15">
                <th className="py-2 px-3 text-left font-bold text-muted-foreground">Date</th>
                <th className="py-2 px-3 text-left font-bold text-muted-foreground">Offering</th>
                <th className="py-2 px-3 text-left font-bold text-muted-foreground">Special</th>
                <th className="py-2 px-3 text-left font-bold text-muted-foreground">Total</th>
                <th className="py-2 px-3 text-left font-bold text-muted-foreground">Status</th>
                {refresh && <th className="py-2 px-3 text-left font-bold text-muted-foreground">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {offerings.map((o) => (
                <tr key={o.id} className="hover:bg-muted/5">
                  <td className="py-3 px-3">{o.meeting_date}</td>
                  <td className="py-3 px-3">{o.offering_amount?.toFixed(2) || "0.00"}</td>
                  <td className="py-3 px-3">{o.special_contributions?.toFixed(2) || "0.00"}</td>
                  <td className="py-3 px-3 font-bold">{o.total_amount?.toFixed(2) || (o.offering_amount + (o.special_contributions || 0)).toFixed(2)}</td>
                  <td className="py-3 px-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      o.submission_status === "approved" ? "bg-green-100 text-green-800" :
                      o.submission_status === "submitted" ? "bg-blue-100 text-blue-800" :
                      "bg-yellow-100 text-yellow-800"
                    }`}>
                      {o.submission_status}
                    </span>
                  </td>
                  {refresh && (
                    <td className="py-3 px-3">
                      <button
                        onClick={() => {
                          setEditing(o.id);
                          setForm(o);
                        }}
                        className="text-xs px-2 py-1 bg-primary/10 text-primary rounded"
                      >
                        Edit
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Reports Tab
function ReportsTab({ reports, cells, cellId, refresh }: { reports: WeeklyReport[], cells: HomeCell[], cellId?: string, refresh?: () => void }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<WeeklyReport>>({
    total_members: 0, members_present: 0, members_absent: 0,
    visitors: 0, new_converts: 0, baptisms: 0, prayer_requests: 0,
    testimonies: 0, follow_ups_completed: 0, total_offering: 0
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cellId && !refresh) return;
    try {
      if (editing) {
        await db.submitWeeklyReport({ ...form, id: editing, home_cell_id: cellId! } as any);
        toast.success("Report updated!");
      } else if (cellId) {
        await db.submitWeeklyReport({
          ...form,
          home_cell_id: cellId,
          report_date: new Date().toISOString().split("T")[0]
        } as any);
        toast.success("Report submitted!");
      }
      refresh?.();
      setEditing(null);
      setForm({
        total_members: 0, members_present: 0, members_absent: 0,
        visitors: 0, new_converts: 0, baptisms: 0, prayer_requests: 0,
        testimonies: 0, follow_ups_completed: 0, total_offering: 0
      });
    } catch {
      toast.error("Failed to save report");
    }
  };

  return (
    <div className="space-y-4">
      {cellId && refresh && (
        <div className="bg-card rounded-2xl border border-border/40 p-5 shadow-sm">
          <h3 className="font-heading text-base font-bold text-foreground mb-4">
            {editing ? "Edit Weekly Report" : "Submit Weekly Report"}
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-muted-foreground uppercase mb-1">Report Date</label>
              <input
                type="date"
                required
                value={form.report_date || ""}
                onChange={(e) => setForm({ ...form, report_date: e.target.value })}
                className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground"
              />
            </div>
            <div>
              <label className="block font-bold text-muted-foreground uppercase mb-1">Total Members</label>
              <input
                type="number"
                min="0"
                value={form.total_members || 0}
                onChange={(e) => setForm({ ...form, total_members: parseInt(e.target.value) || 0 })}
                className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground"
              />
            </div>
            <div>
              <label className="block font-bold text-muted-foreground uppercase mb-1">Members Present</label>
              <input
                type="number"
                min="0"
                value={form.members_present || 0}
                onChange={(e) => setForm({ ...form, members_present: parseInt(e.target.value) || 0 })}
                className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground"
              />
            </div>
            <div>
              <label className="block font-bold text-muted-foreground uppercase mb-1">Members Absent</label>
              <input
                type="number"
                min="0"
                value={form.members_absent || 0}
                onChange={(e) => setForm({ ...form, members_absent: parseInt(e.target.value) || 0 })}
                className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground"
              />
            </div>
            <div>
              <label className="block font-bold text-muted-foreground uppercase mb-1">Visitors</label>
              <input
                type="number"
                min="0"
                value={form.visitors || 0}
                onChange={(e) => setForm({ ...form, visitors: parseInt(e.target.value) || 0 })}
                className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground"
              />
            </div>
            <div>
              <label className="block font-bold text-muted-foreground uppercase mb-1">New Converts</label>
              <input
                type="number"
                min="0"
                value={form.new_converts || 0}
                onChange={(e) => setForm({ ...form, new_converts: parseInt(e.target.value) || 0 })}
                className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground"
              />
            </div>
            <div>
              <label className="block font-bold text-muted-foreground uppercase mb-1">Baptisms</label>
              <input
                type="number"
                min="0"
                value={form.baptisms || 0}
                onChange={(e) => setForm({ ...form, baptisms: parseInt(e.target.value) || 0 })}
                className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground"
              />
            </div>
            <div>
              <label className="block font-bold text-muted-foreground uppercase mb-1">Prayer Requests</label>
              <input
                type="number"
                min="0"
                value={form.prayer_requests || 0}
                onChange={(e) => setForm({ ...form, prayer_requests: parseInt(e.target.value) || 0 })}
                className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground"
              />
            </div>
            <div>
              <label className="block font-bold text-muted-foreground uppercase mb-1">Testimonies</label>
              <input
                type="number"
                min="0"
                value={form.testimonies || 0}
                onChange={(e) => setForm({ ...form, testimonies: parseInt(e.target.value) || 0 })}
                className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground"
              />
            </div>
            <div>
              <label className="block font-bold text-muted-foreground uppercase mb-1">Follow Ups Completed</label>
              <input
                type="number"
                min="0"
                value={form.follow_ups_completed || 0}
                onChange={(e) => setForm({ ...form, follow_ups_completed: parseInt(e.target.value) || 0 })}
                className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground"
              />
            </div>
            <div>
              <label className="block font-bold text-muted-foreground uppercase mb-1">Total Offering</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.total_offering || 0}
                onChange={(e) => setForm({ ...form, total_offering: parseFloat(e.target.value) || 0 })}
                className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground"
              />
            </div>
            <div className="md:col-span-3 flex gap-2 pt-2">
              <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold">
                {editing ? "Update Report" : "Submit Report"}
              </button>
              {editing && (
                <button
                  type="button"
                  onClick={() => {
                    setEditing(null);
                    setForm({
                      total_members: 0, members_present: 0, members_absent: 0,
                      visitors: 0, new_converts: 0, baptisms: 0, prayer_requests: 0,
                      testimonies: 0, follow_ups_completed: 0, total_offering: 0
                    });
                  }}
                  className="px-4 py-2 bg-muted text-foreground rounded-lg font-semibold"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {!cellId && reports.length > 0 && (() => {
        const totalAttendance = reports.reduce((sum, r) => sum + r.members_present, 0);
        const totalPossible = reports.reduce((sum, r) => sum + r.total_members, 0);
        const totalVisitors = reports.reduce((sum, r) => sum + r.visitors, 0);
        const totalConverts = reports.reduce((sum, r) => sum + r.new_converts, 0);
        const totalOffering = reports.reduce((sum, r) => sum + r.total_offering, 0);
        const avgAttendance = totalPossible > 0 ? Math.round((totalAttendance / totalPossible) * 100) : 0;

        const byCell = cells.map((c) => {
          const cellReports = reports.filter((r) => r.home_cell_id === c.id);
          const present = cellReports.reduce((s, r) => s + r.members_present, 0);
          const possible = cellReports.reduce((s, r) => s + r.total_members, 0);
          return {
            cell: c,
            reportCount: cellReports.length,
            attendanceRate: possible > 0 ? Math.round((present / possible) * 100) : 0,
            visitors: cellReports.reduce((s, r) => s + r.visitors, 0),
            offering: cellReports.reduce((s, r) => s + r.total_offering, 0),
          };
        }).filter((row) => row.reportCount > 0);

        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-card rounded-2xl border border-border/40 p-4 shadow-sm">
                <div className="text-xs font-semibold text-muted-foreground">Avg. Attendance</div>
                <div className="text-xl font-bold text-foreground mt-1">{avgAttendance}%</div>
              </div>
              <div className="bg-card rounded-2xl border border-border/40 p-4 shadow-sm">
                <div className="text-xs font-semibold text-muted-foreground">Total Visitors</div>
                <div className="text-xl font-bold text-foreground mt-1">{totalVisitors}</div>
              </div>
              <div className="bg-card rounded-2xl border border-border/40 p-4 shadow-sm">
                <div className="text-xs font-semibold text-muted-foreground">Total Converts</div>
                <div className="text-xl font-bold text-foreground mt-1">{totalConverts}</div>
              </div>
              <div className="bg-card rounded-2xl border border-border/40 p-4 shadow-sm">
                <div className="text-xs font-semibold text-muted-foreground">Total Offerings</div>
                <div className="text-xl font-bold text-foreground mt-1">{totalOffering.toFixed(2)}</div>
              </div>
            </div>

            {byCell.length > 0 && (
              <div className="bg-card rounded-2xl border border-border/40 p-5 shadow-sm">
                <h3 className="font-heading text-base font-bold text-foreground mb-4">Cell Reporting Summary</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border/40 bg-muted/15">
                        <th className="py-2 px-3 text-left font-bold text-muted-foreground">Cell</th>
                        <th className="py-2 px-3 text-right font-bold text-muted-foreground">Reports</th>
                        <th className="py-2 px-3 text-right font-bold text-muted-foreground">Attendance</th>
                        <th className="py-2 px-3 text-right font-bold text-muted-foreground">Visitors</th>
                        <th className="py-2 px-3 text-right font-bold text-muted-foreground">Offerings</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20">
                      {byCell.map((row) => (
                        <tr key={row.cell.id}>
                          <td className="py-2.5 px-3 font-semibold text-foreground">{row.cell.name}</td>
                          <td className="py-2.5 px-3 text-right">{row.reportCount}</td>
                          <td className="py-2.5 px-3 text-right">{row.attendanceRate}%</td>
                          <td className="py-2.5 px-3 text-right">{row.visitors}</td>
                          <td className="py-2.5 px-3 text-right">{row.offering.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      <div className="bg-card rounded-2xl border border-border/40 p-5 shadow-sm">
        <h3 className="font-heading text-base font-bold text-foreground mb-4">Weekly Reports ({reports.length})</h3>
        <div className="space-y-3">
          {reports.map((r) => (
            <div key={r.id} className="p-4 bg-muted/10 rounded-xl border border-border/20">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-foreground">
                    {cells.find((c) => c.id === r.home_cell_id)?.name || "Cell"} - {r.report_date}
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-xs">
                    <div className="bg-white p-2 rounded">
                      <span className="text-muted-foreground">Attendance:</span> {r.members_present}/{r.total_members}
                    </div>
                    <div className="bg-white p-2 rounded">
                      <span className="text-muted-foreground">Visitors:</span> {r.visitors}
                    </div>
                    <div className="bg-white p-2 rounded">
                      <span className="text-muted-foreground">Converts:</span> {r.new_converts}
                    </div>
                    <div className="bg-white p-2 rounded">
                      <span className="text-muted-foreground">Offering:</span> {r.total_offering.toFixed(2)}
                    </div>
                  </div>
                </div>
                {refresh && (
                  <button
                    onClick={() => {
                      setEditing(r.id);
                      setForm(r);
                    }}
                    className="text-xs px-2 py-1 bg-primary/10 text-primary rounded"
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Cell Details Tab
function CellDetailsTab({ cell, refresh, canEdit = true }: { cell: HomeCell, refresh: () => void, canEdit?: boolean }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<HomeCell>>(cell);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await db.updateHomeCell(cell.id, form as any);
      toast.success("Cell updated!");
      setEditing(false);
      refresh();
    } catch {
      toast.error("Failed to update cell");
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-2xl border border-border/40 p-5 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-heading text-base font-bold text-foreground">Cell Details</h3>
          {!canEdit && (
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
              View only
            </span>
          )}
          {canEdit && (
          <button
            onClick={() => editing ? setEditing(false) : setEditing(true)}
            className="text-xs px-3 py-1 bg-primary/10 text-primary rounded font-semibold"
          >
            {editing ? "Cancel" : "Edit"}
          </button>
          )}
        </div>
        {editing && canEdit ? (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-muted-foreground uppercase mb-1">Cell Name</label>
              <input
                type="text"
                value={form.name || ""}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground"
              />
            </div>
            <div>
              <label className="block font-bold text-muted-foreground uppercase mb-1">Cell Code</label>
              <input
                type="text"
                value={form.cell_code || ""}
                onChange={(e) => setForm({ ...form, cell_code: e.target.value })}
                className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground"
              />
            </div>
            <div>
              <label className="block font-bold text-muted-foreground uppercase mb-1">Location</label>
              <input
                type="text"
                value={form.location || ""}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground"
              />
            </div>
            <div>
              <label className="block font-bold text-muted-foreground uppercase mb-1">Address</label>
              <input
                type="text"
                value={form.address || ""}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-muted-foreground uppercase mb-1">Meeting Day</label>
                <select
                  value={form.meeting_day || ""}
                  onChange={(e) => setForm({ ...form, meeting_day: e.target.value })}
                  className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground"
                >
                  <option>Sunday</option>
                  <option>Monday</option>
                  <option>Tuesday</option>
                  <option>Wednesday</option>
                  <option>Thursday</option>
                  <option>Friday</option>
                  <option>Saturday</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-muted-foreground uppercase mb-1">Meeting Time</label>
                <input
                  type="time"
                  value={form.meeting_time || ""}
                  onChange={(e) => setForm({ ...form, meeting_time: e.target.value })}
                  className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground"
                />
              </div>
            </div>
            <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold">
              Save Changes
            </button>
          </form>
        ) : (
          <div className="space-y-3">
            <div>
              <span className="text-xs font-bold text-muted-foreground uppercase">Cell Name:</span>
              <p className="font-semibold">{cell.name}</p>
            </div>
            {cell.cell_code && (
              <div>
                <span className="text-xs font-bold text-muted-foreground uppercase">Cell Code:</span>
                <p className="font-semibold">{cell.cell_code}</p>
              </div>
            )}
            <div>
              <span className="text-xs font-bold text-muted-foreground uppercase">Location:</span>
              <p>{cell.location}</p>
            </div>
            <div>
              <span className="text-xs font-bold text-muted-foreground uppercase">Address:</span>
              <p>{cell.address}</p>
            </div>
            <div>
              <span className="text-xs font-bold text-muted-foreground uppercase">Meeting Time:</span>
              <p>{cell.meeting_day} at {cell.meeting_time}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Requests Tab
function RequestsTab({ requests, cell, cells, refresh }: { requests: CellMembershipRequest[], cell?: HomeCell, cells?: HomeCell[], refresh: () => void }) {
  const cellNameById = new Map((cells || (cell ? [cell] : [])).map((c) => [c.id, c.name]));

  const handleUpdateStatus = async (id: string, status: "approved" | "rejected") => {
    try {
      await db.updateCellMembershipRequest(id, { status });
      toast.success(`Request ${status}!`);
      refresh();
    } catch {
      toast.error("Failed to update request");
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-2xl border border-border/40 p-5 shadow-sm">
        <h3 className="font-heading text-base font-bold text-foreground mb-4">Membership Requests ({requests.length})</h3>
        {requests.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No pending requests</p>
        ) : (
          <div className="space-y-3">
            {requests.map((r) => (
              <div key={r.id} className="p-4 bg-muted/10 rounded-xl border border-border/20">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-foreground">{r.first_name} {r.last_name}</h4>
                      {cells && (
                        <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                          {cellNameById.get(r.home_cell_id) || "Unknown Cell"}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{r.phone_number}</p>
                    <p className="text-xs text-muted-foreground">{r.address}</p>
                    {r.occupation && <p className="text-xs text-muted-foreground">{r.occupation}</p>}
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full text-center ${
                      r.status === "approved" ? "bg-green-100 text-green-800" :
                      r.status === "rejected" ? "bg-red-100 text-red-800" :
                      "bg-yellow-100 text-yellow-800"
                    }`}>
                      {r.status}
                    </span>
                    {r.status === "pending" && (
                      <div className="flex gap-1 mt-1">
                        <button
                          onClick={() => handleUpdateStatus(r.id, "approved")}
                          className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(r.id, "rejected")}
                          className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Contact Messages Tab (public "Contact Us" form submissions)
function ContactMessagesTab({ messages, refresh }: { messages: ContactMessage[], refresh?: () => void }) {
  const [saving, setSaving] = useState<string | null>(null);

  const handleStatusChange = async (id: string, status: ContactMessage["status"]) => {
    setSaving(id);
    try {
      await db.updateContactMessage(id, { status });
      refresh?.();
    } catch {
      toast.error("Failed to update message status");
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-2xl border border-border/40 p-5 shadow-sm">
        <h3 className="font-heading text-base font-bold text-foreground mb-1">Contact Messages ({messages.length})</h3>
        <p className="text-xs text-muted-foreground mb-4">Submitted via the church website's Contact Us form.</p>
        {messages.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No messages yet</p>
        ) : (
          <div className="space-y-3">
            {messages.map((m) => (
              <div key={m.id} className="p-4 bg-muted/10 rounded-xl border border-border/20">
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <h4 className="font-bold text-foreground">{m.full_name}</h4>
                    <a href={`mailto:${m.email}`} className="text-xs text-primary hover:underline">{m.email}</a>
                    <p className="text-xs text-muted-foreground mt-1">{m.message}</p>
                  </div>
                  <select
                    value={m.status}
                    disabled={!refresh || saving === m.id}
                    onChange={(e) => handleStatusChange(m.id, e.target.value as ContactMessage["status"])}
                    className={`text-xs px-2 py-1 rounded-full border-0 shrink-0 ${
                      m.status === "responded" ? "bg-green-100 text-green-800" :
                      m.status === "read" ? "bg-blue-100 text-blue-800" :
                      "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    <option value="new">New</option>
                    <option value="read">Read</option>
                    <option value="responded">Responded</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Events Tab
function EventsTab({ events, refresh }: { events: ChurchEvent[], refresh: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<{ title: string; description: string; event_date: string; image_url: string }>({
    title: "", description: "", event_date: "", image_url: "",
  });
  const [uploading, setUploading] = useState(false);

  const toLocalInputValue = (iso: string) => {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const startEdit = (event: ChurchEvent) => {
    setEditingId(event.id);
    setForm({
      title: event.title,
      description: event.description,
      event_date: toLocalInputValue(event.event_date),
      image_url: event.image_url || "",
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({ title: "", description: "", event_date: "", image_url: "" });
    setShowForm(false);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadMediaImage(file, "events");
      setForm((f) => ({ ...f, image_url: url }));
    } catch {
      toast.error("Failed to upload photo");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title: form.title,
        description: form.description,
        event_date: new Date(form.event_date).toISOString(),
        image_url: form.image_url || null,
      };
      if (editingId) {
        await db.updateEvent(editingId, payload);
        toast.success("Event updated!");
      } else {
        await db.addEvent(payload);
        toast.success("Event posted!");
      }
      resetForm();
      refresh();
    } catch {
      toast.error(editingId ? "Failed to update event" : "Failed to post event");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await db.deleteEvent(id);
      toast.success("Event deleted");
      refresh();
    } catch {
      toast.error("Failed to delete event");
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-2xl border border-border/40 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-base font-bold text-foreground">Events ({events.length})</h3>
          <button
            onClick={() => (showForm ? resetForm() : setShowForm(true))}
            className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            {showForm ? "Cancel" : "+ Add Event"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mb-5 pb-5 border-b border-border/30">
            <div className="md:col-span-2">
              <label className="block font-bold text-muted-foreground uppercase mb-1">Title</label>
              <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground" />
            </div>
            <div className="md:col-span-2">
              <label className="block font-bold text-muted-foreground uppercase mb-1">Description</label>
              <textarea required rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground resize-none" />
            </div>
            <div>
              <label className="block font-bold text-muted-foreground uppercase mb-1">Date &amp; Time</label>
              <input type="datetime-local" required value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground" />
            </div>
            <div>
              <label className="block font-bold text-muted-foreground uppercase mb-1">Photo (optional)</label>
              <input type="file" accept="image/*" onChange={handleFileSelect} disabled={uploading} className="w-full text-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-2 file:text-xs file:font-semibold file:text-primary-foreground file:cursor-pointer" />
              {uploading && <p className="mt-1 text-[10px] normal-case font-normal text-muted-foreground">Uploading...</p>}
              {form.image_url && !uploading && (
                <div className="mt-2 flex items-center gap-2">
                  <img src={form.image_url} alt="" className="h-12 w-12 rounded object-cover border border-border" />
                  <button type="button" onClick={() => setForm({ ...form, image_url: "" })} className="text-[10px] font-semibold text-destructive normal-case">Remove</button>
                </div>
              )}
              <p className="mt-1 text-[10px] normal-case font-normal text-muted-foreground">
                Or paste a direct image link instead - a Facebook/Instagram post link won't work, only a link straight to the photo file.
              </p>
              <input type="text" placeholder="https://example.com/photo.jpg" value={form.image_url.startsWith("data:") ? "" : form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="mt-1 w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground" />
            </div>
            <div className="md:col-span-2">
              <button type="submit" disabled={uploading} className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50">{editingId ? "Update Event" : "Post Event"}</button>
            </div>
          </form>
        )}

        <div className="space-y-3">
          {events.map((e) => (
            <div key={e.id} className="p-4 bg-muted/10 rounded-xl border border-border/20 flex items-start justify-between gap-3">
              <div>
                <h4 className="font-bold text-foreground">{e.title}</h4>
                <p className="text-xs text-muted-foreground">{new Date(e.event_date).toLocaleString()}</p>
                <p className="text-sm mt-1">{e.description}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button onClick={() => startEdit(e)} className="text-[11px] font-semibold text-primary hover:underline">Edit</button>
                <button onClick={() => handleDelete(e.id)} className="text-[11px] font-semibold text-destructive hover:underline">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Announcements Tab
function AnnouncementsTab({ announcements, refresh }: { announcements: Announcement[], refresh: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", content: "" });

  const startEdit = (announcement: Announcement) => {
    setEditingId(announcement.id);
    setForm({ title: announcement.title, content: announcement.content });
    setShowForm(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({ title: "", content: "" });
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await db.updateAnnouncement(editingId, form);
        toast.success("Announcement updated!");
      } else {
        await db.addAnnouncement(form);
        toast.success("Announcement posted!");
      }
      resetForm();
      refresh();
    } catch {
      toast.error(editingId ? "Failed to update announcement" : "Failed to post announcement");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await db.deleteAnnouncement(id);
      toast.success("Announcement deleted");
      refresh();
    } catch {
      toast.error("Failed to delete announcement");
    }
  };

  return (
    <div className="bg-card rounded-2xl border border-border/40 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading text-base font-bold text-foreground">Announcements ({announcements.length})</h3>
        <button
          onClick={() => (showForm ? resetForm() : setShowForm(true))}
          className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          {showForm ? "Cancel" : "+ Add Announcement"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4 text-xs mb-5 pb-5 border-b border-border/30">
          <div>
            <label className="block font-bold text-muted-foreground uppercase mb-1">Title</label>
            <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground" />
          </div>
          <div>
            <label className="block font-bold text-muted-foreground uppercase mb-1">Content</label>
            <textarea required rows={3} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground resize-none" />
          </div>
          <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">{editingId ? "Update Announcement" : "Post Announcement"}</button>
        </form>
      )}

      <div className="space-y-3">
        {announcements.map((a) => (
          <div key={a.id} className="p-4 bg-muted/10 rounded-xl border border-border/20 flex items-start justify-between gap-3">
            <div>
              <h4 className="font-bold text-foreground">{a.title}</h4>
              <p className="text-sm mt-1">{a.content}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button onClick={() => startEdit(a)} className="text-[11px] font-semibold text-primary hover:underline">Edit</button>
              <button onClick={() => handleDelete(a.id)} className="text-[11px] font-semibold text-destructive hover:underline">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Sermons Tab
function SermonsTab({ sermons, refresh }: { sermons: Sermon[], refresh: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", preacher: "", scripture: "", date: "", video_url: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await db.addSermon({
        title: form.title, preacher: form.preacher, scripture: form.scripture,
        date: form.date, video_url: form.video_url || null,
      });
      toast.success("Sermon posted!");
      setForm({ title: "", preacher: "", scripture: "", date: "", video_url: "" });
      setShowForm(false);
      refresh();
    } catch {
      toast.error("Failed to post sermon");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await db.deleteSermon(id);
      toast.success("Sermon deleted");
      refresh();
    } catch {
      toast.error("Failed to delete sermon");
    }
  };

  return (
    <div className="bg-card rounded-2xl border border-border/40 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading text-base font-bold text-foreground">Sermons ({sermons.length})</h3>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          {showForm ? "Cancel" : "+ Add Sermon"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mb-5 pb-5 border-b border-border/30">
          <div>
            <label className="block font-bold text-muted-foreground uppercase mb-1">Title</label>
            <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground" />
          </div>
          <div>
            <label className="block font-bold text-muted-foreground uppercase mb-1">Preacher</label>
            <input type="text" required value={form.preacher} onChange={(e) => setForm({ ...form, preacher: e.target.value })} className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground" />
          </div>
          <div>
            <label className="block font-bold text-muted-foreground uppercase mb-1">Scripture</label>
            <input type="text" required value={form.scripture} onChange={(e) => setForm({ ...form, scripture: e.target.value })} className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground" placeholder="e.g. John 3:16" />
          </div>
          <div>
            <label className="block font-bold text-muted-foreground uppercase mb-1">Date</label>
            <input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground" />
          </div>
          <div className="md:col-span-2">
            <label className="block font-bold text-muted-foreground uppercase mb-1">Video URL (optional)</label>
            <input type="text" placeholder="https://youtube.com/watch?v=... or any link" value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })} className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground" />
            <p className="mt-1 text-[10px] normal-case font-normal text-muted-foreground">
              YouTube or Vimeo links play right on the site. Any other link (Instagram, Facebook, etc.) opens in a new tab instead - those platforms don't allow embedding elsewhere.
            </p>
          </div>
          <div className="md:col-span-2">
            <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">Post Sermon</button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {sermons.map((s) => (
          <div key={s.id} className="p-4 bg-muted/10 rounded-xl border border-border/20 flex items-start justify-between gap-3">
            <div>
              <h4 className="font-bold text-foreground">{s.title}</h4>
              <p className="text-xs text-muted-foreground">{s.preacher} • {s.date}</p>
              {s.scripture && <p className="text-sm text-primary mt-1">{s.scripture}</p>}
            </div>
            <button onClick={() => handleDelete(s.id)} className="text-[11px] font-semibold text-destructive hover:underline shrink-0">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// Books Tab
function BooksTab({ books, refresh }: { books: Book[], refresh: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "", author: "", description: "", purchase_link: "", cover_image_url: "",
    price: "", currency: "TZS", categories: "",
  });
  const [uploading, setUploading] = useState(false);

  const startEdit = (book: Book) => {
    setEditingId(book.id);
    setForm({
      title: book.title,
      author: book.author,
      description: book.description || "",
      purchase_link: book.purchase_link || "",
      cover_image_url: book.cover_image_url || "",
      price: book.price != null ? String(book.price) : "",
      currency: book.currency || "TZS",
      categories: book.categories ? book.categories.join(", ") : "",
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({ title: "", author: "", description: "", purchase_link: "", cover_image_url: "", price: "", currency: "TZS", categories: "" });
    setShowForm(false);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadMediaImage(file, "books");
      setForm((f) => ({ ...f, cover_image_url: url }));
    } catch {
      toast.error("Failed to upload cover");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await db.updateBook(id, { is_approved: true });
      toast.success("Book approved and published.");
      refresh();
    } catch {
      toast.error("Failed to approve book");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await db.deleteBook(id);
      toast.success("Book deleted");
      refresh();
    } catch {
      toast.error("Failed to delete book");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title: form.title,
        author: form.author,
        description: form.description,
        purchase_link: form.purchase_link || null,
        cover_image_url: form.cover_image_url || null,
        price: form.price ? parseFloat(form.price) : null,
        currency: form.price ? form.currency : null,
        categories: form.categories ? form.categories.split(",").map((c) => c.trim()).filter(Boolean) : null,
      };
      if (editingId) {
        await db.updateBook(editingId, payload);
        toast.success("Book updated!");
      } else {
        await db.addBook({ ...payload, is_approved: true });
        toast.success("Book published!");
      }
      resetForm();
      refresh();
    } catch {
      toast.error(editingId ? "Failed to update book" : "Failed to add book");
    }
  };

  return (
    <div className="bg-card rounded-2xl border border-border/40 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading text-base font-bold text-foreground">Books ({books.length})</h3>
        <button
          onClick={() => (showForm ? resetForm() : setShowForm(true))}
          className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          {showForm ? "Cancel" : "+ Add Book"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mb-5 pb-5 border-b border-border/30">
          <div>
            <label className="block font-bold text-muted-foreground uppercase mb-1">Title</label>
            <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground" />
          </div>
          <div>
            <label className="block font-bold text-muted-foreground uppercase mb-1">Author</label>
            <input type="text" required value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground" />
          </div>
          <div className="md:col-span-2">
            <label className="block font-bold text-muted-foreground uppercase mb-1">Description</label>
            <textarea required rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground resize-none" />
          </div>
          <div className="md:col-span-2">
            <label className="block font-bold text-muted-foreground uppercase mb-1">Purchase Link (optional)</label>
            <input type="text" value={form.purchase_link} onChange={(e) => setForm({ ...form, purchase_link: e.target.value })} placeholder="https://..." className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground" />
          </div>
          <div>
            <label className="block font-bold text-muted-foreground uppercase mb-1">Cover Photo (optional)</label>
            <input type="file" accept="image/*" onChange={handleFileSelect} disabled={uploading} className="w-full text-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-2 file:text-xs file:font-semibold file:text-primary-foreground file:cursor-pointer" />
            {uploading && <p className="mt-1 text-[10px] normal-case font-normal text-muted-foreground">Uploading...</p>}
            {form.cover_image_url && !uploading && (
              <div className="mt-2 flex items-center gap-2">
                <img src={form.cover_image_url} alt="" className="h-12 w-9 rounded object-cover border border-border" />
                <button type="button" onClick={() => setForm({ ...form, cover_image_url: "" })} className="text-[10px] font-semibold text-destructive normal-case">Remove</button>
              </div>
            )}
            <p className="mt-1 text-[10px] normal-case font-normal text-muted-foreground">
              Or paste a direct image link instead - a Facebook/Instagram post link won't work, only a link straight to the photo file.
            </p>
            <input type="text" placeholder="https://example.com/cover.jpg" value={form.cover_image_url.startsWith("data:") ? "" : form.cover_image_url} onChange={(e) => setForm({ ...form, cover_image_url: e.target.value })} className="mt-1 w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-bold text-muted-foreground uppercase mb-1">Price (optional)</label>
              <input type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground" />
            </div>
            <div>
              <label className="block font-bold text-muted-foreground uppercase mb-1">Currency</label>
              <input type="text" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground" />
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block font-bold text-muted-foreground uppercase mb-1">Categories (comma-separated, optional)</label>
            <input type="text" value={form.categories} onChange={(e) => setForm({ ...form, categories: e.target.value })} placeholder="Faith, Prayer, Leadership" className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground" />
          </div>
          <div className="md:col-span-2">
            <button type="submit" disabled={uploading} className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50">{editingId ? "Update Book" : "Publish Book"}</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {books.map((b) => (
          <div key={b.id} className="p-4 bg-muted/10 rounded-xl border border-border/20 flex gap-4">
            {b.cover_image_url ? (
              <img src={b.cover_image_url} alt={b.title} className="w-20 h-28 object-cover rounded" />
            ) : (
              <div className="w-20 h-28 bg-primary/10 rounded flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-primary/40" />
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-bold text-foreground">{b.title}</h4>
                <StatusBadge status={b.is_approved ? "approved" : "pending"} />
              </div>
              <p className="text-xs text-muted-foreground">By {b.author}</p>
              {b.description && <p className="text-sm mt-1 line-clamp-2">{b.description}</p>}
              {b.purchase_link && (
                <a href={b.purchase_link} target="_blank" rel="noopener noreferrer" className="text-[11px] text-primary hover:underline mt-1 inline-block">
                  Purchase link ↗
                </a>
              )}
              <div className="flex items-center gap-3 mt-2">
                {!b.is_approved && (
                  <button
                    onClick={() => handleApprove(b.id)}
                    className="rounded-lg bg-primary px-3 py-1.5 text-[11px] font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    Approve & Publish
                  </button>
                )}
                <button onClick={() => startEdit(b)} className="text-[11px] font-semibold text-primary hover:underline">Edit</button>
                <button onClick={() => handleDelete(b.id)} className="text-[11px] font-semibold text-destructive hover:underline">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
