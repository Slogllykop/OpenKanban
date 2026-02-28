-- Migration 006: Fix Cascading RLS Lockout
-- The prior migration locked down SELECT but cascaded to block
-- related INSERT/UPDATE queries from returning their rows.
-- This creates full RPC wrappers for all operations.

-- =========================================================================
-- 1. Lock down SELECT on remaining tables
-- =========================================================================

DROP POLICY IF EXISTS "columns_select" ON columns;
CREATE POLICY "columns_select" ON columns FOR SELECT USING (false);

DROP POLICY IF EXISTS "tasks_select" ON tasks;
CREATE POLICY "tasks_select" ON tasks FOR SELECT USING (false);

-- =========================================================================
-- 2. READ RPC functions
-- =========================================================================

CREATE OR REPLACE FUNCTION get_columns_p(p_board_id uuid)
RETURNS SETOF columns
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY SELECT * FROM columns WHERE board_id = p_board_id ORDER BY position ASC;
END;
$$;

CREATE OR REPLACE FUNCTION get_tasks_by_board_p(p_board_id uuid)
RETURNS SETOF tasks
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
    SELECT t.*
    FROM tasks t
    INNER JOIN columns c ON c.id = t.column_id
    WHERE c.board_id = p_board_id
    ORDER BY t.position ASC;
END;
$$;

-- =========================================================================
-- 3. WRITE RPC functions
-- =========================================================================

CREATE OR REPLACE FUNCTION create_board_p(p_slug text)
RETURNS boards
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result boards;
BEGIN
  INSERT INTO boards (slug) VALUES (p_slug) RETURNING * INTO result;
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION create_column_p(
  p_board_id uuid,
  p_title text,
  p_position integer
)
RETURNS columns
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result columns;
BEGIN
  INSERT INTO columns (board_id, title, position)
  VALUES (p_board_id, p_title, p_position)
  RETURNING * INTO result;
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION update_column_p(
  p_id uuid,
  p_title text DEFAULT NULL,
  p_position integer DEFAULT NULL,
  p_is_collapsed boolean DEFAULT NULL
)
RETURNS columns
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result columns;
BEGIN
  UPDATE columns SET
    title = COALESCE(p_title, title),
    position = COALESCE(p_position, position),
    is_collapsed = COALESCE(p_is_collapsed, is_collapsed)
  WHERE id = p_id
  RETURNING * INTO result;
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION create_task_p(
  p_column_id uuid,
  p_title text,
  p_description text DEFAULT NULL,
  p_priority text DEFAULT 'medium',
  p_position integer DEFAULT 0
)
RETURNS tasks
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result tasks;
BEGIN
  INSERT INTO tasks (column_id, title, description, priority, position)
  VALUES (p_column_id, p_title, p_description, p_priority, p_position)
  RETURNING * INTO result;
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION update_task_p(
  p_id uuid,
  p_title text DEFAULT NULL,
  p_description text DEFAULT NULL,
  p_priority text DEFAULT NULL,
  p_column_id uuid DEFAULT NULL,
  p_position integer DEFAULT NULL
)
RETURNS tasks
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result tasks;
BEGIN
  UPDATE tasks SET
    title = COALESCE(p_title, title),
    description = COALESCE(p_description, description),
    priority = COALESCE(p_priority, priority),
    column_id = COALESCE(p_column_id, column_id),
    position = COALESCE(p_position, position)
  WHERE id = p_id
  RETURNING * INTO result;
  RETURN result;
END;
$$;
