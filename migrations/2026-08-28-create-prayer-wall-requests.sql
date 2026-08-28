-- Migration: Create the prayer_wall_requests table (missing in production)
--
-- Safe to run on the live database as-is. It only creates a new table plus
-- its RLS policies - it does not touch any existing tables or data. Run
-- this in the Supabase SQL Editor.
--
-- Problem: the public /prayer-request page calls db.addPrayerWallRequest(),
-- which inserts into "prayer_wall_requests". That table was defined in
-- supabase_schema.sql and referenced throughout the app, but was never
-- actually created on the live database - so every submission failed with
-- PostgREST error PGRST205 ("Could not find the table
-- 'public.prayer_wall_requests' in the schema cache"), shown to visitors
-- as "Failed to submit your request. Please try again."
--
-- This mirrors table 19 in supabase_schema.sql exactly.

CREATE TABLE IF NOT EXISTS prayer_wall_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    phone_number TEXT,
    email TEXT,
    category TEXT NOT NULL DEFAULT 'general' CHECK (
        category IN ('salvation', 'healing', 'deliverance', 'finances', 'family', 'career', 'spiritual_growth', 'general')
    ),
    request TEXT NOT NULL,
    is_confidential BOOLEAN DEFAULT FALSE NOT NULL,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_prayer', 'answered', 'closed')),
    handled_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

ALTER TABLE prayer_wall_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a prayer request" ON prayer_wall_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Pastors and admins can view prayer wall requests" ON prayer_wall_requests FOR SELECT USING (
    public.get_user_role(auth.uid()) IN ('super_admin', 'church_admin', 'zone_pastor', 'district_pastor')
);
CREATE POLICY "Pastors and admins can manage prayer wall requests" ON prayer_wall_requests FOR UPDATE USING (
    public.get_user_role(auth.uid()) IN ('super_admin', 'church_admin', 'zone_pastor', 'district_pastor')
);
CREATE POLICY "Admins can delete prayer wall requests" ON prayer_wall_requests FOR DELETE USING (
    public.get_user_role(auth.uid()) IN ('super_admin', 'church_admin')
);
