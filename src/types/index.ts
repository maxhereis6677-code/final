import type { OrderStatus, PerfumeCategory, PaymentMethod } from "@/lib/constants";

export interface User {
  id: string;
  name: string;
  phone: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: PerfumeCategory;
  stock: number;
  featured: boolean;
  rating: number;
  discount_percentage?: number;
  original_price?: number | null;
  created_at: string;
}

export interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product?: Product;
}

export interface Order {
  id: string;
  user_id: string | null;
  is_guest?: boolean;
  guest_name?: string;
  guest_phone?: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  payment_method: PaymentMethod;
  shipping_address: string;
  shipping_city: string;
  shipping_phone: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
}

export interface AdminStats {
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  totalProducts: number;
  pendingOrders: number;
  recentOrders: Order[];
}
