export interface Brand {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  name_te: string | null;
  parent_id: string | null;
  description: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  name_te: string | null;
  description: string | null;
  description_te: string | null;
  brand_id: string | null;
  category_id: string;
  price: number;
  mrp: number;
  gst_rate: number;
  image_urls: string[];
  specifications: Record<string, string>;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  brand?: Brand;
  category?: ProductCategory;
  inventory?: Inventory;
}

export interface Inventory {
  id: string;
  product_id: string;
  quantity: number;
  min_quantity: number;
  location: string | null;
  last_updated: string;
}

export interface Customer {
  id: string;
  user_id: string | null;
  name: string;
  email: string | null;
  phone: string;
  alternate_phone: string | null;
  address: string | null;
  city: string;
  state: string;
  pincode: string | null;
  date_of_birth: string | null;
  notes: string | null;
  total_purchases: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string | null;
  status: 'pending' | 'confirmed' | 'processing' | 'ready' | 'delivered' | 'cancelled';
  subtotal: number;
  gst_amount: number;
  discount: number;
  total: number;
  prescription_id: string | null;
  notes: string | null;
  whatsapp_message_sent: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  customer?: Customer;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_sku: string | null;
  quantity: number;
  unit_price: number;
  gst_rate: number;
  gst_amount: number | null;
  total: number;
  created_at: string;
}

export interface CartItem {
  id: string;
  user_id: string | null;
  session_id: string | null;
  product_id: string;
  quantity: number;
  created_at: string;
  product?: Product;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: Product;
}

export interface Prescription {
  id: string;
  customer_id: string | null;
  order_id: string | null;
  file_url: string;
  left_eye_sphere: number | null;
  left_eye_cylinder: number | null;
  left_eye_axis: number | null;
  left_eye_add: number | null;
  right_eye_sphere: number | null;
  right_eye_cylinder: number | null;
  right_eye_axis: number | null;
  right_eye_add: number | null;
  pd: number | null;
  notes: string | null;
  created_at: string;
}

export interface Role {
  id: string;
  name: string;
  description: string | null;
  permissions: Record<string, boolean>;
  created_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role_id: string;
  created_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  gstin: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Purchase {
  id: string;
  purchase_number: string;
  supplier_id: string | null;
  total_amount: number;
  gst_amount: number;
  status: 'pending' | 'received' | 'partial' | 'cancelled';
  notes: string | null;
  created_by: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data: Record<string, unknown>;
  is_read: boolean;
  created_for: string | null;
  created_at: string;
}

export interface GSTInvoice {
  id: string;
  invoice_number: string;
  order_id: string | null;
  customer_name: string;
  customer_address: string | null;
  customer_gstin: string | null;
  subtotal: number;
  cgst_amount: number;
  sgst_amount: number;
  igst_amount: number;
  total: number;
  invoice_date: string;
  created_at: string;
}
