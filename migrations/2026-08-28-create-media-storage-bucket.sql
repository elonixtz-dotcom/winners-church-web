-- Migration: Create a public "media" storage bucket for admin-uploaded photos
--
-- Safe to run on the live database as-is. It only creates a new storage
-- bucket plus policies on storage.objects scoped to that bucket - it does
-- not touch any existing tables, data, or policies. Run this in the
-- Supabase SQL Editor.
--
-- Problem: admins were pasting external links (often social media post
-- URLs, which can never render as an image - see the app's own guidance
-- text) into Event/Book "Image URL" fields because there was no way to
-- just upload a photo. This bucket lets the dashboard upload a file
-- directly and use the resulting public URL instead.

INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view media" ON storage.objects FOR SELECT USING (bucket_id = 'media');

CREATE POLICY "Media, pastors, and admins can upload media" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'media' AND public.get_user_role(auth.uid()) IN ('super_admin', 'church_admin', 'media_team')
);

CREATE POLICY "Media, pastors, and admins can update media" ON storage.objects FOR UPDATE USING (
    bucket_id = 'media' AND public.get_user_role(auth.uid()) IN ('super_admin', 'church_admin', 'media_team')
);

CREATE POLICY "Media, pastors, and admins can delete media" ON storage.objects FOR DELETE USING (
    bucket_id = 'media' AND public.get_user_role(auth.uid()) IN ('super_admin', 'church_admin', 'media_team')
);
