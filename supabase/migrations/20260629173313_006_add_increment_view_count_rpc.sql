/*
# Add increment_view_count RPC function

## Changes Overview
1. **increment_view_count**: RPC function to safely increment product view_count by 1.

## Notes
1. Used by ProductDetailPage to track product views.
2. Safe against race conditions with atomic increment.
*/

CREATE OR REPLACE FUNCTION increment_view_count(p_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE products
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = p_id;
END;
$$;
