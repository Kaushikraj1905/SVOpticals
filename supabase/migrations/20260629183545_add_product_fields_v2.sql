
/*
# Add Missing Product Fields

1. Add columns that were missed in previous migration
*/

ALTER TABLE products ADD COLUMN IF NOT EXISTS is_new_arrival boolean DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_top_selling boolean DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS features jsonb DEFAULT '[]'::jsonb;
