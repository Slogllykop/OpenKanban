-- get_full_board_p combines board, columns, and tasks into a single JSON response
-- This eliminates the need for 3 separate API calls when a client refreshes

CREATE OR REPLACE FUNCTION get_full_board_p(p_slug TEXT)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_board boards%ROWTYPE;
  v_result JSON;
BEGIN
  -- Get the board
  SELECT * INTO v_board FROM boards WHERE slug = p_slug;
  
  IF v_board.id IS NULL THEN
    RETURN NULL;
  END IF;

  -- Build the JSON response containing the board, its columns, and their nested tasks
  SELECT json_build_object(
    'board', row_to_json(v_board),
    'columns', COALESCE(
      (
        SELECT json_agg(
          json_build_object(
            'id', c.id,
            'board_id', c.board_id,
            'title', c.title,
            'position', c.position,
            'is_collapsed', c.is_collapsed,
            'created_at', c.created_at,
            'tasks', COALESCE(
              (
                SELECT json_agg(row_to_json(t) ORDER BY t.position ASC)
                FROM tasks t
                WHERE t.column_id = c.id
              ),
              '[]'::json
            )
          ) ORDER BY c.position ASC
        )
        FROM columns c
        WHERE c.board_id = v_board.id
      ),
      '[]'::json
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$;
