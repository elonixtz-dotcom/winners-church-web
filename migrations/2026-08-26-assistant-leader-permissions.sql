-- Migration: Give Assistant Leaders reduced permissions vs. Cell Leaders
--
-- Safe to run on the live database as-is. It only drops and recreates the
-- specific RLS policies listed below - it does NOT touch any tables, data,
-- or other policies. Run this in the Supabase SQL Editor.
--
-- What changes:
--   - Assistant leaders keep full view/add/edit access to their cell's
--     members, meetings, attendance, visitors, new converts, prayer
--     requests, follow-ups, and testimonies (same as before).
--   - Only the cell leader (not the assistant) can now DELETE those
--     records, or edit the cell's own admin details (name/schedule/etc).
--   - Offerings (financial records) are now restricted to the cell leader
--     only - assistant leaders can no longer view or manage them at all.

-- --- Home Cells: only the leader edits cell admin details ---
DROP POLICY IF EXISTS "Cell leaders and assistants can edit their cell info" ON home_cells;
CREATE POLICY "Cell leader can edit their cell info" ON home_cells FOR UPDATE USING (
    (leader_id = auth.uid() AND public.get_user_role(auth.uid()) = 'cell_leader') OR
    public.get_user_role(auth.uid()) IN ('super_admin', 'church_admin', 'zone_pastor', 'district_pastor')
);

-- --- Members ---
DROP POLICY IF EXISTS "Cell leaders and assistants can manage their cell members" ON members;
CREATE POLICY "Cell leaders and assistants can view their cell members" ON members FOR SELECT USING (
    home_cell_id = public.get_user_home_cell(auth.uid())
);
CREATE POLICY "Cell leaders and assistants can add their cell members" ON members FOR INSERT WITH CHECK (
    home_cell_id = public.get_user_home_cell(auth.uid()) OR
    public.get_user_role(auth.uid()) IN ('super_admin', 'church_admin', 'zone_pastor', 'district_pastor')
);
CREATE POLICY "Cell leaders and assistants can edit their cell members" ON members FOR UPDATE USING (
    home_cell_id = public.get_user_home_cell(auth.uid()) OR
    public.get_user_role(auth.uid()) IN ('super_admin', 'church_admin', 'zone_pastor', 'district_pastor')
);
CREATE POLICY "Only cell leader can delete their cell members" ON members FOR DELETE USING (
    (home_cell_id = public.get_user_home_cell(auth.uid()) AND public.get_user_role(auth.uid()) = 'cell_leader') OR
    public.get_user_role(auth.uid()) IN ('super_admin', 'church_admin')
);

-- --- Meeting Records ---
DROP POLICY IF EXISTS "Cell leaders and assistants can manage their cell meeting records" ON meeting_records;
CREATE POLICY "Cell leaders and assistants can view their cell meeting records" ON meeting_records FOR SELECT USING (
    home_cell_id = public.get_user_home_cell(auth.uid())
);
CREATE POLICY "Cell leaders and assistants can add their cell meeting records" ON meeting_records FOR INSERT WITH CHECK (
    home_cell_id = public.get_user_home_cell(auth.uid()) OR
    public.get_user_role(auth.uid()) IN ('super_admin', 'church_admin', 'zone_pastor', 'district_pastor')
);
CREATE POLICY "Cell leaders and assistants can edit their cell meeting records" ON meeting_records FOR UPDATE USING (
    home_cell_id = public.get_user_home_cell(auth.uid()) OR
    public.get_user_role(auth.uid()) IN ('super_admin', 'church_admin', 'zone_pastor', 'district_pastor')
);
CREATE POLICY "Only cell leader can delete their cell meeting records" ON meeting_records FOR DELETE USING (
    (home_cell_id = public.get_user_home_cell(auth.uid()) AND public.get_user_role(auth.uid()) = 'cell_leader') OR
    public.get_user_role(auth.uid()) IN ('super_admin', 'church_admin')
);

-- --- Attendance ---
DROP POLICY IF EXISTS "Cell leaders and assistants can manage their cell attendance" ON attendance;
CREATE POLICY "Cell leaders and assistants can view their cell attendance" ON attendance FOR SELECT USING (
    home_cell_id = public.get_user_home_cell(auth.uid())
);
CREATE POLICY "Cell leaders and assistants can add their cell attendance" ON attendance FOR INSERT WITH CHECK (
    home_cell_id = public.get_user_home_cell(auth.uid()) OR
    public.get_user_role(auth.uid()) IN ('super_admin', 'church_admin', 'zone_pastor', 'district_pastor')
);
CREATE POLICY "Cell leaders and assistants can edit their cell attendance" ON attendance FOR UPDATE USING (
    home_cell_id = public.get_user_home_cell(auth.uid()) OR
    public.get_user_role(auth.uid()) IN ('super_admin', 'church_admin', 'zone_pastor', 'district_pastor')
);
CREATE POLICY "Only cell leader can delete their cell attendance" ON attendance FOR DELETE USING (
    (home_cell_id = public.get_user_home_cell(auth.uid()) AND public.get_user_role(auth.uid()) = 'cell_leader') OR
    public.get_user_role(auth.uid()) IN ('super_admin', 'church_admin')
);

-- --- Visitors ---
DROP POLICY IF EXISTS "Cell leaders and assistants can manage their cell visitors" ON visitors;
CREATE POLICY "Cell leaders and assistants can view their cell visitors" ON visitors FOR SELECT USING (
    home_cell_id = public.get_user_home_cell(auth.uid())
);
CREATE POLICY "Cell leaders and assistants can add their cell visitors" ON visitors FOR INSERT WITH CHECK (
    home_cell_id = public.get_user_home_cell(auth.uid()) OR
    public.get_user_role(auth.uid()) IN ('super_admin', 'church_admin', 'zone_pastor', 'district_pastor')
);
CREATE POLICY "Cell leaders and assistants can edit their cell visitors" ON visitors FOR UPDATE USING (
    home_cell_id = public.get_user_home_cell(auth.uid()) OR
    public.get_user_role(auth.uid()) IN ('super_admin', 'church_admin', 'zone_pastor', 'district_pastor')
);
CREATE POLICY "Only cell leader can delete their cell visitors" ON visitors FOR DELETE USING (
    (home_cell_id = public.get_user_home_cell(auth.uid()) AND public.get_user_role(auth.uid()) = 'cell_leader') OR
    public.get_user_role(auth.uid()) IN ('super_admin', 'church_admin')
);

-- --- New Converts ---
DROP POLICY IF EXISTS "Cell leaders and assistants can manage their cell new converts" ON new_converts;
CREATE POLICY "Cell leaders and assistants can view their cell new converts" ON new_converts FOR SELECT USING (
    home_cell_id = public.get_user_home_cell(auth.uid())
);
CREATE POLICY "Cell leaders and assistants can add their cell new converts" ON new_converts FOR INSERT WITH CHECK (
    home_cell_id = public.get_user_home_cell(auth.uid()) OR
    public.get_user_role(auth.uid()) IN ('super_admin', 'church_admin', 'zone_pastor', 'district_pastor')
);
CREATE POLICY "Cell leaders and assistants can edit their cell new converts" ON new_converts FOR UPDATE USING (
    home_cell_id = public.get_user_home_cell(auth.uid()) OR
    public.get_user_role(auth.uid()) IN ('super_admin', 'church_admin', 'zone_pastor', 'district_pastor')
);
CREATE POLICY "Only cell leader can delete their cell new converts" ON new_converts FOR DELETE USING (
    (home_cell_id = public.get_user_home_cell(auth.uid()) AND public.get_user_role(auth.uid()) = 'cell_leader') OR
    public.get_user_role(auth.uid()) IN ('super_admin', 'church_admin')
);

-- --- Prayer Requests ---
DROP POLICY IF EXISTS "Cell leaders and assistants can manage their cell prayer requests" ON prayer_requests;
CREATE POLICY "Cell leaders and assistants can view their cell prayer requests" ON prayer_requests FOR SELECT USING (
    home_cell_id = public.get_user_home_cell(auth.uid())
);
CREATE POLICY "Cell leaders and assistants can add their cell prayer requests" ON prayer_requests FOR INSERT WITH CHECK (
    home_cell_id = public.get_user_home_cell(auth.uid()) OR
    public.get_user_role(auth.uid()) IN ('super_admin', 'church_admin', 'zone_pastor', 'district_pastor')
);
CREATE POLICY "Cell leaders and assistants can edit their cell prayer requests" ON prayer_requests FOR UPDATE USING (
    home_cell_id = public.get_user_home_cell(auth.uid()) OR
    public.get_user_role(auth.uid()) IN ('super_admin', 'church_admin', 'zone_pastor', 'district_pastor')
);
CREATE POLICY "Only cell leader can delete their cell prayer requests" ON prayer_requests FOR DELETE USING (
    (home_cell_id = public.get_user_home_cell(auth.uid()) AND public.get_user_role(auth.uid()) = 'cell_leader') OR
    public.get_user_role(auth.uid()) IN ('super_admin', 'church_admin')
);

-- --- Follow Ups ---
DROP POLICY IF EXISTS "Cell leaders and assistants can manage their cell follow ups" ON follow_ups;
CREATE POLICY "Cell leaders and assistants can view their cell follow ups" ON follow_ups FOR SELECT USING (
    home_cell_id = public.get_user_home_cell(auth.uid())
);
CREATE POLICY "Cell leaders and assistants can add their cell follow ups" ON follow_ups FOR INSERT WITH CHECK (
    home_cell_id = public.get_user_home_cell(auth.uid()) OR
    public.get_user_role(auth.uid()) IN ('super_admin', 'church_admin', 'zone_pastor', 'district_pastor')
);
CREATE POLICY "Cell leaders and assistants can edit their cell follow ups" ON follow_ups FOR UPDATE USING (
    home_cell_id = public.get_user_home_cell(auth.uid()) OR
    public.get_user_role(auth.uid()) IN ('super_admin', 'church_admin', 'zone_pastor', 'district_pastor')
);
CREATE POLICY "Only cell leader can delete their cell follow ups" ON follow_ups FOR DELETE USING (
    (home_cell_id = public.get_user_home_cell(auth.uid()) AND public.get_user_role(auth.uid()) = 'cell_leader') OR
    public.get_user_role(auth.uid()) IN ('super_admin', 'church_admin')
);

-- --- Testimonies ---
DROP POLICY IF EXISTS "Cell leaders and assistants can manage their cell testimonies" ON testimonies;
CREATE POLICY "Cell leaders and assistants can view their cell testimonies" ON testimonies FOR SELECT USING (
    home_cell_id = public.get_user_home_cell(auth.uid())
);
CREATE POLICY "Cell leaders and assistants can add their cell testimonies" ON testimonies FOR INSERT WITH CHECK (
    home_cell_id = public.get_user_home_cell(auth.uid()) OR
    public.get_user_role(auth.uid()) IN ('super_admin', 'church_admin', 'zone_pastor', 'district_pastor')
);
CREATE POLICY "Cell leaders and assistants can edit their cell testimonies" ON testimonies FOR UPDATE USING (
    home_cell_id = public.get_user_home_cell(auth.uid()) OR
    public.get_user_role(auth.uid()) IN ('super_admin', 'church_admin', 'zone_pastor', 'district_pastor')
);
CREATE POLICY "Only cell leader can delete their cell testimonies" ON testimonies FOR DELETE USING (
    (home_cell_id = public.get_user_home_cell(auth.uid()) AND public.get_user_role(auth.uid()) = 'cell_leader') OR
    public.get_user_role(auth.uid()) IN ('super_admin', 'church_admin')
);

-- --- Offerings: cell leader only, assistant excluded entirely ---
DROP POLICY IF EXISTS "Cell leaders and assistants can manage their cell offerings" ON offerings;
CREATE POLICY "Cell leader can manage their cell offerings" ON offerings FOR ALL USING (
    (home_cell_id = public.get_user_home_cell(auth.uid()) AND public.get_user_role(auth.uid()) = 'cell_leader') OR
    public.get_user_role(auth.uid()) IN ('super_admin', 'church_admin', 'zone_pastor', 'district_pastor')
);
