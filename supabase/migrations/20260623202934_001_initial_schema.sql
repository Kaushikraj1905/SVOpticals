/*
# S V Opticals - Initial Database Schema

## New Tables Created:

### Authentication & Authorization
- `roles` - Defines user roles (owner, manager, sales_staff, inventory_staff)
- `user_roles` - Links users to roles for RBAC

### Customer Management  
- `customers` - Customer profiles with contact info and addresses

### Product Catalog
- `brands` - Optical brands (Ray-Ban, Oakley, Titan Eye+, etc.)
- `product_categories` - Categories (Frames Men, Frames Women, Sunglasses, Lenses, etc.)
- `products` - Product catalog with pricing, descriptions, inventory

### Inventory Management
- `suppliers` - Supplier/vendor information
- `inventory` - Track stock quantities per product
- `inventory_movements` - Log all inventory changes (in/out)
- `notifications` - Low stock alerts and system notifications

### Sales & Orders
- `orders` - Customer orders with status tracking
- `order_items` - Individual items within orders
- `prescriptions` - Customer prescriptions (images/PDFs)

### Financial
- `gst_invoices` - GST-compliant invoices
- `purchases` - Purchase records from suppliers

## Security:
- RLS enabled on all tables
- Owner: Full access
- Manager: Inventory + Sales + Reports
- Sales Staff: Sales + Customers only
- Inventory Staff: Inventory only
- Customers: Own data only
- Products/Categories/Brands: Public read for storefront
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ROLES & AUTHORIZATION
-- ============================================

CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  permissions jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

INSERT INTO roles (name, description, permissions) VALUES
  ('owner', 'Full system access', '{"all": true}'),
  ('manager', 'Inventory, sales, and reports access', '{"inventory": true, "sales": true, "reports": true, "customers": true}'),
  ('sales_staff', 'Sales and customer management', '{"sales": true, "customers": true}'),
  ('inventory_staff', 'Inventory management only', '{"inventory": true}')
ON CONFLICT (name) DO NOTHING;

CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, role_id)
);

-- ============================================
-- CUSTOMERS
-- ============================================

CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  email text,
  phone text NOT NULL,
  alternate_phone text,
  address text,
  city text DEFAULT 'Hyderabad',
  state text DEFAULT 'Telangana',
  pincode text,
  date_of_birth date,
  notes text,
  total_purchases numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- PRODUCT CATALOG
-- ============================================

CREATE TABLE IF NOT EXISTS brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  logo_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS product_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  name_te text, -- Telugu translation
  parent_id uuid REFERENCES product_categories(id) ON DELETE SET NULL,
  description text,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sku text UNIQUE NOT NULL,
  name text NOT NULL,
  name_te text, -- Telugu translation
  description text,
  description_te text,
  brand_id uuid REFERENCES brands(id) ON DELETE SET NULL,
  category_id uuid NOT NULL REFERENCES product_categories(id) ON DELETE RESTRICT,
  price numeric NOT NULL,
  mrp numeric NOT NULL,
  gst_rate numeric DEFAULT 18,
  image_urls text[] DEFAULT '{}',
  specifications jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================
-- INVENTORY MANAGEMENT
-- ============================================

CREATE TABLE IF NOT EXISTS suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  contact_person text,
  email text,
  phone text,
  address text,
  gstin text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity integer DEFAULT 0,
  min_quantity integer DEFAULT 5,
  location text,
  last_updated timestamptz DEFAULT now(),
  UNIQUE(product_id)
);

CREATE TABLE IF NOT EXISTS inventory_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  movement_type text NOT NULL CHECK (movement_type IN ('purchase', 'sale', 'adjustment', 'return')),
  quantity integer NOT NULL,
  reference_id uuid,
  reference_type text,
  notes text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  data jsonb DEFAULT '{}',
  is_read boolean DEFAULT false,
  created_for uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- ORDERS & SALES
-- ============================================

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'ready', 'delivered', 'cancelled')),
  subtotal numeric NOT NULL,
  gst_amount numeric DEFAULT 0,
  discount numeric DEFAULT 0,
  total numeric NOT NULL,
  prescription_id uuid,
  notes text,
  whatsapp_message_sent boolean DEFAULT false,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  product_sku text,
  quantity integer NOT NULL,
  unit_price numeric NOT NULL,
  gst_rate numeric DEFAULT 18,
  gst_amount numeric,
  total numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS prescriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  file_url text NOT NULL,
  left_eye_sphere numeric,
  left_eye_cylinder numeric,
  left_eye_axis integer,
  left_eye_add numeric,
  right_eye_sphere numeric,
  right_eye_cylinder numeric,
  right_eye_axis integer,
  right_eye_add numeric,
  pd numeric,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- PURCHASES & FINANCIAL
-- ============================================

CREATE TABLE IF NOT EXISTS purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_number text UNIQUE NOT NULL,
  supplier_id uuid REFERENCES suppliers(id) ON DELETE SET NULL,
  total_amount numeric NOT NULL,
  gst_amount numeric DEFAULT 0,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'received', 'partial', 'cancelled')),
  notes text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS purchase_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id uuid NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity integer NOT NULL,
  unit_cost numeric NOT NULL,
  total numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS gst_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text UNIQUE NOT NULL,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  customer_address text,
  customer_gstin text,
  subtotal numeric NOT NULL,
  cgst_amount numeric DEFAULT 0,
  sgst_amount numeric DEFAULT 0,
  igst_amount numeric DEFAULT 0,
  total numeric NOT NULL,
  invoice_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- CART & WISHLIST
-- ============================================

CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wishlist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE gst_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;

-- Helper function to check user role
CREATE OR REPLACE FUNCTION has_role(role_name text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.name = role_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is staff (admin)
CREATE OR REPLACE FUNCTION is_staff()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() 
    AND r.name IN ('owner', 'manager', 'sales_staff', 'inventory_staff')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ROLES: Only owner can manage
DROP POLICY IF EXISTS "roles_select" ON roles;
CREATE POLICY "roles_select" ON roles FOR SELECT
  TO authenticated USING (is_staff());

DROP POLICY IF EXISTS "roles_insert" ON roles;
CREATE POLICY "roles_insert" ON roles FOR INSERT
  TO authenticated WITH CHECK (has_role('owner'));

DROP POLICY IF EXISTS "roles_update" ON roles;
CREATE POLICY "roles_update" ON roles FOR UPDATE
  TO authenticated USING (has_role('owner')) WITH CHECK (has_role('owner'));

-- USER_ROLES: Staff can read, owner can manage
DROP POLICY IF EXISTS "user_roles_select" ON user_roles;
CREATE POLICY "user_roles_select" ON user_roles FOR SELECT
  TO authenticated USING (is_staff());

DROP POLICY IF EXISTS "user_roles_insert" ON user_roles;
CREATE POLICY "user_roles_insert" ON user_roles FOR INSERT
  TO authenticated WITH CHECK (has_role('owner'));

DROP POLICY IF EXISTS "user_roles_delete" ON user_roles;
CREATE POLICY "user_roles_delete" ON user_roles FOR DELETE
  TO authenticated USING (has_role('owner'));

-- CUSTOMERS: Staff can read all, customers read own
DROP POLICY IF EXISTS "customers_select" ON customers;
CREATE POLICY "customers_select" ON customers FOR SELECT
  TO authenticated USING (
    is_staff() OR user_id = auth.uid()
  );

DROP POLICY IF EXISTS "customers_insert" ON customers;
CREATE POLICY "customers_insert" ON customers FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "customers_update" ON customers;
CREATE POLICY "customers_update" ON customers FOR UPDATE
  TO authenticated USING (
    is_staff() OR user_id = auth.uid()
  ) WITH CHECK (
    is_staff() OR user_id = auth.uid()
  );

-- BRANDS: Public read, staff write
DROP POLICY IF EXISTS "brands_select" ON brands;
CREATE POLICY "brands_select" ON brands FOR SELECT
  TO anon, authenticated USING (is_active = true OR is_staff());

DROP POLICY IF EXISTS "brands_all" ON brands;
CREATE POLICY "brands_all" ON brands FOR ALL
  TO authenticated USING (is_staff()) WITH CHECK (is_staff());
  
-- PRODUCT_CATEGORIES: Public read, staff write
DROP POLICY IF EXISTS "categories_select" ON product_categories;
CREATE POLICY "categories_select" ON product_categories FOR SELECT
  TO anon, authenticated USING (is_active = true OR is_staff());

DROP POLICY IF EXISTS "categories_all" ON product_categories;
CREATE POLICY "categories_all" ON product_categories FOR ALL
  TO authenticated USING (is_staff()) WITH CHECK (is_staff());

-- PRODUCTS: Public read (active), staff full access
DROP POLICY IF EXISTS "products_select" ON products;
CREATE POLICY "products_select" ON products FOR SELECT
  TO anon, authenticated USING (is_active = true OR is_staff());

DROP POLICY IF EXISTS "products_insert" ON products;
CREATE POLICY "products_insert" ON products FOR INSERT
  TO authenticated WITH CHECK (is_staff());

DROP POLICY IF EXISTS "products_update" ON products;
CREATE POLICY "products_update" ON products FOR UPDATE
  TO authenticated USING (is_staff()) WITH CHECK (is_staff());

DROP POLICY IF EXISTS "products_delete" ON products;
CREATE POLICY "products_delete" ON products FOR DELETE
  TO authenticated USING (has_role('owner') OR has_role('manager'));

-- SUPPLIERS: Staff only
DROP POLICY IF EXISTS "suppliers_all" ON suppliers;
CREATE POLICY "suppliers_all" ON suppliers FOR ALL
  TO authenticated USING (is_staff()) WITH CHECK (is_staff());
  
-- INVENTORY: Staff only
DROP POLICY IF EXISTS "inventory_all" ON inventory;
CREATE POLICY "inventory_all" ON inventory FOR ALL
  TO authenticated USING (is_staff()) WITH CHECK (is_staff());

-- INVENTORY_MOVEMENTS: Staff only
DROP POLICY IF EXISTS "inventory_movements_select" ON inventory_movements;
CREATE POLICY "inventory_movements_select" ON inventory_movements FOR SELECT
  TO authenticated USING (is_staff());

DROP POLICY IF EXISTS "inventory_movements_insert" ON inventory_movements;
CREATE POLICY "inventory_movements_insert" ON inventory_movements FOR INSERT
  TO authenticated WITH CHECK (is_staff());

-- NOTIFICATIONS: Staff can read all, users read own
DROP POLICY IF EXISTS "notifications_select" ON notifications;
CREATE POLICY "notifications_select" ON notifications FOR SELECT
  TO authenticated USING (
    created_for = auth.uid() OR is_staff()
  );

DROP POLICY IF EXISTS "notifications_insert" ON notifications;
CREATE POLICY "notifications_insert" ON notifications FOR INSERT
  TO authenticated WITH CHECK (is_staff());

DROP POLICY IF EXISTS "notifications_update" ON notifications;
CREATE POLICY "notifications_update" ON notifications FOR UPDATE
  TO authenticated USING (created_for = auth.uid() OR is_staff());

-- ORDERS: Staff full access, customers own orders
DROP POLICY IF EXISTS "orders_select" ON orders;
CREATE POLICY "orders_select" ON orders FOR SELECT
  TO authenticated USING (
    is_staff() OR 
    customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "orders_insert" ON orders;
CREATE POLICY "orders_insert" ON orders FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "orders_update" ON orders;
CREATE POLICY "orders_update" ON orders FOR UPDATE
  TO authenticated USING (is_staff()) WITH CHECK (is_staff());

-- ORDER_ITEMS: Follow order permissions
DROP POLICY IF EXISTS "order_items_select" ON order_items;
CREATE POLICY "order_items_select" ON order_items FOR SELECT
  TO authenticated USING (
    is_staff() OR 
    order_id IN (
      SELECT o.id FROM orders o
      JOIN customers c ON o.customer_id = c.id
      WHERE c.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "order_items_insert" ON order_items;
CREATE POLICY "order_items_insert" ON order_items FOR INSERT
  TO authenticated WITH CHECK (true);

-- PRESCRIPTIONS: Staff and customer own
DROP POLICY IF EXISTS "prescriptions_select" ON prescriptions;
CREATE POLICY "prescriptions_select" ON prescriptions FOR SELECT
  TO authenticated USING (
    is_staff() OR 
    customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "prescriptions_insert" ON prescriptions;
CREATE POLICY "prescriptions_insert" ON prescriptions FOR INSERT
  TO authenticated WITH CHECK (true);

-- PURCHASES: Staff only
DROP POLICY IF EXISTS "purchases_all" ON purchases;
CREATE POLICY "purchases_all" ON purchases FOR ALL
  TO authenticated USING (is_staff()) WITH CHECK (is_staff());

DROP POLICY IF EXISTS "purchase_items_all" ON purchase_items;
CREATE POLICY "purchase_items_all" ON purchase_items FOR ALL
  TO authenticated USING (is_staff()) WITH CHECK (is_staff());

-- GST_INVOICES: Staff only
DROP POLICY IF EXISTS "gst_invoices_all" ON gst_invoices;
CREATE POLICY "gst_invoices_all" ON gst_invoices FOR ALL
  TO authenticated USING (is_staff()) WITH CHECK (is_staff());

-- CART_ITEMS: Users own cart
DROP POLICY IF EXISTS "cart_items_select" ON cart_items;
CREATE POLICY "cart_items_select" ON cart_items FOR SELECT
  TO authenticated USING (user_id = auth.uid() OR session_id IS NOT NULL);

DROP POLICY IF EXISTS "cart_items_insert" ON cart_items;
CREATE POLICY "cart_items_insert" ON cart_items FOR INSERT
  TO authenticated WITH CHECK (user_id = auth.uid() OR session_id IS NOT NULL);

DROP POLICY IF EXISTS "cart_items_update" ON cart_items;
CREATE POLICY "cart_items_update" ON cart_items FOR UPDATE
  TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "cart_items_delete" ON cart_items;
CREATE POLICY "cart_items_delete" ON cart_items FOR DELETE
  TO authenticated USING (user_id = auth.uid() OR session_id IS NOT NULL);

-- WISHLIST: Users own wishlist
DROP POLICY IF EXISTS "wishlist_select" ON wishlist_items;
CREATE POLICY "wishlist_select" ON wishlist_items FOR SELECT
  TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "wishlist_insert" ON wishlist_items;
CREATE POLICY "wishlist_insert" ON wishlist_items FOR INSERT
  TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "wishlist_delete" ON wishlist_items;
CREATE POLICY "wishlist_delete" ON wishlist_items FOR DELETE
  TO authenticated USING (user_id = auth.uid());