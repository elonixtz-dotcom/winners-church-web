-- =========================================================================
-- WINNERS CHAPEL INTERNATIONAL, UKONGA BANANA, DAR ES SALAAM
-- COMPREHENSIVE HOME CELL MANAGEMENT SYSTEM - SUPABASE POSTGRESQL DATABASE SCHEMA
-- =========================================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clean existing tables if needed (doing a fresh reset) - reverse order of dependencies
DROP TABLE IF EXISTS cell_membership_requests CASCADE;
DROP TABLE IF EXISTS announcements CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS books CASCADE;
DROP TABLE IF EXISTS weekly_reports CASCADE;
DROP TABLE IF EXISTS offerings CASCADE;
DROP TABLE IF EXISTS testimonies CASCADE;
DROP TABLE IF EXISTS follow_ups CASCADE;
DROP TABLE IF EXISTS prayer_requests CASCADE;
DROP TABLE IF EXISTS new_converts CASCADE;
DROP TABLE IF EXISTS visitors CASCADE;
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS meeting_records CASCADE;
DROP TABLE IF EXISTS members CASCADE;
DROP TABLE IF EXISTS home_cells CASCADE;
DROP TABLE IF EXISTS districts CASCADE;
DROP TABLE IF EXISTS zones CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- =========================================================================
-- 1. USERS TABLE (Profiles connected to Supabase Auth - Extended roles)
-- =========================================================================
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (
        role IN ('super_admin', 'church_admin', 'district_pastor', 'zone_pastor', 'cell_leader', 'assistant_leader', 'media_team')
    ),
    home_cell_id UUID,
    is_approved BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =========================================================================
-- 2. ZONES TABLE (For hierarchical structure - Zone > District > Cell)
-- =========================================================================
CREATE TABLE zones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    zone_pastor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =========================================================================
-- 3. DISTRICTS TABLE
-- =========================================================================
CREATE TABLE districts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    zone_id UUID REFERENCES zones(id) ON DELETE SET NULL,
    district_pastor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =========================================================================
-- 4. HOME CELLS TABLE (WSF Centers - Enhanced)
-- =========================================================================
CREATE TABLE home_cells (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    cell_code TEXT UNIQUE,
    location TEXT NOT NULL,
    address TEXT NOT NULL,
    meeting_day TEXT NOT NULL,
    meeting_time TEXT NOT NULL,
    leader_id UUID REFERENCES users(id) ON DELETE SET NULL,
    assistant_leader_id UUID REFERENCES users(id) ON DELETE SET NULL,
    district_id UUID REFERENCES districts(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add foreign key constraint to users after home_cells is created
ALTER TABLE users 
ADD CONSTRAINT fk_user_home_cell 
FOREIGN KEY (home_cell_id) REFERENCES home_cells(id) ON DELETE SET NULL;

-- =========================================================================
-- 5. MEMBERS TABLE (Enhanced)
-- =========================================================================
CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    gender TEXT NOT NULL CHECK (gender IN ('Male', 'Female')),
    phone_number TEXT NOT NULL,
    email TEXT,
    date_of_birth DATE,
    marital_status TEXT CHECK (marital_status IN ('Single', 'Married', 'Widowed', 'Divorced')),
    occupation TEXT,
    address TEXT NOT NULL,
    home_cell_id UUID REFERENCES home_cells(id) ON DELETE CASCADE NOT NULL,
    date_joined DATE NOT NULL DEFAULT CURRENT_DATE,
    membership_status TEXT NOT NULL DEFAULT 'active' CHECK (membership_status IN ('active', 'inactive', 'transferred')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =========================================================================
-- 6. MEETING RECORDS TABLE
-- =========================================================================
CREATE TABLE meeting_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    home_cell_id UUID REFERENCES home_cells(id) ON DELETE CASCADE NOT NULL,
    meeting_date DATE NOT NULL,
    meeting_topic TEXT NOT NULL,
    bible_scripture TEXT,
    meeting_notes TEXT,
    total_attendance INTEGER NOT NULL DEFAULT 0 CHECK (total_attendance >= 0),
    meeting_status TEXT NOT NULL DEFAULT 'completed' CHECK (meeting_status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE (home_cell_id, meeting_date)
);

-- =========================================================================
-- 7. ATTENDANCE TABLE (Enhanced)
-- =========================================================================
CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE NOT NULL,
    home_cell_id UUID REFERENCES home_cells(id) ON DELETE CASCADE NOT NULL,
    meeting_record_id UUID REFERENCES meeting_records(id) ON DELETE CASCADE NOT NULL,
    meeting_date DATE NOT NULL,
    present BOOLEAN NOT NULL DEFAULT FALSE,
    arrival_time TIME,
    reason_for_absence TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE (member_id, meeting_record_id)
);

-- =========================================================================
-- 8. VISITORS TABLE (Enhanced)
-- =========================================================================
CREATE TABLE visitors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    gender TEXT NOT NULL CHECK (gender IN ('Male', 'Female')),
    address TEXT,
    invited_by TEXT,
    first_visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
    number_of_visits INTEGER NOT NULL DEFAULT 1 CHECK (number_of_visits >= 1),
    follow_up_status TEXT NOT NULL DEFAULT 'New' CHECK (
        follow_up_status IN ('New', 'Contacted', 'Awaiting Visit', 'Joined Church', 'Not Interested')
    ),
    home_cell_id UUID REFERENCES home_cells(id) ON DELETE CASCADE NOT NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =========================================================================
-- 9. NEW CONVERTS TABLE
-- =========================================================================
CREATE TABLE new_converts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    date_of_salvation DATE NOT NULL DEFAULT CURRENT_DATE,
    baptism_status TEXT NOT NULL DEFAULT 'not_baptized' CHECK (
        baptism_status IN ('not_baptized', 'scheduled', 'baptized')
    ),
    baptism_date DATE,
    foundation_class_status TEXT NOT NULL DEFAULT 'not_started' CHECK (
        foundation_class_status IN ('not_started', 'in_progress', 'completed')
    ),
    assigned_follow_up_leader_id UUID REFERENCES users(id) ON DELETE SET NULL,
    home_cell_id UUID REFERENCES home_cells(id) ON DELETE CASCADE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =========================================================================
-- 10. PRAYER REQUESTS TABLE
-- =========================================================================
CREATE TABLE prayer_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES members(id) ON DELETE SET NULL,
    member_name TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'general' CHECK (
        category IN ('salvation', 'healing', 'deliverance', 'finances', 'family', 'career', 'spiritual_growth', 'general')
    ),
    description TEXT NOT NULL,
    date_submitted DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (
        status IN ('pending', 'in_prayer', 'answered', 'closed')
    ),
    testimony_received BOOLEAN DEFAULT FALSE,
    home_cell_id UUID REFERENCES home_cells(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =========================================================================
-- 11. FOLLOW UPS TABLE
-- =========================================================================
CREATE TABLE follow_ups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    person_name TEXT NOT NULL,
    person_type TEXT NOT NULL CHECK (person_type IN ('member', 'visitor', 'new_convert')),
    person_id UUID,
    follow_up_date DATE NOT NULL,
    follow_up_method TEXT NOT NULL CHECK (
        follow_up_method IN ('phone_call', 'text_message', 'home_visit', 'whatsapp', 'other')
    ),
    outcome TEXT NOT NULL,
    next_action TEXT,
    next_follow_up_date DATE,
    followed_up_by UUID REFERENCES users(id) ON DELETE SET NULL,
    home_cell_id UUID REFERENCES home_cells(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =========================================================================
-- 12. TESTIMONIES TABLE
-- =========================================================================
CREATE TABLE testimonies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES members(id) ON DELETE SET NULL,
    member_name TEXT NOT NULL,
    testimony_title TEXT NOT NULL,
    description TEXT NOT NULL,
    date_shared DATE NOT NULL DEFAULT CURRENT_DATE,
    is_approved BOOLEAN DEFAULT FALSE NOT NULL,
    is_public BOOLEAN DEFAULT FALSE NOT NULL,
    home_cell_id UUID REFERENCES home_cells(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =========================================================================
-- 13. OFFERINGS TABLE
-- =========================================================================
CREATE TABLE offerings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_date DATE NOT NULL,
    meeting_record_id UUID REFERENCES meeting_records(id) ON DELETE SET NULL,
    offering_amount NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (offering_amount >= 0),
    special_contributions NUMERIC(10,2) DEFAULT 0 CHECK (special_contributions >= 0),
    total_amount NUMERIC(10,2) GENERATED ALWAYS AS (offering_amount + COALESCE(special_contributions, 0)) STORED,
    recorded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    submission_status TEXT NOT NULL DEFAULT 'pending' CHECK (
        submission_status IN ('pending', 'submitted', 'approved')
    ),
    home_cell_id UUID REFERENCES home_cells(id) ON DELETE CASCADE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE (home_cell_id, meeting_date)
);

-- =========================================================================
-- 14. WEEKLY REPORTS TABLE (Enhanced)
-- =========================================================================
CREATE TABLE weekly_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    home_cell_id UUID REFERENCES home_cells(id) ON DELETE CASCADE NOT NULL,
    leader_id UUID REFERENCES users(id) ON DELETE SET NULL,
    report_date DATE NOT NULL,
    total_members INTEGER NOT NULL DEFAULT 0 CHECK (total_members >= 0),
    members_present INTEGER NOT NULL DEFAULT 0 CHECK (members_present >= 0),
    members_absent INTEGER NOT NULL DEFAULT 0 CHECK (members_absent >= 0),
    visitors INTEGER NOT NULL DEFAULT 0 CHECK (visitors >= 0),
    new_converts INTEGER NOT NULL DEFAULT 0 CHECK (new_converts >= 0),
    baptisms INTEGER NOT NULL DEFAULT 0 CHECK (baptisms >= 0),
    prayer_requests INTEGER NOT NULL DEFAULT 0 CHECK (prayer_requests >= 0),
    testimonies INTEGER NOT NULL DEFAULT 0 CHECK (testimonies >= 0),
    follow_ups_completed INTEGER NOT NULL DEFAULT 0 CHECK (follow_ups_completed >= 0),
    total_offering NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (total_offering >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE (home_cell_id, report_date)
);

-- =========================================================================
-- 15. BOOKS TABLE (Already added)
-- =========================================================================
CREATE TABLE books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    subtitle TEXT,
    author TEXT NOT NULL,
    description TEXT NOT NULL,
    synopsis TEXT,
    isbn TEXT,
    publication_date DATE,
    page_count INTEGER,
    price NUMERIC(10,2),
    currency TEXT DEFAULT 'USD',
    purchase_link TEXT,
    categories TEXT[],
    cover_image_url TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    is_approved BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =========================================================================
-- 16. EVENTS TABLE (Public announcements / flyers - existing)
-- =========================================================================
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    image_url TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =========================================================================
-- 17. ANNOUNCEMENTS TABLE (For public / homepage - existing)
-- =========================================================================
CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =========================================================================
-- 18. CELL MEMBERSHIP REQUESTS TABLE (Existing)
-- =========================================================================
CREATE TABLE cell_membership_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    gender TEXT NOT NULL CHECK (gender IN ('Male', 'Female')),
    phone_number TEXT NOT NULL,
    address TEXT NOT NULL,
    occupation TEXT,
    marital_status TEXT CHECK (marital_status IN ('Single', 'Married', 'Widowed', 'Divorced')),
    home_cell_id UUID REFERENCES home_cells(id) ON DELETE CASCADE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    notes TEXT,
    processed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =========================================================================
-- INDEXES FOR PERFORMANCE
-- =========================================================================
CREATE INDEX idx_home_cells_district ON home_cells(district_id);
CREATE INDEX idx_home_cells_leader ON home_cells(leader_id);
CREATE INDEX idx_members_cell ON members(home_cell_id);
CREATE INDEX idx_attendance_member ON attendance(member_id);
CREATE INDEX idx_attendance_meeting ON attendance(meeting_record_id);
CREATE INDEX idx_attendance_date ON attendance(meeting_date);
CREATE INDEX idx_visitors_cell ON visitors(home_cell_id);
CREATE INDEX idx_new_converts_cell ON new_converts(home_cell_id);
CREATE INDEX idx_prayer_requests_cell ON prayer_requests(home_cell_id);
CREATE INDEX idx_follow_ups_cell ON follow_ups(home_cell_id);
CREATE INDEX idx_testimonies_cell ON testimonies(home_cell_id);
CREATE INDEX idx_offerings_cell ON offerings(home_cell_id);
CREATE INDEX idx_weekly_reports_cell ON weekly_reports(home_cell_id);
CREATE INDEX idx_meeting_records_cell ON meeting_records(home_cell_id);
CREATE INDEX idx_users_role ON users(role);

-- =========================================================================
-- HELPER FUNCTIONS FOR RLS
-- =========================================================================

CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN (SELECT role FROM public.users WHERE id = user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_user_home_cell(user_id UUID)
RETURNS UUID AS $$
BEGIN
  RETURN (SELECT home_cell_id FROM public.users WHERE id = user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

-- Enable RLS on all tables
ALTER TABLE zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE home_cells ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE new_converts ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonies ENABLE ROW LEVEL SECURITY;
ALTER TABLE offerings ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE cell_membership_requests ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- ZONES POLICIES
-- =========================================================================
CREATE POLICY "All authenticated users can read zones" ON zones FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins and super admins can manage zones" ON zones FOR ALL USING (
    public.get_user_role(auth.uid()) IN ('super_admin', 'church_admin')
);

-- =========================================================================
-- DISTRICTS POLICIES
-- =========================================================================
CREATE POLICY "All authenticated users can read districts" ON districts FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins, super admins, and zone pastors can manage districts" ON districts FOR ALL USING (
    public.get_user_role(auth.uid()) IN ('super_admin', 'church_admin', 'zone_pastor')
);

-- =========================================================================
-- USERS POLICIES
-- =========================================================================
CREATE POLICY "All authenticated users can read all profiles" ON users FOR SELECT USING (true);
CREATE POLICY "Super admins and church admins can manage users" ON users FOR ALL USING (
    public.get_user_role(auth.uid()) IN ('super_admin', 'church_admin')
);
CREATE POLICY "Users can edit their own profile" ON users FOR UPDATE USING (id = auth.uid());

-- =========================================================================
-- HOME CELLS POLICIES
-- =========================================================================
CREATE POLICY "All authenticated users can read cells" ON home_cells FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Super admins, church admins, zone, and district pastors can manage cells" ON home_cells FOR ALL USING (
    public.get_user_role(auth.uid()) IN ('super_admin', 'church_admin', 'zone_pastor', 'district_pastor')
);
CREATE POLICY "Cell leaders and assistants can edit their cell info" ON home_cells FOR UPDATE USING (
    leader_id = auth.uid() OR assistant_leader_id = auth.uid() OR
    public.get_user_role(auth.uid()) IN ('super_admin', 'church_admin', 'zone_pastor', 'district_pastor')
);

-- =========================================================================
-- MEMBERS POLICIES
-- =========================================================================
CREATE POLICY "Super admins, church admins, zone, district pastors can read all members" ON members FOR SELECT USING (
    public.get_user_role(auth.uid()) IN ('super_admin', 'church_admin', 'zone_pastor', 'district_pastor')
);
CREATE POLICY "Cell leaders and assistants can manage their cell members" ON members FOR ALL USING (
    home_cell_id = public.get_user_home_cell(auth.uid()) OR
    public.get_user_role(auth.uid()) IN ('super_admin', 'church_admin', 'zone_pastor', 'district_pastor')
);

-- =========================================================================
-- MEETING RECORDS POLICIES
-- =========================================================================
CREATE POLICY "Pastors and admins can read all meeting records" ON meeting_records FOR SELECT USING (
    public.get_user_role(auth.uid()) IN ('super_admin', 'church_admin', 'zone_pastor', 'district_pastor')
);
CREATE POLICY "Cell leaders and assistants can manage their cell meeting records" ON meeting_records FOR ALL USING (
    home_cell_id = public.get_user_home_cell(auth.uid()) OR
    public.get_user_role(auth.uid()) IN ('super_admin', 'church_admin', 'zone_pastor', 'district_pastor')
);

-- =========================================================================
-- ATTENDANCE POLICIES
-- =========================================================================
CREATE POLICY "Pastors and admins can read all attendance" ON attendance FOR SELECT USING (
    public.get_user_role(auth.uid()) IN ('super_admin', 'church_admin', 'zone_pastor', 'district_pastor')
);
CREATE POLICY "Cell leaders and assistants can manage their cell attendance" ON attendance FOR ALL USING (
    home_cell_id = public.get_user_home_cell(auth.uid()) OR
    public.get_user_role(auth.uid()) IN ('super_admin', 'church_admin', 'zone_pastor', 'district_pastor')
);

-- =========================================================================
-- VISITORS POLICIES
-- =========================================================================
CREATE POLICY "Pastors and admins can read all visitors" ON visitors FOR SELECT USING (
    public.get_user_role(auth.uid()) IN ('super_admin', 'church_admin', 'zone_pastor', 'district_pastor')
);
CREATE POLICY "Cell leaders and assistants can manage their cell visitors" ON visitors FOR ALL USING (
    home_cell_id = public.get_user_home_cell(auth.uid()) OR
    public.get_user_role(auth.uid()) IN ('super_admin', 'church_admin', 'zone_pastor', 'district_pastor')
);

-- =========================================================================
-- NEW CONVERTS POLICIES
-- =========================================================================
CREATE POLICY "Pastors and admins can read all new converts" ON new_converts FOR SELECT USING (
    public.get_user_role(auth.uid()) IN ('super_admin', 'church_admin', 'zone_pastor', 'district_pastor')
);
CREATE POLICY "Cell leaders and assistants can manage their cell new converts" ON new_converts FOR ALL USING (
    home_cell_id = public.get_user_home_cell(auth.uid()) OR
    public.get_user_role(auth.uid()) IN ('super_admin', 'church_admin', 'zone_pastor', 'district_pastor')
);

-- =========================================================================
-- PRAYER REQUESTS POLICIES
-- =========================================================================
CREATE POLICY "Pastors and admins can read all prayer requests" ON prayer_requests FOR SELECT USING (
    public.get_user_role(auth.uid()) IN ('super_admin', 'church_admin', 'zone_pastor', 'district_pastor')
);
CREATE POLICY "Cell leaders and assistants can manage their cell prayer requests" ON prayer_requests FOR ALL USING (
    home_cell_id = public.get_user_home_cell(auth.uid()) OR
    public.get_user_role(auth.uid()) IN ('super_admin', 'church_admin', 'zone_pastor', 'district_pastor')
);

-- =========================================================================
-- FOLLOW UPS POLICIES
-- =========================================================================
CREATE POLICY "Pastors and admins can read all follow ups" ON follow_ups FOR SELECT USING (
    public.get_user_role(auth.uid()) IN ('super_admin', 'church_admin', 'zone_pastor', 'district_pastor')
);
CREATE POLICY "Cell leaders and assistants can manage their cell follow ups" ON follow_ups FOR ALL USING (
    home_cell_id = public.get_user_home_cell(auth.uid()) OR
    public.get_user_role(auth.uid()) IN ('super_admin', 'church_admin', 'zone_pastor', 'district_pastor')
);

-- =========================================================================
-- TESTIMONIES POLICIES
-- =========================================================================
CREATE POLICY "Anyone can read approved public testimonies" ON testimonies FOR SELECT USING (is_approved AND is_public);
CREATE POLICY "Pastors and admins can read all testimonies" ON testimonies FOR SELECT USING (
    public.get_user_role(auth.uid()) IN ('super_admin', 'church_admin', 'zone_pastor', 'district_pastor')
);
CREATE POLICY "Cell leaders and assistants can manage their cell testimonies" ON testimonies FOR ALL USING (
    home_cell_id = public.get_user_home_cell(auth.uid()) OR
    public.get_user_role(auth.uid()) IN ('super_admin', 'church_admin', 'zone_pastor', 'district_pastor')
);

-- =========================================================================
-- OFFERINGS POLICIES
-- =========================================================================
CREATE POLICY "Super admins and church admins can read all offerings" ON offerings FOR SELECT USING (
    public.get_user_role(auth.uid()) IN ('super_admin', 'church_admin')
);
CREATE POLICY "Cell leaders and assistants can manage their cell offerings" ON offerings FOR ALL USING (
    home_cell_id = public.get_user_home_cell(auth.uid()) OR
    public.get_user_role(auth.uid()) IN ('super_admin', 'church_admin', 'zone_pastor', 'district_pastor')
);

-- =========================================================================
-- WEEKLY REPORTS POLICIES
-- =========================================================================
CREATE POLICY "Pastors and admins can read all weekly reports" ON weekly_reports FOR SELECT USING (
    public.get_user_role(auth.uid()) IN ('super_admin', 'church_admin', 'zone_pastor', 'district_pastor')
);
CREATE POLICY "Cell leaders and assistants can manage their cell weekly reports" ON weekly_reports FOR ALL USING (
    home_cell_id = public.get_user_home_cell(auth.uid()) OR
    public.get_user_role(auth.uid()) IN ('super_admin', 'church_admin', 'zone_pastor', 'district_pastor')
);

-- =========================================================================
-- BOOKS POLICIES
-- =========================================================================
CREATE POLICY "Anyone can read approved books" ON books FOR SELECT USING (is_approved);
CREATE POLICY "Super admins and church admins can manage all books" ON books FOR ALL USING (
    public.get_user_role(auth.uid()) IN ('super_admin', 'church_admin', 'media_team')
);

-- =========================================================================
-- EVENTS POLICIES
-- =========================================================================
CREATE POLICY "Anyone can read events" ON events FOR SELECT USING (true);
CREATE POLICY "Media, pastors, and admins can manage events" ON events FOR ALL USING (
    public.get_user_role(auth.uid()) IN ('super_admin', 'church_admin', 'media_team')
);

-- =========================================================================
-- ANNOUNCEMENTS POLICIES
-- =========================================================================
CREATE POLICY "Anyone can read announcements" ON announcements FOR SELECT USING (true);
CREATE POLICY "Media, pastors, and admins can manage announcements" ON announcements FOR ALL USING (
    public.get_user_role(auth.uid()) IN ('super_admin', 'church_admin', 'media_team')
);

-- =========================================================================
-- CELL MEMBERSHIP REQUESTS POLICIES
-- =========================================================================
CREATE POLICY "Anyone can submit a membership request" ON cell_membership_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Pastors and admins can view all requests" ON cell_membership_requests FOR SELECT USING (
    public.get_user_role(auth.uid()) IN ('super_admin', 'church_admin', 'zone_pastor', 'district_pastor')
);
CREATE POLICY "Cell leaders and assistants can view requests for their cell" ON cell_membership_requests FOR SELECT USING (
    home_cell_id = public.get_user_home_cell(auth.uid()) OR
    public.get_user_role(auth.uid()) IN ('super_admin', 'church_admin', 'zone_pastor', 'district_pastor')
);
CREATE POLICY "Cell leaders, assistants, and admins can manage requests for their cell" ON cell_membership_requests FOR UPDATE USING (
    home_cell_id = public.get_user_home_cell(auth.uid()) OR
    public.get_user_role(auth.uid()) IN ('super_admin', 'church_admin', 'zone_pastor', 'district_pastor')
);
CREATE POLICY "Pastors and admins can delete requests" ON cell_membership_requests FOR DELETE USING (
    public.get_user_role(auth.uid()) IN ('super_admin', 'church_admin')
);

-- =========================================================================
-- AUTOMATIC USER SYNC TRIGGER
-- =========================================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, full_name, email, role, is_approved)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'cell_leader'),
    CASE 
      WHEN COALESCE(new.raw_user_meta_data->>'role', 'cell_leader') IN ('cell_leader', 'assistant_leader') THEN FALSE
      ELSE TRUE
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
