const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'samarth-masale-secret-2025';

// ── Detect where index.html lives ──
// Supports both: files in same folder OR inside a /public subfolder
const publicDir = fs.existsSync(path.join(__dirname, 'public', 'index.html'))
  ? path.join(__dirname, 'public')
  : __dirname;

console.log(`📁  Serving static files from: ${publicDir}`);

// ── Middleware ──
app.use(cors());
app.use(express.json());
app.use(express.static(publicDir));

// ── In-Memory Database (replace with MongoDB/PostgreSQL in production) ──
const db = {
  users: [],      // { id, name, email, phone, password(hashed), address, createdAt }
  orders: [],     // { id, userId, items, total, status, address, createdAt }
  carts: {},      // { userId: [{ productId, name, price, emoji, qty }] }
  reviews: [],    // { id, userId, productId, rating, comment, createdAt }
};

// ── Products Data ──
const products = [
  { id: 1,  name: "Garam Masala",        emoji: "🫙",  category: "blend",   badge: "Best Seller",    price: 149, old: 199, weight: "100g", origin: "Punjab Blend",           stock: 150, desc: "Aromatic blend of 12+ hand-picked whole spices stone-ground to perfection. Transforms every dish with rich, warming depth.",   details: { Type: "Blend", Weight: "100g / 200g", Shelf: "18 months", Origin: "Pan-India" }, tags: ["No Preservatives","Stone Ground","Airtight Pack"] },
  { id: 2,  name: "Turmeric Powder",     emoji: "💛",  category: "powder",  badge: "Pure & Natural", price: 99,  old: 129, weight: "200g", origin: "Erode, Tamil Nadu",       stock: 200, desc: "Golden-yellow powder packed with curcumin sourced from the finest farms of Erode — the turmeric capital of India.", details: { Type: "Powder", Weight: "200g / 500g", Shelf: "24 months", Curcumin: "5.2%" }, tags: ["Lab Tested","High Curcumin","Pure"] },
  { id: 3,  name: "Red Chili Powder",    emoji: "🌶️", category: "powder",  badge: "Fiery Hot",      price: 129, old: 159, weight: "200g", origin: "Guntur, Andhra Pradesh", stock: 180, desc: "Guntur's famous red chilies — sun-dried and ground to bring you brilliant color and intense heat. Perfect for curries and marinades.", details: { Type: "Powder", Weight: "200g / 500g", Heat: "Extra Hot", Shelf: "18 months" }, tags: ["Vibrant Color","Extra Spicy","Sun Dried"] },
  { id: 4,  name: "Coriander Powder",    emoji: "🌿",  category: "powder",  badge: "Freshly Ground", price: 89,  old: 115, weight: "200g", origin: "Rajasthan",              stock: 175, desc: "Slow-roasted coriander seeds from Rajasthan stone-ground to unlock full nutty, citrusy aroma. Earthy base for any curry.", details: { Type: "Powder", Weight: "200g / 500g", Aroma: "High", Shelf: "18 months" }, tags: ["Slow Roasted","Aromatic","Farm Fresh"] },
  { id: 5,  name: "Cumin Seeds",         emoji: "🫘",  category: "seed",    badge: "Whole & Pure",   price: 119, old: 149, weight: "200g", origin: "Gujarat",                stock: 160, desc: "Hand-cleaned cumin seeds from Gujarat — plump, dark, and full of distinctive warm, earthy flavor. Ideal for tadkas and rice dishes.", details: { Type: "Whole Seed", Weight: "200g / 500g", Form: "Whole", Shelf: "24 months" }, tags: ["Hand Cleaned","No Dust","Premium Grade"] },
  { id: 6,  name: "Kolhapuri Masala",    emoji: "🔥",  category: "blend",   badge: "Authentic",      price: 179, old: 229, weight: "100g", origin: "Kolhapur, Maharashtra",  stock: 90,  desc: "The legendary fiery Kolhapuri Masala crafted from the traditional recipe of Kolhapur. The secret behind Tambda Rassa and Kolhapuri Mutton.", details: { Type: "Blend", Weight: "100g / 200g", Heat: "Very Hot", Shelf: "12 months" }, tags: ["Traditional Recipe","Maharashtra Special","Zero Compromise"] },
  { id: 7,  name: "Black Pepper Powder", emoji: "⚫",  category: "powder",  badge: "Premium",        price: 189, old: 249, weight: "100g", origin: "Wayanad, Kerala",        stock: 110, desc: "Kerala's prized Malabar black pepper freshly ground — bold, pungent, and rich in piperine. Elevates everything from soups to desserts.", details: { Type: "Powder", Weight: "100g / 250g", Piperine: "High", Shelf: "18 months" }, tags: ["Single Origin","Fresh Ground","Premium"] },
  { id: 8,  name: "Green Cardamom",      emoji: "🟢",  category: "whole",   badge: "Aromatic",       price: 299, old: 399, weight: "50g",  origin: "Idukki, Kerala",         stock: 75,  desc: "Hand-picked green cardamom pods from the lush Idukki hills of Kerala. Intense sweet-floral scent that transforms biryanis, kheer and chai.", details: { Type: "Whole Pod", Weight: "50g / 100g", Grade: "Premium", Shelf: "24 months" }, tags: ["Hand Picked","Highland Grown","Extra Aromatic"] },
  { id: 9,  name: "Panch Phoron",        emoji: "🌱",  category: "blend",   badge: "Bengali Special",price: 109, old: 139, weight: "100g", origin: "Bengal Blend",           stock: 120, desc: "The quintessential Bengali 5-spice blend — mustard, fennel, fenugreek, cumin, and nigella seeds. Perfect for tempering fish and vegetables.", details: { Type: "Whole Blend", Weight: "100g / 200g", Spices: "5 Whole", Shelf: "18 months" }, tags: ["5 Spice Blend","Bengali Tradition","Whole"] },
  { id: 10, name: "Cinnamon Sticks",     emoji: "🪵",  category: "whole",   badge: "Premium Ceylon", price: 249, old: 329, weight: "100g", origin: "Ceylon / Sri Lanka",     stock: 85,  desc: "True Ceylon cinnamon sticks — soft, delicate, naturally sweet. Far superior to cassia, perfect for curries, desserts, and masalas.", details: { Type: "Whole Stick", Weight: "100g / 250g", Variety: "Ceylon", Shelf: "36 months" }, tags: ["True Ceylon","Soft & Sweet","Premium Import"] },
  { id: 11, name: "Mustard Seeds",       emoji: "🟡",  category: "seed",    badge: "Tadka Essential",price: 79,  old: 99,  weight: "250g", origin: "Rajasthan",              stock: 220, desc: "Fine quality black mustard seeds that pop in hot oil releasing nutty, pungent aroma — the foundation of South Indian and Maharashtrian cooking.", details: { Type: "Whole Seed", Weight: "250g / 500g", Variety: "Black Mustard", Shelf: "24 months" }, tags: ["Black Variety","Tadka Perfect","Pure"] },
  { id: 12, name: "Kitchen King Masala", emoji: "👑",  category: "blend",   badge: "All-in-One",     price: 159, old: 199, weight: "100g", origin: "Special House Blend",    stock: 140, desc: "A masterful blend of 18 spices designed to work in any dish — sabzis, daals, paneer, meat. One masala, endless possibilities.", details: { Type: "Blend", Weight: "100g/200g/500g", Spices: "18 Whole", Shelf: "18 months" }, tags: ["18 Spice Blend","All Purpose","Family Favourite"] },
];

// ── Auth Middleware ──
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// ═══════════════════════════════════════════
//  AUTH ROUTES
// ═══════════════════════════════════════════

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password are required' });
    if (db.users.find(u => u.email === email)) return res.status(409).json({ error: 'Email already registered' });
    const hashed = await bcrypt.hash(password, 10);
    const user = { id: uuidv4(), name, email, phone: phone || '', password: hashed, address: '', createdAt: new Date().toISOString() };
    db.users.push(user);
    db.carts[user.id] = [];
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, phone: user.phone } });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = db.users.find(u => u.email === email);
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' });
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, phone: user.phone } });
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// Get profile
app.get('/api/auth/profile', authMiddleware, (req, res) => {
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ id: user.id, name: user.name, email: user.email, phone: user.phone, address: user.address, createdAt: user.createdAt });
});

// Update profile
app.put('/api/auth/profile', authMiddleware, (req, res) => {
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { name, phone, address } = req.body;
  if (name) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (address !== undefined) user.address = address;
  res.json({ id: user.id, name: user.name, email: user.email, phone: user.phone, address: user.address });
});

// ═══════════════════════════════════════════
//  PRODUCT ROUTES
// ═══════════════════════════════════════════

app.get('/api/products', (req, res) => {
  const { category, search } = req.query;
  let result = products;
  if (category && category !== 'all') result = result.filter(p => p.category === category);
  if (search) result = result.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  res.json(result);
});

app.get('/api/products/:id', (req, res) => {
  const p = products.find(p => p.id === parseInt(req.params.id));
  if (!p) return res.status(404).json({ error: 'Product not found' });
  res.json(p);
});

// ═══════════════════════════════════════════
//  CART ROUTES
// ═══════════════════════════════════════════

app.get('/api/cart', authMiddleware, (req, res) => {
  const cart = db.carts[req.user.id] || [];
  res.json(cart);
});

app.post('/api/cart', authMiddleware, (req, res) => {
  const { productId, qty = 1 } = req.body;
  const product = products.find(p => p.id === productId);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  if (!db.carts[req.user.id]) db.carts[req.user.id] = [];
  const cart = db.carts[req.user.id];
  const existing = cart.find(i => i.productId === productId);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ productId, name: product.name, emoji: product.emoji, price: product.price, weight: product.weight, qty });
  }
  res.json(cart);
});

app.put('/api/cart/:productId', authMiddleware, (req, res) => {
  const { qty } = req.body;
  const cart = db.carts[req.user.id] || [];
  const item = cart.find(i => i.productId === parseInt(req.params.productId));
  if (!item) return res.status(404).json({ error: 'Item not in cart' });
  if (qty <= 0) {
    db.carts[req.user.id] = cart.filter(i => i.productId !== parseInt(req.params.productId));
  } else {
    item.qty = qty;
  }
  res.json(db.carts[req.user.id]);
});

app.delete('/api/cart/:productId', authMiddleware, (req, res) => {
  db.carts[req.user.id] = (db.carts[req.user.id] || []).filter(i => i.productId !== parseInt(req.params.productId));
  res.json(db.carts[req.user.id]);
});

app.delete('/api/cart', authMiddleware, (req, res) => {
  db.carts[req.user.id] = [];
  res.json([]);
});

// ═══════════════════════════════════════════
//  ORDER ROUTES
// ═══════════════════════════════════════════

app.post('/api/orders', authMiddleware, (req, res) => {
  const cart = db.carts[req.user.id] || [];
  if (cart.length === 0) return res.status(400).json({ error: 'Cart is empty' });
  const { address, paymentMethod = 'COD' } = req.body;
  if (!address) return res.status(400).json({ error: 'Delivery address is required' });
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const order = {
    id: 'ORD-' + Date.now(),
    userId: req.user.id,
    items: [...cart],
    total,
    address,
    paymentMethod,
    status: 'Confirmed',
    createdAt: new Date().toISOString(),
  };
  db.orders.push(order);
  db.carts[req.user.id] = [];
  res.status(201).json(order);
});

app.get('/api/orders', authMiddleware, (req, res) => {
  const orders = db.orders.filter(o => o.userId === req.user.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(orders);
});

app.get('/api/orders/:id', authMiddleware, (req, res) => {
  const order = db.orders.find(o => o.id === req.params.id && o.userId === req.user.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

// ── Serve frontend (catch-all) ──
app.get('*', (req, res) => {
  const indexPath = path.join(publicDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send(`
      <h2 style="font-family:sans-serif;color:#7B0D0D;padding:2rem">
        ⚠️ index.html not found!<br><br>
        <small style="font-size:.8rem;color:#555">
          Please make sure <b>index.html</b> and <b>logo.jpeg</b> are in the same folder as server.js<br>
          OR inside a <b>public/</b> subfolder.<br><br>
          Current search path: <code>${publicDir}</code>
        </small>
      </h2>`);
  }
});

app.listen(PORT, () => {
  console.log(`\n🌶  Samarth Masale Server running on http://localhost:${PORT}`);
  console.log(`📁  Static files: ${publicDir}`);
  console.log(`✅  Open http://localhost:${PORT} in your browser\n`);
});
