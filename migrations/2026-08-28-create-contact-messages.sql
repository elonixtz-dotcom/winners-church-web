-- Migration: Create the contact_messages table and wire up the Contact Us form
--
-- Safe to run on the live database as-is. It only creates a new table plus
-- its RLS policies - it does not touch any existing tables or data. Run
-- this in the Supabase SQL Editor.
--
-- Problem: the public /contact page's "Send a Message" form had
-- onSubmit={(e) => e.preventDefault()} and nothing else - it never sent
-- the message anywhere. Visitors filling it out believed they'd reached
-- the church, but no pastor or admin ever received it. This mirrors the
-- prayer_wall_requests / cell_membership_requests pattern already used
-- elsewhere in this app for public, unauthenticated submissions.

CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'responded')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a contact message" ON contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Pastors and admins can view contact messages" ON contact_messages FOR SELECT USING (
    public.get_user_role(auth.uid()) IN ('super_admin', 'church_admin', 'zone_pastor', 'district_pastor')
);
CREATE POLICY "Pastors and admins can manage contact messages" ON contact_messages FOR UPDATE USING (
    public.get_user_role(auth.uid()) IN ('super_admin', 'church_admin', 'zone_pastor', 'district_pastor')
);
CREATE POLICY "Admins can delete contact messages" ON contact_messages FOR DELETE USING (
    public.get_user_role(auth.uid()) IN ('super_admin', 'church_admin')
);
