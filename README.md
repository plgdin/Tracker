# 🍰 NayaKart — Premium Baking Supplies & Cake Decor E-Commerce

A complete, modern, responsive e-commerce web application for **NayaKart**, a physical retail store in Trivandrum specializing in professional baking ingredients, cake decoration accessories, silicone moulds, cake toppers, whipping creams, food colours, and packaging supplies.

---

## 🎨 Mandatory Brand Color Palette

- **Wasabi (`#EAF05C`):** Primary accent, selected states, badges, and promotional highlights.
- **Orange Topaze (`#FF5C34`):** Primary action buttons, cart triggers, and prominent calls to action.
- **Cool Blue (`#D7EFFF`):** Secondary backgrounds, product-category cards, and informational sections.
- **Cassis (`#351E28`):** Headings, dark panels, footer, and admin navigation.
- **Vert Sauge (`#AEBBA0`):** Subtle backgrounds, secondary cards, and supporting UI accents.
- **Warm Off-White (`#F8F7F0`):** Main page background for clean, editorial elegance.
- **Pure White (`#FFFFFF`):** Product cards, input forms, and content surfaces.

---

## 🚀 Key Features

### 🛒 Customer-Facing Storefront
1. **Editorial Homepage:**
   - Announcement bar with in-store counter pickup notifications.
   - High-impact hero section with bakery photography and trust guarantees.
   - 10 distinct category cards styled with brand palette colors.
   - Featured products & trending supplies grids with quick Add-to-Cart.
   - Promotional showcase for Belgian couverture chocolate and oil-based candy colours.
   - Physical Trivandrum store location section with address, timings, and direct WhatsApp inquiries.
   - Rich Cassis footer with quick links and store hours.

2. **Full Product Catalogue (`/products`):**
   - Live search with instant debounced auto-complete dropdown.
   - Category filtering pills with Wasabi active highlights.
   - Price range filters & In-Stock availability toggle.
   - Multiple sorting modes: Featured, Price Low-High, Price High-Low, Most Popular, Newest.
   - Empty state with one-click filter reset.

3. **Interactive Product Detail Modal:**
   - Multi-image gallery with discount badges.
   - Variant selector (pack sizes, weights, options).
   - Quantity stepper and live in-stock counter.
   - Direct WhatsApp enquiry button.

4. **Shopping Cart & Checkout Flow:**
   - Persistent slide-over cart drawer with quantity steppers.
   - Checkout modal capturing Name, Phone, WhatsApp, and Pickup Time Preference.
   - Zero-fee Trivandrum counter pickup information.
   - Form validation with formatted error messages.

5. **WhatsApp Click-to-Chat Dispatch:**
   - Generates a unique order reference (e.g. `BNJ-8241`).
   - Automatically formats a clean WhatsApp message containing the customer's name, phone, pickup slot, itemized list, quantities, unit prices, and final total.
   - Opens the WhatsApp conversation with the store owner (`VITE_WHATSAPP_NUMBER`).
   - Displays a confirmation screen with order summary and WhatsApp re-open option.

---

### 🛡️ Admin Dashboard (`/admin`)

- **Demo Authentication (`/admin/login`):**
  - Evaluator demo credentials:
    - **Email:** `admin@demo.com`
    - **Password:** `Demo@123`
  - Convenient **"Click to Auto-fill Demo Credentials"** button for instant testing.
  - Session persistence in `localStorage`.

- **Overview (`/admin`):**
  - 8 KPI cards: Total Products, Active Products, Total Orders, Pending, Confirmed, Ready for Pickup, Completed, Revenue.
  - Recent customer orders table with inline workflow status updates.

- **Product Management (`/admin/products`):**
  - Full product table with search and category filtering.
  - Add & Edit product modal with instant local image preview via `FileReader`.
  - Stock quantity editor, active status toggle, and featured product toggle.
  - Safe delete confirmation dialog.

- **Category Management (`/admin/categories`):**
  - View all 10 product categories.
  - Add & edit categories with brand palette swatch selection (`Wasabi`, `Orange Topaze`, `Cool Blue`, `Vert Sauge`, `Cassis`).
  - Delete category.

- **Order & Pickup Management (`/admin/orders`):**
  - Filter orders by workflow status (`New`, `Pending`, `Confirmed`, `Ready for Pickup`, `Completed`, `Cancelled`).
  - Order details modal with item breakdown and customer notes.
  - Independent payment status tracker (`Pending`, `Paid`, `Refunded`).
  - Direct WhatsApp button to message the customer.

- **Store Settings (`/admin/settings`):**
  - Live configuration of Store Name, Tagline, Address, Phone, WhatsApp desk number, Announcement banner, and Opening hours.
  - Updates immediately reflect across the customer storefront.

---

## 🔌 Supabase Backend Integration Guide

The frontend is architected with a dedicated service layer in `src/services/` that decouples UI components from storage. Replacing the mock layer with a live Supabase backend is clean and straightforward:

### 1. `src/services/productService.ts`
- **List products:** Replace `getStoredProducts()` with:
  ```ts
  const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
  ```
- **Insert product:**
  ```ts
  const { data, error } = await supabase.from('products').insert([productData]).select().single();
  ```

### 2. `src/services/categoryService.ts`
- **List categories:**
  ```ts
  const { data, error } = await supabase.from('categories').select('*').order('display_order', { ascending: true });
  ```

### 3. `src/services/orderService.ts`
- **Save orders:**
  ```ts
  const { data: order, error } = await supabase.from('orders').insert([orderPayload]).select().single();
  await supabase.from('order_items').insert(itemsPayload);
  ```

### 4. `src/services/authService.ts`
- **Supabase Auth:**
  ```ts
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  ```

### 5. `src/services/storageService.ts`
- **Supabase Storage:**
  ```ts
  const { data, error } = await supabase.storage.from('product-images').upload(`products/${fileName}`, file);
  ```

---

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Start Vite dev server
npm run dev

# Build for production
npm run build
```

Storefront will be running locally at `http://localhost:5173/`.
Admin console accessible at `http://localhost:5173/admin`.
