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
  CellMembershipRequest
} from "@/lib/db";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardHome,
});

function DashboardHome() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  // State data for Pastor Dashboard
  const [cells, setCells] = useState<HomeCell[]>([]);
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [allReports, setAllReports] = useState<WeeklyReport[]>([]);
  const [allVisitors, setAllVisitors] = useState<Visitor[]>([]);
  const [allLeaders, setAllLeaders] = useState<UserProfile[]>([]);
  const [allRequests, setAllRequests] = useState<CellMembershipRequest[]>([]);

  // State data for Media Dashboard
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [sermons, setSermons] = useState<Sermon[]>([]);

  // State data for Cell Leader Dashboard
  const [myCell, setMyCell] = useState<HomeCell | null>(null);
  const [myMembers, setMyMembers] = useState<Member[]>([]);
  const [myVisitors, setMyVisitors] = useState<Visitor[]>([]);
  const [myReports, setMyReports] = useState<WeeklyReport[]>([]);
  const [myRequests, setMyRequests] = useState<CellMembershipRequest[]>([]);

  // Refresh lists helper
  const [triggerRefresh, setTriggerRefresh] = useState(0);
  const refresh = () => setTriggerRefresh((prev) => prev + 1);

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
        if (user.role === "pastor_admin") {
          const [c, m, r, v, u, req] = await Promise.all([
            db.getHomeCells(),
            db.getMembers(),
            db.getWeeklyReports(),
            db.getVisitors(),
            db.getUsers(),
            db.getCellMembershipRequests(),
          ]);
          setCells(c);
          setAllMembers(m);
          setAllReports(r);
          setAllVisitors(v);
          setAllLeaders(u.filter((x) => x.role === "cell_leader"));
          setAllRequests(req);
        } else if (user.role === "media_team") {
          const [e, a, s] = await Promise.all([
            db.getEvents(),
            db.getAnnouncements(),
            db.getSermons(),
          ]);
          setEvents(e);
          setAnnouncements(a);
          setSermons(s);
        } else if (user.role === "cell_leader") {
          const allCells = await db.getHomeCells();
          
          // Get cell assigned to this leader
          let cell = allCells.find((c) => c.leader_id === user.id);
          
          // Fallback: If leader doesn't have an assigned cell, try to assign them to the first cell or let them select one
          if (!cell && user.home_cell_id) {
            cell = allCells.find((c) => c.id === user.home_cell_id);
          }
          
          if (cell) {
            setMyCell(cell);
            const [m, v, r, req] = await Promise.all([
              db.getMembersByCell(cell.id),
              db.getVisitorsByCell(cell.id),
              db.getWeeklyReportsByCell(cell.id),
              db.getCellMembershipRequestsByCell(cell.id),
            ]);
            setMyMembers(m);
            setMyVisitors(v);
            setMyReports(r);
            setMyRequests(req);
          } else {
            setMyCell(null);
            setMyMembers([]);
            setMyVisitors([]);
            setMyReports([]);
            setMyRequests([]);
          }
        }
      } catch (err) {
        console.error("Error loading dashboard data", err);
      }
    };

    loadData();
  }, [user, triggerRefresh]);

  if (!user) return null;

  return (
    <div className="flex flex-col gap-6">
      {/* Mobile Top Navigation Tabs */}
      <div className="lg:hidden bg-card border border-border/40 rounded-xl p-1.5 flex items-center justify-between gap-1 overflow-x-auto shadow-sm">
        {user.role === "pastor_admin" && (
          <>
            <TabButton mobile active={activeTab === "overview"} onClick={() => setActiveTab("overview")} label="Stats" icon="📊" />
            <TabButton mobile active={activeTab === "cells"} onClick={() => setActiveTab("cells")} label="WSF Cells" icon="🏠" />
            <TabButton mobile active={activeTab === "leaders"} onClick={() => setActiveTab("leaders")} label="Leaders" icon="🎖️" />
            <TabButton mobile active={activeTab === "members"} onClick={() => setActiveTab("members")} label="Members" icon="👥" />
            <TabButton mobile active={activeTab === "requests"} onClick={() => setActiveTab("requests")} label="Requests" icon="📋" />
            <TabButton mobile active={activeTab === "reports"} onClick={() => setActiveTab("reports")} label="Reports" icon="📝" />
          </>
        )}
        {user.role === "media_team" && (
          <>
            <TabButton mobile active={activeTab === "overview"} onClick={() => setActiveTab("overview")} label="Add Events" icon="📅" />
            <TabButton mobile active={activeTab === "announcements"} onClick={() => setActiveTab("announcements")} label="News" icon="📣" />
            <TabButton mobile active={activeTab === "sermons"} onClick={() => setActiveTab("sermons")} label="Sermons" icon="📖" />
          </>
        )}
        {user.role === "cell_leader" && (
          <>
            <TabButton mobile active={activeTab === "overview"} onClick={() => setActiveTab("overview")} label="WSF Cell" icon="🏠" />
            <TabButton mobile active={activeTab === "requests"} onClick={() => setActiveTab("requests")} label="Requests" icon="📋" />
            <TabButton mobile active={activeTab === "members"} onClick={() => setActiveTab("members")} label="Register" icon="👥" />
            <TabButton mobile active={activeTab === "attendance"} onClick={() => setActiveTab("attendance")} label="Log Roll" icon="✅" />
            <TabButton mobile active={activeTab === "visitors"} onClick={() => setActiveTab("visitors")} label="Visitors" icon="🤝" />
            <TabButton mobile active={activeTab === "reports"} onClick={() => setActiveTab("reports")} label="Report" icon="📝" />
          </>
        )}
      </div>

      {/* Main Grid: Sidebar (Desktop) + Content Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Desktop Sidebar Navigation */}
        <aside className="hidden lg:block lg:col-span-1 bg-card border border-border/40 rounded-2xl p-5 h-fit shadow-sm space-y-2">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-3 mb-4">
            Navigation Menu
          </div>
          {user.role === "pastor_admin" && (
            <div className="flex flex-col gap-1.5">
              <TabButton active={activeTab === "overview"} onClick={() => setActiveTab("overview")} label="Dashboard Overview" icon="📊" />
              <TabButton active={activeTab === "cells"} onClick={() => setActiveTab("cells")} label="WSF Satellite Cells" icon="🏠" />
              <TabButton active={activeTab === "leaders"} onClick={() => setActiveTab("leaders")} label="Cell Leaders" icon="🎖️" />
              <TabButton active={activeTab === "members"} onClick={() => setActiveTab("members")} label="Members Directory" icon="👥" />
              <TabButton active={activeTab === "requests"} onClick={() => setActiveTab("requests")} label="Membership Requests" icon="📋" />
              <TabButton active={activeTab === "reports"} onClick={() => setActiveTab("reports")} label="Cell Weekly Reports" icon="📝" />
            </div>
          )}
          {user.role === "media_team" && (
            <div className="flex flex-col gap-1.5">
              <TabButton active={activeTab === "overview"} onClick={() => setActiveTab("overview")} label="Events Manager" icon="📅" />
              <TabButton active={activeTab === "announcements"} onClick={() => setActiveTab("announcements")} label="Homepage News" icon="📣" />
              <TabButton active={activeTab === "sermons"} onClick={() => setActiveTab("sermons")} label="Sermons Archive" icon="📖" />
            </div>
          )}
          {user.role === "cell_leader" && (
            <div className="flex flex-col gap-1.5">
              <TabButton active={activeTab === "overview"} onClick={() => setActiveTab("overview")} label="My WSF Center" icon="🏠" />
              <TabButton active={activeTab === "requests"} onClick={() => setActiveTab("requests")} label="Membership Requests" icon="📋" />
              <TabButton active={activeTab === "members"} onClick={() => setActiveTab("members")} label="Cell Members Roll" icon="👥" />
              <TabButton active={activeTab === "attendance"} onClick={() => setActiveTab("attendance")} label="Log Attendance" icon="✅" />
              <TabButton active={activeTab === "visitors"} onClick={() => setActiveTab("visitors")} label="Visitor Registry" icon="🤝" />
              <TabButton active={activeTab === "reports"} onClick={() => setActiveTab("reports")} label="Weekly Reports" icon="📝" />
            </div>
          )}
        </aside>

        {/* Dynamic Panels Content Area */}
        <section className="lg:col-span-3 flex flex-col gap-6">
          {user.role === "pastor_admin" && (
            <PastorDashboard
              activeTab={activeTab}
              cells={cells}
              leaders={allLeaders}
              members={allMembers}
              reports={allReports}
              visitors={allVisitors}
              requests={allRequests}
              refresh={refresh}
            />
          )}
          {user.role === "media_team" && (
            <MediaDashboard
              activeTab={activeTab}
              events={events}
              announcements={announcements}
              sermons={sermons}
              refresh={refresh}
            />
          )}
          {user.role === "cell_leader" && (
            <CellLeaderDashboard
              activeTab={activeTab}
              user={user}
              cell={myCell}
              cells={cells}
              members={myMembers}
              visitors={myVisitors}
              reports={myReports}
              requests={myRequests}
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
        className={`flex-1 flex flex-col items-center gap-0.5 py-2 px-1.5 rounded-lg text-center transition-all ${
          active
            ? "bg-primary text-primary-foreground font-bold scale-102"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <span className="text-base leading-none">{icon}</span>
        <span className="text-[9px] whitespace-nowrap">{label}</span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-left text-xs font-semibold transition-all ${
        active
          ? "bg-primary text-primary-foreground shadow-md translate-x-1"
          : "text-foreground/80 hover:bg-muted hover:text-foreground"
      }`}
    >
      <span className="text-sm">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

// =========================================================================
// PASTOR / ADMIN DASHBOARD PANEL
// =========================================================================
interface PastorDashboardProps {
  activeTab: string;
  cells: HomeCell[];
  leaders: UserProfile[];
  members: Member[];
  reports: WeeklyReport[];
  visitors: Visitor[];
  requests: CellMembershipRequest[];
  refresh: () => void;
}
function PastorDashboard({ activeTab, cells, leaders, members, reports, visitors, requests, refresh }: PastorDashboardProps) {
  // Editing and delete states for Cells & Leaders
  const [editingCellId, setEditingCellId] = useState<string | null>(null);
  const [editingLeaderId, setEditingLeaderId] = useState<string | null>(null);

  // Cell creator form state
  const [cellName, setCellName] = useState("");
  const [location, setLocation] = useState("");
  const [address, setAddress] = useState("");
  const [meetingDay, setMeetingDay] = useState("Saturday");
  const [meetingTime, setMeetingTime] = useState("5:00 PM");
  
  // Leader creator form state
  const [leaderName, setLeaderName] = useState("");
  const [leaderEmail, setLeaderEmail] = useState("");
  const [leaderPassword, setLeaderPassword] = useState("");
  const [assignedCellId, setAssignedCellId] = useState("");
  
  // Members search state
  const [searchQuery, setSearchQuery] = useState("");

  const handleCreateLeader = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaderName || !leaderEmail) {
      toast.error("Please add leader's full name and email.");
      return;
    }
    try {
      if (editingLeaderId) {
        // Edit flow
        await db.updateCellLeader(editingLeaderId, {
          full_name: leaderName,
          email: leaderEmail,
          home_cell_id: assignedCellId || null,
        });

        // Clear leader_id from cells where this leader was assigned, except for the new assigned cell
        const formerCells = cells.filter((c) => c.leader_id === editingLeaderId);
        for (const former of formerCells) {
          if (former.id !== assignedCellId) {
            await db.updateHomeCell(former.id, { leader_id: undefined });
          }
        }

        // Set leader_id on the newly assigned cell
        if (assignedCellId) {
          await db.updateHomeCell(assignedCellId, { leader_id: editingLeaderId });
        }

        toast.success(`Cell Leader "${leaderName}" updated successfully!`);
        setEditingLeaderId(null);
      } else {
        // Create flow
        const newLeader = await db.addCellLeader({
          full_name: leaderName,
          email: leaderEmail,
          role: "cell_leader",
          home_cell_id: assignedCellId || null,
        });

        // Link leader directly to home cell in local db
        if (assignedCellId) {
          await db.updateHomeCell(assignedCellId, { leader_id: newLeader.id });
        }

        toast.success(`Home Cell Leader "${leaderName}" added and assigned successfully!`);
      }

      setLeaderName("");
      setLeaderEmail("");
      setLeaderPassword("");
      setAssignedCellId("");
      refresh();
    } catch (err) {
      toast.error(editingLeaderId ? "Failed to update home cell leader." : "Failed to register home cell leader.");
    }
  };

  const handleDeleteLeader = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete cell leader "${name}"?`)) return;
    try {
      await db.deleteCellLeader(id);
      
      // Also unassign this leader from any cell they led
      const ledCells = cells.filter((c) => c.leader_id === id);
      for (const cell of ledCells) {
        await db.updateHomeCell(cell.id, { leader_id: undefined });
      }

      toast.success(`Cell Leader "${name}" deleted successfully.`);
      if (editingLeaderId === id) {
        setEditingLeaderId(null);
        setLeaderName("");
        setLeaderEmail("");
        setAssignedCellId("");
      }
      refresh();
    } catch (err) {
      toast.error("Failed to delete cell leader.");
    }
  };

  const handleCreateCell = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cellName || !location || !address) {
      toast.error("Please fill in cell name, location, and address details.");
      return;
    }
    try {
      if (editingCellId) {
        // Edit flow
        const existing = cells.find((c) => c.id === editingCellId);
        await db.updateHomeCell(editingCellId, {
          name: cellName,
          location,
          address,
          meeting_day: meetingDay,
          meeting_time: meetingTime,
          leader_id: existing?.leader_id,
        });
        toast.success("WSF Satellite Cell updated successfully!");
        setEditingCellId(null);
      } else {
        // Create flow
        await db.addHomeCell({
          name: cellName,
          location,
          address,
          meeting_day: meetingDay,
          meeting_time: meetingTime,
        });
        toast.success("WSF Satellite Cell center created successfully!");
      }

      setCellName("");
      setLocation("");
      setAddress("");
      setMeetingDay("Saturday");
      setMeetingTime("5:00 PM");
      refresh();
    } catch (err) {
      toast.error(editingCellId ? "Error updating cell center." : "Error creating cell center.");
    }
  };

  const handleDeleteCell = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete WSF Cell Center "${name}"?`)) return;
    try {
      await db.deleteHomeCell(id);
      toast.success(`WSF Cell Center "${name}" deleted successfully.`);
      if (editingCellId === id) {
        setEditingCellId(null);
        setCellName("");
        setLocation("");
        setAddress("");
      }
      refresh();
    } catch (err) {
      toast.error("Failed to delete cell center.");
    }
  };

  // Stats Card Calculations
  const totalCellsCount = cells.length;
  const totalMembersCount = members.length;
  const totalReportsCount = reports.length;
  const totalVisitorsCount = visitors.length;
  const totalSoulsWon = reports.reduce((acc, r) => acc + r.souls_won, 0);

  const filteredMembers = members.filter(
    (m) =>
      `${m.first_name} ${m.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.phone_number.includes(searchQuery) ||
      m.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Card Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="WSF Centers" value={totalCellsCount} icon="🏠" bg="bg-primary/5 border-primary/10" />
            <StatCard label="Total Members" value={totalMembersCount} icon="👥" bg="bg-gold/10 border-gold/20" />
            <StatCard label="Souls Won (WSF)" value={totalSoulsWon} icon="🕊️" bg="bg-green-500/5 border-green-500/10" />
            <StatCard label="Visitors Log" value={totalVisitorsCount} icon="🤝" bg="bg-blue-500/5 border-blue-500/10" />
          </div>

          {/* Core overview & empty notices */}
          {totalCellsCount === 0 && totalMembersCount === 0 ? (
            <div className="bg-card border border-border/40 rounded-2xl p-10 text-center shadow-sm">
              <div className="w-14 h-14 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-4 text-xl">
                🏠
              </div>
              <h3 className="font-heading text-lg font-bold text-foreground">Welcome, Pastor!</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-2 leading-relaxed">
                The database is currently empty and waiting for inputs. Click on the <strong>"WSF Satellite Cells"</strong> tab to set up your first Home Cell center so leaders can begin registering members!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Recent Weekly Reports List */}
              <div className="bg-card rounded-2xl border border-border/40 p-5 shadow-sm">
                <h3 className="font-heading text-base font-bold text-foreground mb-4">Recent Reports Submitted</h3>
                {reports.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-6 text-center">No weekly reports submitted yet.</p>
                ) : (
                  <div className="space-y-3 max-h-[250px] overflow-auto">
                    {reports.slice(0, 5).map((r) => {
                      const c = cells.find((cell) => cell.id === r.home_cell_id);
                      return (
                        <div key={r.id} className="p-3 bg-muted/10 border border-border/20 rounded-xl flex items-center justify-between text-xs">
                          <div>
                            <p className="font-semibold text-foreground">{c?.name || "WSF Center"}</p>
                            <p className="text-[10px] text-muted-foreground">Report Date: {r.report_date}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-primary">Att: {r.total_attendance}</p>
                            <p className="text-[9px] text-muted-foreground">Souls: {r.souls_won}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Quick Charts/Overview details */}
              <div className="bg-card rounded-2xl border border-border/40 p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="font-heading text-base font-bold text-foreground mb-2">Cell Activity Overview</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Once cell leaders log weekly attendances, dynamic aggregates will show here. Ensure all cell leaders submit reports by Sunday evening.
                  </p>
                </div>
                <div className="border-t border-border/20 pt-4 mt-6">
                  <div className="flex justify-between items-center text-xs mb-2">
                    <span className="text-muted-foreground">Active WSF cells with members:</span>
                    <span className="font-bold text-foreground">
                      {cells.filter((c) => members.some((m) => m.home_cell_id === c.id)).length} / {totalCellsCount}
                    </span>
                  </div>
                  <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-primary h-full transition-all duration-500"
                      style={{
                        width: `${
                          totalCellsCount > 0
                            ? (cells.filter((c) => members.some((m) => m.home_cell_id === c.id)).length / totalCellsCount) * 100
                            : 0
                        }%`
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "cells" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* Creator Form */}
          <div className="md:col-span-1 bg-card rounded-2xl border border-border/40 p-5 shadow-sm space-y-4">
            <h3 className="font-heading text-base font-bold text-foreground border-b border-border/30 pb-2">
              {editingCellId ? "Edit WSF Center" : "Setup WSF Center"}
            </h3>
            <form onSubmit={handleCreateCell} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Center Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kipawa WSF Center"
                  value={cellName}
                  onChange={(e) => setCellName(e.target.value)}
                  className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Center Location (Area)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kipawa, Dar es Salaam"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Center Address</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. House No. 25, Opp. Primary School"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Meeting Day</label>
                  <select
                    value={meetingDay}
                    onChange={(e) => setMeetingDay(e.target.value)}
                    className="w-full rounded-lg border border-border px-2.5 py-2 bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                  >
                    <option>Saturday</option>
                    <option>Sunday</option>
                    <option>Wednesday</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Meeting Time</label>
                  <input
                    type="text"
                    required
                    value={meetingTime}
                    onChange={(e) => setMeetingTime(e.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground focus:outline-none"
                  />
                </div>
              </div>
              <div className="space-y-2 pt-2">
                <button
                  type="submit"
                  className="w-full rounded-lg bg-primary py-2.5 font-semibold text-primary-foreground shadow transition-colors hover:bg-primary/95"
                >
                  {editingCellId ? "Update WSF Center" : "Register WSF Center"}
                </button>
                {editingCellId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCellId(null);
                      setCellName("");
                      setLocation("");
                      setAddress("");
                      setMeetingDay("Saturday");
                      setMeetingTime("5:00 PM");
                    }}
                    className="w-full rounded-lg bg-muted text-foreground py-2 font-semibold hover:bg-muted/80 transition-colors"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* List display */}
          <div className="md:col-span-2 space-y-4">
            <div className="bg-card rounded-2xl border border-border/40 p-5 shadow-sm">
              <h3 className="font-heading text-base font-bold text-foreground border-b border-border/30 pb-2 mb-4">
                Registered Satellite WSF Centers ({totalCellsCount})
              </h3>
              {cells.length === 0 ? (
                <div className="py-10 text-center bg-muted/15 rounded-xl border border-dashed border-border/50">
                  <p className="text-xs text-muted-foreground">No WSF Centers registered in Ukonga Banana parish.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[450px] overflow-auto pr-1">
                  {cells.map((c) => (
                    <div key={c.id} className="p-4 bg-muted/10 rounded-xl border border-border/20 space-y-2 text-xs flex flex-col justify-between relative group hover:border-primary/30 transition-all shadow-sm">
                      <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCellId(c.id);
                            setCellName(c.name);
                            setLocation(c.location);
                            setAddress(c.address);
                            setMeetingDay(c.meeting_day);
                            setMeetingTime(c.meeting_time);
                            toast.info(`Editing "${c.name}" - edit form is ready.`);
                          }}
                          className="p-1 hover:text-primary transition-colors text-[10px]"
                          title="Edit WSF Center"
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCell(c.id, c.name)}
                          className="p-1 hover:text-red-600 transition-colors text-[10px]"
                          title="Delete WSF Center"
                        >
                          🗑️
                        </button>
                      </div>
                      <div className="pr-10">
                        <h4 className="font-bold text-foreground text-sm flex items-center gap-1.5 truncate">
                          <span className="text-base">🏠</span> {c.name}
                        </h4>
                        <p className="text-muted-foreground mt-1">Area: {c.location}</p>
                        <p className="text-muted-foreground">Address: {c.address}</p>
                      </div>
                      <div className="pt-2 border-t border-border/20 flex items-center justify-between text-[10px] text-primary font-semibold">
                        <span>Day: {c.meeting_day}</span>
                        <span>Time: {c.meeting_time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "members" && (
        <div className="bg-card rounded-2xl border border-border/40 p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/30 pb-3">
            <h3 className="font-heading text-base font-bold text-foreground">Global Members Directory ({totalMembersCount})</h3>
            
            {/* Search Input */}
            <div className="relative max-w-xs w-full">
              <input
                type="text"
                placeholder="Search first/last name, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs rounded-full border border-border bg-card pl-8 pr-3 py-1.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
              />
              <svg className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
          </div>

          {members.length === 0 ? (
            <div className="py-12 text-center bg-muted/15 border border-dashed border-border/50 rounded-xl max-w-xl mx-auto">
              <p className="text-xs text-muted-foreground font-semibold">No Registered Church Members</p>
              <p className="text-[10px] text-muted-foreground mt-1 max-w-xs mx-auto">
                Members are registered by Home Cell leaders when they log in to their assigned WSF center dashboards.
              </p>
            </div>
          ) : filteredMembers.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-10">No directory records match your query.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border/40 text-muted-foreground font-semibold bg-muted/15">
                    <th className="py-2.5 px-3">Name</th>
                    <th className="py-2.5 px-3">Gender</th>
                    <th className="py-2.5 px-3">Phone Number</th>
                    <th className="py-2.5 px-3">Residential Address</th>
                    <th className="py-2.5 px-3">WSF Center</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {filteredMembers.map((m) => {
                    const c = cells.find((cell) => cell.id === m.home_cell_id);
                    return (
                      <tr key={m.id} className="hover:bg-muted/10 transition-colors">
                        <td className="py-3 px-3 font-bold text-foreground">{m.first_name} {m.last_name}</td>
                        <td className="py-3 px-3">{m.gender}</td>
                        <td className="py-3 px-3 font-medium text-primary">{m.phone_number}</td>
                        <td className="py-3 px-3 line-clamp-1 max-w-[200px]">{m.address}</td>
                        <td className="py-3 px-3 font-semibold text-primary">{c?.name || "Unassigned"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "leaders" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* Creator Form */}
          <div className="md:col-span-1 bg-card rounded-2xl border border-border/40 p-5 shadow-sm space-y-4">
            <h3 className="font-heading text-base font-bold text-foreground border-b border-border/30 pb-2">
              {editingLeaderId ? "Edit Cell Leader" : "Register Home Cell Leader"}
            </h3>
            <form onSubmit={handleCreateLeader} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Deacon Charles Mushi"
                  value={leaderName}
                  onChange={(e) => setLeaderName(e.target.value)}
                  className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. charles@winnersbanana.org"
                  value={leaderEmail}
                  onChange={(e) => setLeaderEmail(e.target.value)}
                  className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Password Account</label>
                <input
                  type="text"
                  placeholder="•••••••• (direct test role bypass)"
                  value={leaderPassword}
                  onChange={(e) => setLeaderPassword(e.target.value)}
                  className="w-full rounded-lg border border-border px-3 py-2 bg-card text-muted-foreground focus:outline-none bg-muted/20 cursor-not-allowed"
                  disabled
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Assign WSF Cell Center</label>
                <select
                  value={assignedCellId}
                  onChange={(e) => setAssignedCellId(e.target.value)}
                  className="w-full rounded-lg border border-border px-2.5 py-2 bg-card text-foreground focus:outline-none cursor-pointer"
                >
                  <option value="">-- No Cell Assignment --</option>
                  {cells.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.location})
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2 pt-2">
                <button
                  type="submit"
                  className="w-full rounded-lg bg-primary py-2.5 font-semibold text-primary-foreground shadow hover:bg-primary/95 transition-colors"
                >
                  {editingLeaderId ? "Update Cell Leader" : "Register & Link Leader"}
                </button>
                {editingLeaderId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingLeaderId(null);
                      setLeaderName("");
                      setLeaderEmail("");
                      setAssignedCellId("");
                    }}
                    className="w-full rounded-lg bg-muted text-foreground py-2 font-semibold hover:bg-muted/80 transition-colors"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* List display */}
          <div className="md:col-span-2 space-y-4">
            <div className="bg-card rounded-2xl border border-border/40 p-5 shadow-sm">
              <h3 className="font-heading text-base font-bold text-foreground border-b border-border/30 pb-2 mb-4">
                Registered Home Cell Leaders Directory ({leaders.length})
              </h3>
              {leaders.length === 0 ? (
                <div className="py-10 text-center bg-muted/15 rounded-xl border border-dashed border-border/50">
                  <p className="text-xs text-muted-foreground">No cell leaders registered yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[450px] overflow-auto pr-1">
                  {leaders.map((l) => {
                    const c = cells.find((cell) => cell.id === l.home_cell_id || cell.leader_id === l.id);
                    return (
                      <div key={l.id} className="p-4 bg-muted/10 rounded-xl border border-border/20 space-y-2 text-xs flex flex-col justify-between relative group hover:border-primary/30 transition-all shadow-sm">
                        <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingLeaderId(l.id);
                              setLeaderName(l.full_name);
                              setLeaderEmail(l.email);
                              setAssignedCellId(l.home_cell_id || "");
                              toast.info(`Editing "${l.full_name}" - edit form is ready.`);
                            }}
                            className="p-1 hover:text-primary transition-colors text-[10px]"
                            title="Edit Leader Profile"
                          >
                            ✏️
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteLeader(l.id, l.full_name)}
                            className="p-1 hover:text-red-600 transition-colors text-[10px]"
                            title="Delete Leader Profile"
                          >
                            🗑️
                          </button>
                        </div>
                        <div className="pr-10">
                          <h4 className="font-bold text-foreground text-sm flex items-center gap-1.5 truncate">
                            <span className="text-base">🎖️</span> {l.full_name}
                          </h4>
                          <p className="text-muted-foreground mt-1 font-medium text-primary">{l.email}</p>
                          <div className="mt-1.5 flex items-center gap-1.5">
                            <span className="text-[9px] uppercase font-bold text-muted-foreground">Access:</span>
                            <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                              l.is_approved
                                ? "bg-green-500/10 text-green-600 border border-green-500/20"
                                : "bg-red-500/10 text-red-600 border border-red-500/20 animate-pulse"
                            }`}>
                              {l.is_approved ? "Approved ✅" : "Pending Vetting ⏳"}
                            </span>
                          </div>
                        </div>
                        <div className="pt-2 border-t border-border/20 text-[10px] text-muted-foreground flex flex-col gap-2.5 font-medium">
                          <div className="flex items-center justify-between">
                            <span>Assigned Cell:</span>
                            <span className="font-semibold text-foreground truncate max-w-[120px]">{c?.name || "Unassigned"}</span>
                          </div>
                          <button
                            type="button"
                            onClick={async () => {
                              const nextState = !l.is_approved;
                              await db.updateCellLeader(l.id, { is_approved: nextState });
                              toast.success(`Leader "${l.full_name}" is now ${nextState ? "Approved" : "Suspended"}!`);
                              refresh();
                            }}
                            className={`w-full text-center py-1.5 rounded font-bold transition-all text-[9px] flex items-center justify-center gap-1 cursor-pointer ${
                              l.is_approved
                                ? "bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 border border-amber-500/20"
                                : "bg-primary text-primary-foreground hover:bg-primary/95 shadow-sm"
                            }`}
                          >
                            {l.is_approved ? "⛔ Revoke Approval" : "✅ Approve Portal Access"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "reports" && (
        <div className="bg-card rounded-2xl border border-border/40 p-5 shadow-sm space-y-4">
          <h3 className="font-heading text-base font-bold text-foreground border-b border-border/30 pb-2">
            Weekly Report Submissions ({totalReportsCount})
          </h3>
          {reports.length === 0 ? (
            <div className="py-12 text-center bg-muted/15 border border-dashed border-border/50 rounded-xl">
              <p className="text-xs text-muted-foreground font-semibold">No reports submitted yet</p>
              <p className="text-[10px] text-muted-foreground mt-1">
                Cell leaders will submit their attendance, visitor count, and souls won counts weekly here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border/40 text-muted-foreground font-semibold bg-muted/15">
                    <th className="py-2.5 px-3">WSF Center</th>
                    <th className="py-2.5 px-3">Meeting Date</th>
                    <th className="py-2.5 px-3 text-center">Attendance</th>
                    <th className="py-2.5 px-3 text-center">Visitors</th>
                    <th className="py-2.5 px-3 text-center">Souls Won</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {reports.map((r) => {
                    const c = cells.find((cell) => cell.id === r.home_cell_id);
                    return (
                      <tr key={r.id} className="hover:bg-muted/10 transition-colors">
                        <td className="py-3 px-3 font-bold text-foreground">{c?.name || "WSF Cell"}</td>
                        <td className="py-3 px-3">{r.report_date}</td>
                        <td className="py-3 px-3 text-center font-bold text-primary">{r.total_attendance}</td>
                        <td className="py-3 px-3 text-center font-medium text-gold">{r.total_visitors}</td>
                        <td className="py-3 px-3 text-center font-semibold text-green-600">{r.souls_won}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  icon: string;
  bg: string;
}
function StatCard({ label, value, icon, bg }: StatCardProps) {
  return (
    <div className={`p-4 rounded-xl border shadow-sm ${bg} flex flex-col justify-between h-24`}>
      <div className="flex items-center justify-between text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
        <span>{label}</span>
        <span className="text-sm">{icon}</span>
      </div>
      <div className="font-heading text-2xl font-black text-foreground">{value}</div>
    </div>
  );
}

// =========================================================================
// MEDIA TEAM COORDINATOR DASHBOARD PANEL
// =========================================================================
interface MediaDashboardProps {
  activeTab: string;
  events: ChurchEvent[];
  announcements: Announcement[];
  sermons: Sermon[];
  refresh: () => void;
}
function MediaDashboard({ activeTab, events, announcements, sermons, refresh }: MediaDashboardProps) {
  // Event Form State
  const [evtTitle, setEvtTitle] = useState("");
  const [evtDesc, setEvtDesc] = useState("");
  const [evtDate, setEvtDate] = useState("");
  const [evtImage, setEvtImage] = useState("");

  // Announcement Form State
  const [annTitle, setAnnTitle] = useState("");
  const [annContent, setAnnContent] = useState("");

  // Sermon Form State
  const [sermTitle, setSermTitle] = useState("");
  const [sermPreacher, setSermPreacher] = useState("");
  const [sermScript, setSermScript] = useState("");
  const [sermDate, setSermDate] = useState("");
  const [sermVideo, setSermVideo] = useState("");

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evtTitle || !evtDesc || !evtDate) {
      toast.error("Please add event title, description and date.");
      return;
    }
    try {
      await db.addEvent({
        title: evtTitle,
        description: evtDesc,
        event_date: new Date(evtDate).toISOString(),
        image_url: evtImage || undefined,
      });
      toast.success("Church public event uploaded successfully!");
      setEvtTitle("");
      setEvtDesc("");
      setEvtDate("");
      setEvtImage("");
      refresh();
    } catch (err) {
      toast.error("Failed to add event.");
    }
  };

  const handleAddAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle || !annContent) {
      toast.error("Please add announcement title and content.");
      return;
    }
    try {
      await db.addAnnouncement({
        title: annTitle,
        content: annContent,
      });
      toast.success("Parish homepage announcement posted successfully!");
      setAnnTitle("");
      setAnnContent("");
      refresh();
    } catch (err) {
      toast.error("Failed to post announcement.");
    }
  };

  const handleAddSermon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sermTitle || !sermPreacher || !sermScript || !sermDate) {
      toast.error("Please fill in sermon title, preacher, scripture, and date.");
      return;
    }
    try {
      await db.addSermon({
        title: sermTitle,
        preacher: sermPreacher,
        scripture: sermScript,
        date: sermDate,
        video_url: sermVideo || undefined,
      });
      toast.success("Sermon uploaded to public archive successfully!");
      setSermTitle("");
      setSermPreacher("");
      setSermScript("");
      setSermDate("");
      setSermVideo("");
      refresh();
    } catch (err) {
      toast.error("Failed to upload sermon.");
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      await db.deleteEvent(id);
      toast.success("Event deleted.");
      refresh();
    } catch (err) {
      toast.error("Deletion failed.");
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    try {
      await db.deleteAnnouncement(id);
      toast.success("Announcement deleted.");
      refresh();
    } catch (err) {
      toast.error("Deletion failed.");
    }
  };

  const handleDeleteSermon = async (id: string) => {
    try {
      await db.deleteSermon(id);
      toast.success("Sermon message deleted.");
      refresh();
    } catch (err) {
      toast.error("Deletion failed.");
    }
  };

  return (
    <>
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* Uploader Card */}
          <div className="md:col-span-1 bg-card rounded-2xl border border-border/40 p-5 shadow-sm space-y-4">
            <h3 className="font-heading text-base font-bold text-foreground border-b border-border/30 pb-2">
              Post Church Event
            </h3>
            <form onSubmit={handleAddEvent} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Event Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Week of Spiritual Emphasis"
                  value={evtTitle}
                  onChange={(e) => setEvtTitle(e.target.value)}
                  className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Event Date &amp; Time</label>
                <input
                  type="datetime-local"
                  required
                  value={evtDate}
                  onChange={(e) => setEvtDate(e.target.value)}
                  className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">
                  Flyer Image (Upload or Paste Link)
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Paste URL of flyer image"
                    value={evtImage}
                    onChange={(e) => setEvtImage(e.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground focus:outline-none"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground font-semibold">Or import picture:</span>
                    <label className="cursor-pointer bg-primary/10 text-primary hover:bg-primary/20 transition-colors px-2.5 py-1 rounded-md text-[10px] font-bold shadow-sm inline-block">
                      Choose File
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              if (event.target?.result) {
                                setEvtImage(event.target.result as string);
                                toast.success("Flyer picture imported successfully!");
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                  {evtImage && (
                    <div className="relative mt-2 border border-border/40 rounded-lg overflow-hidden bg-muted/20 p-1 flex items-center gap-2">
                      <img
                        src={evtImage}
                        alt="Flyer Preview"
                        className="h-10 w-10 object-cover rounded-md"
                        onError={(e) => {
                          // Fallback if image load fails
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1544427928-c49cd249ca3e?auto=format&fit=crop&q=80&w=150";
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-bold text-foreground truncate">Selected Flyer</p>
                        <p className="text-[8px] text-muted-foreground truncate">Ready to post</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEvtImage("")}
                        className="text-red-500 hover:text-red-700 font-bold text-xs p-1"
                        title="Remove Image"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Description / details</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Provide conference details, preacher lists..."
                  value={evtDesc}
                  onChange={(e) => setEvtDesc(e.target.value)}
                  className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground focus:outline-none resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full mt-2 rounded-lg bg-primary py-2.5 font-semibold text-primary-foreground shadow hover:bg-primary/95 transition-colors"
              >
                Upload Event Flyer
              </button>
            </form>
          </div>

          {/* Active events manager */}
          <div className="md:col-span-2 bg-card rounded-2xl border border-border/40 p-5 shadow-sm">
            <h3 className="font-heading text-base font-bold text-foreground border-b border-border/30 pb-2 mb-5 flex items-center justify-between">
              <span>Events Registry &amp; Archive</span>
              <span className="text-[10px] bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-bold">
                {events.length} Total
              </span>
            </h3>
            {events.length === 0 ? (
              <div className="py-12 text-center bg-muted/15 border border-dashed border-border/50 rounded-xl">
                <p className="text-xs text-muted-foreground font-semibold">No uploaded church events yet.</p>
              </div>
            ) : (
              (() => {
                const nowTime = new Date();
                const upcomingEvents = events.filter(e => new Date(e.event_date) >= nowTime);
                const pastEvents = events.filter(e => new Date(e.event_date) < nowTime);

                return (
                  <div className="space-y-6">
                    {/* Upcoming Events Section */}
                    <div>
                      <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        Upcoming Scheduled Events ({upcomingEvents.length})
                      </h4>
                      {upcomingEvents.length === 0 ? (
                        <p className="text-[11px] text-muted-foreground italic py-3 px-4 bg-muted/5 border border-border/10 rounded-xl">
                          No upcoming events scheduled.
                        </p>
                      ) : (
                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                          {upcomingEvents.map((e) => (
                            <div key={e.id} className="p-3.5 bg-card border border-border/40 hover:border-emerald-500/20 rounded-xl flex items-center justify-between gap-4 transition-all shadow-sm group">
                              <div className="flex items-center gap-3.5 min-w-0">
                                {/* Flyer Thumbnail / Color Accents */}
                                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-primary/5 flex items-center justify-center border border-border/20">
                                  {e.image_url ? (
                                    <img src={e.image_url} alt={e.title} className="w-full h-full object-cover" />
                                  ) : (
                                    <img src={churchLogo} alt="" className="h-6 w-6 opacity-40 object-contain" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <h5 className="font-bold text-foreground text-xs md:text-sm truncate group-hover:text-primary transition-colors">{e.title}</h5>
                                  <p className="text-[9px] font-bold text-amber-500 mt-0.5 uppercase tracking-wide">
                                    📅 {new Date(e.event_date).toLocaleString("en-US", { 
                                      weekday: "short", 
                                      month: "short", 
                                      day: "numeric", 
                                      hour: "numeric", 
                                      minute: "2-digit" 
                                    })} EAT
                                  </p>
                                  <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">{e.description}</p>
                                </div>
                              </div>
                              <button
                                onClick={() => handleDeleteEvent(e.id)}
                                className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 transition-all flex-shrink-0 cursor-pointer shadow-sm hover:shadow"
                                title="Delete Upcoming Event"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Past Events Section */}
                    <div>
                      <h4 className="text-xs font-bold text-rose-500/80 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-rose-500/60" />
                        Past &amp; Completed Events ({pastEvents.length})
                      </h4>
                      {pastEvents.length === 0 ? (
                        <p className="text-[11px] text-muted-foreground italic py-3 px-4 bg-muted/5 border border-border/10 rounded-xl">
                          No past events found in database.
                        </p>
                      ) : (
                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                          {pastEvents.map((e) => (
                            <div key={e.id} className="p-3.5 bg-muted/10 border border-border/10 hover:border-rose-500/20 rounded-xl flex items-center justify-between gap-4 transition-all opacity-80 group">
                              <div className="flex items-center gap-3.5 min-w-0">
                                {/* Flyer Thumbnail */}
                                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-muted/20 flex items-center justify-center border border-border/10 grayscale opacity-60">
                                  {e.image_url ? (
                                    <img src={e.image_url} alt={e.title} className="w-full h-full object-cover" />
                                  ) : (
                                    <img src={churchLogo} alt="" className="h-6 w-6 opacity-30 object-contain" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <h5 className="font-bold text-foreground text-xs md:text-sm truncate line-through decoration-muted-foreground/30">{e.title}</h5>
                                  <p className="text-[9px] font-semibold text-muted-foreground mt-0.5">
                                    📅 {new Date(e.event_date).toLocaleString("en-US", { 
                                      weekday: "short", 
                                      month: "short", 
                                      day: "numeric", 
                                      hour: "numeric", 
                                      minute: "2-digit" 
                                    })} EAT
                                  </p>
                                  <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">{e.description}</p>
                                </div>
                              </div>
                              <button
                                onClick={() => handleDeleteEvent(e.id)}
                                className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 transition-all flex-shrink-0 cursor-pointer shadow-sm hover:shadow"
                                title="Delete Past Event"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        </div>
      )}

      {activeTab === "announcements" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* Announcement form */}
          <div className="md:col-span-1 bg-card rounded-2xl border border-border/40 p-5 shadow-sm space-y-4">
            <h3 className="font-heading text-base font-bold text-foreground border-b border-border/30 pb-2">
              Post Parish Announcement
            </h3>
            <form onSubmit={handleAddAnnouncement} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Headline</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Next Sunday is Covenant Family Day"
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Announcement Body</label>
                <textarea
                  required
                  rows={6}
                  placeholder="Detail the announcement specifications..."
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground focus:outline-none resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full mt-2 rounded-lg bg-primary py-2.5 font-semibold text-primary-foreground shadow hover:bg-primary/95 transition-colors"
              >
                Post to Homepage
              </button>
            </form>
          </div>

          {/* List display */}
          <div className="md:col-span-2 bg-card rounded-2xl border border-border/40 p-5 shadow-sm">
            <h3 className="font-heading text-base font-bold text-foreground border-b border-border/30 pb-2 mb-4">
              Homepage Announcements Board ({announcements.length})
            </h3>
            {announcements.length === 0 ? (
              <div className="py-12 text-center bg-muted/15 border border-dashed border-border/50 rounded-xl">
                <p className="text-xs text-muted-foreground font-semibold">No announcements posted yet.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-auto pr-1">
                {announcements.map((a) => (
                  <div key={a.id} className="p-4 bg-muted/10 border border-border/20 rounded-xl flex items-start justify-between gap-4">
                    <div className="text-xs">
                      <h4 className="font-bold text-foreground text-sm">{a.title}</h4>
                      <p className="text-[9px] text-muted-foreground mt-1">
                        Posted: {new Date(a.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-muted-foreground mt-2 leading-relaxed">{a.content}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteAnnouncement(a.id)}
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 transition-colors flex-shrink-0"
                      title="Delete Announcement"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "sermons" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* Sermon Upload Form */}
          <div className="md:col-span-1 bg-card rounded-2xl border border-border/40 p-5 shadow-sm space-y-4">
            <h3 className="font-heading text-base font-bold text-foreground border-b border-border/30 pb-2">
              Add Sermon Message
            </h3>
            <form onSubmit={handleAddSermon} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Sermon Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Operating in the Supernatural"
                  value={sermTitle}
                  onChange={(e) => setSermTitle(e.target.value)}
                  className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Preaching Minister</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pastor Daniel Leba"
                  value={sermPreacher}
                  onChange={(e) => setSermPreacher(e.target.value)}
                  className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Scripture Reference</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Isaiah 8:18"
                  value={sermScript}
                  onChange={(e) => setSermScript(e.target.value)}
                  className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Preaching Date</label>
                <input
                  type="date"
                  required
                  value={sermDate}
                  onChange={(e) => setSermDate(e.target.value)}
                  className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Video Stream URL (Optional)</label>
                <input
                  type="text"
                  placeholder="Paste YouTube or video link"
                  value={sermVideo}
                  onChange={(e) => setSermVideo(e.target.value)}
                  className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full mt-2 rounded-lg bg-primary py-2.5 font-semibold text-primary-foreground shadow hover:bg-primary/95 transition-colors"
              >
                Upload Sermon Record
              </button>
            </form>
          </div>

          {/* List display */}
          <div className="md:col-span-2 bg-card rounded-2xl border border-border/40 p-5 shadow-sm">
            <h3 className="font-heading text-base font-bold text-foreground border-b border-border/30 pb-2 mb-4">
              Sermons Library Registry ({sermons.length})
            </h3>
            {sermons.length === 0 ? (
              <div className="py-12 text-center bg-muted/15 border border-dashed border-border/50 rounded-xl">
                <p className="text-xs text-muted-foreground font-semibold">No sermons uploaded to archive.</p>
              </div>
            ) : (
              <div className="space-y-3.5 max-h-[500px] overflow-auto pr-1">
                {sermons.map((s) => (
                  <div key={s.id} className="p-4 bg-muted/10 border border-border/20 rounded-xl flex items-start justify-between gap-4">
                    <div className="text-xs">
                      <h4 className="font-bold text-foreground text-sm">{s.title}</h4>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Preacher: <span className="font-bold text-primary">{s.preacher}</span> · Text: <span className="font-semibold text-foreground">{s.scripture}</span>
                      </p>
                      <p className="text-[9.5px] text-muted-foreground mt-1">Date: {s.date}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteSermon(s.id)}
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 transition-colors flex-shrink-0"
                      title="Delete Sermon"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// =========================================================================
// HOME CELL (WSF CENTER) LEADER DASHBOARD PANEL
// =========================================================================
interface CellLeaderDashboardProps {
  activeTab: string;
  user: UserProfile;
  cell: HomeCell | null;
  cells: HomeCell[];
  members: Member[];
  visitors: Visitor[];
  reports: WeeklyReport[];
  requests: CellMembershipRequest[];
  refresh: () => void;
}
function CellLeaderDashboard({ activeTab, user, cell, cells, members, visitors, reports, requests, refresh }: CellLeaderDashboardProps) {
  // Member Registration States
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState<"Male" | "Female">("Male");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [occupation, setOccupation] = useState("");
  const [maritalStatus, setMaritalStatus] = useState<any>("Single");

  // Attendance logging state
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split("T")[0]);
  const [presentMap, setPresentMap] = useState<Record<string, boolean>>({});
  const [remarksMap, setRemarksMap] = useState<Record<string, string>>({});

  // Visitor Registry Form States
  const [visName, setVisName] = useState("");
  const [visPhone, setVisPhone] = useState("");
  const [visInvited, setVisInvited] = useState("");

  // Report Submission Form States
  const [repDate, setRepDate] = useState(new Date().toISOString().split("T")[0]);
  const [repAttendance, setRepAttendance] = useState("");
  const [repVisitors, setRepVisitors] = useState("");
  const [repSouls, setRepSouls] = useState("");

  const handleRegisterMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cell) {
      toast.error("No active WSF cell center selected/assigned.");
      return;
    }
    if (!firstName || !lastName || !phoneNumber || !address) {
      toast.error("Please fill in first name, last name, phone, and address.");
      return;
    }
    try {
      await db.addMember({
        first_name: firstName,
        last_name: lastName,
        gender,
        phone_number: phoneNumber,
        address,
        occupation: occupation || undefined,
        marital_status: maritalStatus,
        home_cell_id: cell.id,
        date_joined: new Date().toISOString().split("T")[0],
      });
      toast.success("WSF cell member registered successfully!");
      setFirstName("");
      setLastName("");
      setPhoneNumber("");
      setAddress("");
      setOccupation("");
      refresh();
    } catch (err) {
      toast.error("Registration failed.");
    }
  };

  const handleSaveAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cell) return;
    if (members.length === 0) {
      toast.error("No members registered in this WSF cell yet.");
      return;
    }
    try {
      const records = members.map((m) => ({
        member_id: m.id,
        home_cell_id: cell.id,
        meeting_date: attendanceDate,
        present: presentMap[m.id] || false,
        remarks: remarksMap[m.id] || undefined,
      }));
      await db.saveAttendance(records);
      toast.success(`Attendance logs for ${attendanceDate} saved successfully!`);
      
      // Auto-populate report fields with these numbers to simplify leader workload!
      const totalPresent = records.filter(r => r.present).length;
      setRepAttendance(String(totalPresent));
    } catch (err) {
      toast.error("Failed to save attendance logs.");
    }
  };

  const handleRegisterVisitor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cell) return;
    if (!visName || !visPhone || !visInvited) {
      toast.error("Please fill in visitor full name, phone number, and who invited them.");
      return;
    }
    try {
      await db.addVisitor({
        full_name: visName,
        phone_number: visPhone,
        invited_by: visInvited,
        visit_date: new Date().toISOString().split("T")[0],
        follow_up_status: "New",
        home_cell_id: cell.id,
      });
      toast.success("Visitor registered in cell log successfully!");
      setVisName("");
      setVisPhone("");
      setVisInvited("");
      refresh();
    } catch (err) {
      toast.error("Failed to add visitor.");
    }
  };

  const handleVisitorStatusChange = async (id: string, status: any) => {
    try {
      await db.updateVisitorStatus(id, status);
      toast.success("Visitor follow-up status updated.");
      refresh();
    } catch (err) {
      toast.error("Failed to update status.");
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cell) return;
    if (!repAttendance || !repVisitors || !repSouls) {
      toast.error("Please fill in attendance, visitors, and souls won counts.");
      return;
    }
    try {
      await db.submitWeeklyReport({
        home_cell_id: cell.id,
        leader_id: user.id,
        total_attendance: Number(repAttendance),
        total_visitors: Number(repVisitors),
        souls_won: Number(repSouls),
        report_date: repDate,
      });
      toast.success(`Weekly report for ${repDate} submitted successfully!`);
      setRepAttendance("");
      setRepVisitors("");
      setRepSouls("");
      refresh();
    } catch (err) {
      toast.error("Failed to submit weekly report.");
    }
  };

  // Self assign cell center helper (needed when database starts completely blank!)
  const handleSelfAssign = async (cellId: string) => {
    if (!cellId) return;
    try {
      const allC = await db.getHomeCells();
      const target = allC.find((c) => c.id === cellId);
      if (!target) return;
      
      // Update cell leader id
      await db.addHomeCell({
        ...target,
        leader_id: user.id,
      });

      // Also update local session
      const updatedUser = {
        ...user,
        home_cell_id: cellId,
      };
      localStorage.setItem("winners_church_session", JSON.stringify(updatedUser));
      toast.success(`WSF Center assigned: ${target.name}`);
      refresh();
      window.location.reload(); // Quick refresh to sync all components
    } catch (err) {
      toast.error("Assignment failed.");
    }
  };

  if (!cell) {
    return (
      <div className="bg-card border border-border/40 rounded-2xl p-8 text-center max-w-xl mx-auto shadow-sm space-y-6">
        <div className="w-14 h-14 bg-gold/15 rounded-full flex items-center justify-center text-xl mx-auto">
          🏠
        </div>
        <h3 className="font-heading text-lg font-bold text-foreground">Welcome, Home Cell Leader!</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Since the database starts fresh, you are currently not assigned to any active WSF Center. Please assign yourself to one of the centers created by the Pastor below, or contact your Administrator to set one up!
        </p>

        {cells.length === 0 ? (
          <div className="p-4 bg-muted/20 border border-border/20 rounded-xl text-xs">
            <p className="font-semibold text-primary">Parish Administration Notice:</p>
            <p className="text-muted-foreground mt-1">
              There are no WSF Satellite Centers registered in the system yet. Please log in as <strong>Pastor/Admin</strong> first to create your neighborhood centers!
            </p>
          </div>
        ) : (
          <div className="space-y-3 pt-3 border-t border-border/30">
            <label className="block text-[10px] font-bold text-foreground uppercase tracking-widest text-left mb-1.5">
              Choose neighborhood WSF Center:
            </label>
            <select
              onChange={(e) => handleSelfAssign(e.target.value)}
              defaultValue=""
              className="w-full text-xs rounded-lg border border-border bg-card px-3 py-2.5 focus:outline-none"
            >
              <option value="" disabled>-- Select Center --</option>
              {cells.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.location})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Card Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Cell Members" value={members.length} icon="👥" bg="bg-primary/5 border-primary/10" />
            <StatCard label="Visitors Logged" value={visitors.length} icon="🤝" bg="bg-gold/10 border-gold/20" />
            <StatCard label="Submitted Reports" value={reports.length} icon="📝" bg="bg-green-500/5 border-green-500/10" />
            <StatCard label="Souls Won (Cell)" value={reports.reduce((acc, r) => acc + r.souls_won, 0)} icon="🕊️" bg="bg-blue-500/5 border-blue-500/10" />
          </div>

          {/* Cell Overview Profile card */}
          <div className="bg-card rounded-2xl border border-border/40 p-6 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div>
              <span className="inline-block bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full mb-3 uppercase tracking-wider">
                My Fellowship Center
              </span>
              <h2 className="font-heading text-2xl font-bold text-foreground">{cell.name}</h2>
              <div className="mt-3.5 space-y-2 text-xs text-muted-foreground">
                <p>📍 Location Area: <span className="font-semibold text-foreground">{cell.location}</span></p>
                <p>🏠 Host Address: <span className="font-semibold text-foreground">{cell.address}</span></p>
                <p>⏰ Meeting Schedule: <span className="font-semibold text-foreground">{cell.meeting_day} at {cell.meeting_time}</span></p>
              </div>
            </div>
            <div className="bg-muted/10 border border-border/20 rounded-2xl p-5 text-xs space-y-3">
              <p className="font-bold text-foreground">Satellite Leadership Directives:</p>
              <ul className="list-disc pl-4 space-y-1.5 text-muted-foreground">
                <li>Register new attendees in the "Register" tab.</li>
                <li>Record attendance logs every Saturday evening.</li>
                <li>Follow up with first-time visitors using the visitor status dashboard.</li>
                <li>Submit weekly stats to the Pastor immediately after each home cell fellowship.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {activeTab === "members" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* Member Registration Form */}
          <div className="md:col-span-1 bg-card rounded-2xl border border-border/40 p-5 shadow-sm space-y-4">
            <h3 className="font-heading text-base font-bold text-foreground border-b border-border/30 pb-2">
              Register New Member
            </h3>
            <form onSubmit={handleRegisterMember} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mwita"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full rounded-lg border border-border px-2 py-2 bg-card text-foreground focus:outline-none"
                  >
                    <option>Male</option>
                    <option>Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="07..."
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Residential Address</label>
                <input
                  type="text"
                  required
                  placeholder="Street / House Number / Landmark"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Occupation (Opt)</label>
                  <input
                    type="text"
                    placeholder="e.g. Teacher"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Marital Status</label>
                  <select
                    value={maritalStatus}
                    onChange={(e) => setMaritalStatus(e.target.value as any)}
                    className="w-full rounded-lg border border-border px-2 py-2 bg-card text-foreground cursor-pointer"
                  >
                    <option>Single</option>
                    <option>Married</option>
                    <option>Widowed</option>
                    <option>Divorced</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="w-full mt-2 rounded-lg bg-primary py-2.5 font-semibold text-primary-foreground shadow hover:bg-primary/95 transition-colors"
              >
                Register Member
              </button>
            </form>
          </div>

          {/* Members Roll display */}
          <div className="md:col-span-2 bg-card rounded-2xl border border-border/40 p-5 shadow-sm">
            <h3 className="font-heading text-base font-bold text-foreground border-b border-border/30 pb-2 mb-4">
              Registered Cell Members Roll ({members.length})
            </h3>
            {members.length === 0 ? (
              <div className="py-12 text-center bg-muted/15 border border-dashed border-border/50 rounded-xl">
                <p className="text-xs text-muted-foreground font-semibold">No members registered in this center yet.</p>
                <p className="text-[10px] text-muted-foreground mt-1 max-w-xs mx-auto">
                  Add your first member using the registration form to start logging weekly attendances!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[500px] overflow-auto pr-1">
                {members.map((m) => (
                  <div key={m.id} className="p-4 bg-muted/10 rounded-xl border border-border/20 space-y-2 text-xs flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-foreground text-sm flex items-center gap-1.5">
                        👤 {m.first_name} {m.last_name}
                      </h4>
                      <p className="text-muted-foreground mt-1">Gender: {m.gender} · Status: {m.marital_status}</p>
                      <p className="text-muted-foreground">Phone: <span className="font-semibold text-primary">{m.phone_number}</span></p>
                      <p className="text-muted-foreground line-clamp-1">Address: {m.address}</p>
                    </div>
                    {m.occupation && (
                      <div className="pt-2 border-t border-border/20 text-[10px] text-muted-foreground">
                        Occupation: {m.occupation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "attendance" && (
        <div className="bg-card rounded-2xl border border-border/40 p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/30 pb-3">
            <div>
              <h3 className="font-heading text-base font-bold text-foreground">Record Cell Attendance</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">Toggle checkboxes for present members and hit save</p>
            </div>
            
            {/* Meeting Date Selector */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-muted-foreground">Meeting Date:</label>
              <input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="text-xs rounded-lg border border-border px-2.5 py-1.5 bg-card text-foreground focus:outline-none"
              />
            </div>
          </div>

          {members.length === 0 ? (
            <div className="py-12 text-center bg-muted/15 border border-dashed border-border/50 rounded-xl max-w-xl mx-auto">
              <p className="text-xs text-muted-foreground font-semibold">Roll Call Empty</p>
              <p className="text-[10px] text-muted-foreground mt-1 max-w-xs mx-auto">
                You must register cell members under the <strong>"Register"</strong> tab before you can log their fellowship attendance!
              </p>
            </div>
          ) : (
            <form onSubmit={handleSaveAttendance} className="space-y-4">
              <div className="divide-y divide-border/20 max-h-[400px] overflow-auto pr-1">
                {members.map((m) => (
                  <div key={m.id} className="py-3 flex items-center justify-between text-xs gap-4">
                    <label className="flex items-center gap-3 cursor-pointer select-none font-bold text-foreground">
                      <input
                        type="checkbox"
                        checked={presentMap[m.id] || false}
                        onChange={(e) => setPresentMap({ ...presentMap, [m.id]: e.target.checked })}
                        className="h-5.5 w-5.5 rounded border-border text-primary focus:ring-primary/20 cursor-pointer"
                      />
                      <span>{m.first_name} {m.last_name}</span>
                    </label>
                    
                    {/* Remarks Input */}
                    <input
                      type="text"
                      placeholder="Remarks (e.g. traveled, sick)"
                      value={remarksMap[m.id] || ""}
                      onChange={(e) => setRemarksMap({ ...remarksMap, [m.id]: e.target.value })}
                      className="max-w-xs w-full text-xs rounded-lg border border-border px-3 py-1 bg-card text-foreground focus:outline-none"
                    />
                  </div>
                ))}
              </div>
              
              <div className="border-t border-border/30 pt-4 flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-semibold">
                  Toggled Present: {Object.values(presentMap).filter(Boolean).length} / {members.length}
                </span>
                <button
                  type="submit"
                  className="rounded-lg bg-primary px-6 py-2.5 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/95 transition-all"
                >
                  Save Attendance Roll
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {activeTab === "visitors" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* Visitor Registry Form */}
          <div className="md:col-span-1 bg-card rounded-2xl border border-border/40 p-5 shadow-sm space-y-4">
            <h3 className="font-heading text-base font-bold text-foreground border-b border-border/30 pb-2">
              Log First-Time Visitor
            </h3>
            <form onSubmit={handleRegisterVisitor} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Visitor Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Neema Joshua"
                  value={visName}
                  onChange={(e) => setVisName(e.target.value)}
                  className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="07..."
                  value={visPhone}
                  onChange={(e) => setVisPhone(e.target.value)}
                  className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Invited By (Host Member)</label>
                <input
                  type="text"
                  required
                  placeholder="Who invited them?"
                  value={visInvited}
                  onChange={(e) => setVisInvited(e.target.value)}
                  className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full mt-2 rounded-lg bg-primary py-2.5 font-semibold text-primary-foreground shadow hover:bg-primary/95 transition-colors"
              >
                Log Visitor Record
              </button>
            </form>
          </div>

          {/* Visitor List with follow-up selector */}
          <div className="md:col-span-2 bg-card rounded-2xl border border-border/40 p-5 shadow-sm">
            <h3 className="font-heading text-base font-bold text-foreground border-b border-border/30 pb-2 mb-4">
              Cell Visitors Registry ({visitors.length})
            </h3>
            {visitors.length === 0 ? (
              <div className="py-12 text-center bg-muted/15 border border-dashed border-border/50 rounded-xl">
                <p className="text-xs text-muted-foreground font-semibold">No visitors logged yet.</p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Log your first-time fellowship visitors to coordinate follow-ups!
                </p>
              </div>
            ) : (
              <div className="space-y-3.5 max-h-[500px] overflow-auto pr-1">
                {visitors.map((v) => (
                  <div key={v.id} className="p-4 bg-muted/10 border border-border/20 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs">
                    <div>
                      <h4 className="font-bold text-foreground text-sm">🤝 {v.full_name}</h4>
                      <p className="text-muted-foreground mt-1">
                        Invited by: <span className="font-semibold text-foreground">{v.invited_by}</span> · Phone: <span className="font-semibold text-primary">{v.phone_number}</span>
                      </p>
                      <p className="text-[10.5px] text-muted-foreground mt-0.5">Visited on: {v.visit_date}</p>
                    </div>
                    
                    {/* Follow up status toggle dropdown */}
                    <div className="flex items-center gap-1.5 self-end sm:self-auto">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Follow up:</span>
                      <select
                        value={v.follow_up_status}
                        onChange={(e) => handleVisitorStatusChange(v.id, e.target.value as any)}
                        className="rounded-lg border border-border bg-card px-2.5 py-1 text-[11px] font-semibold text-foreground cursor-pointer focus:outline-none"
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Awaiting Visit">Awaiting Visit</option>
                        <option value="Joined Church">Joined Church</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "reports" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* Submit weekly report card */}
          <div className="md:col-span-1 bg-card rounded-2xl border border-border/40 p-5 shadow-sm space-y-4">
            <h3 className="font-heading text-base font-bold text-foreground border-b border-border/30 pb-2">
              Submit Weekly Report
            </h3>
            <form onSubmit={handleSubmitReport} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Report / Meeting Date</label>
                <input
                  type="date"
                  required
                  value={repDate}
                  onChange={(e) => setRepDate(e.target.value)}
                  className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Total Attendance Count</label>
                <input
                  type="number"
                  min="0"
                  required
                  placeholder="e.g. 8"
                  value={repAttendance}
                  onChange={(e) => setRepAttendance(e.target.value)}
                  className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Total Visitors Count</label>
                <input
                  type="number"
                  min="0"
                  required
                  placeholder="e.g. 2"
                  value={repVisitors}
                  onChange={(e) => setRepVisitors(e.target.value)}
                  className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Souls Won Count</label>
                <input
                  type="number"
                  min="0"
                  required
                  placeholder="e.g. 1"
                  value={repSouls}
                  onChange={(e) => setRepSouls(e.target.value)}
                  className="w-full rounded-lg border border-border px-3 py-2 bg-card text-foreground focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full mt-2 rounded-lg bg-primary py-2.5 font-semibold text-primary-foreground shadow hover:bg-primary/95 transition-colors"
              >
                Submit Report to Pastor
              </button>
            </form>
          </div>

          {/* Past reports submitted */}
          <div className="md:col-span-2 bg-card rounded-2xl border border-border/40 p-5 shadow-sm">
            <h3 className="font-heading text-base font-bold text-foreground border-b border-border/30 pb-2 mb-4">
              Submitted Weekly Reports ({reports.length})
            </h3>
            {reports.length === 0 ? (
              <div className="py-12 text-center bg-muted/15 border border-dashed border-border/50 rounded-xl">
                <p className="text-xs text-muted-foreground font-semibold">No reports submitted yet.</p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  Fill in the weekly statistics form on the left to notify the Pastor of cell attendance!
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border/40 text-muted-foreground font-semibold bg-muted/15">
                      <th className="py-2.5 px-3">Report Date</th>
                      <th className="py-2.5 px-3 text-center">Attendance</th>
                      <th className="py-2.5 px-3 text-center">Visitors</th>
                      <th className="py-2.5 px-3 text-center">Souls Won</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20">
                    {reports.map((r) => (
                      <tr key={r.id} className="hover:bg-muted/10 transition-colors">
                        <td className="py-3 px-3 font-medium text-foreground">{r.report_date}</td>
                        <td className="py-3 px-3 text-center font-bold text-primary">{r.total_attendance}</td>
                        <td className="py-3 px-3 text-center font-medium text-gold">{r.total_visitors}</td>
                        <td className="py-3 px-3 text-center font-semibold text-green-600">{r.souls_won}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
