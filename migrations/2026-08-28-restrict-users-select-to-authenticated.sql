-- Migration: Stop leaking every user's name/email/role to the public
--
-- Safe to run on the live database as-is. It only replaces the SELECT
-- policy on users - it does not touch any tables, data, or other policies.
-- Run this in the Supabase SQL Editor immediately.
--
-- Problem: the "All authenticated users can read all profiles" policy on
-- users used `USING (true)` instead of `USING (auth.uid() IS NOT NULL)`.
-- In Postgres RLS, a policy with no `TO <role>` clause applies to PUBLIC,
-- which includes the anon role - so `USING (true)` let anyone with just
-- the public anon key (already embedded in the site's JS bundle) read
-- every row of the users table, including full_name, email, and role,
-- with zero authentication. Verified live: an anonymous request against
-- /rest/v1/users returned real admin data.
--
-- Fix: require auth.uid() IS NOT NULL, matching what the policy's name
-- always claimed it did.

DROP POLICY IF EXISTS "All authenticated users can read all profiles" ON users;
CREATE POLICY "All authenticated users can read all profiles" ON users FOR SELECT USING (auth.uid() IS NOT NULL);
