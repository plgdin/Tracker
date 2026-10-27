import type { Order, OrderItem, OrderStatus, PaymentStatus } from '../types/ecommerce';
import { INITIAL_ORDERS } from './mockData';
import { db } from '../lib/db';

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
  idempotencyKey?: string;
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
   * Fetch all orders from stanes db backend ('online' store)
   */
  async getAll(): Promise<Order[]> {
    try {
      const orders = await db.getOnlineOrders();
      if (orders && orders.length > 0) {
        const mapped: Order[] = orders.map((o) => {
          let orderItems: OrderItem[] = [];
          if (Array.isArray(o.items)) {
            orderItems = o.items.map((it: any, idx: number) => ({
              id: it.id || `item-${o.id}-${idx}`,
              orderId: String(o.id),
              productId: it.productId || it.id || '',
              productName: it.productName || it.name || '',
              variantName: it.variantName || it.selectedVariant,
              unitPrice: Number(it.unitPrice ?? it.price ?? 0),
              quantity: Number(it.quantity ?? 1),
              lineTotal: Number(it.lineTotal ?? ((it.unitPrice ?? it.price ?? 0) * (it.quantity ?? 1))),
              image: it.image || it.image_url,
            }));
          }

          return {
            id: String(o.id),
            orderNumber: String(o.id).startsWith('BNJ-') || String(o.id).startsWith('ORD-') ? String(o.id) : `ORD-${String(o.id).substring(0, 5).toUpperCase()}`,
            customerName: o.customer_name || 'Customer',
            customerPhone: o.customer_phone || '',
            customerWhatsapp: o.customer_phone || '',
            pickupPreference: o.delivery_type || 'Store Pickup',
            notes: o.notes || '',
            items: orderItems,
            subtotal: Number(o.total_amount) || 0,
            discount: 0,
            total: Number(o.total_amount) || 0,
            orderStatus: (o.status as OrderStatus) || 'new',
            paymentStatus: o.transaction_id ? 'paid' : 'pending',
            idempotencyKey: o.offer_code || undefined,
            createdAt: o.created_at || new Date().toISOString(),
          };
        });

        saveOrders(mapped);
        return mapped;
      }
    } catch (e) {
      console.warn('Backend orders fetch failed, using stored:', e);
    }

    const stored = getStoredOrders();
    return stored.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getById(idOrNumber: string): Promise<Order | undefined> {
    const orders = await this.getAll();
    return orders.find((o) => o.id === idOrNumber || o.orderNumber === idOrNumber);
  },

  /**
   * Create a new order connected to stanes db backend
   */
  async create(input: CreateOrderInput): Promise<{ order: Order; whatsappUrl: string }> {
    const orders = getStoredOrders();

    // Idempotency Key Check
    if (input.idempotencyKey) {
      const existing = orders.find((o) => o.idempotencyKey === input.idempotencyKey);
      if (existing) {
        return {
          order: existing,
          whatsappUrl: this.generateWhatsAppUrl(existing),
        };
      }
    }

    // Atomic order ID via stanes db RPC or fallback
    let orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`;
    try {
      orderNumber = await db.generateOrderId();
    } catch {
      orderNumber = `BNJ-${Math.floor(1000 + Math.random() * 9000)}`;
    }
    const orderId = orderNumber;

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
      idempotencyKey: input.idempotencyKey,
      createdAt: new Date().toISOString(),
    };

    // Save directly into stanes online_orders backend
    try {
      await db.addOnlineOrder({
        id: orderId,
        store_type: 'online',
        customer_name: newOrder.customerName,
        customer_phone: newOrder.customerPhone,
        customer_email: '',
        delivery_type: newOrder.pickupPreference,
        address: '',
        notes: newOrder.notes,
        offer_code: input.idempotencyKey || '',
        total_amount: total,
        items: items.map((it) => ({
          id: it.productId,
          name: it.productName,
          price: it.unitPrice.toString(),
          quantity: it.quantity,
        })),
      });
    } catch (e) {
      console.warn('Backend db.addOnlineOrder failed, saving locally:', e);
    }

    orders.unshift(newOrder);
    saveOrders(orders);

    const whatsappUrl = this.generateWhatsAppUrl(newOrder);
    return { order: newOrder, whatsappUrl };
  },

  generateWhatsAppUrl(order: Order, targetPhoneNumber?: string): string {
    const storeNumber = 
      targetPhoneNumber || 
      import.meta.env.VITE_WHATSAPP_NUMBER || 
      '919778052356';

    const cleanNumber = storeNumber.replace(/\D/g, '');

    const lines: string[] = [
      `🍰 *NEW ORDER: ${order.orderNumber}*`,
      `*Store:* NayaKart (Kazhakuttam, Thiruvananthapuram)`,
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

  async updateStatus(orderId: string, status: OrderStatus): Promise<Order> {
    try {
      const dbStatus = status === 'completed' ? 'completed' : status === 'cancelled' ? 'cancelled' : 'pending';
      await db.updateOrderStatus(orderId, dbStatus);
    } catch (e) {
      console.warn('Backend updateOrderStatus failed:', e);
    }

    const orders = getStoredOrders();
    const idx = orders.findIndex((o) => o.id === orderId || o.orderNumber === orderId);
    if (idx === -1) throw new Error('Order not found');
    orders[idx].orderStatus = status;
    saveOrders(orders);
    return orders[idx];
  },

  async updatePaymentStatus(orderId: string, paymentStatus: PaymentStatus): Promise<Order> {
    try {
      if (paymentStatus === 'paid') {
        await db.updateOrderTransactionId(orderId, `UTR-${Date.now()}`);
      }
    } catch (e) {
      console.warn('Backend updateOrderTransactionId failed:', e);
    }

    const orders = getStoredOrders();
    const idx = orders.findIndex((o) => o.id === orderId || o.orderNumber === orderId);
    if (idx === -1) throw new Error('Order not found');
    orders[idx].paymentStatus = paymentStatus;
    saveOrders(orders);
    return orders[idx];
  },

  async resetToDefaults(): Promise<void> {
    saveOrders(INITIAL_ORDERS);
  },
};
