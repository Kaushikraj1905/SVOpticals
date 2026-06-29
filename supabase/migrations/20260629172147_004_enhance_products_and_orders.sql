/*
# Enhance Products and Orders for E-commerce Platform

## Changes Overview
1. **Product Enhancements**: Add `search_keywords` (text array), `popularity` (integer, default 0), `view_count` (integer, default 0) for AI search and sorting. Add stock photos using Pexels URLs.
2. **Order Tracking**: Create `order_status_history` table to track order status changes (pending -> confirmed -> ready -> delivered -> cancelled).
3. **Product Tags**: Add `tags` (text array) to products for AI search categorization.
4. **Update existing products**: Populate image URLs with real Pexels stock photos matching each product category.

## Security
- Existing RLS policies remain unchanged.
- `order_status_history` inherits staff-only access.

## Notes
1. Uses Pexels URLs for stock photos — no local images needed.
2. AI search keywords pre-populated for natural language matching.
3. `popularity` is updated via triggers or edge functions.
*/

-- ============================================
-- PRODUCT ENHANCEMENTS
-- ============================================

-- Add columns to products if they don't exist
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'search_keywords') THEN
    ALTER TABLE products ADD COLUMN search_keywords text[] DEFAULT '{}';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'popularity') THEN
    ALTER TABLE products ADD COLUMN popularity integer DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'view_count') THEN
    ALTER TABLE products ADD COLUMN view_count integer DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'tags') THEN
    ALTER TABLE products ADD COLUMN tags text[] DEFAULT '{}';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'images_360') THEN
    ALTER TABLE products ADD COLUMN images_360 jsonb DEFAULT '{}';
  END IF;
END $$;

-- ============================================
-- ORDER STATUS HISTORY TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS order_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('pending', 'confirmed', 'processing', 'ready', 'delivered', 'cancelled')),
  changed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "order_status_history_select" ON order_status_history;
CREATE POLICY "order_status_history_select" ON order_status_history FOR SELECT
  TO authenticated USING (
    is_staff() OR 
    order_id IN (SELECT o.id FROM orders o JOIN customers c ON o.customer_id = c.id WHERE c.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "order_status_history_insert" ON order_status_history;
CREATE POLICY "order_status_history_insert" ON order_status_history FOR INSERT
  TO authenticated WITH CHECK (is_staff());

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_products_search_keywords ON products USING GIN(search_keywords);
CREATE INDEX IF NOT EXISTS idx_products_tags ON products USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_products_popularity ON products(popularity DESC);
CREATE INDEX IF NOT EXISTS idx_order_status_history_order ON order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_history_created ON order_status_history(created_at DESC);

-- ============================================
-- UPDATE PRODUCT IMAGES WITH STOCK PHOTOS
-- ============================================

UPDATE products SET image_urls = ARRAY[
  'https://images.pexels.com/photos/39716/pexels-photo-39716.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/1362558/pexels-photo-1362558.jpeg?auto=compress&cs=tinysrgb&w=600'
], search_keywords = ARRAY['aviator', 'classic', 'gold', 'metal', 'men', 'lightweight', 'office', 'sunglasses'],
tags = ARRAY['frames', 'men', 'metal', 'aviator', 'classic'] WHERE sku = 'RB-AVIATOR-001';

UPDATE products SET image_urls = ARRAY[
  'https://images.pexels.com/photos/701841/pexels-photo-701841.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/947885/pexels-photo-947885.jpeg?auto=compress&cs=tinysrgb&w=600'
], search_keywords = ARRAY['wayfarer', 'classic', 'black', 'acetate', 'men', 'sunglasses', 'casual'],
tags = ARRAY['frames', 'men', 'acetate', 'wayfarer', 'classic'] WHERE sku = 'RB-WAYFARER-001';

UPDATE products SET image_urls = ARRAY[
  'https://images.pexels.com/photos/147641/pexels-photo-147641.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/1362558/pexels-photo-1362558.jpeg?auto=compress&cs=tinysrgb&w=600'
], search_keywords = ARRAY['round', 'metal', 'vintage', 'men', 'gold', 'intellectual', 'office', 'glasses'],
tags = ARRAY['frames', 'men', 'metal', 'round', 'vintage'] WHERE sku = 'RB-ROUND-001';

UPDATE products SET image_urls = ARRAY[
  'https://images.pexels.com/photos/1362558/pexels-photo-1362558.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/701841/pexels-photo-701841.jpeg?auto=compress&cs=tinysrgb&w=600'
], search_keywords = ARRAY['sports', 'oversized', 'prizm', 'men', 'sunglasses', 'outdoor', 'active'],
tags = ARRAY['sunglasses', 'men', 'sports', 'oversized', 'prizm'] WHERE sku = 'OAK-HOLBROOK-001';

UPDATE products SET image_urls = ARRAY[
  'https://images.pexels.com/photos/947885/pexels-photo-947885.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/39716/pexels-photo-39716.jpeg?auto=compress&cs=tinysrgb&w=600'
], search_keywords = ARRAY['cycling', 'running', 'sports', 'performance', 'men', 'sunglasses', 'active'],
tags = ARRAY['sunglasses', 'men', 'sports', 'cycling', 'performance'] WHERE sku = 'OAK-RADAR-001';

UPDATE products SET image_urls = ARRAY[
  'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/1362558/pexels-photo-1362558.jpeg?auto=compress&cs=tinysrgb&w=600'
], search_keywords = ARRAY['cat eye', 'women', 'sunglasses', 'elegant', 'gradient', 'oversized', 'fashion'],
tags = ARRAY['sunglasses', 'women', 'cat eye', 'fashion', 'elegant'] WHERE sku = 'VOG-VO5278-001';

UPDATE products SET image_urls = ARRAY[
  'https://images.pexels.com/photos/147641/pexels-photo-147641.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/701841/pexels-photo-701841.jpeg?auto=compress&cs=tinysrgb&w=600'
], search_keywords = ARRAY['round', 'women', 'rose gold', 'thin', 'sunglasses', 'everyday', 'fashion'],
tags = ARRAY['sunglasses', 'women', 'round', 'metal', 'fashion'] WHERE sku = 'VOG-VO5432-001';

UPDATE products SET image_urls = ARRAY[
  'https://images.pexels.com/photos/39716/pexels-photo-39716.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/1362558/pexels-photo-1362558.jpeg?auto=compress&cs=tinysrgb&w=600'
], search_keywords = ARRAY['titanium', 'men', 'premium', 'lightweight', 'frames', 'durable', 'office'],
tags = ARRAY['frames', 'men', 'titanium', 'premium', 'lightweight'] WHERE sku = 'TITAN-MAVERICK-001';

UPDATE products SET image_urls = ARRAY[
  'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/147641/pexels-photo-147641.jpeg?auto=compress&cs=tinysrgb&w=600'
], search_keywords = ARRAY['women', 'gold', 'elegant', 'delicate', 'burgundy', 'frames', 'fashion'],
tags = ARRAY['frames', 'women', 'elegant', 'fashion', 'gold'] WHERE sku = 'TITAN-GRACE-001';

UPDATE products SET image_urls = ARRAY[
  'https://images.pexels.com/photos/701841/pexels-photo-701841.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/947885/pexels-photo-947885.jpeg?auto=compress&cs=tinysrgb&w=600'
], search_keywords = ARRAY['kids', 'children', 'durable', 'colorful', 'blue', 'red', 'frames', 'tr90'],
tags = ARRAY['frames', 'kids', 'durable', 'colorful', 'tr90'] WHERE sku = 'TITAN-KIDS-001';

UPDATE products SET image_urls = ARRAY[
  'https://images.pexels.com/photos/947885/pexels-photo-947885.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/39716/pexels-photo-39716.jpeg?auto=compress&cs=tinysrgb&w=600'
], search_keywords = ARRAY['polarized', 'youth', 'square', 'black', 'men', 'sunglasses', 'uv400'],
tags = ARRAY['sunglasses', 'men', 'polarized', 'square', 'youth'] WHERE sku = 'FAST-P1296-001';

UPDATE products SET image_urls = ARRAY[
  'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/147641/pexels-photo-147641.jpeg?auto=compress&cs=tinysrgb&w=600'
], search_keywords = ARRAY['cat eye', 'women', 'pink', 'gradient', 'sunglasses', 'bold', 'fashion'],
tags = ARRAY['sunglasses', 'women', 'cat eye', 'pink', 'fashion'] WHERE sku = 'FAST-F2345-001';

-- Lenses
UPDATE products SET image_urls = ARRAY[
  'https://images.pexels.com/photos/569388/pexels-photo-569388.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/37347/pexels-photo-37347.jpeg?auto=compress&cs=tinysrgb&w=600'
], search_keywords = ARRAY['single vision', 'crizal', 'anti-reflective', 'prescription', 'lens', '1.5 index'],
tags = ARRAY['lenses', 'single vision', 'crizal', 'prescription'] WHERE sku = 'ESS-SV-001';

UPDATE products SET image_urls = ARRAY[
  'https://images.pexels.com/photos/569388/pexels-photo-569388.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/37347/pexels-photo-37347.jpeg?auto=compress&cs=tinysrgb&w=600'
], search_keywords = ARRAY['progressive', 'varilux', 'no-line', 'smooth', 'prescription', 'lens', 'comfort'],
tags = ARRAY['lenses', 'progressive', 'varilux', 'prescription'] WHERE sku = 'ESS-PROG-001';

UPDATE products SET image_urls = ARRAY[
  'https://images.pexels.com/photos/569388/pexels-photo-569388.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/37347/pexels-photo-37347.jpeg?auto=compress&cs=tinysrgb&w=600'
], search_keywords = ARRAY['blue cut', 'blue light', 'computer', 'digital', 'prescription', 'lens', 'screen', 'anti glare'],
tags = ARRAY['lenses', 'blue cut', 'computer', 'digital', 'blue light'] WHERE sku = 'CRIZAL-BLUE-001';

UPDATE products SET image_urls = ARRAY[
  'https://images.pexels.com/photos/569388/pexels-photo-569388.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/37347/pexels-photo-37347.jpeg?auto=compress&cs=tinysrgb&w=600'
], search_keywords = ARRAY['photochromic', 'adaptive', 'light', 'transitions', 'indoor', 'outdoor', 'prescription', 'lens'],
tags = ARRAY['lenses', 'photochromic', 'adaptive', 'transitions'] WHERE sku = 'ZEISS-PHOTO-001';

UPDATE products SET image_urls = ARRAY[
  'https://images.pexels.com/photos/569388/pexels-photo-569388.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/37347/pexels-photo-37347.jpeg?auto=compress&cs=tinysrgb&w=600'
], search_keywords = ARRAY['high index', 'thin', 'strong', '1.74', 'prescription', 'lens', 'aspheric', 'lightweight'],
tags = ARRAY['lenses', 'high index', 'thin', 'lightweight', '1.74'] WHERE sku = 'ESS-HI-001';

-- Contact Lenses
UPDATE products SET image_urls = ARRAY[
  'https://images.pexels.com/photos/569388/pexels-photo-569388.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/37347/pexels-photo-37347.jpeg?auto=compress&cs=tinysrgb&w=600'
], search_keywords = ARRAY['daily', 'disposable', 'contact', '30 lenses', 'acuvue', 'moist', 'uv', 'comfort'],
tags = ARRAY['contact lenses', 'daily', 'disposable', 'acuvue', 'moist'] WHERE sku = 'ACUVUE-MOIST-001';

UPDATE products SET image_urls = ARRAY[
  'https://images.pexels.com/photos/569388/pexels-photo-569388.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/37347/pexels-photo-37347.jpeg?auto=compress&cs=tinysrgb&w=600'
], search_keywords = ARRAY['monthly', 'disposable', 'contact', '6 lenses', 'acuvue', 'vita', 'extended', 'comfort'],
tags = ARRAY['contact lenses', 'monthly', 'disposable', 'acuvue', 'vita'] WHERE sku = 'ACUVUE-VITA-001';

UPDATE products SET image_urls = ARRAY[
  'https://images.pexels.com/photos/569388/pexels-photo-569388.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/37347/pexels-photo-37347.jpeg?auto=compress&cs=tinysrgb&w=600'
], search_keywords = ARRAY['monthly', 'disposable', 'contact', '6 lenses', 'bausch', 'soflens', 'aspheric'],
tags = ARRAY['contact lenses', 'monthly', 'disposable', 'bausch', 'soflens'] WHERE sku = 'BAUS-SOFT-001';

UPDATE products SET image_urls = ARRAY[
  'https://images.pexels.com/photos/569388/pexels-photo-569388.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/37347/pexels-photo-37347.jpeg?auto=compress&cs=tinysrgb&w=600'
], search_keywords = ARRAY['monthly', 'silicone', 'hydrogel', 'contact', '6 lenses', 'bausch', 'infuse', 'premium'],
tags = ARRAY['contact lenses', 'monthly', 'silicone', 'hydrogel', 'premium'] WHERE sku = 'BAUS-INFUSE-001';

UPDATE products SET image_urls = ARRAY[
  'https://images.pexels.com/photos/569388/pexels-photo-569388.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/37347/pexels-photo-37347.jpeg?auto=compress&cs=tinysrgb&w=600'
], search_keywords = ARRAY['colored', 'cosmetic', 'contact', '2 lenses', 'freshlook', 'colorblends', 'hazel', 'blue', 'green', 'gray'],
tags = ARRAY['contact lenses', 'colored', 'cosmetic', 'freshlook', 'colorblends'] WHERE sku = 'COLOR-FRESH-001';

-- Accessories
UPDATE products SET image_urls = ARRAY[
  'https://images.pexels.com/photos/54308/pexels-photo-54308.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/569388/pexels-photo-569388.jpeg?auto=compress&cs=tinysrgb&w=600'
], search_keywords = ARRAY['cleaner', 'spray', 'lens', '100ml', 'accessory', 'cleaning', 'solution'],
tags = ARRAY['accessories', 'cleaner', 'lens', 'spray'] WHERE sku = 'CLEAN-SPRAY-001';

UPDATE products SET image_urls = ARRAY[
  'https://images.pexels.com/photos/54308/pexels-photo-54308.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/569388/pexels-photo-569388.jpeg?auto=compress&cs=tinysrgb&w=600'
], search_keywords = ARRAY['case', 'hard', 'shell', 'protective', 'eyeglass', 'accessory', 'universal'],
tags = ARRAY['accessories', 'case', 'hard', 'protective', 'eyeglass'] WHERE sku = 'CASE-HARD-001';

UPDATE products SET image_urls = ARRAY[
  'https://images.pexels.com/photos/37347/pexels-photo-37347.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/569388/pexels-photo-569388.jpeg?auto=compress&cs=tinysrgb&w=600'
], search_keywords = ARRAY['cloth', 'microfiber', 'cleaning', 'lens', 'accessory', 'premium', 'gentle'],
tags = ARRAY['accessories', 'cloth', 'microfiber', 'cleaning', 'lens'] WHERE sku = 'CLOTH-MICRO-001';

UPDATE products SET image_urls = ARRAY[
  'https://images.pexels.com/photos/37347/pexels-photo-37347.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/569388/pexels-photo-569388.jpeg?auto=compress&cs=tinysrgb&w=600'
], search_keywords = ARRAY['chain', 'metal', 'eyeglass', 'gold', 'silver', 'accessory', 'elegant', '70cm'],
tags = ARRAY['accessories', 'chain', 'metal', 'eyeglass', 'elegant'] WHERE sku = 'CHAIN-METAL-001';

-- Update popularity values for sorting
UPDATE products SET popularity = 150 WHERE sku IN ('RB-AVIATOR-001', 'RB-WAYFARER-001', 'TITAN-MAVERICK-001');
UPDATE products SET popularity = 120 WHERE sku IN ('OAK-HOLBROOK-001', 'VOG-VO5278-001', 'ESS-SV-001');
UPDATE products SET popularity = 100 WHERE sku IN ('CRIZAL-BLUE-001', 'ESS-PROG-001', 'ZEISS-PHOTO-001');
UPDATE products SET popularity = 80 WHERE sku IN ('ACUVUE-MOIST-001', 'ACUVUE-VITA-001', 'COLOR-FRESH-001');
UPDATE products SET popularity = 60 WHERE sku IN ('FAST-P1296-001', 'RB-ROUND-001', 'VOG-VO5432-001');
UPDATE products SET popularity = 40 WHERE sku IN ('TITAN-GRACE-001', 'TITAN-KIDS-001', 'FAST-F2345-001');
UPDATE products SET popularity = 30 WHERE sku IN ('BAUS-SOFT-001', 'BAUS-INFUSE-001', 'ESS-HI-001');
UPDATE products SET popularity = 20 WHERE sku IN ('CLEAN-SPRAY-001', 'CASE-HARD-001', 'CLOTH-MICRO-001', 'CHAIN-METAL-001');

-- Update view_count for popularity
UPDATE products SET view_count = popularity * 10;
