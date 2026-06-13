-- =========================================================================
-- WINNERS CHAPEL INTERNATIONAL, UKONGA BANANA, DAR ES SALAAM
-- SUPABASE POSTGRESQL DATABASE SCHEMA (ZERO DEMO DATA)
-- =========================================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clean existing tables if needed (doing a fresh reset)
DROP TABLE IF EXISTS weekly_reports CASCADE;
DROP TABLE IF EXISTS announcements CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS visitors CASCADE;
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS members CASCADE;
DROP TABLE IF EXISTS home_cells CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- =========================================================================
-- 1. USERS TABLE (Profiles connected to Supabase Auth)
-- =========================================================================
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('pastor_admin', 'media_team', 'cell_leader')),
    home_cell_id UUID, -- Nullable if not a cell leader, or references home_cells
    is_approved BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =========================================================================
-- 2. HOME CELLS TABLE (WSF Centers)
-- =========================================================================
CREATE TABLE home_cells (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    address TEXT NOT NULL,
    meeting_day TEXT NOT NULL,
    meeting_time TEXT NOT NULL,
    leader_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add foreign key constraint to users after home_cells is created
ALTER TABLE users 
ADD CONSTRAINT fk_user_home_cell 
FOREIGN KEY (home_cell_id) REFERENCES home_cells(id) ON DELETE SET NULL;

-- =========================================================================
-- 3. MEMBERS TABLE
-- =========================================================================
CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    gender TEXT NOT NULL CHECK (gender IN ('Male', 'Female')),
    phone_number TEXT NOT NULL,
    address TEXT NOT NULL,
    occupation TEXT,
    marital_status TEXT CHECK (marital_status IN ('Single', 'Married', 'Widowed', 'Divorced')),
    home_cell_id UUID REFERENCES home_cells(id) ON DELETE CASCADE NOT NULL,
    date_joined DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =========================================================================
-- 4. ATTENDANCE TABLE
-- =========================================================================
CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE NOT NULL,
    home_cell_id UUID REFERENCES home_cells(id) ON DELETE CASCADE NOT NULL,
    meeting_date DATE NOT NULL,
    present BOOLEAN NOT NULL DEFAULT FALSE,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE (member_id, meeting_date)
);

-- =========================================================================
-- 5. VISITORS TABLE
-- =========================================================================
CREATE TABLE visitors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    invited_by TEXT NOT NULL,
    visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
    follow_up_status TEXT NOT NULL CHECK (follow_up_status IN ('New', 'Contacted', 'Awaiting Visit', 'Joined Church')),
    home_cell_id UUID REFERENCES home_cells(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =========================================================================
-- 6. EVENTS TABLE (Public announcements / flyers)
-- =========================================================================
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    image_url TEXT, -- URL of uploaded flyer
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =========================================================================
-- 7. ANNOUNCEMENTS TABLE (For public / homepage)
-- =========================================================================
CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- =========================================================================
-- 8. WEEKLY REPORTS TABLE (Submitted by Cell Leaders)
-- =========================================================================
CREATE TABLE weekly_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    home_cell_id UUID REFERENCES home_cells(id) ON DELETE CASCADE NOT NULL,
    leader_id UUID REFERENCES users(id) ON DELETE SET NULL,
    total_attendance INTEGER NOT NULL CHECK (total_attendance >= 0),
    total_visitors INTEGER NOT NULL CHECK (total_visitors >= 0),
    souls_won INTEGER NOT NULL DEFAULT 0 CHECK (souls_won >= 0),
    report_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE (home_cell_id, report_date)
);

-- =========================================================================
-- 9. CELL MEMBERSHIP REQUESTS TABLE (Public registration with approval workflow)
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
-- ROW LEVEL SECURITY (RLS) & POLICIES SETUP
-- =========================================================================

-- Helper function to fetch user role securely bypassing RLS recursion loops
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN (SELECT role FROM public.users WHERE id = user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to fetch user cell assignment securely bypassing RLS recursion loops
CREATE OR REPLACE FUNCTION public.get_user_home_cell(user_id UUID)
RETURNS UUID AS $$
BEGIN
  RETURN (SELECT home_cell_id FROM public.users WHERE id = user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE home_cells ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE cell_membership_requests ENABLE ROW LEVEL SECURITY;

-- -------------------------------------------------------------------------
-- Users Table Policies
-- -------------------------------------------------------------------------
CREATE POLICY "Users can read all profiles"
    ON users FOR SELECT USING (true);

CREATE POLICY "Pastor/Admin can insert profiles"
    ON users FOR INSERT WITH CHECK (
        public.get_user_role(auth.uid()) = 'pastor_admin'
    );

CREATE POLICY "Pastor/Admin can update profiles"
    ON users FOR UPDATE USING (
        public.get_user_role(auth.uid()) = 'pastor_admin'
    );

CREATE POLICY "Pastor/Admin can delete profiles"
    ON users FOR DELETE USING (
        public.get_user_role(auth.uid()) = 'pastor_admin'
    );

CREATE POLICY "Users can edit their own profile"
    ON users FOR UPDATE USING (id = auth.uid());

-- -------------------------------------------------------------------------
-- Home Cells Table Policies
-- -------------------------------------------------------------------------
CREATE POLICY "All authenticated users can read cells"
    ON home_cells FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Pastor/Admin can manage cells"
    ON home_cells FOR ALL USING (
        public.get_user_role(auth.uid()) = 'pastor_admin'
    );

CREATE POLICY "Cell leaders can read and edit their assigned cell info"
    ON home_cells FOR UPDATE USING (
        leader_id = auth.uid() OR
        public.get_user_role(auth.uid()) = 'pastor_admin'
    );

-- -------------------------------------------------------------------------
-- Members Table Policies
-- -------------------------------------------------------------------------
CREATE POLICY "Pastor/Admin and Media can read all members"
    ON members FOR SELECT USING (
        public.get_user_role(auth.uid()) IN ('pastor_admin', 'media_team')
    );

CREATE POLICY "Home Cell Leaders can manage members of their own cell"
    ON members FOR ALL USING (
        home_cell_id = public.get_user_home_cell(auth.uid()) OR
        public.get_user_role(auth.uid()) = 'pastor_admin'
    );

-- -------------------------------------------------------------------------
-- Attendance Table Policies
-- -------------------------------------------------------------------------
CREATE POLICY "Pastor/Admin can view all attendance"
    ON attendance FOR SELECT USING (
        public.get_user_role(auth.uid()) = 'pastor_admin'
    );

CREATE POLICY "Cell Leaders can manage attendance of their own cell"
    ON attendance FOR ALL USING (
        home_cell_id = public.get_user_home_cell(auth.uid()) OR
        public.get_user_role(auth.uid()) = 'pastor_admin'
    );

-- -------------------------------------------------------------------------
-- Visitors Table Policies
-- -------------------------------------------------------------------------
CREATE POLICY "Pastor/Admin can view all visitors"
    ON visitors FOR SELECT USING (
        public.get_user_role(auth.uid()) = 'pastor_admin'
    );

CREATE POLICY "Cell Leaders can manage visitors of their own cell"
    ON visitors FOR ALL USING (
        home_cell_id = public.get_user_home_cell(auth.uid()) OR
        public.get_user_role(auth.uid()) = 'pastor_admin'
    );

-- -------------------------------------------------------------------------
-- Events Table Policies
-- -------------------------------------------------------------------------
CREATE POLICY "Anyone can read events"
    ON events FOR SELECT USING (true);

CREATE POLICY "Media and Pastor can manage events"
    ON events FOR ALL USING (
        public.get_user_role(auth.uid()) IN ('pastor_admin', 'media_team')
    );

-- -------------------------------------------------------------------------
-- Announcements Table Policies
-- -------------------------------------------------------------------------
CREATE POLICY "Anyone can read announcements"
    ON announcements FOR SELECT USING (true);

CREATE POLICY "Media and Pastor can manage announcements"
    ON announcements FOR ALL USING (
        public.get_user_role(auth.uid()) IN ('pastor_admin', 'media_team')
    );

-- -------------------------------------------------------------------------
-- Weekly Reports Table Policies
-- -------------------------------------------------------------------------
CREATE POLICY "Pastor/Admin can view all reports"
    ON weekly_reports FOR SELECT USING (
        public.get_user_role(auth.uid()) = 'pastor_admin'
    );

CREATE POLICY "Cell Leaders can manage weekly reports for their cell"
    ON weekly_reports FOR ALL USING (
        home_cell_id = public.get_user_home_cell(auth.uid()) OR
        public.get_user_role(auth.uid()) = 'pastor_admin'
    );

-- -------------------------------------------------------------------------
-- Cell Membership Requests Table Policies
-- -------------------------------------------------------------------------
CREATE POLICY "Anyone can submit a membership request"
    ON cell_membership_requests FOR INSERT WITH CHECK (true);

CREATE POLICY "Pastor/Admin can view all requests"
    ON cell_membership_requests FOR SELECT USING (
        public.get_user_role(auth.uid()) = 'pastor_admin'
    );

CREATE POLICY "Home Cell Leaders can view requests for their own cell"
    ON cell_membership_requests FOR SELECT USING (
        home_cell_id = public.get_user_home_cell(auth.uid()) OR
        public.get_user_role(auth.uid()) = 'pastor_admin'
    );

CREATE POLICY "Home Cell Leaders and Pastor/Admin can manage requests for their cell"
    ON cell_membership_requests FOR UPDATE USING (
        home_cell_id = public.get_user_home_cell(auth.uid()) OR
        public.get_user_role(auth.uid()) = 'pastor_admin'
    );

CREATE POLICY "Pastor/Admin can delete requests"
    ON cell_membership_requests FOR DELETE USING (
        public.get_user_role(auth.uid()) = 'pastor_admin'
    );

-- =========================================================================
-- 10. AUTOMATIC USER SYNC FUNCTION AND TRIGGER FOR LOGINS
-- =========================================================================

-- Clean trigger and function if existing
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create trigger function
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
      WHEN COALESCE(new.raw_user_meta_data->>'role', 'cell_leader') = 'cell_leader' THEN FALSE
      ELSE TRUE
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind trigger to auth.users insert event
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

