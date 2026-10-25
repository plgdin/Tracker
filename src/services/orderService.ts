import type { Order, OrderItem, OrderStatus, PaymentStatus } from '../types/ecommerce';
import { INITIAL_ORDERS } from './mockData';

const STORAGE_KEY = 'bnj_orders';

const getStoredOrders = (): Order[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ORDERS));
      return INITIAL_ORDERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_ORDERS;
  }
};

const saveOrders = (orders: Order[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
};

export interface CreateOrderInput {
  customerName: string;
  customerPhone: string;
  customerWhatsapp?: string;
  pickupPreference: string;
  notes?: string;
  items: Array<{
    productId: string;
    productName: string;
    variantName?: string;
    unitPrice: number;
    quantity: number;
    image?: string;
  }>;
}

export const orderService = {
  /**
   * Fetch all orders (Admin)
   * Supabase Integration Point:
   * const { data, error } = await supabase.from('orders').select('*, items:order_items(*)').order('created_at', { ascending: false });
   */
  async getAll(): Promise<Order[]> {
    const orders = getStoredOrders();
    return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  /**
   * Fetch single order by ID or orderNumber
   */
  async getById(idOrNumber: string): Promise<Order | undefined> {
    const orders = getStoredOrders();
    return orders.find((o) => o.id === idOrNumber || o.orderNumber === idOrNumber);
  },

  /**
   * Create a new order from checkout.
   * Supabase Integration Point:
   * const { data: order, error } = await supabase.from('orders').insert([orderPayload]).select().single();
   * await supabase.from('order_items').insert(itemsPayload);
   */
  async create(input: CreateOrderInput): Promise<{ order: Order; whatsappUrl: string }> {
    const orders = getStoredOrders();
    const orderNumber = `BNJ-${Math.floor(1000 + Math.random() * 9000)}`;
    const orderId = `ord-${Date.now()}`;

    const items: OrderItem[] = input.items.map((it, idx) => ({
      id: `item-${Date.now()}-${idx}`,
      orderId,
      productId: it.productId,
      productName: it.productName,
      variantName: it.variantName,
      unitPrice: it.unitPrice,
      quantity: it.quantity,
      lineTotal: it.unitPrice * it.quantity,
      image: it.image,
    }));

    const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
    const discount = 0;
    const total = subtotal - discount;

    const newOrder: Order = {
      id: orderId,
      orderNumber,
      customerName: input.customerName.trim(),
      customerPhone: input.customerPhone.trim(),
      customerWhatsapp: input.customerWhatsapp?.trim() || input.customerPhone.trim(),
      pickupPreference: input.pickupPreference,
      notes: input.notes?.trim() || '',
      items,
      subtotal,
      discount,
      total,
      orderStatus: 'new',
      paymentStatus: 'pending',
      createdAt: new Date().toISOString(),
    };

    orders.unshift(newOrder);
    saveOrders(orders);

    const whatsappUrl = this.generateWhatsAppUrl(newOrder);
    return { order: newOrder, whatsappUrl };
  },

  /**
   * Formats a clean, readable message and generates WhatsApp click-to-chat URL.
   * NOTE: Store phone number is configurable via import.meta.env.VITE_WHATSAPP_NUMBER or store settings.
   */
  generateWhatsAppUrl(order: Order, targetPhoneNumber?: string): string {
    const storeNumber = 
      targetPhoneNumber || 
      import.meta.env.VITE_WHATSAPP_NUMBER || 
      '919999999999';

    // Sanitize phone number (strip spaces, +, -, etc.)
    const cleanNumber = storeNumber.replace(/\D/g, '');

    const lines: string[] = [
      `🍰 *NEW ORDER: ${order.orderNumber}*`,
      `*Store:* NayaKart (Trivandrum)`,
      `---------------------------------`,
      `👤 *Customer:* ${order.customerName}`,
      `📞 *Phone:* ${order.customerPhone}`,
      order.customerWhatsapp ? `💬 *WhatsApp:* ${order.customerWhatsapp}` : '',
      `⏰ *Pickup:* ${order.pickupPreference}`,
      order.notes ? `📝 *Notes:* ${order.notes}` : '',
      `---------------------------------`,
      `🛒 *ITEMS ORDERED:*`,
    ].filter(Boolean);

    order.items.forEach((item, i) => {
      const variantText = item.variantName ? ` (${item.variantName})` : '';
      lines.push(`${i + 1}. ${item.productName}${variantText}`);
      lines.push(`   Qty: ${item.quantity} × ₹${item.unitPrice} = *₹${item.lineTotal}*`);
    });

    lines.push(`---------------------------------`);
    lines.push(`💰 *TOTAL AMOUNT: ₹${order.total}*`);
    lines.push(`💳 *Payment:* In-store at counter / UPI`);
    lines.push(``);
    lines.push(`Hi NayaKart, I have placed order *${order.orderNumber}*. Please confirm item availability and let me know when ready for pickup!`);

    const messageText = lines.join('\n');
    const encodedMessage = encodeURIComponent(messageText);

    return `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
  },

  /**
   * Update order workflow status (Admin)
   * Statuses: 'new' | 'pending' | 'confirmed' | 'ready_for_pickup' | 'completed' | 'cancelled'
   */
  async updateStatus(orderId: string, status: OrderStatus): Promise<Order> {
    const orders = getStoredOrders();
    const idx = orders.findIndex((o) => o.id === orderId || o.orderNumber === orderId);
    if (idx === -1) throw new Error('Order not found');
    orders[idx].orderStatus = status;
    saveOrders(orders);
    return orders[idx];
  },

  /**
   * Update payment status (Admin)
   * Statuses: 'pending' | 'paid' | 'refunded'
   */
  async updatePaymentStatus(orderId: string, paymentStatus: PaymentStatus): Promise<Order> {
    const orders = getStoredOrders();
    const idx = orders.findIndex((o) => o.id === orderId || o.orderNumber === orderId);
    if (idx === -1) throw new Error('Order not found');
    orders[idx].paymentStatus = paymentStatus;
    saveOrders(orders);
    return orders[idx];
  },

  /**
   * Reset orders to demo initial records
   */
  async resetToDefaults(): Promise<void> {
    saveOrders(INITIAL_ORDERS);
  },
};
