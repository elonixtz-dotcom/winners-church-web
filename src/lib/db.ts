import { createClient } from "@supabase/supabase-js";

// =========================================================================
// 1. DATA TYPES
// =========================================================================
export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: "super_admin" | "church_admin" | "district_pastor" | "zone_pastor" | "cell_leader" | "assistant_leader" | "media_team";
  home_cell_id?: string | null;
  is_approved?: boolean;
  created_at: string;
}

export interface Zone {
  id: string;
  name: string;
  zone_pastor_id?: string | null;
  created_at: string;
}

export interface District {
  id: string;
  name: string;
  zone_id?: string | null;
  district_pastor_id?: string | null;
  created_at: string;
}

export interface HomeCell {
  id: string;
  name: string;
  cell_code?: string | null;
  location: string;
  address: string;
  meeting_day: string;
  meeting_time: string;
  leader_id?: string | null;
  assistant_leader_id?: string | null;
  district_id?: string | null;
  created_at: string;
}

export interface Member {
  id: string;
  first_name: string;
  last_name: string;
  gender: "Male" | "Female";
  phone_number: string;
  email?: string | null;
  date_of_birth?: string | null;
  marital_status?: "Single" | "Married" | "Widowed" | "Divorced" | null;
  occupation?: string | null;
  address: string;
  home_cell_id: string;
  date_joined: string;
  membership_status: "active" | "inactive" | "transferred";
  created_at: string;
  updated_at: string;
}

export interface MeetingRecord {
  id: string;
  home_cell_id: string;
  meeting_date: string;
  meeting_topic: string;
  bible_scripture?: string | null;
  meeting_notes?: string | null;
  total_attendance: number;
  meeting_status: "scheduled" | "in_progress" | "completed" | "cancelled";
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AttendanceRecord {
  id: string;
  member_id: string;
  home_cell_id: string;
  meeting_record_id: string;
  meeting_date: string;
  present: boolean;
  arrival_time?: string | null;
  reason_for_absence?: string | null;
  created_at: string;
}

export interface Visitor {
  id: string;
  full_name: string;
  phone_number: string;
  gender: "Male" | "Female";
  address?: string | null;
  invited_by?: string | null;
  first_visit_date: string;
  number_of_visits: number;
  follow_up_status: "New" | "Contacted" | "Awaiting Visit" | "Joined Church" | "Not Interested";
  home_cell_id: string;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface NewConvert {
  id: string;
  full_name: string;
  phone_number: string;
  date_of_salvation: string;
  baptism_status: "not_baptized" | "scheduled" | "baptized";
  baptism_date?: string | null;
  foundation_class_status: "not_started" | "in_progress" | "completed";
  assigned_follow_up_leader_id?: string | null;
  home_cell_id: string;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PrayerRequest {
  id: string;
  member_id?: string | null;
  member_name: string;
  category: "salvation" | "healing" | "deliverance" | "finances" | "family" | "career" | "spiritual_growth" | "general";
  description: string;
  date_submitted: string;
  status: "pending" | "in_prayer" | "answered" | "closed";
  testimony_received: boolean;
  home_cell_id: string;
  created_at: string;
  updated_at: string;
}

export interface FollowUp {
  id: string;
  person_name: string;
  person_type: "member" | "visitor" | "new_convert";
  person_id?: string | null;
  follow_up_date: string;
  follow_up_method: "phone_call" | "text_message" | "home_visit" | "whatsapp" | "other";
  outcome: string;
  next_action?: string | null;
  next_follow_up_date?: string | null;
  followed_up_by?: string | null;
  home_cell_id: string;
  created_at: string;
  updated_at: string;
}

export interface Testimony {
  id: string;
  member_id?: string | null;
  member_name: string;
  testimony_title: string;
  description: string;
  date_shared: string;
  is_approved: boolean;
  is_public: boolean;
  home_cell_id: string;
  created_at: string;
  updated_at: string;
}

export interface Offering {
  id: string;
  meeting_date: string;
  meeting_record_id?: string | null;
  offering_amount: number;
  special_contributions?: number | null;
  total_amount?: number;
  recorded_by?: string | null;
  submission_status: "pending" | "submitted" | "approved";
  home_cell_id: string;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface WeeklyReport {
  id: string;
  home_cell_id: string;
  leader_id?: string | null;
  report_date: string;
  total_members: number;
  members_present: number;
  members_absent: number;
  visitors: number;
  new_converts: number;
  baptisms: number;
  prayer_requests: number;
  testimonies: number;
  follow_ups_completed: number;
  total_offering: number;
  created_at: string;
}

export interface ChurchEvent {
  id: string;
  title: string;
  description: string;
  event_date: string;
  image_url?: string | null;
  created_by?: string | null;
  created_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  created_by?: string | null;
  created_at: string;
}

export interface Sermon {
  id: string;
  title: string;
  preacher: string;
  scripture: string;
  date: string;
  video_url?: string | null;
  created_at: string;
}

export interface CellMembershipRequest {
  id: string;
  first_name: string;
  last_name: string;
  gender: "Male" | "Female";
  phone_number: string;
  address: string;
  occupation?: string | null;
  marital_status?: "Single" | "Married" | "Widowed" | "Divorced" | null;
  home_cell_id: string;
  status: "pending" | "approved" | "rejected";
  notes?: string | null;
  processed_by?: string | null;
  processed_at?: string | null;
  created_at: string;
}

export interface Book {
  id: string;
  title: string;
  subtitle?: string | null;
  author: string;
  description: string;
  synopsis?: string | null;
  isbn?: string | null;
  publication_date?: string | null;
  page_count?: number | null;
  price?: number | null;
  currency?: string | null;
  purchase_link?: string | null;
  categories?: string[] | null;
  cover_image_url?: string | null;
  created_by?: string | null;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
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

  // --- Zones ---
  getZones(): Zone[] { return this.get<Zone>("zones"); }
  addZone(zone: Omit<Zone, "id" | "created_at">): Zone {
    const list = this.getZones();
    const newZone: Zone = { ...zone, id: crypto.randomUUID(), created_at: new Date().toISOString() };
    list.push(newZone);
    this.set("zones", list);
    return newZone;
  }
  updateZone(id: string, updates: Partial<Zone>): Zone {
    const list = this.getZones();
    const idx = list.findIndex(z => z.id === id);
    if (idx === -1) throw new Error("Zone not found");
    list[idx] = { ...list[idx], ...updates };
    this.set("zones", list);
    return list[idx];
  }
  deleteZone(id: string): void { this.set("zones", this.getZones().filter(z => z.id !== id)); }

  // --- Districts ---
  getDistricts(): District[] { return this.get<District>("districts"); }
  addDistrict(district: Omit<District, "id" | "created_at">): District {
    const list = this.getDistricts();
    const newDistrict: District = { ...district, id: crypto.randomUUID(), created_at: new Date().toISOString() };
    list.push(newDistrict);
    this.set("districts", list);
    return newDistrict;
  }
  updateDistrict(id: string, updates: Partial<District>): District {
    const list = this.getDistricts();
    const idx = list.findIndex(d => d.id === id);
    if (idx === -1) throw new Error("District not found");
    list[idx] = { ...list[idx], ...updates };
    this.set("districts", list);
    return list[idx];
  }
  deleteDistrict(id: string): void { this.set("districts", this.getDistricts().filter(d => d.id !== id)); }

  // --- Home Cells ---
  getHomeCells(): HomeCell[] { return this.get<HomeCell>("home_cells"); }
  addHomeCell(cell: Omit<HomeCell, "id" | "created_at">): HomeCell {
    const list = this.getHomeCells();
    const newCell: HomeCell = { ...cell, id: crypto.randomUUID(), created_at: new Date().toISOString() };
    list.push(newCell);
    this.set("home_cells", list);
    return newCell;
  }
  updateHomeCell(id: string, updates: Partial<HomeCell>): HomeCell {
    const list = this.getHomeCells();
    const idx = list.findIndex(c => c.id === id);
    if (idx === -1) throw new Error("WSF Cell not found");
    list[idx] = { ...list[idx], ...updates };
    this.set("home_cells", list);
    return list[idx];
  }
  deleteHomeCell(id: string): void { this.set("home_cells", this.getHomeCells().filter(c => c.id !== id)); }

  // --- Members ---
  getMembers(): Member[] { return this.get<Member>("members"); }
  getMembersByCell(cellId: string): Member[] { return this.getMembers().filter(m => m.home_cell_id === cellId); }
  addMember(member: Omit<Member, "id" | "created_at" | "updated_at">): Member {
    const list = this.getMembers();
    const newMember: Member = {
      ...member, id: crypto.randomUUID(), created_at: new Date().toISOString(), updated_at: new Date().toISOString()
    };
    list.push(newMember);
    this.set("members", list);
    return newMember;
  }
  updateMember(id: string, updates: Partial<Member>): Member {
    const list = this.getMembers();
    const idx = list.findIndex(m => m.id === id);
    if (idx === -1) throw new Error("Member not found");
    list[idx] = { ...list[idx], ...updates, updated_at: new Date().toISOString() };
    this.set("members", list);
    return list[idx];
  }

  // --- Meeting Records ---
  getMeetingRecords(): MeetingRecord[] { return this.get<MeetingRecord>("meeting_records"); }
  getMeetingRecordsByCell(cellId: string): MeetingRecord[] {
    return this.getMeetingRecords().filter(mr => mr.home_cell_id === cellId);
  }
  addMeetingRecord(record: Omit<MeetingRecord, "id" | "created_at" | "updated_at">): MeetingRecord {
    const list = this.getMeetingRecords();
    const newRecord: MeetingRecord = {
      ...record, id: crypto.randomUUID(), created_at: new Date().toISOString(), updated_at: new Date().toISOString()
    };
    list.push(newRecord);
    this.set("meeting_records", list);
    return newRecord;
  }
  updateMeetingRecord(id: string, updates: Partial<MeetingRecord>): MeetingRecord {
    const list = this.getMeetingRecords();
    const idx = list.findIndex(mr => mr.id === id);
    if (idx === -1) throw new Error("Meeting record not found");
    list[idx] = { ...list[idx], ...updates, updated_at: new Date().toISOString() };
    this.set("meeting_records", list);
    return list[idx];
  }
  deleteMeetingRecord(id: string): void {
    this.set("meeting_records", this.getMeetingRecords().filter(mr => mr.id !== id));
  }

  // --- Attendance ---
  getAttendance(): AttendanceRecord[] { return this.get<AttendanceRecord>("attendance"); }
  getAttendanceByCell(cellId: string, date: string): AttendanceRecord[] {
    return this.getAttendance().filter(a => a.home_cell_id === cellId && a.meeting_date === date);
  }
  getAttendanceByMeeting(meetingRecordId: string): AttendanceRecord[] {
    return this.getAttendance().filter(a => a.meeting_record_id === meetingRecordId);
  }
  saveAttendance(records: Omit<AttendanceRecord, "id" | "created_at">[]): void {
    let list = this.getAttendance();
    records.forEach(record => {
      list = list.filter(a => !(a.member_id === record.member_id && a.meeting_record_id === record.meeting_record_id));
      list.push({ ...record, id: crypto.randomUUID(), created_at: new Date().toISOString() });
    });
    this.set("attendance", list);
  }

  // --- Visitors ---
  getVisitors(): Visitor[] { return this.get<Visitor>("visitors"); }
  getVisitorsByCell(cellId: string): Visitor[] { return this.getVisitors().filter(v => v.home_cell_id === cellId); }
  addVisitor(visitor: Omit<Visitor, "id" | "created_at" | "updated_at">): Visitor {
    const list = this.getVisitors();
    const newVisitor: Visitor = {
      ...visitor, id: crypto.randomUUID(), created_at: new Date().toISOString(), updated_at: new Date().toISOString()
    };
    list.push(newVisitor);
    this.set("visitors", list);
    return newVisitor;
  }
  updateVisitor(id: string, updates: Partial<Visitor>): Visitor {
    const list = this.getVisitors();
    const idx = list.findIndex(v => v.id === id);
    if (idx === -1) throw new Error("Visitor not found");
    list[idx] = { ...list[idx], ...updates, updated_at: new Date().toISOString() };
    this.set("visitors", list);
    return list[idx];
  }

  // --- New Converts ---
  getNewConverts(): NewConvert[] { return this.get<NewConvert>("new_converts"); }
  getNewConvertsByCell(cellId: string): NewConvert[] {
    return this.getNewConverts().filter(nc => nc.home_cell_id === cellId);
  }
  addNewConvert(convert: Omit<NewConvert, "id" | "created_at" | "updated_at">): NewConvert {
    const list = this.getNewConverts();
    const newConvert: NewConvert = {
      ...convert, id: crypto.randomUUID(), created_at: new Date().toISOString(), updated_at: new Date().toISOString()
    };
    list.push(newConvert);
    this.set("new_converts", list);
    return newConvert;
  }
  updateNewConvert(id: string, updates: Partial<NewConvert>): NewConvert {
    const list = this.getNewConverts();
    const idx = list.findIndex(nc => nc.id === id);
    if (idx === -1) throw new Error("New convert not found");
    list[idx] = { ...list[idx], ...updates, updated_at: new Date().toISOString() };
    this.set("new_converts", list);
    return list[idx];
  }

  // --- Prayer Requests ---
  getPrayerRequests(): PrayerRequest[] { return this.get<PrayerRequest>("prayer_requests"); }
  getPrayerRequestsByCell(cellId: string): PrayerRequest[] {
    return this.getPrayerRequests().filter(pr => pr.home_cell_id === cellId);
  }
  addPrayerRequest(request: Omit<PrayerRequest, "id" | "created_at" | "updated_at">): PrayerRequest {
    const list = this.getPrayerRequests();
    const newRequest: PrayerRequest = {
      ...request, id: crypto.randomUUID(), created_at: new Date().toISOString(), updated_at: new Date().toISOString()
    };
    list.push(newRequest);
    this.set("prayer_requests", list);
    return newRequest;
  }
  updatePrayerRequest(id: string, updates: Partial<PrayerRequest>): PrayerRequest {
    const list = this.getPrayerRequests();
    const idx = list.findIndex(pr => pr.id === id);
    if (idx === -1) throw new Error("Prayer request not found");
    list[idx] = { ...list[idx], ...updates, updated_at: new Date().toISOString() };
    this.set("prayer_requests", list);
    return list[idx];
  }

  // --- Follow Ups ---
  getFollowUps(): FollowUp[] { return this.get<FollowUp>("follow_ups"); }
  getFollowUpsByCell(cellId: string): FollowUp[] {
    return this.getFollowUps().filter(fu => fu.home_cell_id === cellId);
  }
  addFollowUp(followUp: Omit<FollowUp, "id" | "created_at" | "updated_at">): FollowUp {
    const list = this.getFollowUps();
    const newFollowUp: FollowUp = {
      ...followUp, id: crypto.randomUUID(), created_at: new Date().toISOString(), updated_at: new Date().toISOString()
    };
    list.push(newFollowUp);
    this.set("follow_ups", list);
    return newFollowUp;
  }
  updateFollowUp(id: string, updates: Partial<FollowUp>): FollowUp {
    const list = this.getFollowUps();
    const idx = list.findIndex(fu => fu.id === id);
    if (idx === -1) throw new Error("Follow up not found");
    list[idx] = { ...list[idx], ...updates, updated_at: new Date().toISOString() };
    this.set("follow_ups", list);
    return list[idx];
  }

  // --- Testimonies ---
  getTestimonies(): Testimony[] { return this.get<Testimony>("testimonies"); }
  getTestimoniesByCell(cellId: string): Testimony[] {
    return this.getTestimonies().filter(t => t.home_cell_id === cellId);
  }
  addTestimony(testimony: Omit<Testimony, "id" | "created_at" | "updated_at">): Testimony {
    const list = this.getTestimonies();
    const newTestimony: Testimony = {
      ...testimony, id: crypto.randomUUID(), created_at: new Date().toISOString(), updated_at: new Date().toISOString()
    };
    list.push(newTestimony);
    this.set("testimonies", list);
    return newTestimony;
  }
  updateTestimony(id: string, updates: Partial<Testimony>): Testimony {
    const list = this.getTestimonies();
    const idx = list.findIndex(t => t.id === id);
    if (idx === -1) throw new Error("Testimony not found");
    list[idx] = { ...list[idx], ...updates, updated_at: new Date().toISOString() };
    this.set("testimonies", list);
    return list[idx];
  }

  // --- Offerings ---
  getOfferings(): Offering[] { return this.get<Offering>("offerings"); }
  getOfferingsByCell(cellId: string): Offering[] { return this.getOfferings().filter(o => o.home_cell_id === cellId); }
  addOffering(offering: Omit<Offering, "id" | "created_at" | "updated_at">): Offering {
    const list = this.getOfferings();
    const newOffering: Offering = {
      ...offering,
      total_amount: offering.offering_amount + (offering.special_contributions || 0),
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    list.push(newOffering);
    this.set("offerings", list);
    return newOffering;
  }
  updateOffering(id: string, updates: Partial<Offering>): Offering {
    const list = this.getOfferings();
    const idx = list.findIndex(o => o.id === id);
    if (idx === -1) throw new Error("Offering not found");
    const updated = { ...list[idx], ...updates, updated_at: new Date().toISOString() };
    updated.total_amount = updated.offering_amount + (updated.special_contributions || 0);
    list[idx] = updated;
    this.set("offerings", list);
    return list[idx];
  }

  // --- Users & Leaders Management ---
  getUsers(): UserProfile[] { return this.get<UserProfile>("users"); }
  addUser(user: UserProfile): void { const list = this.getUsers(); list.push(user); this.set("users", list); }
  updateUser(id: string, updates: Partial<UserProfile>): UserProfile {
    const list = this.getUsers(); const idx = list.findIndex(u => u.id === id);
    if (idx === -1) throw new Error("User not found");
    list[idx] = { ...list[idx], ...updates }; this.set("users", list);
    return list[idx];
  }
  deleteUser(id: string): void { const list = this.getUsers().filter(u => u.id !== id); this.set("users", list); }

  // --- Events ---
  getEvents(): ChurchEvent[] {
    return this.get<ChurchEvent>("events").sort(
      (a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
    );
  }
  addEvent(event: Omit<ChurchEvent, "id" | "created_at">): ChurchEvent {
    const list = this.get<ChurchEvent>("events");
    const newEvent: ChurchEvent = { ...event, id: crypto.randomUUID(), created_at: new Date().toISOString() };
    list.push(newEvent); this.set("events", list); return newEvent;
  }
  deleteEvent(id: string): void { this.set("events", this.get<ChurchEvent>("events").filter(e => e.id !== id)); }

  // --- Announcements ---
  getAnnouncements(): Announcement[] {
    return this.get<Announcement>("announcements").sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }
  addAnnouncement(announcement: Omit<Announcement, "id" | "created_at">): Announcement {
    const list = this.getAnnouncements();
    const newAnn: Announcement = { ...announcement, id: crypto.randomUUID(), created_at: new Date().toISOString() };
    list.push(newAnn); this.set("announcements", list); return newAnn;
  }
  deleteAnnouncement(id: string): void { this.set("announcements", this.getAnnouncements().filter(a => a.id !== id)); }

  // --- Sermons ---
  getSermons(): Sermon[] {
    return this.get<Sermon>("sermons").sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }
  addSermon(sermon: Omit<Sermon, "id" | "created_at">): Sermon {
    const list = this.getSermons();
    const newSermon: Sermon = { ...sermon, id: crypto.randomUUID(), created_at: new Date().toISOString() };
    list.push(newSermon); this.set("sermons", list); return newSermon;
  }
  deleteSermon(id: string): void { this.set("sermons", this.getSermons().filter(s => s.id !== id)); }

  // --- Weekly Reports ---
  getWeeklyReports(): WeeklyReport[] {
    return this.get<WeeklyReport>("weekly_reports").sort(
      (a, b) => new Date(b.report_date).getTime() - new Date(a.report_date).getTime()
    );
  }
  getWeeklyReportsByCell(cellId: string): WeeklyReport[] {
    return this.getWeeklyReports().filter(r => r.home_cell_id === cellId);
  }
  submitWeeklyReport(report: Omit<WeeklyReport, "id" | "created_at">): WeeklyReport {
    const list = this.getWeeklyReports();
    const cleanList = list.filter(r => !(r.home_cell_id === report.home_cell_id && r.report_date === report.report_date));
    const newReport: WeeklyReport = { ...report, id: crypto.randomUUID(), created_at: new Date().toISOString() };
    cleanList.push(newReport); this.set("weekly_reports", cleanList); return newReport;
  }

  // --- Cell Membership Requests ---
  getCellMembershipRequests(): CellMembershipRequest[] { return this.get<CellMembershipRequest>("cell_membership_requests"); }
  getCellMembershipRequestsByCell(cellId: string): CellMembershipRequest[] {
    return this.getCellMembershipRequests().filter(r => r.home_cell_id === cellId);
  }
  addCellMembershipRequest(request: Omit<CellMembershipRequest, "id" | "status" | "created_at">): CellMembershipRequest {
    const list = this.getCellMembershipRequests();
    const newRequest: CellMembershipRequest = {
      ...request, id: crypto.randomUUID(), status: "pending", created_at: new Date().toISOString()
    };
    list.push(newRequest); this.set("cell_membership_requests", list); return newRequest;
  }
  updateCellMembershipRequest(id: string, updates: Partial<CellMembershipRequest>): CellMembershipRequest {
    const list = this.getCellMembershipRequests(); const idx = list.findIndex(r => r.id === id);
    if (idx === -1) throw new Error("Membership request not found");
    list[idx] = { ...list[idx], ...updates };
    this.set("cell_membership_requests", list); return list[idx];
  }
  deleteCellMembershipRequest(id: string): void {
    const list = this.getCellMembershipRequests().filter(r => r.id !== id);
    this.set("cell_membership_requests", list);
  }

  // --- Books ---
  getBooks(): Book[] {
    return this.get<Book>("books").sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }
  getBookById(id: string): Book | undefined {
    return this.getBooks().find(b => b.id === id);
  }
  getBooksByAuthor(authorId: string): Book[] {
    return this.getBooks().filter(b => b.created_by === authorId);
  }
  addBook(book: Omit<Book, "id" | "created_at" | "updated_at">): Book {
    const list = this.getBooks();
    const newBook: Book = {
      ...book, id: crypto.randomUUID(), created_at: new Date().toISOString(), updated_at: new Date().toISOString()
    };
    list.push(newBook); this.set("books", list); return newBook;
  }
  updateBook(id: string, updates: Partial<Book>): Book {
    const list = this.getBooks(); const idx = list.findIndex(b => b.id === id);
    if (idx === -1) throw new Error("Book not found");
    list[idx] = { ...list[idx], ...updates, updated_at: new Date().toISOString() };
    this.set("books", list); return list[idx];
  }
  deleteBook(id: string): void {
    this.set("books", this.getBooks().filter(b => b.id !== id));
  }
}

export const mockDb = new LocalStorageDatabase();

// =========================================================================
// 4. UNIFIED CORE DATABASE CONTROLLER (Seamless Supabase / Local Fallback)
// =========================================================================

export const db = {
  // --- Users ---
  getUsers: async (): Promise<UserProfile[]> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("users").select("*").order("full_name", { ascending: true });
      if (error) throw error;
      return data as UserProfile[];
    }
    return mockDb.getUsers();
  },

  addUser: async (user: UserProfile): Promise<void> => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from("users").insert([user]);
      if (error) throw error;
    } else {
      mockDb.addUser(user);
    }
  },

  updateUser: async (id: string, updates: Partial<UserProfile>): Promise<UserProfile> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("users").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data as UserProfile;
    }
    return mockDb.updateUser(id, updates);
  },

  deleteUser: async (id: string): Promise<void> => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from("users").delete().eq("id", id);
      if (error) throw error;
    } else {
      mockDb.deleteUser(id);
    }
  },

  // --- Sessions & Auth ---
  getCurrentUser: async (): Promise<UserProfile | null> => {
    if (isSupabaseConfigured && supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase.from("users").select("*").eq("id", user.id).single();
      if (error || !data) {
        const role = user.user_metadata?.role || "cell_leader";
        const newProfile = {
          id: user.id,
          full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Church Member",
          email: user.email || "",
          role: role,
          is_approved: role === "cell_leader" || role === "assistant_leader" ? false : true,
          created_at: new Date().toISOString()
        };
        const { data: insertedData, error: insertError } = await supabase.from("users").insert([newProfile]).select().single();
        if (insertError) {
          console.error("Self-heal profile creation failed", insertError);
          return null;
        }
        return insertedData as UserProfile;
      }
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

  // --- Zones ---
  getZones: async (): Promise<Zone[]> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("zones").select("*").order("name", { ascending: true });
      if (error) throw error;
      return data as Zone[];
    }
    return mockDb.getZones();
  },
  addZone: async (zone: Omit<Zone, "id" | "created_at">): Promise<Zone> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("zones").insert([zone]).select().single();
      if (error) throw error;
      return data as Zone;
    }
    return mockDb.addZone(zone);
  },
  updateZone: async (id: string, updates: Partial<Zone>): Promise<Zone> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("zones").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data as Zone;
    }
    return mockDb.updateZone(id, updates);
  },
  deleteZone: async (id: string): Promise<void> => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from("zones").delete().eq("id", id);
      if (error) throw error;
    } else {
      mockDb.deleteZone(id);
    }
  },

  // --- Districts ---
  getDistricts: async (): Promise<District[]> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("districts").select("*").order("name", { ascending: true });
      if (error) throw error;
      return data as District[];
    }
    return mockDb.getDistricts();
  },
  addDistrict: async (district: Omit<District, "id" | "created_at">): Promise<District> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("districts").insert([district]).select().single();
      if (error) throw error;
      return data as District;
    }
    return mockDb.addDistrict(district);
  },
  updateDistrict: async (id: string, updates: Partial<District>): Promise<District> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("districts").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data as District;
    }
    return mockDb.updateDistrict(id, updates);
  },
  deleteDistrict: async (id: string): Promise<void> => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from("districts").delete().eq("id", id);
      if (error) throw error;
    } else {
      mockDb.deleteDistrict(id);
    }
  },

  // --- Home Cells ---
  getHomeCells: async (): Promise<HomeCell[]> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("home_cells").select("*").order("name", { ascending: true });
      if (error) throw error;
      return data as HomeCell[];
    }
    return mockDb.getHomeCells();
  },
  addHomeCell: async (cell: Omit<HomeCell, "id" | "created_at">): Promise<HomeCell> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("home_cells").insert([cell]).select().single();
      if (error) throw error;
      return data as HomeCell;
    }
    return mockDb.addHomeCell(cell);
  },
  updateHomeCell: async (id: string, updates: Partial<HomeCell>): Promise<HomeCell> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("home_cells").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data as HomeCell;
    }
    return mockDb.updateHomeCell(id, updates);
  },
  deleteHomeCell: async (id: string): Promise<void> => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from("home_cells").delete().eq("id", id);
      if (error) throw error;
    } else {
      mockDb.deleteHomeCell(id);
    }
  },

  // --- Members ---
  getMembers: async (): Promise<Member[]> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("members").select("*").order("first_name", { ascending: true });
      if (error) throw error;
      return data as Member[];
    }
    return mockDb.getMembers();
  },
  getMembersByCell: async (cellId: string): Promise<Member[]> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("members").select("*").eq("home_cell_id", cellId).order("first_name", { ascending: true });
      if (error) throw error;
      return data as Member[];
    }
    return mockDb.getMembersByCell(cellId);
  },
  addMember: async (member: Omit<Member, "id" | "created_at" | "updated_at">): Promise<Member> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("members").insert([member]).select().single();
      if (error) throw error;
      return data as Member;
    }
    return mockDb.addMember(member);
  },
  updateMember: async (id: string, updates: Partial<Member>): Promise<Member> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("members").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data as Member;
    }
    return mockDb.updateMember(id, updates);
  },

  // --- Meeting Records ---
  getMeetingRecords: async (): Promise<MeetingRecord[]> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("meeting_records").select("*").order("meeting_date", { ascending: false });
      if (error) throw error;
      return data as MeetingRecord[];
    }
    return mockDb.getMeetingRecords();
  },
  getMeetingRecordsByCell: async (cellId: string): Promise<MeetingRecord[]> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("meeting_records").select("*").eq("home_cell_id", cellId).order("meeting_date", { ascending: false });
      if (error) throw error;
      return data as MeetingRecord[];
    }
    return mockDb.getMeetingRecordsByCell(cellId);
  },
  addMeetingRecord: async (record: Omit<MeetingRecord, "id" | "created_at" | "updated_at">): Promise<MeetingRecord> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("meeting_records").insert([record]).select().single();
      if (error) throw error;
      return data as MeetingRecord;
    }
    return mockDb.addMeetingRecord(record);
  },
  updateMeetingRecord: async (id: string, updates: Partial<MeetingRecord>): Promise<MeetingRecord> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("meeting_records").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data as MeetingRecord;
    }
    return mockDb.updateMeetingRecord(id, updates);
  },
  deleteMeetingRecord: async (id: string): Promise<void> => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from("meeting_records").delete().eq("id", id);
      if (error) throw error;
    } else {
      mockDb.deleteMeetingRecord(id);
    }
  },

  // --- Attendance ---
  getAttendanceByCell: async (cellId: string, date: string): Promise<AttendanceRecord[]> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("attendance").select("*").eq("home_cell_id", cellId).eq("meeting_date", date);
      if (error) throw error;
      return data as AttendanceRecord[];
    }
    return mockDb.getAttendanceByCell(cellId, date);
  },
  getAttendanceByMeeting: async (meetingRecordId: string): Promise<AttendanceRecord[]> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("attendance").select("*").eq("meeting_record_id", meetingRecordId);
      if (error) throw error;
      return data as AttendanceRecord[];
    }
    return mockDb.getAttendanceByMeeting(meetingRecordId);
  },
  saveAttendance: async (records: Omit<AttendanceRecord, "id" | "created_at">[]): Promise<void> => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from("attendance").upsert(records, { onConflict: "member_id,meeting_record_id" });
      if (error) throw error;
    } else {
      mockDb.saveAttendance(records);
    }
  },

  // --- Visitors ---
  getVisitors: async (): Promise<Visitor[]> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("visitors").select("*").order("first_visit_date", { ascending: false });
      if (error) throw error;
      return data as Visitor[];
    }
    return mockDb.getVisitors();
  },
  getVisitorsByCell: async (cellId: string): Promise<Visitor[]> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("visitors").select("*").eq("home_cell_id", cellId).order("first_visit_date", { ascending: false });
      if (error) throw error;
      return data as Visitor[];
    }
    return mockDb.getVisitorsByCell(cellId);
  },
  addVisitor: async (visitor: Omit<Visitor, "id" | "created_at" | "updated_at">): Promise<Visitor> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("visitors").insert([visitor]).select().single();
      if (error) throw error;
      return data as Visitor;
    }
    return mockDb.addVisitor(visitor);
  },
  updateVisitor: async (id: string, updates: Partial<Visitor>): Promise<Visitor> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("visitors").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data as Visitor;
    }
    return mockDb.updateVisitor(id, updates);
  },

  // --- New Converts ---
  getNewConverts: async (): Promise<NewConvert[]> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("new_converts").select("*").order("date_of_salvation", { ascending: false });
      if (error) throw error;
      return data as NewConvert[];
    }
    return mockDb.getNewConverts();
  },
  getNewConvertsByCell: async (cellId: string): Promise<NewConvert[]> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("new_converts").select("*").eq("home_cell_id", cellId).order("date_of_salvation", { ascending: false });
      if (error) throw error;
      return data as NewConvert[];
    }
    return mockDb.getNewConvertsByCell(cellId);
  },
  addNewConvert: async (convert: Omit<NewConvert, "id" | "created_at" | "updated_at">): Promise<NewConvert> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("new_converts").insert([convert]).select().single();
      if (error) throw error;
      return data as NewConvert;
    }
    return mockDb.addNewConvert(convert);
  },
  updateNewConvert: async (id: string, updates: Partial<NewConvert>): Promise<NewConvert> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("new_converts").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data as NewConvert;
    }
    return mockDb.updateNewConvert(id, updates);
  },

  // --- Prayer Requests ---
  getPrayerRequests: async (): Promise<PrayerRequest[]> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("prayer_requests").select("*").order("date_submitted", { ascending: false });
      if (error) throw error;
      return data as PrayerRequest[];
    }
    return mockDb.getPrayerRequests();
  },
  getPrayerRequestsByCell: async (cellId: string): Promise<PrayerRequest[]> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("prayer_requests").select("*").eq("home_cell_id", cellId).order("date_submitted", { ascending: false });
      if (error) throw error;
      return data as PrayerRequest[];
    }
    return mockDb.getPrayerRequestsByCell(cellId);
  },
  addPrayerRequest: async (request: Omit<PrayerRequest, "id" | "created_at" | "updated_at">): Promise<PrayerRequest> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("prayer_requests").insert([request]).select().single();
      if (error) throw error;
      return data as PrayerRequest;
    }
    return mockDb.addPrayerRequest(request);
  },
  updatePrayerRequest: async (id: string, updates: Partial<PrayerRequest>): Promise<PrayerRequest> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("prayer_requests").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data as PrayerRequest;
    }
    return mockDb.updatePrayerRequest(id, updates);
  },

  // --- Follow Ups ---
  getFollowUps: async (): Promise<FollowUp[]> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("follow_ups").select("*").order("follow_up_date", { ascending: false });
      if (error) throw error;
      return data as FollowUp[];
    }
    return mockDb.getFollowUps();
  },
  getFollowUpsByCell: async (cellId: string): Promise<FollowUp[]> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("follow_ups").select("*").eq("home_cell_id", cellId).order("follow_up_date", { ascending: false });
      if (error) throw error;
      return data as FollowUp[];
    }
    return mockDb.getFollowUpsByCell(cellId);
  },
  addFollowUp: async (followUp: Omit<FollowUp, "id" | "created_at" | "updated_at">): Promise<FollowUp> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("follow_ups").insert([followUp]).select().single();
      if (error) throw error;
      return data as FollowUp;
    }
    return mockDb.addFollowUp(followUp);
  },
  updateFollowUp: async (id: string, updates: Partial<FollowUp>): Promise<FollowUp> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("follow_ups").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data as FollowUp;
    }
    return mockDb.updateFollowUp(id, updates);
  },

  // --- Testimonies ---
  getTestimonies: async (): Promise<Testimony[]> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("testimonies").select("*").eq("is_approved", true).eq("is_public", true).order("date_shared", { ascending: false });
      if (error) throw error;
      return data as Testimony[];
    }
    return mockDb.getTestimonies().filter(t => t.is_approved && t.is_public);
  },
  getTestimoniesByCell: async (cellId: string): Promise<Testimony[]> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("testimonies").select("*").eq("home_cell_id", cellId).order("date_shared", { ascending: false });
      if (error) throw error;
      return data as Testimony[];
    }
    return mockDb.getTestimoniesByCell(cellId);
  },
  addTestimony: async (testimony: Omit<Testimony, "id" | "created_at" | "updated_at">): Promise<Testimony> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("testimonies").insert([testimony]).select().single();
      if (error) throw error;
      return data as Testimony;
    }
    return mockDb.addTestimony(testimony);
  },
  updateTestimony: async (id: string, updates: Partial<Testimony>): Promise<Testimony> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("testimonies").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data as Testimony;
    }
    return mockDb.updateTestimony(id, updates);
  },

  // --- Offerings ---
  getOfferings: async (): Promise<Offering[]> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("offerings").select("*").order("meeting_date", { ascending: false });
      if (error) throw error;
      return data as Offering[];
    }
    return mockDb.getOfferings();
  },
  getOfferingsByCell: async (cellId: string): Promise<Offering[]> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("offerings").select("*").eq("home_cell_id", cellId).order("meeting_date", { ascending: false });
      if (error) throw error;
      return data as Offering[];
    }
    return mockDb.getOfferingsByCell(cellId);
  },
  addOffering: async (offering: Omit<Offering, "id" | "created_at" | "updated_at" | "total_amount">): Promise<Offering> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("offerings").insert([offering]).select().single();
      if (error) throw error;
      return data as Offering;
    }
    return mockDb.addOffering(offering);
  },
  updateOffering: async (id: string, updates: Partial<Offering>): Promise<Offering> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("offerings").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data as Offering;
    }
    return mockDb.updateOffering(id, updates);
  },

  // --- Weekly Reports ---
  getWeeklyReports: async (): Promise<WeeklyReport[]> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("weekly_reports").select("*").order("report_date", { ascending: false });
      if (error) throw error;
      return data as WeeklyReport[];
    }
    return mockDb.getWeeklyReports();
  },
  getWeeklyReportsByCell: async (cellId: string): Promise<WeeklyReport[]> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("weekly_reports").select("*").eq("home_cell_id", cellId).order("report_date", { ascending: false });
      if (error) throw error;
      return data as WeeklyReport[];
    }
    return mockDb.getWeeklyReportsByCell(cellId);
  },
  submitWeeklyReport: async (report: Omit<WeeklyReport, "id" | "created_at">): Promise<WeeklyReport> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("weekly_reports").upsert(report, { onConflict: "home_cell_id,report_date" }).select().single();
      if (error) throw error;
      return data as WeeklyReport;
    }
    return mockDb.submitWeeklyReport(report);
  },

  // --- Cell Membership Requests ---
  getCellMembershipRequests: async (): Promise<CellMembershipRequest[]> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("cell_membership_requests").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as CellMembershipRequest[];
    }
    return mockDb.getCellMembershipRequests();
  },
  getCellMembershipRequestsByCell: async (cellId: string): Promise<CellMembershipRequest[]> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("cell_membership_requests").select("*").eq("home_cell_id", cellId).order("created_at", { ascending: false });
      if (error) throw error;
      return data as CellMembershipRequest[];
    }
    return mockDb.getCellMembershipRequestsByCell(cellId);
  },
  addCellMembershipRequest: async (request: Omit<CellMembershipRequest, "id" | "status" | "created_at">): Promise<CellMembershipRequest> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("cell_membership_requests").insert([request]).select().single();
      if (error) throw error;
      return data as CellMembershipRequest;
    }
    return mockDb.addCellMembershipRequest(request);
  },
  updateCellMembershipRequest: async (id: string, updates: Partial<CellMembershipRequest>): Promise<CellMembershipRequest> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("cell_membership_requests").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data as CellMembershipRequest;
    }
    return mockDb.updateCellMembershipRequest(id, updates);
  },
  deleteCellMembershipRequest: async (id: string): Promise<void> => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from("cell_membership_requests").delete().eq("id", id);
      if (error) throw error;
    } else {
      mockDb.deleteCellMembershipRequest(id);
    }
  },

  // --- Books ---
  getBooks: async (): Promise<Book[]> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("books").select("*").eq("is_approved", true).order("created_at", { ascending: false });
      if (error) throw error;
      return data as Book[];
    }
    return mockDb.getBooks().filter(b => b.is_approved);
  },
  getBookById: async (id: string): Promise<Book | null> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("books").select("*").eq("id", id).single();
      if (error) return null;
      return data as Book;
    }
    return mockDb.getBookById(id) || null;
  },
  getBooksByAuthor: async (authorId: string): Promise<Book[]> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("books").select("*").eq("created_by", authorId).order("created_at", { ascending: false });
      if (error) throw error;
      return data as Book[];
    }
    return mockDb.getBooksByAuthor(authorId);
  },
  addBook: async (book: Omit<Book, "id" | "created_at" | "updated_at">): Promise<Book> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("books").insert([book]).select().single();
      if (error) throw error;
      return data as Book;
    }
    return mockDb.addBook(book);
  },
  updateBook: async (id: string, updates: Partial<Book>): Promise<Book> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("books").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data as Book;
    }
    return mockDb.updateBook(id, updates);
  },
  deleteBook: async (id: string): Promise<void> => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from("books").delete().eq("id", id);
      if (error) throw error;
    } else {
      mockDb.deleteBook(id);
    }
  },

  // --- Events ---
  getEvents: async (): Promise<ChurchEvent[]> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("events").select("*").order("event_date", { ascending: true });
      if (error) throw error;
      return data as ChurchEvent[];
    }
    return mockDb.getEvents();
  },
  addEvent: async (event: Omit<ChurchEvent, "id" | "created_at">): Promise<ChurchEvent> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("events").insert([event]).select().single();
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
      const { data, error } = await supabase.from("announcements").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Announcement[];
    }
    return mockDb.getAnnouncements();
  },
  addAnnouncement: async (announcement: Omit<Announcement, "id" | "created_at">): Promise<Announcement> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("announcements").insert([announcement]).select().single();
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
      const { data, error } = await supabase.from("sermons").select("*").order("date", { ascending: false });
      if (error) throw error;
      return data as Sermon[];
    }
    return mockDb.getSermons();
  },
  addSermon: async (sermon: Omit<Sermon, "id" | "created_at">): Promise<Sermon> => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from("sermons").insert([sermon]).select().single();
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
};
