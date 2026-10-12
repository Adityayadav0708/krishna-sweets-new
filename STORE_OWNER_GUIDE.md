# 🍬 Krishna Sweets — Store Owner Operating Manual

**Welcome to your online store management system!**  
This guide explains how to operate your digital sweets shop in Chhibramau, manage your mithai catalog, add daily fresh items, upload photos from your phone, and handle customer delivery orders.

---

## 1. Accessing Your Admin Portal

1. Open your website in any browser: `http://localhost:5173` (or your live domain).
2. Click **"Sign In"** in the top-right corner.
3. Enter your store administrator credentials:
   - **Email:** `adityayadav8362@gmail.com`
   - **Password:** *(Your admin password)*
4. Once signed in, you will see a golden **"Admin Portal"** badge in your top header.
5. Click **"Admin Portal"** or select **"Manage Sweets"** from your account dropdown to open your dashboard (`/admin`).

---

## 2. Managing Your Sweets Menu

### Adding a New Sweet:
1. In the Admin Portal, click the dark maroon button: **"+ Add New Sweet"**.
2. Fill in the details:
   - **Sweet Name:** e.g., *Special Kaju Katli*, *Desi Ghee Besan Ladoo*.
   - **Category:** Choose an existing category or create a new one (e.g., *Signature, Bengali, Ladoo, Festive, Dry Fruit, Halwa*).
   - **Unit & Base Price:** e.g., ₹900 per 1 kg. The website automatically calculates smaller portions (250g, 500g) for customers.
   - **Stock Quantity:** Enter how many kilograms or boxes you have prepared fresh.
   - **Photo Upload:** Click **"Upload from Device"** to pick a photo directly from your smartphone gallery or computer. The photo is automatically processed and hosted via Cloudinary.
   - **Ingredients & Heritage Story:** Mention pure ingredients (*Pure Desi Ghee, Pistachios, Saffron*) to build customer trust.
3. Click **"Save Sweet Item"**. It will immediately appear on the storefront.

### Updating Prices, Portions, or Details:
- Click the **"Edit"** button on any sweet row in your menu table.
- Modify the price, description, or photo.
- Click **"Save Changes"**. Changes take effect instantly for all customers.

### 1-Click "Sold Out" Toggle:
- During festivals or busy hours when an item finishes, click the green **"In Stock"** pill.
- It immediately flips to red **"Sold Out"** on the website, preventing customers from ordering finished batches until you prepare the next fresh batch.

---

## 3. Handling Customer Orders (Cash on Delivery)

1. Click the **"Customer Orders"** tab in your Admin Portal.
2. At a glance, you will see:
   - **Total Sweets on Menu**
   - **Fresh & In Stock count**
   - **Active In-Kitchen Orders**
   - **Total Shop Revenue (₹)**
3. Each incoming order displays:
   - **Order ID:** e.g., `#B17D2F`
   - **Customer Name & Phone Number**
   - **Delivery Address in Chhibramau**
   - **Sweets & Portions:** e.g., *Kaju Katli (500g) × 2, Motichoor Ladoo (1kg) × 1*
   - **Total Bill:** e.g., *₹1,450 (Cash on Delivery)*

### Updating Order Status:
Select the new status from the dropdown as your kitchen progresses:
- **Confirmed:** Order received and accepted.
- **Preparing Fresh:** Sweets are currently being packed/prepared in the kitchen.
- **Out for Delivery:** Sweet box is handed to your delivery person.
- **Delivered:** Handed over to the customer and Cash on Delivery collected.

### WhatsApp Customer Messaging:
- On each order row, click the **"WhatsApp Customer"** button.
- It opens WhatsApp with a ready-made message:
  > *"Hello [Customer Name], updating you regarding your order #[ID] from Krishna Sweets. Order status: [Status]. Total bill: ₹[Amount] (Cash on Delivery). Thank you!"*

---

## 4. Customer Support on WhatsApp
- Customers can also click the floating WhatsApp button on any order to ask questions about delivery timing.
- Direct messages will arrive at your shop WhatsApp number: `+91 8858609844`.
