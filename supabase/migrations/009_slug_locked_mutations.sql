-- Migration 009: Slug-Locked Mutations (BOLA mitigation)
-- All mutation RPCs now require p_slug and verify the target record
-- belongs to the board identified by that slug before performing the operation.

-- =========================================================================
-- 1. DELETE functions with slug ownership check
-- =========================================================================

CREATE OR REPLACE FUNCTION delete_board_p(p_slug text, p_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM boards WHERE id = p_id AND slug = p_slug;
END;
$$;

CREATE OR REPLACE FUNCTION delete_column_p(p_slug text, p_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM columns
  WHERE id = p_id
  AND board_id = (SELECT id FROM boards WHERE slug = p_slug);
END;
$$;

CREATE OR REPLACE FUNCTION delete_task_p(p_slug text, p_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM tasks
  WHERE id = p_id
  AND column_id IN (
    SELECT c.id FROM columns c
    JOIN boards b ON b.id = c.board_id
    WHERE b.slug = p_slug
  );
END;
$$;

-- =========================================================================
-- 2. UPDATE functions with slug ownership check
-- =========================================================================

CREATE OR REPLACE FUNCTION update_column_p(
  p_slug text,
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
  AND board_id = (SELECT id FROM boards WHERE slug = p_slug)
  RETURNING * INTO result;
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION update_task_p(
  p_slug text,
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
  AND column_id IN (
    SELECT c.id FROM columns c
    JOIN boards b ON b.id = c.board_id
    WHERE b.slug = p_slug
  )
  RETURNING * INTO result;
  RETURN result;
END;
$$;

-- =========================================================================
-- 3. Batch position update functions with slug ownership check
-- =========================================================================

CREATE OR REPLACE FUNCTION update_column_positions_p(p_slug text, p_updates jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  item jsonb;
  v_board_id uuid;
BEGIN
  SELECT id INTO v_board_id FROM boards WHERE slug = p_slug;
  IF v_board_id IS NULL THEN RETURN; END IF;

  FOR item IN SELECT * FROM jsonb_array_elements(p_updates)
  LOOP
    UPDATE columns SET
      position = (item->>'position')::integer,
      title = COALESCE(item->>'title', title),
      is_collapsed = COALESCE((item->>'is_collapsed')::boolean, is_collapsed)
    WHERE id = (item->>'id')::uuid
    AND board_id = v_board_id;
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION update_task_positions_p(p_slug text, p_updates jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  item jsonb;
  v_board_id uuid;
BEGIN
  SELECT id INTO v_board_id FROM boards WHERE slug = p_slug;
  IF v_board_id IS NULL THEN RETURN; END IF;

  FOR item IN SELECT * FROM jsonb_array_elements(p_updates)
  LOOP
    UPDATE tasks SET
      column_id = COALESCE((item->>'column_id')::uuid, column_id),
      position = (item->>'position')::integer,
      title = COALESCE(item->>'title', title),
      description = COALESCE(item->>'description', description),
      priority = COALESCE(item->>'priority', priority)
    WHERE id = (item->>'id')::uuid
    AND column_id IN (
      SELECT c.id FROM columns c WHERE c.board_id = v_board_id
    );
  END LOOP;
END;
$$;
