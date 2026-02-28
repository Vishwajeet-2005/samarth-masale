# 🌶 Shri Swami Samarth Masale — Full Stack E-commerce

## Project Structure
```
samarth-masale-backend/
├── server.js          ← Express backend (API + auth + cart + orders)
├── package.json       ← Node dependencies
├── public/
│   ├── index.html     ← Full frontend (HTML + CSS + JS)
│   └── logo.jpeg      ← Company logo
└── README.md
```

---

## 🚀 Quick Start (3 Steps)

### Step 1 — Install Node.js
Download and install Node.js from: https://nodejs.org (v18+ recommended)

### Step 2 — Install Dependencies
Open terminal in this folder and run:
```bash
npm install
```

### Step 3 — Start the Server
```bash
npm start
```

Open your browser and go to: **http://localhost:3000**

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint              | Description       |
|--------|-----------------------|-------------------|
| POST   | /api/auth/register    | Create new account|
| POST   | /api/auth/login       | Login & get token |
| GET    | /api/auth/profile     | Get profile (auth)|
| PUT    | /api/auth/profile     | Update profile    |

### Products
| Method | Endpoint              | Description             |
|--------|-----------------------|-------------------------|
| GET    | /api/products         | All products            |
| GET    | /api/products?category=blend | Filter by category |
| GET    | /api/products/:id     | Single product          |

### Cart (requires login)
| Method | Endpoint              | Description       |
|--------|-----------------------|-------------------|
| GET    | /api/cart             | Get cart          |
| POST   | /api/cart             | Add item          |
| PUT    | /api/cart/:productId  | Update qty        |
| DELETE | /api/cart/:productId  | Remove item       |

### Orders (requires login)
| Method | Endpoint              | Description       |
|--------|-----------------------|-------------------|
| GET    | /api/orders           | Get all orders    |
| POST   | /api/orders           | Place new order   |
| GET    | /api/orders/:id       | Single order      |

---

## ⚡ Features

### Frontend
- ✅ Login / Sign Up modal with form validation
- ✅ JWT authentication (auto-restore on refresh)
- ✅ Product catalog with category filter
- ✅ Product popup with details, quantity selector
- ✅ Cart sidebar (live updates, qty changes, remove)
- ✅ Checkout modal (address + 4 payment methods)
- ✅ Order success screen with order ID
- ✅ Account dashboard (Profile, My Orders, Settings)
- ✅ Free delivery logic (₹499+)
- ✅ Toast notifications
- ✅ Responsive design (mobile + desktop)
- ✅ Animated hero, product cards, marquee

### Backend
- ✅ JWT authentication with bcrypt password hashing
- ✅ Cart synced to server when logged in
- ✅ Order history persisted per user
- ✅ Guest cart (localStorage fallback)
- ✅ CORS enabled for development

---

## 🗄 Database (Production Upgrade)

This demo uses **in-memory storage** (resets on restart).
For production, replace with:

**MongoDB** (recommended):
```bash
npm install mongoose
```

**PostgreSQL**:
```bash
npm install pg sequelize
```

**MySQL**:
```bash
npm install mysql2 sequelize
```

---

## 🌍 Deploy to Production

### Option 1: Railway (Easiest)
1. Push to GitHub
2. Go to railway.app and connect repo
3. It auto-deploys!

### Option 2: Render
1. Push to GitHub
2. Go to render.com → New Web Service
3. Build command: `npm install`
4. Start command: `node server.js`

### Option 3: VPS (DigitalOcean / AWS)
```bash
npm install pm2 -g
pm2 start server.js --name "samarth-masale"
pm2 save && pm2 startup
```

---

## 🔐 Environment Variables (Production)
Create a `.env` file:
```
PORT=3000
JWT_SECRET=your-super-secret-key-here
```

---

Made with ❤️ for Shri Swami Samarth Masale 🌶
