/*
# S V Opticals - Enhanced Schema with Employees and Sales

## New Tables:
- `employees` - Staff/employee management with role assignments
- `sales` - Daily sales tracking and revenue
- `sale_items` - Items within each sale

## New Features:
- Auto-update timestamp triggers
- Low stock trigger for notifications
- Additional indexes for performance
- Sample employees, customers, orders, and sales
- Helper views for reports

## Notes:
1. Employees can be linked to auth.users for login access
2. Sales table tracks point-of-sale transactions
3. Triggers automatically update timestamps
*/

-- ============================================
-- EMPLOYEES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  employee_id text UNIQUE NOT NULL,
  name text NOT NULL,
  email text,
  phone text NOT NULL,
  role_id uuid REFERENCES roles(id) ON DELETE SET NULL,
  department text,
  hire_date date DEFAULT CURRENT_DATE,
  salary numeric,
  is_active boolean DEFAULT true,
  address text,
  emergency_contact text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Policies for employees
DROP POLICY IF EXISTS "employees_select" ON employees;
CREATE POLICY "employees_select" ON employees FOR SELECT
  TO authenticated USING (is_staff());

DROP POLICY IF EXISTS "employees_insert" ON employees;
CREATE POLICY "employees_insert" ON employees FOR INSERT
  TO authenticated WITH CHECK (has_role('owner') OR has_role('manager'));

DROP POLICY IF EXISTS "employees_update" ON employees;
CREATE POLICY "employees_update" ON employees FOR UPDATE
  TO authenticated USING (has_role('owner') OR has_role('manager'))
  WITH CHECK (has_role('owner') OR has_role('manager'));

DROP POLICY IF EXISTS "employees_delete" ON employees;
CREATE POLICY "employees_delete" ON employees FOR DELETE
  TO authenticated USING (has_role('owner'));

-- ============================================
-- SALES TABLE (Point-of-Sale)
-- ============================================

CREATE TABLE IF NOT EXISTS sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_number text UNIQUE NOT NULL,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  employee_id uuid REFERENCES employees(id) ON DELETE SET NULL,
  sale_type text DEFAULT 'retail' CHECK (sale_type IN ('retail', 'wholesale', 'online')),
  subtotal numeric NOT NULL,
  discount numeric DEFAULT 0,
  gst_amount numeric DEFAULT 0,
  total numeric NOT NULL,
  payment_method text DEFAULT 'cash' CHECK (payment_method IN ('cash', 'card', 'upi', 'credit', 'mixed')),
  payment_status text DEFAULT 'paid' CHECK (payment_status IN ('pending', 'paid', 'partial', 'refunded')),
  prescription_id uuid REFERENCES prescriptions(id) ON DELETE SET NULL,
  notes text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sales_select" ON sales;
CREATE POLICY "sales_select" ON sales FOR SELECT
  TO authenticated USING (is_staff());

DROP POLICY IF EXISTS "sales_insert" ON sales;
CREATE POLICY "sales_insert" ON sales FOR INSERT
  TO authenticated WITH CHECK (
    has_role('owner') OR has_role('manager') OR has_role('sales_staff')
  );

DROP POLICY IF EXISTS "sales_update" ON sales;
CREATE POLICY "sales_update" ON sales FOR UPDATE
  TO authenticated USING (has_role('owner') OR has_role('manager'));

CREATE TABLE IF NOT EXISTS sale_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id uuid NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  product_sku text,
  quantity integer NOT NULL,
  unit_price numeric NOT NULL,
  gst_rate numeric DEFAULT 18,
  gst_amount numeric,
  discount numeric DEFAULT 0,
  total numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sale_items_select" ON sale_items;
CREATE POLICY "sale_items_select" ON sale_items FOR SELECT
  TO authenticated USING (is_staff());

DROP POLICY IF EXISTS "sale_items_insert" ON sale_items;
CREATE POLICY "sale_items_insert" ON sale_items FOR INSERT
  TO authenticated WITH CHECK (
    has_role('owner') OR has_role('manager') OR has_role('sales_staff')
  );

-- ============================================
-- INDEXES FOR NEW TABLES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_employees_role ON employees(role_id);
CREATE INDEX IF NOT EXISTS idx_employees_active ON employees(is_active);
CREATE INDEX IF NOT EXISTS idx_sales_customer ON sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_employee ON sales(employee_id);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sales_type ON sales(sale_type);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_type ON inventory_movements(movement_type);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_date ON inventory_movements(created_at DESC);

-- ============================================
-- AUTO-UPDATE TIMESTAMP TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_employees_updated_at ON employees;
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- LOW STOCK ALERT TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION check_low_stock()
RETURNS TRIGGER AS $$
DECLARE
  product_name text;
BEGIN
  IF NEW.quantity <= NEW.min_quantity THEN
    SELECT name INTO product_name FROM products WHERE id = NEW.product_id;
    
    INSERT INTO notifications (type, title, message, data)
    VALUES (
      'low_stock',
      'Low Stock Alert',
      product_name || ' is running low. Current: ' || NEW.quantity || ', Minimum: ' || NEW.min_quantity,
      jsonb_build_object(
        'product_id', NEW.product_id,
        'current_quantity', NEW.quantity,
        'min_quantity', NEW.min_quantity
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS check_low_stock_trigger ON inventory;
CREATE TRIGGER check_low_stock_trigger AFTER UPDATE ON inventory
  FOR EACH ROW WHEN (NEW.quantity <= NEW.min_quantity)
  EXECUTE FUNCTION check_low_stock();

-- ============================================
-- SAMPLE EMPLOYEES
-- ============================================

INSERT INTO employees (employee_id, name, email, phone, role_id, department, salary)
SELECT 'EMP001', 'Dr. R.K. Gupta', 'drrkgupta037@gmail.com', '+91 9441273074', 
  (SELECT id FROM roles WHERE name = 'owner' LIMIT 1), 'Management', 75000
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_id = 'EMP001');

INSERT INTO employees (employee_id, name, email, phone, role_id, department, salary)
SELECT 'EMP002', 'Ramesh Kumar', 'ramesh@svopticals.com', '+91 9876543211', 
  (SELECT id FROM roles WHERE name = 'manager' LIMIT 1), 'Operations', 35000
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_id = 'EMP002');

INSERT INTO employees (employee_id, name, email, phone, role_id, department, salary)
SELECT 'EMP003', 'Priya Sharma', 'priya@svopticals.com', '+91 9876543212', 
  (SELECT id FROM roles WHERE name = 'sales_staff' LIMIT 1), 'Sales', 25000
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_id = 'EMP003');

INSERT INTO employees (employee_id, name, email, phone, role_id, department, salary)
SELECT 'EMP004', 'Amit Patel', 'amit@svopticals.com', '+91 9876543213', 
  (SELECT id FROM roles WHERE name = 'inventory_staff' LIMIT 1), 'Inventory', 22000
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE employee_id = 'EMP004');

-- ============================================
-- SAMPLE CUSTOMERS
-- ============================================

INSERT INTO customers (name, email, phone, address, city, state, pincode)
SELECT 'Rajesh Reddy', 'rajesh.reddy@email.com', '+91 9876543220', 'Banjara Hills, Road No. 5', 'Hyderabad', 'Telangana', '500034'
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE phone = '+91 9876543220');

INSERT INTO customers (name, email, phone, address, city, state, pincode)
SELECT 'Sunita Devi', 'sunita.devi@email.com', '+91 9876543221', 'Madhapur, Hitech City', 'Hyderabad', 'Telangana', '500081'
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE phone = '+91 9876543221');

INSERT INTO customers (name, email, phone, address, city, state, pincode)
SELECT 'Vikram Singh', 'vikram.singh@email.com', '+91 9876543222', 'Secunderabad, Malkajgiri', 'Hyderabad', 'Telangana', '500047'
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE phone = '+91 9876543222');

INSERT INTO customers (name, email, phone, address, city, state, pincode)
SELECT 'Lakshmi Prasad', 'lakshmi.prasad@email.com', '+91 9876543223', 'Kukatpally, KPHB', 'Hyderabad', 'Telangana', '500072'
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE phone = '+91 9876543223');

INSERT INTO customers (name, email, phone, address, city, state, pincode)
SELECT 'Ananya Rao', 'ananya.rao@email.com', '+91 9876543224', 'Gachibowli, Financial District', 'Hyderabad', 'Telangana', '500032'
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE phone = '+91 9876543224');

-- ============================================
-- SAMPLE ORDERS
-- ============================================

INSERT INTO orders (order_number, customer_id, status, subtotal, gst_amount, total, notes)
SELECT 'SVO2506230001', 
  (SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 0),
  'delivered', 8500, 1530, 10030, 'Delivered to customer'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE order_number = 'SVO2506230001');

INSERT INTO orders (order_number, customer_id, status, subtotal, gst_amount, total)
SELECT 'SVO2506230002', 
  (SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 1),
  'ready', 5500, 990, 6490
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE order_number = 'SVO2506230002');

INSERT INTO orders (order_number, customer_id, status, subtotal, gst_amount, total)
SELECT 'SVO2506230003', 
  (SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 2),
  'processing', 12000, 2160, 14160
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE order_number = 'SVO2506230003');

INSERT INTO orders (order_number, customer_id, status, subtotal, gst_amount, total)
SELECT 'SVO2506230004', 
  (SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 3),
  'pending', 3200, 576, 3776
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE order_number = 'SVO2506230004');

INSERT INTO orders (order_number, customer_id, status, subtotal, gst_amount, total)
SELECT 'SVO2506230005', 
  (SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 4),
  'confirmed', 7800, 1404, 9204
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE order_number = 'SVO2506230005');

-- ============================================
-- SAMPLE SALES
-- ============================================

INSERT INTO sales (sale_number, customer_id, employee_id, sale_type, subtotal, gst_amount, total, payment_method)
SELECT 'SAL2506230001',
  (SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 0),
  (SELECT id FROM employees WHERE employee_id = 'EMP003' LIMIT 1),
  'retail', 8500, 1530, 10030, 'card'
WHERE NOT EXISTS (SELECT 1 FROM sales WHERE sale_number = 'SAL2506230001');

INSERT INTO sales (sale_number, employee_id, sale_type, subtotal, gst_amount, total, payment_method)
SELECT 'SAL2506230002',
  (SELECT id FROM employees WHERE employee_id = 'EMP003' LIMIT 1),
  'retail', 4500, 810, 5310, 'cash'
WHERE NOT EXISTS (SELECT 1 FROM sales WHERE sale_number = 'SAL2506230002');

INSERT INTO sales (sale_number, customer_id, employee_id, sale_type, subtotal, gst_amount, total, payment_method)
SELECT 'SAL2506230003',
  (SELECT id FROM customers ORDER BY created_at LIMIT 1 OFFSET 1),
  (SELECT id FROM employees WHERE employee_id = 'EMP002' LIMIT 1),
  'retail', 12000, 2160, 14160, 'upi'
WHERE NOT EXISTS (SELECT 1 FROM sales WHERE sale_number = 'SAL2506230003');

-- ============================================
-- HELPER VIEWS FOR REPORTS
-- ============================================

CREATE OR REPLACE VIEW daily_sales_summary AS
SELECT
  DATE(created_at) as sale_date,
  COUNT(*) as total_sales,
  SUM(subtotal) as total_revenue,
  SUM(gst_amount) as total_gst,
  SUM(total) as total_with_gst,
  SUM(CASE WHEN payment_method = 'cash' THEN total ELSE 0 END) as cash_sales,
  SUM(CASE WHEN payment_method = 'card' THEN total ELSE 0 END) as card_sales,
  SUM(CASE WHEN payment_method = 'upi' THEN total ELSE 0 END) as upi_sales
FROM sales
GROUP BY DATE(created_at)
ORDER BY sale_date DESC;

CREATE OR REPLACE VIEW low_stock_alerts AS
SELECT
  i.id,
  i.product_id,
  p.name as product_name,
  p.sku,
  b.name as brand_name,
  i.quantity,
  i.min_quantity,
  i.last_updated
FROM inventory i
JOIN products p ON i.product_id = p.id
LEFT JOIN brands b ON p.brand_id = b.id
WHERE i.quantity <= i.min_quantity
ORDER BY i.quantity ASC;

CREATE OR REPLACE VIEW top_products_by_sales AS
SELECT
  p.id,
  p.name as product_name,
  p.sku,
  b.name as brand_name,
  COUNT(si.id) as times_sold,
  SUM(si.quantity) as total_quantity_sold,
  SUM(si.total) as total_revenue
FROM products p
LEFT JOIN sale_items si ON p.id = si.product_id
LEFT JOIN brands b ON p.brand_id = b.id
GROUP BY p.id, p.name, p.sku, b.name
ORDER BY total_revenue DESC NULLS LAST
LIMIT 20;

CREATE OR REPLACE VIEW customer_stats AS
SELECT
  c.id,
  c.name,
  c.phone,
  c.email,
  COUNT(DISTINCT o.id) as order_count,
  COUNT(DISTINCT s.id) as sale_count,
  COALESCE(SUM(o.total), 0) as total_order_value,
  COALESCE(SUM(s.total), 0) as total_sale_value,
  MAX(COALESCE(o.created_at, s.created_at)) as last_purchase_date
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id
LEFT JOIN sales s ON c.id = s.customer_id
GROUP BY c.id, c.name, c.phone, c.email
ORDER BY total_sale_value DESC;
