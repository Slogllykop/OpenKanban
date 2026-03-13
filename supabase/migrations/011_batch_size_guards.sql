-- Migration 011: Batch Size Guards + Slug-Scoped Creates
-- Security Audit Findings #4 and #7
--
-- #4: Add batch size limits to update_column_positions_p / update_task_positions_p
-- #7: Add p_slug parameter to create_column_p / create_task_p with ownership check

-- =========================================================================
-- Finding #4: Batch size guards on position update functions
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
  -- Guard: reject oversized batches (Finding #4)
  IF jsonb_array_length(p_updates) > 200 THEN
    RAISE EXCEPTION 'Batch size exceeds maximum of 200 items';
  END IF;

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
  -- Guard: reject oversized batches (Finding #4)
  IF jsonb_array_length(p_updates) > 200 THEN
    RAISE EXCEPTION 'Batch size exceeds maximum of 200 items';
  END IF;

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

-- =========================================================================
-- Finding #7: Slug-scoped create_column_p and create_task_p
-- =========================================================================

CREATE OR REPLACE FUNCTION create_column_p(
  p_slug text,
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
  -- Verify board belongs to slug (BOLA mitigation)
  IF NOT EXISTS (SELECT 1 FROM boards WHERE id = p_board_id AND slug = p_slug) THEN
    RAISE EXCEPTION 'Board not found';
  END IF;

  INSERT INTO columns (board_id, title, position)
  VALUES (p_board_id, p_title, p_position)
  RETURNING * INTO result;
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION create_task_p(
  p_slug text,
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
  -- Verify column belongs to a board with the given slug (BOLA mitigation)
  IF NOT EXISTS (
    SELECT 1 FROM columns c
    JOIN boards b ON b.id = c.board_id
    WHERE c.id = p_column_id AND b.slug = p_slug
  ) THEN
    RAISE EXCEPTION 'Column not found';
  END IF;

  INSERT INTO tasks (column_id, title, description, priority, position)
  VALUES (p_column_id, p_title, p_description, p_priority, p_position)
  RETURNING * INTO result;
  RETURN result;
END;
$$;
