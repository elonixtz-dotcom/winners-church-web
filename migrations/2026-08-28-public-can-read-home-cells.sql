-- Migration: Allow the public "Join a Home Cell" form to list cells
--
-- Safe to run on the live database as-is. It only replaces the SELECT
-- policy on home_cells - it does not touch any tables, data, or other
-- policies. Run this in the Supabase SQL Editor.
--
-- Problem: home_cells previously only allowed SELECT for logged-in users
-- (auth.uid() IS NOT NULL). The public /join-cell page is used by
-- unauthenticated site visitors, so it always saw zero cells even when
-- cells existed, showing "No home cell groups are currently available."
--
-- Fix: cells contain no sensitive data (name, location, meeting day/time),
-- so let anyone read them, matching the existing "Anyone can submit a
-- membership request" policy on cell_membership_requests.

DROP POLICY IF EXISTS "All authenticated users can read cells" ON home_cells;
CREATE POLICY "Anyone can view home cells" ON home_cells FOR SELECT USING (true);
