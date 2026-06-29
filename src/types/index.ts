export interface Brand {
  id: string;
  name: string;
  logo_url: string | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  name_te: string | null;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Inventory {
  id: string;
  product_id: string;
  quantity: number;
  min_quantity: number;
  location: string | null;
  last_updated: string;
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
  discount_price: number;
  gst_rate: number;
  image_urls: string[];
  specifications: Record<string, string>;
  features: string[];
  is_active: boolean;
  is_featured: boolean;
  is_new_arrival: boolean;
  is_top_selling: boolean;
  frame_shape: string | null;
  material: string | null;
  gender: string | null;
  color: string | null;
  size: string | null;
  weight: string | null;
  warranty: string | null;
  rating: number;
  review_count: number;
  popularity: number;
  view_count: number;
  search_keywords: string[];
  tags: string[];
  images_360: Record<string, string>;
  created_at: string;
  updated_at: string;
  brand?: Brand;
  category?: ProductCategory;
  inventory?: Inventory;
  reviews?: Review[];
  product_images?: ProductImage[];
}

export interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  product?: Product;
}

export interface WishlistItem {
  id: string;
  product_id: string;
  created_at: string;
  product?: Product;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  date_of_birth: string | null;
  notes: string | null;
  created_at: string;
  last_visit?: string | null;
  total_spent?: number;
  preferred_brands?: string[];
  order_count?: number;
  prescription_count?: number;
}

export interface Prescription {
  id: string;
  customer_id: string | null;
  order_id: string | null;
  file_url: string | null;
  file_name: string | null;
  left_eye_sphere: number | null;
  left_eye_cylinder: number | null;
  left_eye_axis: number | null;
  left_eye_add: number | null;
  left_eye_va: string | null;
  right_eye_sphere: number | null;
  right_eye_cylinder: number | null;
  right_eye_axis: number | null;
  right_eye_add: number | null;
  right_eye_va: string | null;
  pd: number | null;
  lens_type: string | null;
  lens_brand: string | null;
  lens_coating: string | null;
  prescription_date: string | null;
  notes: string | null;
  created_at: string;
  customer?: Customer;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_sku: string;
  quantity: number;
  unit_price: number;
  gst_rate: number;
  gst_amount: number;
  total: number;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  status: 'pending' | 'confirmed' | 'processing' | 'ready' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  gst_amount: number;
  discount: number;
  total: number;
  prescription_id: string | null;
  notes: string | null;
  whatsapp_message_sent: boolean;
  created_at: string;
  updated_at: string;
  customer?: Customer;
  prescription?: Prescription;
  items?: OrderItem[];
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

export interface Review {
  id: string;
  product_id: string;
  customer_id: string | null;
  customer_name: string;
  rating: number;
  title: string | null;
  review_text: string;
  verified_purchase: boolean;
  helpful_count: number;
  created_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  view_type: 'front' | 'side' | 'model' | '3d';
  url: string;
  sort_order: number;
  created_at: string;
}

export interface RecentlyViewed {
  id: string;
  product_id: string;
  customer_id: string | null;
  viewed_at: string;
  product?: Product;
}

export interface CustomerReminder {
  id: string;
  customer_id: string;
  reminder_type: 'birthday' | 'eye_test' | 'promotion';
  reminder_date: string;
  message: string | null;
  is_sent: boolean;
  created_at: string;
}
