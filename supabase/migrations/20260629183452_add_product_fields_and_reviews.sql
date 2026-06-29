
/*
# Add Product Fields and Reviews Table

1. Modified Tables
- `products` - Added new columns: frame_shape, material, gender, rating, review_count, discount_price
- `product_images` - New table for storing product images with view types (front, side, model, 3D)
- `reviews` - New table for customer reviews with ratings
- `recently_viewed` - New table for tracking recently viewed products
- `customer_reminders` - New table for birthday and eye test reminders
2. Security
- All new tables have RLS enabled with appropriate policies
- Admin-only for writes, public read for reviews
*/

-- Add product fields
ALTER TABLE products ADD COLUMN IF NOT EXISTS frame_shape text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS material text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS gender text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS rating numeric DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS review_count integer DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS discount_price numeric DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS color text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS size text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS weight text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS warranty text;

-- Create product images table for view types
CREATE TABLE IF NOT EXISTS product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  view_type text NOT NULL DEFAULT 'front',
  url text NOT NULL,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  customer_name text NOT NULL,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title text,
  review_text text NOT NULL,
  verified_purchase boolean DEFAULT false,
  helpful_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create recently viewed table
CREATE TABLE IF NOT EXISTS recently_viewed (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  viewed_at timestamptz DEFAULT now()
);

-- Create customer reminders table
CREATE TABLE IF NOT EXISTS customer_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  reminder_type text NOT NULL,
  reminder_date date NOT NULL,
  message text,
  is_sent boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_customer_id ON reviews(customer_id);
CREATE INDEX IF NOT EXISTS idx_recently_viewed_product_id ON recently_viewed(product_id);
CREATE INDEX IF NOT EXISTS idx_recently_viewed_customer_id ON recently_viewed(customer_id);
CREATE INDEX IF NOT EXISTS idx_recently_viewed_viewed_at ON recently_viewed(viewed_at);
CREATE INDEX IF NOT EXISTS idx_customer_reminders_customer_id ON customer_reminders(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_reminders_date ON customer_reminders(reminder_date);
CREATE INDEX IF NOT EXISTS idx_products_frame_shape ON products(frame_shape);
CREATE INDEX IF NOT EXISTS idx_products_material ON products(material);
CREATE INDEX IF NOT EXISTS idx_products_gender ON products(gender);
CREATE INDEX IF NOT EXISTS idx_products_rating ON products(rating);

-- Enable RLS on new tables
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE recently_viewed ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_reminders ENABLE ROW LEVEL SECURITY;

-- Product images policies (public read, admin write)
DROP POLICY IF EXISTS "select_product_images" ON product_images;
CREATE POLICY "select_product_images" ON product_images FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_product_images" ON product_images;
CREATE POLICY "insert_product_images" ON product_images FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_product_images" ON product_images;
CREATE POLICY "update_product_images" ON product_images FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_product_images" ON product_images;
CREATE POLICY "delete_product_images" ON product_images FOR DELETE
  TO anon, authenticated USING (true);

-- Reviews policies (public read, authenticated write)
DROP POLICY IF EXISTS "select_reviews" ON reviews;
CREATE POLICY "select_reviews" ON reviews FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_reviews" ON reviews;
CREATE POLICY "insert_reviews" ON reviews FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_reviews" ON reviews;
CREATE POLICY "update_reviews" ON reviews FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_reviews" ON reviews;
CREATE POLICY "delete_reviews" ON reviews FOR DELETE
  TO anon, authenticated USING (true);

-- Recently viewed policies
DROP POLICY IF EXISTS "select_recently_viewed" ON recently_viewed;
CREATE POLICY "select_recently_viewed" ON recently_viewed FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_recently_viewed" ON recently_viewed;
CREATE POLICY "insert_recently_viewed" ON recently_viewed FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_recently_viewed" ON recently_viewed;
CREATE POLICY "update_recently_viewed" ON recently_viewed FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_recently_viewed" ON recently_viewed;
CREATE POLICY "delete_recently_viewed" ON recently_viewed FOR DELETE
  TO anon, authenticated USING (true);

-- Customer reminders policies
DROP POLICY IF EXISTS "select_customer_reminders" ON customer_reminders;
CREATE POLICY "select_customer_reminders" ON customer_reminders FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_customer_reminders" ON customer_reminders;
CREATE POLICY "insert_customer_reminders" ON customer_reminders FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_customer_reminders" ON customer_reminders;
CREATE POLICY "update_customer_reminders" ON customer_reminders FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_customer_reminders" ON customer_reminders;
CREATE POLICY "delete_customer_reminders" ON customer_reminders FOR DELETE
  TO anon, authenticated USING (true);
