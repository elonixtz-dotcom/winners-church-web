import { createClient } from "@supabase/supabase-js";

// =========================================================================
// 1. DATA TYPES
// =========================================================================
export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: "pastor_admin" | "media_team" | "cell_leader";
  home_cell_id?: string | null;
  is_approved?: boolean;
  created_at: string;
}

export interface HomeCell {
  id: string;
  name: string;
  location: string;
  address: string;
  meeting_day: string;
  meeting_time: string;
  leader_id?: string | null;
  created_at: string;
}

export interface Member {
  id: string;
  first_name: string;
  last_name: string;
  gender: "Male" | "Female";
  phone_number: string;
  address: string;
  occupation?: string;
  marital_status?: "Single" | "Married" | "Widowed" | "Divorced";
  home_cell_id: string;
  date_joined: string;
  created_at: string;
}

export interface AttendanceRecord {
  id: string;
  member_id: string;
  home_cell_id: string;
  meeting_date: string;
  present: boolean;
  remarks?: string;
  created_at: string;
}

export interface Visitor {
  id: string;
  full_name: string;
  phone_number: string;
  invited_by: string;
  visit_date: string;
  follow_up_status: "New" | "Contacted" | "Awaiting Visit" | "Joined Church";
  home_cell_id: string;
  created_at: string;
}

export interface ChurchEvent {
  id: string;
  title: string;
  description: string;
  event_date: string;
  image_url?: string;
  created_by?: string;
  created_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  created_by?: string;
  created_at: string;
}

export interface WeeklyReport {
  id: string;
  home_cell_id: string;
  leader_id: string;
  total_attendance: number;
  total_visitors: number;
  souls_won: number;
  report_date: string;
  created_at: string;
}

export interface Sermon {
  id: string;
  title: string;
  preacher: string;
  scripture: string;
  date: string;
  video_url?: string;
  created_at: string;
}

// =========================================================================
// 2. SUPABASE INITIALIZATION
// =========================================================================
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured =
  supabaseUrl.trim() !== "" && supabaseAnonKey.trim() !== "";

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// =========================================================================
// 3. PERSISTENT MOCK DATABASE LAYER (localStorage fallback)
// =========================================================================
class LocalStorageDatabase {
  private get<T>(key: string): T[] {
    if (typeof window === "undefined") return [];
    const val = localStorage.getItem(`winners_church_${key}`);
    return val ? JSON.parse(val) : [];
  }

  private set<T>(key: string, data: T[]): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(`winners_church_${key}`, JSON.stringify(data));
  }

  // --- Session Management ---
  getCurrentUser(): UserProfile | null {
    if (typeof window === "undefined") return null;
    const session = localStorage.getItem("winners_church_session");
    return session ? JSON.parse(session) : null;
  }

  setCurrentUser(user: UserProfile | null): void {
    if (typeof window === "undefined") return;
    if (user) {
      localStorage.setItem("winners_church_session", JSON.stringify(user));
    } else {
      localStorage.removeItem("winners_church_session");
    }
  }

  // --- Home Cells ---
  getHomeCells(): HomeCell[] {
    return this.get<HomeCell>("home_cells");
  }

  addHomeCell(cell: Omit<HomeCell, "id" | "created_at">): HomeCell {
    const list = this.getHomeCells();
    const newCell: HomeCell = {
      ...cell,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    list.push(newCell);
    this.set("home_cells", list);
    return newCell;
  }

  // --- Members ---
  getMembers(): Member[] {
    return this.get<Member>("members");
  }

  getMembersByCell(cellId: string): Member[] {
    return this.getMembers().filter((m) => m.home_cell_id === cellId);
  }

  addMember(member: Omit<Member, "id" | "created_at">): Member {
    const list = this.getMembers();
    const newMember: Member = {
      ...member,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    list.push(newMember);
    this.set("members", list);
    return newMember;
  }

  updateMember(id: string, updates: Partial<Member>): Member {
    const list = this.getMembers();
    const idx = list.findIndex((m) => m.id === id);
    if (idx === -1) throw new Error("Member not found");
    const updated = { ...list[idx], ...updates };
    list[idx] = updated;
    this.set("members", list);
    return updated;
  }

  // --- Attendance ---
  getAttendance(): AttendanceRecord[] {
    return this.get<AttendanceRecord>("attendance");
  }

  getAttendanceByCell(cellId: string, date: string): AttendanceRecord[] {
    return this.getAttendance().filter(
      (a) => a.home_cell_id === cellId && a.meeting_date === date
    );
  }

  saveAttendance(records: Omit<AttendanceRecord, "id" | "created_at">[]): void {
    let list = this.getAttendance();
    records.forEach((record) => {
      // Remove any existing duplicate record for this member and date
      list = list.filter(
        (a) => !(a.member_id === record.member_id && a.meeting_date === record.meeting_date)
      );
      list.push({
        ...record,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
      });
    });
    this.set("attendance", list);
  }

  // --- Visitors ---
  getVisitors(): Visitor[] {
    return this.get<Visitor>("visitors");
  }

  getVisitorsByCell(cellId: string): Visitor[] {
    return this.getVisitors().filter((v) => v.home_cell_id === cellId);
  }

  addVisitor(visitor: Omit<Visitor, "id" | "created_at">): Visitor {
    const list = this.getVisitors();
    const newVisitor: Visitor = {
      ...visitor,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    list.push(newVisitor);
    this.set("visitors", list);
    return newVisitor;
  }

  updateVisitorStatus(id: string, status: Visitor["follow_up_status"]): Visitor {
    const list = this.getVisitors();
    const idx = list.findIndex((v) => v.id === id);
    if (idx === -1) throw new Error("Visitor not found");
    list[idx].follow_up_status = status;
    this.set("visitors", list);
    return list[idx];
  }

  // --- Events ---
  getEvents(): ChurchEvent[] {
    return this.get<ChurchEvent>("events").sort(
      (a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
    );
  }

  addEvent(event: Omit<ChurchEvent, "id" | "created_at">): ChurchEvent {
    const list = this.get<ChurchEvent>("events");
    const newEvent: ChurchEvent = {
      ...event,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    list.push(newEvent);
    this.set("events", list);
    return newEvent;
  }

  deleteEvent(id: string): void {
    const list = this.get<ChurchEvent>("events").filter((e) => e.id !== id);
    this.set("events", list);
  }

  // --- Announcements ---
  getAnnouncements(): Announcement[] {
    return this.get<Announcement>("announcements").sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  addAnnouncement(announcement: Omit<Announcement, "id" | "created_at">): Announcement {
    const list = this.getAnnouncements();
    const newAnn: Announcement = {
      ...announcement,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    list.push(newAnn);
    this.set("announcements", list);
    return newAnn;
  }

  deleteAnnouncement(id: string): void {
    const list = this.getAnnouncements().filter((a) => a.id !== id);
    this.set("announcements", list);
  }

  // --- Sermons ---
  getSermons(): Sermon[] {
    return this.get<Sermon>("sermons").sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  addSermon(sermon: Omit<Sermon, "id" | "created_at">): Sermon {
    const list = this.getSermons();
    const newSermon: Sermon = {
      ...sermon,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    list.push(newSermon);
    this.set("sermons", list);
    return newSermon;
  }

  deleteSermon(id: string): void {
    const list = this.getSermons().filter((s) => s.id !== id);
    this.set("sermons", list);
  }

  // --- Weekly Reports ---
  getWeeklyReports(): WeeklyReport[] {
    return this.get<WeeklyReport>("weekly_reports").sort(
      (a, b) => new Date(b.report_date).getTime() - new Date(a.report_date).getTime()
    );
  }

  getWeeklyReportsByCell(cellId: string): WeeklyReport[] {
    return this.getWeeklyReports().filter((r) => r.home_cell_id === cellId);
  }

  submitWeeklyReport(report: Omit<WeeklyReport, "id" | "created_at">): WeeklyReport {
    const list = this.getWeeklyReports();
    // Prevent duplicate report dates for a cell in mock db
    const cleanList = list.filter(
      (r) => !(r.home_cell_id === report.home_cell_id && r.report_date === report.report_date)
    );
    const newReport: WeeklyReport = {
      ...report,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    cleanList.push(newReport);
    this.set("weekly_reports", cleanList);
    return newReport;
  }

  // --- Users & Leaders Management ---
  getUsers(): UserProfile[] {
    return this.get<UserProfile>("users");
  }

  addUser(user: UserProfile): void {
    const list = this.getUsers();
    list.push(user);
    this.set("users", list);
  }

  updateUser(id: string, updates: Partial<UserProfile>): UserProfile {
    const list = this.getUsers();
    const idx = list.findIndex((u) => u.id === id);
    if (idx === -1) throw new Error("Leader not found");
    const updated = { ...list[idx], ...updates };
    list[idx] = updated;
    this.set("users", list);
    return updated;
  }

  deleteUser(id: string): void {
    const list = this.getUsers().filter((u) => u.id !== id);
    this.set("users", list);
  }

  // --- Home Cells Management Updates ---
  updateHomeCell(id: string, updates: Partial<HomeCell>): HomeCell {
    const list = this.getHomeCells();
    const idx = list.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error("WSF Cell not found");
    const updated = { ...list[idx], ...updates };
    list[idx] = updated;
    this.set("home_cells", list);
    return updated;
  }

  deleteHomeCell(id: string): void {
    const list = this.getHomeCells().filter((c) => c.id !== id);
    this.set("home_cells", list);
  }
}

export const mockDb = new LocalStorageDatabase();

// =========================================================================
// 4. UNIFIED CORE DATABASE CONTROLLER (Seamless Supabase / Local Fallback)
// =========================================================================

export const db = {
  // --- Users & Leaders Directory ---
  getUsers: async (): Promise<UserProfile[]> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("full_name", { ascending: true });
      if (error) throw error;
      return data as UserProfile[];
    }
    return mockDb.getUsers();
  },

  addCellLeader: async (leader: Omit<UserProfile, "id" | "created_at">): Promise<UserProfile> => {
    const newLeader: UserProfile = {
      ...leader,
      id: crypto.randomUUID(),
      is_approved: leader.is_approved !== undefined ? leader.is_approved : true,
      created_at: new Date().toISOString(),
    };
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("users")
        .insert([newLeader])
        .select()
        .single();
      if (error) throw error;
      return data as UserProfile;
    }
    mockDb.addUser(newLeader);
    return newLeader;
  },

  updateCellLeader: async (id: string, updates: Partial<UserProfile>): Promise<UserProfile> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("users")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as UserProfile;
    }
    return mockDb.updateUser(id, updates);
  },

  deleteCellLeader: async (id: string): Promise<void> => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from("users")
        .delete()
        .eq("id", id);
      if (error) throw error;
      return;
    }
    mockDb.deleteUser(id);
  },

  // --- Sessions & Auth ---
  getCurrentUser: async (): Promise<UserProfile | null> => {
    if (isSupabaseConfigured && supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();
      
      if (error) return null;
      return data as UserProfile;
    }
    return mockDb.getCurrentUser();
  },

  logout: async (): Promise<void> => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    } else {
      mockDb.setCurrentUser(null);
    }
  },

  // --- Home Cells ---
  getHomeCells: async (): Promise<HomeCell[]> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("home_cells")
        .select("*")
        .order("name", { ascending: true });
      if (error) throw error;
      return data as HomeCell[];
    }
    return mockDb.getHomeCells();
  },

  addHomeCell: async (cell: Omit<HomeCell, "id" | "created_at">): Promise<HomeCell> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("home_cells")
        .insert([cell])
        .select()
        .single();
      if (error) throw error;
      return data as HomeCell;
    }
    return mockDb.addHomeCell(cell);
  },

  updateHomeCell: async (id: string, updates: Partial<HomeCell>): Promise<HomeCell> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("home_cells")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as HomeCell;
    }
    return mockDb.updateHomeCell(id, updates);
  },

  deleteHomeCell: async (id: string): Promise<void> => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from("home_cells")
        .delete()
        .eq("id", id);
      if (error) throw error;
      return;
    }
    mockDb.deleteHomeCell(id);
  },

  // --- Members ---
  getMembers: async (): Promise<Member[]> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("members")
        .select("*")
        .order("first_name", { ascending: true });
      if (error) throw error;
      return data as Member[];
    }
    return mockDb.getMembers();
  },

  getMembersByCell: async (cellId: string): Promise<Member[]> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("members")
        .select("*")
        .eq("home_cell_id", cellId)
        .order("first_name", { ascending: true });
      if (error) throw error;
      return data as Member[];
    }
    return mockDb.getMembersByCell(cellId);
  },

  addMember: async (member: Omit<Member, "id" | "created_at">): Promise<Member> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("members")
        .insert([member])
        .select()
        .single();
      if (error) throw error;
      return data as Member;
    }
    return mockDb.addMember(member);
  },

  updateMember: async (id: string, updates: Partial<Member>): Promise<Member> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("members")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as Member;
    }
    return mockDb.updateMember(id, updates);
  },

  // --- Attendance ---
  getAttendanceByCell: async (cellId: string, date: string): Promise<AttendanceRecord[]> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("attendance")
        .select("*")
        .eq("home_cell_id", cellId)
        .eq("meeting_date", date);
      if (error) throw error;
      return data as AttendanceRecord[];
    }
    return mockDb.getAttendanceByCell(cellId, date);
  },

  saveAttendance: async (records: Omit<AttendanceRecord, "id" | "created_at">[]): Promise<void> => {
    if (isSupabaseConfigured && supabase) {
      // Upsert to handle updates seamlessly
      const { error } = await supabase
        .from("attendance")
        .upsert(records, { onConflict: "member_id,meeting_date" });
      if (error) throw error;
    } else {
      mockDb.saveAttendance(records);
    }
  },

  // --- Visitors ---
  getVisitors: async (): Promise<Visitor[]> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("visitors")
        .select("*")
        .order("visit_date", { ascending: false });
      if (error) throw error;
      return data as Visitor[];
    }
    return mockDb.getVisitors();
  },

  getVisitorsByCell: async (cellId: string): Promise<Visitor[]> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("visitors")
        .select("*")
        .eq("home_cell_id", cellId)
        .order("visit_date", { ascending: false });
      if (error) throw error;
      return data as Visitor[];
    }
    return mockDb.getVisitorsByCell(cellId);
  },

  addVisitor: async (visitor: Omit<Visitor, "id" | "created_at">): Promise<Visitor> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("visitors")
        .insert([visitor])
        .select()
        .single();
      if (error) throw error;
      return data as Visitor;
    }
    return mockDb.addVisitor(visitor);
  },

  updateVisitorStatus: async (id: string, status: Visitor["follow_up_status"]): Promise<Visitor> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("visitors")
        .update({ follow_up_status: status })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as Visitor;
    }
    return mockDb.updateVisitorStatus(id, status);
  },

  // --- Events ---
  getEvents: async (): Promise<ChurchEvent[]> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("event_date", { ascending: true });
      if (error) throw error;
      return data as ChurchEvent[];
    }
    return mockDb.getEvents();
  },

  addEvent: async (event: Omit<ChurchEvent, "id" | "created_at">): Promise<ChurchEvent> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("events")
        .insert([event])
        .select()
        .single();
      if (error) throw error;
      return data as ChurchEvent;
    }
    return mockDb.addEvent(event);
  },

  deleteEvent: async (id: string): Promise<void> => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
    } else {
      mockDb.deleteEvent(id);
    }
  },

  // --- Announcements ---
  getAnnouncements: async (): Promise<Announcement[]> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Announcement[];
    }
    return mockDb.getAnnouncements();
  },

  addAnnouncement: async (announcement: Omit<Announcement, "id" | "created_at">): Promise<Announcement> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("announcements")
        .insert([announcement])
        .select()
        .single();
      if (error) throw error;
      return data as Announcement;
    }
    return mockDb.addAnnouncement(announcement);
  },

  deleteAnnouncement: async (id: string): Promise<void> => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from("announcements").delete().eq("id", id);
      if (error) throw error;
    } else {
      mockDb.deleteAnnouncement(id);
    }
  },

  // --- Sermons ---
  getSermons: async (): Promise<Sermon[]> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("sermons")
        .select("*")
        .order("date", { ascending: false });
      if (error) throw error;
      return data as Sermon[];
    }
    return mockDb.getSermons();
  },

  addSermon: async (sermon: Omit<Sermon, "id" | "created_at">): Promise<Sermon> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("sermons")
        .insert([sermon])
        .select()
        .single();
      if (error) throw error;
      return data as Sermon;
    }
    return mockDb.addSermon(sermon);
  },

  deleteSermon: async (id: string): Promise<void> => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from("sermons").delete().eq("id", id);
      if (error) throw error;
    } else {
      mockDb.deleteSermon(id);
    }
  },

  // --- Weekly Reports ---
  getWeeklyReports: async (): Promise<WeeklyReport[]> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("weekly_reports")
        .select("*")
        .order("report_date", { ascending: false });
      if (error) throw error;
      return data as WeeklyReport[];
    }
    return mockDb.getWeeklyReports();
  },

  getWeeklyReportsByCell: async (cellId: string): Promise<WeeklyReport[]> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("weekly_reports")
        .select("*")
        .eq("home_cell_id", cellId)
        .order("report_date", { ascending: false });
      if (error) throw error;
      return data as WeeklyReport[];
    }
    return mockDb.getWeeklyReportsByCell(cellId);
  },

  submitWeeklyReport: async (report: Omit<WeeklyReport, "id" | "created_at">): Promise<WeeklyReport> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("weekly_reports")
        .upsert(report, { onConflict: "home_cell_id,report_date" })
        .select()
        .single();
      if (error) throw error;
      return data as WeeklyReport;
    }
    return mockDb.submitWeeklyReport(report);
  },
};
