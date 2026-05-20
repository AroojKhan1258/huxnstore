/**
 * seedOrders.js — Creates realistic sample data:
 * - Sets some products to low/out-of-stock
 * - Adds price histories showing real increases (triggers AI drop suggestions)
 * - Creates 25 orders from real customer names (not admin)
 * - Spread across 90 days so all graphs show movement
 *
 * Run: node seedOrders.js
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/huxnStore";

const Product = mongoose.model("Product", new mongoose.Schema({
  name: String, price: Number, image: String,
  countInStock: Number, priceHistory: Array,
}, { strict: false }));

const User = mongoose.model("User", new mongoose.Schema({
  username: String, email: String, isAdmin: Boolean,
}, { strict: false }));

const Order = mongoose.model("Order", new mongoose.Schema({
  user: mongoose.Schema.Types.ObjectId,
  orderItems: Array, shippingAddress: Object,
  paymentMethod: String,
  itemsPrice: Number, taxPrice: Number, shippingPrice: Number, totalPrice: Number,
  isPaid: Boolean, paidAt: Date, isDelivered: Boolean, deliveredAt: Date,
}, { strict: false, timestamps: true }));

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const CUSTOMERS = [
  { username: "sarah_khan",   email: "sarah@example.com"   },
  { username: "john_doe",     email: "john@example.com"    },
  { username: "emma_wilson",  email: "emma@example.com"    },
  { username: "ali_raza",     email: "ali@example.com"     },
  { username: "fatima_malik", email: "fatima@example.com"  },
  { username: "james_brown",  email: "james@example.com"   },
  { username: "aisha_tariq",  email: "aisha@example.com"   },
  { username: "mike_ross",    email: "mike@example.com"    },
];

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log("✅ Connected to MongoDB\n");

  const products = await Product.find({});
  if (!products.length) {
    console.log("❌ No products found. Add products first.");
    return await mongoose.disconnect();
  }
  console.log(`📦 ${products.length} products found\n`);

  // ── Step 1: Delete ALL old seeded orders for clean start ──────
  const del = await Order.deleteMany({});
  if (del.deletedCount) console.log(`🗑️  Deleted ${del.deletedCount} old orders`);

  // ── Step 2: Set realistic stock levels ─────────────────────────
  // First 2 products → out of stock (0)
  // Next 2 → critical (2-4)
  // Next 2 → low (5-8)
  // Rest → healthy
  for (let i = 0; i < products.length; i++) {
    let stock;
    if (i === 0)      stock = 0;   // Out of stock
    else if (i === 1) stock = 0;   // Out of stock
    else if (i === 2) stock = 3;   // Critical
    else if (i === 3) stock = 2;   // Critical
    else if (i === 4) stock = 6;   // Low
    else if (i === 5) stock = 8;   // Low
    else              stock = rand(15, 60); // Healthy

    await Product.updateOne({ _id: products[i]._id }, { $set: { countInStock: stock } });
    const label = stock === 0 ? "OUT OF STOCK" : stock < 5 ? "CRITICAL" : stock < 10 ? "LOW" : "healthy";
    console.log(`  📦 ${products[i].name.substring(0, 30).padEnd(32)} → stock: ${stock} (${label})`);
  }
  console.log();

  // ── Step 3: Add realistic price histories ──────────────────────
  // Some products have steep price increases (AI will suggest dropping)
  const priceScenarios = [
    // [m3, m2, m1, now] as multipliers — increasing = AI drop suggestion
    [0.70, 0.80, 0.90, 1.00],  // +43% increase → AI says DROP
    [0.75, 0.85, 0.92, 1.00],  // +33% increase → AI says DROP
    [0.88, 0.92, 0.96, 1.00],  // +14% slight increase
    [0.95, 0.97, 0.99, 1.00],  // stable
    [1.00, 0.99, 0.97, 0.95],  // decreasing
    [0.90, 0.93, 0.97, 1.00],  // +11% increase
    [1.00, 1.00, 1.00, 1.00],  // stable
    [0.80, 0.87, 0.93, 1.00],  // +25% increase → AI says DROP
  ];

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const scenario = priceScenarios[i % priceScenarios.length];
    const base = p.price;
    const history = [
      { price: +(base * scenario[0]).toFixed(2), date: new Date(Date.now() - 90 * 86400000) },
      { price: +(base * scenario[1]).toFixed(2), date: new Date(Date.now() - 60 * 86400000) },
      { price: +(base * scenario[2]).toFixed(2), date: new Date(Date.now() - 30 * 86400000) },
      { price: +(base * scenario[3]).toFixed(2), date: new Date() },
    ];
    await Product.updateOne({ _id: p._id }, { $set: { priceHistory: history } });
    const change = Math.round(((scenario[3] - scenario[0]) / scenario[0]) * 100);
    console.log(`  💹 ${p.name.substring(0, 30).padEnd(32)} → price change: ${change > 0 ? "+" : ""}${change}%`);
  }
  console.log();

  // ── Step 4: Create sample customer users ───────────────────────
  const customerUsers = [];
  for (const c of CUSTOMERS) {
    let u = await User.findOne({ email: c.email });
    if (!u) u = await User.create({ username: c.username, email: c.email, password: "hashedpw123", isAdmin: false });
    customerUsers.push(u);
  }
  console.log(`👥 ${customerUsers.length} customer users ready\n`);

  // ── Step 5: Create 25 realistic orders ─────────────────────────
  const existingOrders = await Order.countDocuments();
  if (existingOrders >= 15) {
    console.log(`📋 Already ${existingOrders} orders — skipping order creation`);
  } else {
    const freshProducts = await Product.find({});
    const orders = [];
    for (let i = 0; i < 25; i++) {
      const customer = customerUsers[rand(0, customerUsers.length - 1)];
      const numItems = rand(1, Math.min(3, freshProducts.length));
      const picked   = [...freshProducts].sort(() => 0.5 - Math.random()).slice(0, numItems);

      const orderItems = picked.map(p => ({
        name: p.name, qty: rand(1, 3),
        image: p.image || "", price: p.price, product: p._id,
      }));

      const itemsPrice    = +orderItems.reduce((s, it) => s + it.price * it.qty, 0).toFixed(2);
      const taxPrice      = +(itemsPrice * 0.15).toFixed(2);
      const shippingPrice = itemsPrice > 100 ? 0 : 10;
      const totalPrice    = +(itemsPrice + taxPrice + shippingPrice).toFixed(2);

      const daysAgo   = rand(1, 90);
      const orderDate = new Date(Date.now() - daysAgo * 86400000);
      const isPaid    = Math.random() > 0.2;
      const isDelivered = isPaid && Math.random() > 0.35;

      orders.push({
        user: customer._id,
        orderItems,
        shippingAddress: { address: "123 Main St", city: "Karachi", postalCode: "75500", country: "Pakistan" },
        paymentMethod: "PayPal",
        itemsPrice, taxPrice, shippingPrice, totalPrice,
        isPaid, paidAt: isPaid ? orderDate : undefined,
        isDelivered, deliveredAt: isDelivered ? orderDate : undefined,
        createdAt: orderDate,
      });
    }
    await Order.insertMany(orders);
    console.log(`🛒 ${orders.length} orders created from customer accounts`);
  }

  // ── Summary ────────────────────────────────────────────────────
  const totalOrders  = await Order.countDocuments();
  const paidOrders   = await Order.countDocuments({ isPaid: true });
  const outOfStock   = await Product.countDocuments({ countInStock: 0 });
  const lowStock     = await Product.countDocuments({ countInStock: { $gt: 0, $lte: 5 } });
  const revenue      = await Order.aggregate([
    { $match: { isPaid: true } },
    { $group: { _id: null, total: { $sum: "$totalPrice" } } }
  ]);

  console.log("\n══════════════════════════════════");
  console.log(`✅ Total Orders   : ${totalOrders}`);
  console.log(`✅ Paid Orders    : ${paidOrders}`);
  console.log(`✅ Revenue        : $${(revenue[0]?.total || 0).toFixed(2)}`);
  console.log(`🔴 Out of Stock   : ${outOfStock} products`);
  console.log(`🟡 Low Stock      : ${lowStock} products`);
  console.log("══════════════════════════════════");
  console.log("\n🎉 Done! Dashboard graphs will now show:");
  console.log("   - Sales trend with movement");
  console.log("   - Out of stock + critical inventory alerts");
  console.log("   - Price drop AI suggestions");
  console.log("   - Real customer names (not admin)\n");

  await mongoose.disconnect();
}

run().catch(console.error);
