-- Migration 007: Complete RPC coverage for all remaining direct table operations
-- The prior migrations locked down SELECT with USING(false) but also left
-- INSERT/UPDATE/DELETE policies as the originals from 001-003 which use USING(true).
-- However, some operations (delete, upsert) also require SELECT to return rows
-- or to check existence, which fails because SELECT is USING(false).
-- This migration:
--   1. Creates SECURITY DEFINER RPC wrappers for all remaining direct operations
--   2. Locks down remaining INSERT/UPDATE/DELETE policies to USING(false)
--      so ALL mutations go through controlled RPC functions

-- =========================================================================
-- 1. Lock down ALL remaining permissive policies
-- =========================================================================

-- Boards: lock insert/update/delete (select already locked in 005)
DROP POLICY IF EXISTS "boards_insert" ON boards;
CREATE POLICY "boards_insert" ON boards FOR INSERT WITH CHECK (false);

DROP POLICY IF EXISTS "boards_update" ON boards;
CREATE POLICY "boards_update" ON boards FOR UPDATE USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "boards_delete" ON boards;
CREATE POLICY "boards_delete" ON boards FOR DELETE USING (false);

-- Columns: lock insert/update/delete (select already locked in 006)
DROP POLICY IF EXISTS "columns_insert" ON columns;
CREATE POLICY "columns_insert" ON columns FOR INSERT WITH CHECK (false);

DROP POLICY IF EXISTS "columns_update" ON columns;
CREATE POLICY "columns_update" ON columns FOR UPDATE USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "columns_delete" ON columns;
CREATE POLICY "columns_delete" ON columns FOR DELETE USING (false);

-- Tasks: lock insert/update/delete (select already locked in 006)
DROP POLICY IF EXISTS "tasks_insert" ON tasks;
CREATE POLICY "tasks_insert" ON tasks FOR INSERT WITH CHECK (false);

DROP POLICY IF EXISTS "tasks_update" ON tasks;
CREATE POLICY "tasks_update" ON tasks FOR UPDATE USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "tasks_delete" ON tasks;
CREATE POLICY "tasks_delete" ON tasks FOR DELETE USING (false);

-- =========================================================================
-- 2. DELETE RPC functions
-- =========================================================================

CREATE OR REPLACE FUNCTION delete_board_p(p_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM boards WHERE id = p_id;
END;
$$;

CREATE OR REPLACE FUNCTION delete_column_p(p_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM columns WHERE id = p_id;
END;
$$;

CREATE OR REPLACE FUNCTION delete_task_p(p_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM tasks WHERE id = p_id;
END;
$$;

-- =========================================================================
-- 3. Batch position update RPC functions
-- =========================================================================

-- Batch update column positions
-- Accepts a JSON array: [{"id": "uuid", "position": 0}, ...]
CREATE OR REPLACE FUNCTION update_column_positions_p(p_updates jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  item jsonb;
BEGIN
  FOR item IN SELECT * FROM jsonb_array_elements(p_updates)
  LOOP
    UPDATE columns SET
      position = (item->>'position')::integer,
      title = COALESCE(item->>'title', title),
      is_collapsed = COALESCE((item->>'is_collapsed')::boolean, is_collapsed)
    WHERE id = (item->>'id')::uuid;
  END LOOP;
END;
$$;

-- Batch update task positions and column assignments
-- Accepts a JSON array: [{"id": "uuid", "column_id": "uuid", "position": 0}, ...]
CREATE OR REPLACE FUNCTION update_task_positions_p(p_updates jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  item jsonb;
BEGIN
  FOR item IN SELECT * FROM jsonb_array_elements(p_updates)
  LOOP
    UPDATE tasks SET
      column_id = COALESCE((item->>'column_id')::uuid, column_id),
      position = (item->>'position')::integer,
      title = COALESCE(item->>'title', title),
      description = COALESCE(item->>'description', description),
      priority = COALESCE(item->>'priority', priority)
    WHERE id = (item->>'id')::uuid;
  END LOOP;
END;
$$;
