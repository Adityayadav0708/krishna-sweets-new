# 🎓 Krishna Sweets — Technical Architecture & Viva Guide

**Project:** Full-Stack MERN E-Commerce Web Application with Cash on Delivery & Cloudinary Integration  
**Role / Level:** Production-Ready Full-Stack Web Development (B.Tech CSE Capstone / Major Project)  
**Client:** Krishna Sweets (Traditional Mithai House, Chhibramau, Kannauj)

---

## 1. System Architecture Overview

```
┌────────────────────────────────────────────────────────┐
│                   FRONTEND (React + Vite)              │
│               Port: 5173 | D:/full stck ks/client/kp    │
│  - React Router DOM (Declarative Routing)              │
│  - Context API (AuthContext, CartProvider)             │
│  - Axios Client (Interceptors for Bearer & Refresh)    │
│  - Pure CSS Modules & Google Fonts Typography          │
└───────────────────────────▲────────────────────────────┘
                            │ REST API (JSON / Cookies)
                            │ withCredentials: true
┌───────────────────────────▼────────────────────────────┐
│                  BACKEND (Node.js + Express)           │
│                 Port: 5006 | D:/full stck ks/backend   │
│  - Express REST Controllers & Routers                  │
│  - Authentication Guard (auth, isAdmin)                │
│  - Multer Memory Storage & Cloudinary v2 Stream SDK    │
│  - Resend Email API for Transactional Flows            │
└───────────────────────────▲────────────────────────────┘
                            │ Mongoose ODM
┌───────────────────────────▼────────────────────────────┐
│                    DATABASE (MongoDB)                  │
│              URI: mongodb://127.0.0.1:27017/E_COMMERCE  │
│  - Collections: users, products, carts, orders,        │
│    addresses, categories, subcategories                │
└────────────────────────────────────────────────────────┘
```

---

## 2. Database Models & Schema Design

### 1. `User` Schema (`backend/src/models/User.js`)
- `name`: String (required)
- `email`: String (unique, required)
- `password`: String (bcrypt hashed)
- `avatar`: String (Cloudinary URL)
- `mobile`: String
- `verify_email`: Boolean (default `false`)
- `role`: Enum `['user', 'admin']` (default `'user'`)
- `refreshToken`: String (JWT signed)
- `forgot_password_otp`, `forgot_password_otp_expiry`

### 2. `Product` Schema (`backend/src/models/Product.js`)
- `title` / `name`: String (required)
- `image`: Array of Strings (Cloudinary image URLs)
- `category`: Mixed / String (flexible for custom store categories)
- `unit`: String (e.g. `'500g'`, `'1kg'`)
- `stock`: Number (default `25`)
- `price`: Number (required)
- `discount`: Number (% off)
- `description`: String
- `more_details`: Object (`ingredients`, `shelfLife`, `storage`)
- `publish`: Boolean (default `true`)

### 3. `Cart` Schema (`backend/src/models/Cart.js`)
- `userId`: ObjectId (references `User`)
- `productId`: Mixed / ObjectId (references `Product`)
- `size`: String (e.g., `'250g'`, `'500g'`, `'1kg'`, default `'500g'`)
- `quantity`: Number (default `1`)

### 4. `Order` Schema (`backend/src/models/Order.js`)
- `userId`: ObjectId (references `User`)
- `orderId`: String
- `items`: Array of `{ productId, name, size, quantity, price }`
- `address`: Object (`fullName`, `phone`, `addressLine`, `city`, `pinCode`)
- `paymentMethod`: String (default `'COD'`)
- `paymentStatus`: Enum `['Pending', 'Completed', 'Failed']`
- `status`: Enum `['Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled']`
- `totalAmount`: Number

---

## 3. Core REST Endpoints Directory

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `POST` | `/api/auth/signup` | Public | Registers a new user account and triggers email verification |
| `POST` | `/api/auth/login` | Public | Authenticates credentials, sets httpOnly cookies (`accessToken`, `refreshToken`) |
| `POST` | `/api/auth/logout` | Authenticated | Clears cookies and invalidates session |
| `GET` | `/api/auth/user-details` | Authenticated | Returns current profile data (excluding password) |
| `PUT` | `/api/auth/update-user` | Authenticated | Updates customer name, mobile, and address |
| `POST` | `/api/auth/refresh-token` | Public | Generates a new access token using the refresh token |
| `GET` | `/api/products` | Public | Retrieves all live products with optional `?search=` and `?category=` |
| `GET` | `/api/products/:id` | Public | Retrieves a single product document |
| `POST` | `/api/products/add` | Admin Only | Inserts a new sweet into the MongoDB catalogue |
| `PUT` | `/api/products/update/:id` | Admin Only | Updates pricing, stock, descriptions, and portions |
| `DELETE` | `/api/products/delete/:id` | Admin Only | Removes a sweet from the menu |
| `POST` | `/api/products/upload-image` | Admin Only | Streams an image file to Cloudinary via Multer memory storage |
| `GET` | `/api/cart/my-cart` | Authenticated | Retrieves current user's synchronized shopping bag |
| `POST` | `/api/cart/add` | Authenticated | Adds sweet item with chosen portion size to cart |
| `POST` | `/api/order/create` | Authenticated | Places a Cash on Delivery order with inline delivery address |
| `GET` | `/api/order/my-orders` | Authenticated | Customer order history with 4-stage tracking status |
| `GET` | `/api/order/all-orders` | Admin Only | Store owner real-time orders dashboard |
| `PUT` | `/api/order/update-status` | Admin Only | Updates order lifecycle status (`Confirmed` ➔ `Preparing` ➔ `Out for Delivery` ➔ `Delivered`) |

---

## 4. Key Security Implementations

1. **Dual-Layer JWT Authentication:**
   - Primary: `httpOnly` secure cookies prevent XSS theft of auth tokens.
   - Secondary: `Authorization: Bearer <token>` in Axios request interceptor ensures authentication succeeds even if browsers block third-party cookies.
2. **Silent Token Refresh:**
   - Access tokens expire after 1 hour for security.
   - An Axios response interceptor catches `401 Unauthorized` responses and silently requests a new access token via `/api/auth/refresh-token`, replaying the original request without user logout.
3. **Prevention of Client ID Spoofing:**
   - In cart and order controllers, `userId` is never trusted from the client JSON body (`req.body.userId`). It is extracted directly from the verified JWT payload (`req.userId`).
4. **Strict Role Guarding (`isAdmin`):**
   - Routes like `/api/products/add`, `/api/products/upload-image`, and `/api/order/all-orders` execute `isAdmin` middleware, querying MongoDB to verify `user.role === 'admin'`.

---

## 5. College Viva / Technical Interview Questions & Answers

### Q1: Why did you use JWTs with both httpOnly cookies and an Axios Bearer interceptor?
> **Answer:** `httpOnly` cookies provide the strongest protection against Cross-Site Scripting (XSS) because JavaScript cannot read or extract the cookie. However, modern browsers (like Safari with ITP or Chrome in Incognito) often block cross-site cookies. By adding a request interceptor that provides `Authorization: Bearer <token>` as a fallback, our application guarantees resilient authentication across any browser environment.

### Q2: How does the system handle weight-based pricing for sweets?
> **Answer:** Traditional mithai is sold by weight (250g, 500g, 1kg). Our MongoDB `Product` model stores the base unit and price (e.g., ₹900 per 1kg). The `adaptProduct` service dynamically calculates proportional prices for smaller portions (`250g`, `500g`). Both the `Cart` and `Order` schemas store the selected `size` string to ensure accurate billing and kitchen packing.

### Q3: Why stream images through Multer memory storage to Cloudinary instead of saving to local disk?
> **Answer:** Saving images to the local server disk creates storage bloat, causes disk filling issues, and fails in modern serverless or ephemeral container deployments (like Vercel, Render, or Docker containers). Using `multer.memoryStorage()` streams the image buffer directly to Cloudinary's CDN, returning a secure, globally distributed CDN URL.

### Q4: How is real-time order tracking handled for the customer?
> **Answer:** Each order has a lifecycle state: `Confirmed` ➔ `Preparing` ➔ `Out for Delivery` ➔ `Delivered`. When the store owner updates this status in the Admin Portal, it writes to MongoDB. When the customer opens `/my-orders`, the React frontend reads `ord.status` and computes a 4-stage visual stepper, highlighting the current state and providing a one-click WhatsApp button referencing their Order ID.
