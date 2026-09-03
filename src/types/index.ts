export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  compare_at_price?: number;
  cost?: number;
  shipping_cost?: number;
  material?: string;
  fit?: string;
  care_instructions?: string;
  shipping_info?: string;
  return_info?: string;
  sku?: string;
  cj_product_id?: string;
  status: 'draft' | 'testing' | 'active' | 'paused' | 'winner' | 'discontinued';
  featured?: boolean;
  tags?: string[];
  size_chart_image?: string;
  fit_photo?: string;
  images?: ProductImage[];
  variants?: ProductVariant[];
  created_at?: string;
  updated_at?: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt?: string;
  sort_order: number;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  color?: string;
  size?: string;
  price_modifier: number;
  stock: number;
  cj_variant_id?: string;
  cj_sku?: string;
  sku?: string;
}

export interface CartItem {
  productId: string;
  variantId?: string;
  name: string;
  price: number;
  color?: string;
  size?: string;
  quantity: number;
  imageUrl?: string;
  cjProductId?: string;
  cjVariantId?: string;
}

export interface Customer {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  created_at?: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id?: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  subtotal: number;
  shipping_cost: number;
  total: number;
  payment_status: PaymentStatus;
  fulfillment_status: FulfillmentStatus;
  payment_provider?: string;
  payment_reference?: string;
  payment_verified?: boolean;
  cj_order_id?: string;
  cj_submitted_at?: string;
  cj_error?: string;
  tracking_number?: string;
  carrier?: string;
  tracking_url?: string;
  estimated_delivery?: string;
  notes?: string;
  idempotency_key?: string;
  created_at?: string;
  updated_at?: string;
  order_items?: OrderItem[];
}

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded' | 'chargeback';
export type FulfillmentStatus = 'awaiting_fulfillment' | 'sent_to_cj' | 'cj_processing' | 'shipped' | 'in_transit' | 'delivered' | 'fulfillment_error' | 'cancelled';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string;
  variant_id?: string;
  product_name?: string;
  color?: string;
  size?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  cj_product_id?: string;
  cj_variant_id?: string;
  image_url?: string;
}

export interface PaymentTransaction {
  id: string;
  order_id?: string;
  provider: string;
  transaction_id?: string;
  reference?: string;
  amount?: number;
  currency?: string;
  status: string;
  webhook_received?: boolean;
  webhook_data?: Record<string, unknown>;
  error_message?: string;
  created_at?: string;
}

export interface FulfillmentRecord {
  id: string;
  order_id?: string;
  cj_order_id?: string;
  status?: string;
  error_message?: string;
  retry_count: number;
  last_polled_at?: string;
  raw_response?: Record<string, unknown>;
}

export interface Return {
  id: string;
  order_id?: string;
  customer_email?: string;
  product_name?: string;
  reason?: string;
  evidence_urls?: string[];
  status: 'pending' | 'approved' | 'rejected' | 'refunded' | 'replacement_sent';
  cj_dispute_ref?: string;
  refund_amount?: number;
  notes?: string;
  created_at?: string;
}

export interface ContentEntry {
  id: string;
  video_url?: string;
  product_id?: string;
  hook?: string;
  posted_at?: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  profile_visits: number;
  link_clicks: number;
  orders: number;
  revenue: number;
  notes?: string;
  created_at?: string;
}

export interface SiteSetting {
  id: string;
  key: string;
  value?: string;
  value_json?: Record<string, unknown>;
}

export interface CheckoutForm {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface AdminSession {
  email: string;
  loggedIn: boolean;
  timestamp: number;
}

export type PaymentProvider = 'paystack' | 'flutterwave';
