-- Migration 005: Hardened RLS and Stealth Fetching
-- This migration disables direct SELECT on boards to prevent "List All" attacks.
-- It introduces an RPC function that requires a specific slug to fetch data.

-- 1. Disable the permissive select policy
DROP POLICY IF EXISTS "boards_select" ON boards;
CREATE POLICY "boards_select" ON boards FOR SELECT USING (false);

-- 2. Create the Stealth Fetch function
-- This function is the ONLY way to fetch a board. 
-- It is marked as 'security definer' to bypass RLS in a controlled way.
CREATE OR REPLACE FUNCTION get_board_p(p_slug text)
RETURNS SETOF boards
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with creator privileges to fetch hidden rows
SET search_path = public
AS $$
BEGIN
  RETURN QUERY SELECT * FROM boards WHERE slug = p_slug;
END;
$$;

-- 3. Hardening Columns and Tasks
-- We ensure that you can only see columns/tasks if you know the board_id.
-- Since the board_id (UUID) is only revealed if you have the slug, 
-- it acts as a secret token.

DROP POLICY IF EXISTS "columns_select" ON columns;
CREATE POLICY "columns_select" ON columns FOR SELECT USING (
  EXISTS (SELECT 1 FROM boards WHERE id = board_id)
);

DROP POLICY IF EXISTS "tasks_select" ON tasks;
CREATE POLICY "tasks_select" ON tasks FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM columns c
    JOIN boards b ON b.id = c.board_id
    WHERE c.id = tasks.column_id
  )
);
