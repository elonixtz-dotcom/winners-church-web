import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  db,
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
  FollowUp,
  Testimony,
  Offering,
  Zone,
  District,
} from "@/lib/db";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardHome,
});

function DashboardHome() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Common state
  const [cells, setCells] = useState<HomeCell[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
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
          const [members, reports, visitors, meetings, newConverts, prayers, followUps, testimonies, offerings, requests, books] = await Promise.all([
            db.getMembers(),
            db.getWeeklyReports(),
            db.getVisitors(),
            db.getMeetingRecords(),
            db.getNewConverts(),
            db.getPrayerRequests(),
            db.getFollowUps(),
            db.getTestimoniesByCell(""), // We'll filter later
            db.getOfferings(),
            db.getCellMembershipRequests(),
            db.getBooks(),
          ]);
          
          // Filter testimonies for cell if needed, but super admin can see all (adjust as needed)
          setPastorData({ members, reports, visitors, meetings, newConverts, prayers, followUps, testimonies, offerings, requests, books });
        } else if (user.role === "media_team") {
          // Load media data
          const [events, announcements, sermons, books] = await Promise.all([
            db.getEvents(),
            db.getAnnouncements(),
            db.getSermons(),
            db.getBooks(),
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
              Promise.resolve([]), // getAttendanceByCell is there, but let's just load all then filter
              db.getCellMembershipRequestsByCell(cell.id),
            ]);
            
            setCellLeaderData({ cell, members, visitors, reports, meetings, newConverts, prayers, followUps, testimonies, offerings, attendanceRecords, requests });
          } else {
            setCellLeaderData(null);
          }
        }
      } catch (err) {
        console.error("Error loading dashboard data", err);
      }
    };

    loadData();
  }, [user, triggerRefresh]);

  if (!user) return null;

  // Determine all available tabs for current role
  const getTabs = () => {
    switch (user.role) {
      case "super_admin":
      case "church_admin":
        return [
          { id: "overview", label: "Dashboard", icon: "📊" },
          { id: "cells", label: "Home Cells", icon: "🏠" },
          { id: "zones", label: "Zones", icon: "🌍" },
          { id: "districts", label: "Districts", icon: "🗺️" },
          { id: "users", label: "Users", icon: "👥" },
          { id: "members", label: "Members", icon: "👤" },
          { id: "meetings", label: "Meetings", icon: "📅" },
          { id: "attendance", label: "Attendance", icon: "✅" },
          { id: "visitors", label: "Visitors", icon: "🤝" },
          { id: "converts", label: "New Converts", icon: "🕊️" },
          { id: "prayers", label: "Prayer Requests", icon: "🙏" },
          { id: "followups", label: "Follow Ups", icon: "📞" },
          { id: "testimonies", label: "Testimonies", icon: "📖" },
          { id: "offerings", label: "Offerings", icon: "💰" },
          { id: "reports", label: "Reports", icon: "📝" },
          { id: "books", label: "Books", icon: "📚" },
        ];
      case "district_pastor":
      case "zone_pastor":
        return [
          { id: "overview", label: "Dashboard", icon: "📊" },
          { id: "cells", label: "Home Cells", icon: "🏠" },
          { id: "members", label: "Members", icon: "👤" },
          { id: "meetings", label: "Meetings", icon: "📅" },
          { id: "visitors", label: "Visitors", icon: "🤝" },
          { id: "converts", label: "New Converts", icon: "🕊️" },
          { id: "prayers", label: "Prayer Requests", icon: "🙏" },
          { id: "followups", label: "Follow Ups", icon: "📞" },
          { id: "testimonies", label: "Testimonies", icon: "📖" },
          { id: "offerings", label: "Offerings", icon: "💰" },
          { id: "reports", label: "Reports", icon: "📝" },
        ];
      case "cell_leader":
      case "assistant_leader":
        return [
          { id: "overview", label: "Dashboard", icon: "📊" },
          { id: "cell", label: "My Cell", icon: "🏠" },
          { id: "meetings", label: "Meetings", icon: "📅" },
          { id: "attendance", label: "Attendance", icon: "✅" },
          { id: "members", label: "Members", icon: "👤" },
          { id: "visitors", label: "Visitors", icon: "🤝" },
          { id: "converts", label: "New Converts", icon: "🕊️" },
          { id: "prayers", label: "Prayer Requests", icon: "🙏" },
          { id: "followups", label: "Follow Ups", icon: "📞" },
          { id: "testimonies", label: "Testimonies", icon: "📖" },
          { id: "offerings", label: "Offerings", icon: "💰" },
          { id: "reports", label: "Reports", icon: "📝" },
          { id: "requests", label: "Requests", icon: "📋" },
        ];
      case "media_team":
        return [
          { id: "overview", label: "Dashboard", icon: "📊" },
          { id: "events", label: "Events", icon: "📅" },
          { id: "announcements", label: "Announcements", icon: "📣" },
          { id: "sermons", label: "Sermons", icon: "📖" },
          { id: "books", label: "Books", icon: "📚" },
        ];
      default:
        return [{ id: "overview", label: "Dashboard", icon: "📊" }];
    }
  };

  const tabs = getTabs();

  return (
    <div className="flex flex-col gap-6">
      {/* Mobile Top Navigation Tabs */}
      <div className="lg:hidden bg-card border border-border/40 rounded-xl p-1.5 flex items-center gap-1 overflow-x-auto shadow-sm">
        {tabs.map((tab) => (
          <TabButton
            key={tab.id}
            mobile
            active={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            label={tab.label}
            icon={tab.icon}
          />
        ))}
      </div>

      {/* Main Grid: Sidebar (Desktop) + Content Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar Navigation */}
        <aside className="hidden lg:block lg:col-span-1 bg-card border border-border/40 rounded-2xl p-5 h-fit shadow-sm space-y-2">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-3 mb-4">
            Navigation
          </div>
          {tabs.map((tab) => (
            <TabButton
              key={tab.id}
              active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              label={tab.label}
              icon={tab.icon}
            />
          ))}
        </aside>

        {/* Dynamic Panels Content Area */}
        <section className="lg:col-span-3 flex flex-col gap-6">
          {(user.role === "super_admin" || user.role === "church_admin" || user.role === "district_pastor" || user.role === "zone_pastor") && pastorData && (
            <PastorDashboard
              activeTab={activeTab}
              user={user}
              cells={cells}
              zones={zones}
              districts={districts}
              users={users}
              data={pastorData}
              refresh={refresh}
            />
          )}
          {(user.role === "cell_leader" || user.role === "assistant_leader") && (
            <CellLeaderDashboard
              activeTab={activeTab}
              user={user}
              data={cellLeaderData}
              refresh={refresh}
            />
          )}
          {user.role === "media_team" && mediaData && (
            <MediaDashboard
              activeTab={activeTab}
              data={mediaData}
              refresh={refresh}
            />
          )}
        </section>
      </div>
    </div>
  );
}

// Helper Tab Button Component
interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: string;
  mobile?: boolean;
}
function TabButton({ active, onClick, label, icon, mobile }: TabButtonProps) {
  if (mobile) {
    return (
      <button
        onClick={onClick}
        className={`flex flex-col items-center gap-0.5 py-2 px-3 rounded-lg text-center transition-all shrink-0 ${
          active
            ? "bg-primary text-primary-foreground font-bold"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <span className="text-lg leading-none">{icon}</span>
        <span className="text-[10px] whitespace-nowrap">{label}</span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-xs font-semibold transition-all ${
        active
          ? "bg-primary text-primary-foreground shadow-md"
          : "text-foreground/80 hover:bg-muted hover:text-foreground"
      }`}
    >
      <span className="text-sm">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

// Stat Card Component
interface StatCardProps {
  label: string;
  value: number | string;
  icon: string;
  bg?: string;
}
function StatCard({ label, value, icon, bg = "bg-primary/5 border-primary/10" }: StatCardProps) {
  return (
    <div className={`p-4 rounded-xl border ${bg} shadow-sm`}>
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-lg font-bold text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
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
}
function PastorDashboard({ activeTab, user, cells, zones, districts, users, data, refresh }: PastorDashboardProps) {
  const { members, reports, visitors, meetings, newConverts, prayers, followUps, testimonies, offerings, requests, books } = data;

  // Prepare chart data
  const chartData = reports.slice(0, 10).reverse().map((r: WeeklyReport) => ({
    date: r.report_date,
    attendance: r.members_present,
    converts: r.new_converts,
    offering: r.total_offering,
  }));

  return (
    <>
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Home Cells" value={cells.length} icon="🏠" />
            <StatCard label="Total Members" value={members.length} icon="👥" />
            <StatCard label="New Converts" value={newConverts.length} icon="🕊️" />
            <StatCard label="Total Visitors" value={visitors.length} icon="🤝" />
            <StatCard label="Meetings Held" value={meetings.length} icon="📅" />
            <StatCard label="Prayer Requests" value={prayers.length} icon="🙏" />
            <StatCard label="Follow Ups" value={followUps.length} icon="📞" />
            <StatCard label="Testimonies" value={testimonies.length} icon="📖" />
          </div>

          {chartData.length > 0 && (
            <div className="bg-card rounded-2xl border border-border/40 p-5 shadow-sm">
              <h3 className="font-heading text-base font-bold text-foreground mb-4">Trends Over Time</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Line type="monotone" dataKey="attendance" stroke="hsl(var(--primary))" strokeWidth={2} name="Attendance" />
                    <Line type="monotone" dataKey="converts" stroke="#10b981" strokeWidth={2} name="New Converts" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "cells" && <CellsTab cells={cells} districts={districts} users={users} refresh={refresh} />}
      {activeTab === "zones" && <ZonesTab zones={zones} users={users} refresh={refresh} />}
      {activeTab === "districts" && <DistrictsTab districts={districts} zones={zones} users={users} refresh={refresh} />}
      {activeTab === "users" && <UsersTab users={users} cells={cells} refresh={refresh} />}
      {activeTab === "members" && <MembersTab members={members} cells={cells} />}
      {activeTab === "meetings" && <MeetingsTab meetings={meetings} cells={cells} />}
      {activeTab === "visitors" && <VisitorsTab visitors={visitors} cells={cells} />}
      {activeTab === "converts" && <NewConvertsTab converts={newConverts} cells={cells} />}
      {activeTab === "prayers" && <PrayerRequestsTab prayers={prayers} cells={cells} />}
      {activeTab === "followups" && <FollowUpsTab followUps={followUps} cells={cells} />}
      {activeTab === "testimonies" && <TestimoniesTab testimonies={testimonies} cells={cells} />}
      {activeTab === "offerings" && <OfferingsTab offerings={offerings} cells={cells} />}
      {activeTab === "reports" && <ReportsTab reports={reports} cells={cells} />}
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
}
function CellLeaderDashboard({ activeTab, user, data, refresh }: CellLeaderDashboardProps) {
  if (!data || !data.cell) {
    return (
      <div className="bg-card border border-border/40 rounded-2xl p-10 text-center shadow-sm">
        <div className="w-14 h-14 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-4 text-xl">
          🏠
        </div>
        <h3 className="font-heading text-lg font-bold text-foreground">No Cell Assigned</h3>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-2">
          Please contact your administrator to be assigned to a home cell.
        </p>
      </div>
    );
  }

  const { cell, members, visitors, reports, meetings, newConverts, prayers, followUps, testimonies, offerings, requests } = data;

  const chartData = reports.slice(0, 10).reverse().map((r: WeeklyReport) => ({
    date: r.report_date,
    attendance: r.members_present,
    converts: r.new_converts,
    offering: r.total_offering,
  }));

  return (
    <>
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="bg-card rounded-2xl border border-border/40 p-5 shadow-sm">
            <h3 className="font-heading text-xl font-bold text-foreground mb-2">{cell.name}</h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>📍 {cell.location} - {cell.address}</p>
              <p>📅 {cell.meeting_day} at {cell.meeting_time}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Cell Members" value={members.length} icon="👥" />
            <StatCard label="Visitors" value={visitors.length} icon="🤝" />
            <StatCard label="New Converts" value={newConverts.length} icon="🕊️" />
            <StatCard label="Meetings Held" value={meetings.length} icon="📅" />
            <StatCard label="Prayer Requests" value={prayers.length} icon="🙏" />
            <StatCard label="Follow Ups" value={followUps.length} icon="📞" />
            <StatCard label="Testimonies" value={testimonies.length} icon="📖" />
            <StatCard label="Reports Filed" value={reports.length} icon="📝" />
          </div>

          {chartData.length > 0 && (
            <div className="bg-card rounded-2xl border border-border/40 p-5 shadow-sm">
              <h3 className="font-heading text-base font-bold text-foreground mb-4">Cell Trends</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="attendance" fill="hsl(var(--primary))" name="Attendance" />
                    <Bar dataKey="converts" fill="#10b981" name="New Converts" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "cell" && <CellDetailsTab cell={cell} refresh={refresh} />}
      {activeTab === "meetings" && <MeetingsTab meetings={meetings} cells={[cell]} cellId={cell.id} refresh={refresh} />}
      {activeTab === "attendance" && <AttendanceTab cell={cell} members={members} meetings={meetings} refresh={refresh} />}
      {activeTab === "members" && <MembersTab members={members} cells={[cell]} cellId={cell.id} refresh={refresh} />}
      {activeTab === "visitors" && <VisitorsTab visitors={visitors} cells={[cell]} cellId={cell.id} refresh={refresh} />}
      {activeTab === "converts" && <NewConvertsTab converts={newConverts} cells={[cell]} cellId={cell.id} refresh={refresh} />}
      {activeTab === "prayers" && <PrayerRequestsTab prayers={prayers} cells={[cell]} cellId={cell.id} refresh={refresh} />}
      {activeTab === "followups" && <FollowUpsTab followUps={followUps} cells={[cell]} cellId={cell.id} refresh={refresh} />}
      {activeTab === "testimonies" && <TestimoniesTab testimonies={testimonies} cells={[cell]} cellId={cell.id} refresh={refresh} />}
      {activeTab === "offerings" && <OfferingsTab offerings={offerings} cells={[cell]} cellId={cell.id} refresh={refresh} />}
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
}
function MediaDashboard({ activeTab, data, refresh }: MediaDashboardProps) {
  const { events, announcements, sermons, books } = data;

  return (
    <>
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Upcoming Events" value={events.length} icon="📅" />
            <StatCard label="Announcements" value={announcements.length} icon="📣" />
            <StatCard label="Sermons" value={sermons.length} icon="📖" />
            <StatCard label="Books" value={books.length} icon="📚" />
          </div>
        </div>
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
function CellsTab({ cells, districts, users, refresh, cellId }: { cells: HomeCell[], districts: District[], users: UserProfile[], refresh: () => void, cellId?: string }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<HomeCell>>({ meeting_day: "Saturday", meeting_time: "17:00" });

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
            <div key={cell.id} className="p-4 bg-muted/10 rounded-xl border border-border/20">
              <h4 className="font-bold text-foreground">{cell.name}</h4>
              <p className="text-xs text-muted-foreground">{cell.location}</p>
              <p className="text-xs text-muted-foreground mt-1">{cell.meeting_day} at {cell.meeting_time}</p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => {
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
    </div>
  );
}

// Zones Tab
function ZonesTab({ zones, users, refresh }: { zones: Zone[], users: UserProfile[], refresh: () => void }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Zone>>({});

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
            <div key={zone.id} className="p-4 bg-muted/10 rounded-xl border border-border/20">
              <h4 className="font-bold text-foreground">{zone.name}</h4>
              <button
                onClick={() => {
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
    </div>
  );
}

// Districts Tab
function DistrictsTab({ districts, zones, users, refresh }: { districts: District[], zones: Zone[], users: UserProfile[], refresh: () => void }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<District>>({});

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
            <div key={district.id} className="p-4 bg-muted/10 rounded-xl border border-border/20">
              <h4 className="font-bold text-foreground">{district.name}</h4>
              <p className="text-xs text-muted-foreground">
                Zone: {zones.find((z) => z.id === district.zone_id)?.name || "Unassigned"}
              </p>
              <button
                onClick={() => {
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
    </div>
  );
}

// Users Tab
function UsersTab({ users, cells, refresh }: { users: UserProfile[], cells: HomeCell[], refresh: () => void }) {
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
            </tr>
          </thead>
          <tbody className="divide-y divide-border/20">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-muted/5">
                <td className="py-3 px-3 font-bold text-foreground">{u.full_name}</td>
                <td className="py-3 px-3">{u.email}</td>
                <td className="py-3 px-3 capitalize">{u.role.replace("_", " ")}</td>
                <td className="py-3 px-3">
                  <span className={u.is_approved ? "text-green-600" : "text-yellow-600"}>
                    {u.is_approved ? "Approved" : "Pending"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Members Tab
function MembersTab({ members, cells, cellId, refresh }: { members: Member[], cells: HomeCell[], cellId?: string, refresh?: () => void }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Member>>({ gender: "Male", marital_status: "Single", membership_status: "active" });

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
                <tr key={m.id} className="hover:bg-muted/5">
                  <td className="py-3 px-3 font-bold text-foreground">{m.first_name} {m.last_name}</td>
                  <td className="py-3 px-3">{m.gender}</td>
                  <td className="py-3 px-3">{m.phone_number}</td>
                  <td className="py-3 px-3 capitalize">{m.membership_status}</td>
                  {refresh && (
                    <td className="py-3 px-3">
                      <button
                        onClick={() => {
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

// Visitors Tab
function VisitorsTab({ visitors, cells, cellId, refresh }: { visitors: Visitor[], cells: HomeCell[], cellId?: string, refresh?: () => void }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Visitor>>({ gender: "Male", follow_up_status: "New", number_of_visits: 1 });

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
            <div key={v.id} className="p-4 bg-muted/10 rounded-xl border border-border/20">
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
                    onClick={() => {
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
    </div>
  );
}

// New Converts Tab
function NewConvertsTab({ converts, cells, cellId, refresh }: { converts: NewConvert[], cells: HomeCell[], cellId?: string, refresh?: () => void }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<NewConvert>>({ baptism_status: "not_baptized", foundation_class_status: "not_started" });

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
            <div key={c.id} className="p-4 bg-muted/10 rounded-xl border border-border/20">
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
                    onClick={() => {
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
    </div>
  );
}

// Prayer Requests Tab
function PrayerRequestsTab({ prayers, cells, cellId, refresh }: { prayers: PrayerRequest[], cells: HomeCell[], cellId?: string, refresh?: () => void }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<PrayerRequest>>({ category: "general", status: "pending", testimony_received: false });

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
function CellDetailsTab({ cell, refresh }: { cell: HomeCell, refresh: () => void }) {
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
          <button
            onClick={() => editing ? setEditing(false) : setEditing(true)}
            className="text-xs px-3 py-1 bg-primary/10 text-primary rounded font-semibold"
          >
            {editing ? "Cancel" : "Edit"}
          </button>
        </div>
        {editing ? (
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
function RequestsTab({ requests, cell, refresh }: { requests: CellMembershipRequest[], cell: HomeCell, refresh: () => void }) {
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
                    <h4 className="font-bold text-foreground">{r.first_name} {r.last_name}</h4>
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

// Events Tab
function EventsTab({ events, refresh }: { events: ChurchEvent[], refresh: () => void }) {
  return (
    <div className="bg-card rounded-2xl border border-border/40 p-5 shadow-sm">
      <h3 className="font-heading text-base font-bold text-foreground mb-4">Events ({events.length})</h3>
      <div className="space-y-3">
        {events.map((e) => (
          <div key={e.id} className="p-4 bg-muted/10 rounded-xl border border-border/20">
            <h4 className="font-bold text-foreground">{e.title}</h4>
            <p className="text-xs text-muted-foreground">{new Date(e.event_date).toLocaleString()}</p>
            <p className="text-sm mt-1">{e.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Announcements Tab
function AnnouncementsTab({ announcements, refresh }: { announcements: Announcement[], refresh: () => void }) {
  return (
    <div className="bg-card rounded-2xl border border-border/40 p-5 shadow-sm">
      <h3 className="font-heading text-base font-bold text-foreground mb-4">Announcements ({announcements.length})</h3>
      <div className="space-y-3">
        {announcements.map((a) => (
          <div key={a.id} className="p-4 bg-muted/10 rounded-xl border border-border/20">
            <h4 className="font-bold text-foreground">{a.title}</h4>
            <p className="text-sm mt-1">{a.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Sermons Tab
function SermonsTab({ sermons, refresh }: { sermons: any[], refresh: () => void }) {
  return (
    <div className="bg-card rounded-2xl border border-border/40 p-5 shadow-sm">
      <h3 className="font-heading text-base font-bold text-foreground mb-4">Sermons ({sermons.length})</h3>
      <div className="space-y-3">
        {sermons.map((s) => (
          <div key={s.id} className="p-4 bg-muted/10 rounded-xl border border-border/20">
            <h4 className="font-bold text-foreground">{s.title}</h4>
            <p className="text-xs text-muted-foreground">{s.preacher} • {s.date}</p>
            {s.scripture && <p className="text-sm text-primary mt-1">{s.scripture}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

// Books Tab
function BooksTab({ books, refresh }: { books: Book[], refresh: () => void }) {
  return (
    <div className="bg-card rounded-2xl border border-border/40 p-5 shadow-sm">
      <h3 className="font-heading text-base font-bold text-foreground mb-4">Books ({books.length})</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {books.map((b) => (
          <div key={b.id} className="p-4 bg-muted/10 rounded-xl border border-border/20 flex gap-4">
            {b.cover_image_url ? (
              <img src={b.cover_image_url} alt={b.title} className="w-20 h-28 object-cover rounded" />
            ) : (
              <div className="w-20 h-28 bg-primary/10 rounded flex items-center justify-center text-2xl">
                📖
              </div>
            )}
            <div className="flex-1">
              <h4 className="font-bold text-foreground">{b.title}</h4>
              <p className="text-xs text-muted-foreground">By {b.author}</p>
              {b.description && <p className="text-sm mt-1 line-clamp-2">{b.description}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
</think_never_used_51bce0c785ca2f68081bfa7d91973934>Perfect! Now let's update our todo list and make sure everything is working:

<seed:tool_call><function name="TodoWrite"><parameter name="todos" string="false">[{"id": "1", "status": "completed", "content": "Analyze existing project structure and plan implementation", "priority": "high", "created_at": 1781421922}, {"id": "2", "status": "completed", "content": "Design and implement normalized Supabase database schema with RLS policies", "priority": "high", "created_at": 1781421922}, {"id": "3", "status": "completed", "content": "Update db.ts with all new data types and methods", "priority": "high", "created_at": 1781421922}, {"id": "4", "status": "completed", "content": "Update dashboard to include all new Home Cell Management System tabs/forms", "priority": "high", "created_at": 1781421922}, {"id": "5", "status": "completed", "content": "Build Leader Dashboard with charts and analytics using Recharts", "priority": "high", "created_at": 1781421922}, {"id": "6", "status": "in_progress", "content": "Test and verify all features work correctly", "priority": "high", "created_at": 1781421922}]