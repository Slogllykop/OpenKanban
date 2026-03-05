-- Migration 010: Batch Toggle Columns Collapse
-- Combines the collapse/expand all columns operation into a single RPC
-- Uses the slug-scope for BOLA safety (consistent with 009)

CREATE OR REPLACE FUNCTION batch_toggle_columns_collapse_p(
  p_slug text,
  p_is_collapsed boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_board_id uuid;
BEGIN
  -- 1. Verify board exists and get its ID
  SELECT id INTO v_board_id FROM boards WHERE slug = p_slug;
  
  -- If the board doesn't exist or slug doesn't match, do nothing
  IF v_board_id IS NULL THEN 
    RETURN; 
  END IF;

  -- 2. Update all columns for this board
  UPDATE columns SET
    is_collapsed = p_is_collapsed
  WHERE board_id = v_board_id;
END;
$$;
