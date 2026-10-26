export interface ProductVariant {
  id: string;
  name: string; // e.g. "250g", "500g", "1kg", "Pack of 12", "Red", "Gold"
  price: number;
  discountPrice?: number;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number;
  categoryId: string;
  categoryName: string;
  images: string[];
  stock: number;
  variants?: ProductVariant[];
  brand?: string;
  rating: number;
  reviewsCount: number;
  isFeatured: boolean;
  isActive: boolean;
  tags?: string[];
  unit?: string; // e.g. "Pack", "Bottle", "Box", "Kg"
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  color: string; // From brand palette: '#EAF05C', '#FF5C34', '#D7EFFF', '#AEBBA0', '#351E28'
  iconName: string;
  displayOrder: number;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  image?: string;
  selectedVariant?: string; // variant name or ID
  categoryName?: string;
}

export type OrderStatus = 
  | 'new'
  | 'pending'
  | 'confirmed'
  | 'ready_for_pickup'
  | 'completed'
  | 'cancelled';

export type PaymentStatus = 
  | 'pending'
  | 'paid'
  | 'refunded';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  variantName?: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  image?: string;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. BNJ-1082
  customerName: string;
  customerPhone: string;
  customerWhatsapp?: string;
  pickupPreference: string; // "Today - 5:00 PM", "Tomorrow - Morning", etc.
  notes?: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  idempotencyKey?: string;
  createdAt: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  description: string;
  address: string;
  phone: string;
  whatsappNumber: string;
  email: string;
  openingHours: string;
  currency: string;
  currencySymbol: string;
  announcement: string;
  logoUrl?: string;
}

export interface DemoUser {
  id: string;
  email: string;
  role: 'admin' | 'customer';
  name: string;
}
