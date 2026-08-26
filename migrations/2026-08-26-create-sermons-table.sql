-- Migration: Create the missing `sermons` table
--
-- The Media dashboard's "Sermons" tab has always called db.getSermons() /
-- addSermon() / deleteSermon(), but the `sermons` table was never actually
-- defined in supabase_schema.sql, so it was never created on the live
-- database either. This is why loading the Media dashboard failed with:
--   "Could not find the table 'public.sermons' in the schema cache"
--
-- Safe to run as-is - only creates a new table and its policies, doesn't
-- touch any existing table or data.

CREATE TABLE IF NOT EXISTS sermons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    preacher TEXT NOT NULL,
    scripture TEXT NOT NULL,
    date DATE NOT NULL,
    video_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

ALTER TABLE sermons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read sermons" ON sermons;
CREATE POLICY "Anyone can read sermons" ON sermons FOR SELECT USING (true);

DROP POLICY IF EXISTS "Media, pastors, and admins can manage sermons" ON sermons;
CREATE POLICY "Media, pastors, and admins can manage sermons" ON sermons FOR ALL USING (
    public.get_user_role(auth.uid()) IN ('super_admin', 'church_admin', 'media_team')
);
