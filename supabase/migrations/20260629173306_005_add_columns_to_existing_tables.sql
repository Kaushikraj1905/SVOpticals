/*
# Add Columns to Existing Tables and Create inventory_notifications

## Changes Overview
1. **prescriptions**: Add user_id, product_id, file_name columns.
2. **purchases**: Add purchase_date, grand_total columns.
3. **inventory_notifications**: Create new table for low stock alerts.

## Security
- Update RLS policies on prescriptions to use user_id.

## Notes
1. These support the full e-commerce platform features.
*/

-- ============================================
-- PRESCRIPTIONS TABLE - ADD COLUMNS
-- ============================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prescriptions' AND column_name = 'user_id') THEN
    ALTER TABLE prescriptions ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prescriptions' AND column_name = 'product_id') THEN
    ALTER TABLE prescriptions ADD COLUMN product_id uuid REFERENCES products(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prescriptions' AND column_name = 'file_name') THEN
    ALTER TABLE prescriptions ADD COLUMN file_name text;
  END IF;
END $$;

DROP POLICY IF EXISTS "prescriptions_select" ON prescriptions;
DROP POLICY IF EXISTS "prescriptions_insert" ON prescriptions;
DROP POLICY IF EXISTS "prescriptions_delete" ON prescriptions;

CREATE POLICY "prescriptions_select" ON prescriptions FOR SELECT
  TO authenticated USING (auth.uid() = user_id OR is_staff());

CREATE POLICY "prescriptions_insert" ON prescriptions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id OR is_staff());

CREATE POLICY "prescriptions_delete" ON prescriptions FOR DELETE
  TO authenticated USING (auth.uid() = user_id OR is_staff());

-- ============================================
-- PURCHASES TABLE - ADD COLUMNS
-- ============================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchases' AND column_name = 'purchase_date') THEN
    ALTER TABLE purchases ADD COLUMN purchase_date date DEFAULT CURRENT_DATE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'purchases' AND column_name = 'grand_total') THEN
    ALTER TABLE purchases ADD COLUMN grand_total decimal(10,2) DEFAULT 0;
  END IF;
END $$;

-- ============================================
-- INVENTORY NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS inventory_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL DEFAULT 'low_stock',
  message text NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE inventory_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_select_staff" ON inventory_notifications;
CREATE POLICY "notifications_select_staff" ON inventory_notifications FOR SELECT
  TO authenticated USING (is_staff());

DROP POLICY IF EXISTS "notifications_insert_staff" ON inventory_notifications;
CREATE POLICY "notifications_insert_staff" ON inventory_notifications FOR INSERT
  TO authenticated WITH CHECK (is_staff());

DROP POLICY IF EXISTS "notifications_update_staff" ON inventory_notifications;
CREATE POLICY "notifications_update_staff" ON inventory_notifications FOR UPDATE
  TO authenticated USING (is_staff()) WITH CHECK (is_staff());

DROP POLICY IF EXISTS "notifications_delete_staff" ON inventory_notifications;
CREATE POLICY "notifications_delete_staff" ON inventory_notifications FOR DELETE
  TO authenticated USING (is_staff());

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_prescriptions_user ON prescriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_order ON prescriptions(order_id);
CREATE INDEX IF NOT EXISTS idx_inventory_notifications_read ON inventory_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_inventory_notifications_created ON inventory_notifications(created_at DESC);

-- ============================================
-- SAMPLE SUPPLIERS (if missing)
-- ============================================
INSERT INTO suppliers (name, contact_person, phone, email, address, is_active) VALUES
('Essilor India', 'Rajesh Kumar', '+91 80 12345678', 'orders@essilor.in', 'Bangalore, Karnataka', true),
('Luxottica India', 'Priya Sharma', '+91 22 87654321', 'sales@luxottica.in', 'Mumbai, Maharashtra', true),
('Carl Zeiss India', 'Anil Mehta', '+91 11 23456789', 'contact@zeiss.in', 'Delhi, NCR', true),
('Bausch & Lomb India', 'Sunita Rao', '+91 40 34567890', 'orders@bausch.in', 'Hyderabad, Telangana', true),
('Titan Eye Plus', 'Vijay Gupta', '+91 80 45678901', 'wholesale@titaneye.in', 'Bangalore, Karnataka', true)
ON CONFLICT DO NOTHING;
