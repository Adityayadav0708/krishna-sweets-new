# Krishna Sweets 🍬

A full-stack e-commerce web application for an Indian sweets shop, built using the MERN stack.

## 🔗 Live Demo
**Website:** (https://krishna-sweets-new.vercel.app/)

**GitHub:** https://github.com/Adityayadav0708/krishna-sweets-new

## 🛠️ Tech Stack
- **Frontend:** React.js, Vite, React Router, CSS Modules
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas (Mongoose)
- **Hosting:** Vercel (Frontend) + Render (Backend)
- **Others:** Cloudinary (image upload), JWT (authentication), Nodemailer (email OTP)

## ✨ Features
- Browse and search sweet products by category
- Add to cart and checkout with delivery address
- User signup, login, and logout
- OTP-based forgot password via email
- Secure authentication using JWT (access + refresh tokens in HTTP-only cookies)
- Customer order history
- **Admin Dashboard:**
  - Add, edit, and delete products with image uploads (Cloudinary)
  - Manage and update order statuses
  - Analytics charts (revenue, sales trends, top products, order stats)

## 🚀 Run Locally

**Backend:**
```bash
cd backend
npm install
# create .env from .env.example and fill in your values
npm run dev
```

**Frontend:**
```bash
cd client/kp
npm install
# set VITE_API_URL=http://localhost:5006/api in .env
npm run dev
```


