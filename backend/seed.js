import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/huxnStore";

// ── Reliable Unsplash image URLs (matched to each product) ──────────────────
const IMAGES = {
  headphones: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80",
  smartwatch:  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=500&q=80",
  tshirt:      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=500&q=80",
  shoes:       "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=80",
  cookware:    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=500&q=80",
  book:        "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=500&q=80",
  laptopstand: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?auto=format&fit=crop&w=500&q=80",
  yogamat:     "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=500&q=80",
  coffee:      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=500&q=80",
  laptop:      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=500&q=80",
  phone:       "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=500&q=80",
  camera:      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=500&q=80",
  speaker:     "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=500&q=80",
  bag:         "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=500&q=80",
  jacket:      "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=500&q=80",
  sunglasses:  "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=500&q=80",
  furniture:   "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=500&q=80",
  plant:       "https://images.unsplash.com/photo-1526397751294-331021109fbd?auto=format&fit=crop&w=500&q=80",
  bicycle:     "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=500&q=80",
  gaming:      "https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=500&q=80",
  keyboard:    "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=500&q=80",
  mouse:       "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=500&q=80",
  monitor:     "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=500&q=80",
  tablet:      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=500&q=80",
  backpack:    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=500&q=80",
  perfume:     "https://images.unsplash.com/photo-1541643600914-78b084683702?auto=format&fit=crop&w=500&q=80",
  watch:       "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=500&q=80",
  bottle:      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=500&q=80",
  towel:       "https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=500&q=80",
  skincare:    "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=500&q=80",
  lamp:        "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=500&q=80",
  pillow:      "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=500&q=80",
  blender:     "https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=500&q=80",
  dumbbell:    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=500&q=80",
  boots:       "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=500&q=80",
  default:     "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=500&q=80",
};

/**
 * Pick the best matching image URL for a product
 * based on its name + description keywords.
 */
function pickImage(name = "", description = "") {
  const text = `${name} ${description}`.toLowerCase();

  if (/headphone|earphone|earbud|audio|sound|noise cancel/.test(text)) return IMAGES.headphones;
  if (/smart.?watch|wrist.?watch|watch/i.test(text)) return IMAGES.smartwatch;
  if (/t.shirt|tshirt|shirt|polo|top\b|blouse/.test(text)) return IMAGES.tshirt;
  if (/running shoe|sneaker|shoe|footwear|boot\b/.test(text)) return /boot/.test(text) ? IMAGES.boots : IMAGES.shoes;
  if (/cookware|pan\b|pot\b|casserole|kitchen set|non.?stick/.test(text)) return IMAGES.cookware;
  if (/yoga mat|exercise mat/.test(text)) return IMAGES.yogamat;
  if (/coffee|espresso|cappuccino|latte|brew/.test(text)) return IMAGES.coffee;
  if (/laptop stand|desk stand|monitor stand/.test(text)) return IMAGES.laptopstand;
  if (/laptop|macbook|notebook computer/.test(text)) return IMAGES.laptop;
  if (/phone|smartphone|iphone|android|mobile/.test(text)) return IMAGES.phone;
  if (/camera|dslr|mirrorless|lens/.test(text)) return IMAGES.camera;
  if (/speaker|bluetooth speaker|woofer|subwoofer/.test(text)) return IMAGES.speaker;
  if (/keyboard/.test(text)) return IMAGES.keyboard;
  if (/mouse\b/.test(text)) return IMAGES.mouse;
  if (/monitor|display|screen/.test(text)) return IMAGES.monitor;
  if (/tablet|ipad/.test(text)) return IMAGES.tablet;
  if (/gaming|game controller|gamepad|console/.test(text)) return IMAGES.gaming;
  if (/book|novel|guide|programming|javascript|python/.test(text)) return IMAGES.book;
  if (/jacket|coat|hoodie|sweatshirt/.test(text)) return IMAGES.jacket;
  if (/sunglass|eyewear|glasses/.test(text)) return IMAGES.sunglasses;
  if (/bag\b|handbag|purse|clutch/.test(text)) return IMAGES.bag;
  if (/backpack|rucksack/.test(text)) return IMAGES.backpack;
  if (/sofa|couch|chair|furniture|desk/.test(text)) return IMAGES.furniture;
  if (/plant|succulent|flower|pot plant/.test(text)) return IMAGES.plant;
  if (/bicycle|bike|cycling/.test(text)) return IMAGES.bicycle;
  if (/perfume|fragrance|cologne/.test(text)) return IMAGES.perfume;
  if (/bottle|water bottle|flask/.test(text)) return IMAGES.bottle;
  if (/towel|bath/.test(text)) return IMAGES.towel;
  if (/serum|moisturizer|skincare|cream|lotion/.test(text)) return IMAGES.skincare;
  if (/lamp|light|bulb|lighting/.test(text)) return IMAGES.lamp;
  if (/pillow|cushion/.test(text)) return IMAGES.pillow;
  if (/blender|mixer|juicer/.test(text)) return IMAGES.blender;
  if (/dumbbell|barbell|weight|gym/.test(text)) return IMAGES.dumbbell;
  if (/electronic|gadget|tech|device/.test(text)) return IMAGES.laptop;

  return IMAGES.default;
}

/** Returns true when a path looks like a broken local upload path */
function isBrokenLocalPath(imgPath) {
  return !imgPath || imgPath.startsWith("/uploads/") || imgPath === "";
}

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  // ── Model definitions ──────────────────────────────────────────────────────
  const userSchema = new mongoose.Schema(
    { username: String, email: String, password: String, isAdmin: { type: Boolean, default: false } },
    { timestamps: true }
  );
  const User = mongoose.models.User || mongoose.model("User", userSchema);

  const categorySchema = new mongoose.Schema({ name: { type: String, unique: true } });
  const Category = mongoose.models.Category || mongoose.model("Category", categorySchema);

  const productSchema = new mongoose.Schema(
    {
      name: String, image: String, brand: String, quantity: Number,
      category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
      description: String, reviews: [], rating: { type: Number, default: 0 },
      numReviews: { type: Number, default: 0 }, price: { type: Number, default: 0 },
      countInStock: { type: Number, default: 0 },
      priceHistory: [{ price: Number, date: Date }],
      metaKeywords: [String], metaDescription: String,
    },
    { timestamps: true }
  );
  const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

  const orderSchema = new mongoose.Schema(
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      orderItems: [{ name: String, qty: Number, image: String, price: Number, product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" } }],
      shippingAddress: { address: String, city: String, postalCode: String, country: String },
      paymentMethod: String, itemsPrice: { type: Number, default: 0 },
      taxPrice: { type: Number, default: 0 }, shippingPrice: { type: Number, default: 0 },
      totalPrice: { type: Number, default: 0 }, isPaid: { type: Boolean, default: false },
      paidAt: Date, isDelivered: { type: Boolean, default: false }, deliveredAt: Date,
    },
    { timestamps: true }
  );
  const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

  // ── 1. Admin user ──────────────────────────────────────────────────────────
  const salt = await bcrypt.genSalt(10);
  const hashedPw = await bcrypt.hash("admin123", salt);
  let admin = await User.findOne({ email: "admin@test.com" });
  if (!admin) {
    admin = await User.create({ username: "admin", email: "admin@test.com", password: hashedPw, isAdmin: true });
    console.log("Admin user created (admin@test.com / admin123)");
  } else {
    console.log("Admin already exists");
  }

  // ── 2. Categories ──────────────────────────────────────────────────────────
  const catNames = ["Electronics", "Clothing", "Home & Kitchen", "Books", "Sports"];
  for (const c of catNames) {
    try { await Category.create({ name: c }); } catch (e) { /* exists */ }
  }
  const allCats = await Category.find({});
  console.log("Categories:", allCats.map((c) => c.name).join(", "));

  // ── 3. Fix broken images on ALL existing products ─────────────────────────
  const allExisting = await Product.find({});
  let fixedCount = 0;
  for (const p of allExisting) {
    if (isBrokenLocalPath(p.image)) {
      const correctImage = pickImage(p.name, p.description);
      await Product.updateOne({ _id: p._id }, { $set: { image: correctImage } });
      console.log(`  Fixed image for: ${p.name}`);
      fixedCount++;
    }
  }
  if (fixedCount > 0) console.log(`Fixed ${fixedCount} broken product images.`);

  // ── 4. Seed products if none exist ────────────────────────────────────────
  const existingProducts = await Product.countDocuments();
  if (existingProducts === 0) {
    const getCat = (name) => allCats.find((c) => c.name === name)?._id;

    const products = [
      {
        name: "Wireless Bluetooth Headphones", brand: "SoundMax", price: 79.99,
        quantity: 50, countInStock: 50, category: getCat("Electronics"),
        description: "Premium wireless bluetooth headphones with noise cancellation and 30-hour battery life",
        image: IMAGES.headphones,
        priceHistory: [{ price: 69.99, date: new Date("2025-01-01") }, { price: 74.99, date: new Date("2025-02-01") }, { price: 79.99, date: new Date("2025-03-01") }],
        metaKeywords: ["headphones", "bluetooth", "wireless", "noise cancellation"],
        metaDescription: "Premium wireless Bluetooth headphones with active noise cancellation and 30-hour battery.",
      },
      {
        name: "Smart Watch Pro", brand: "TechFit", price: 199.99,
        quantity: 25, countInStock: 3, category: getCat("Electronics"),
        description: "Advanced smartwatch with health monitoring, GPS tracking and water resistance",
        image: IMAGES.smartwatch,
        priceHistory: [{ price: 149.99, date: new Date("2025-01-01") }, { price: 179.99, date: new Date("2025-02-01") }, { price: 199.99, date: new Date("2025-03-01") }],
        metaKeywords: ["smartwatch", "fitness tracker", "GPS", "health monitoring"],
        metaDescription: "Advanced smartwatch with health monitoring, GPS tracking, and water resistance.",
      },
      {
        name: "Cotton T-Shirt Classic", brand: "StyleWear", price: 24.99,
        quantity: 200, countInStock: 200, category: getCat("Clothing"),
        description: "Comfortable 100% cotton t-shirt available in multiple colors and sizes for everyday wear",
        image: IMAGES.tshirt,
        priceHistory: [{ price: 19.99, date: new Date("2025-01-01") }, { price: 22.99, date: new Date("2025-03-01") }],
        metaKeywords: ["t-shirt", "cotton", "casual wear", "clothing"],
        metaDescription: "Comfortable 100% cotton t-shirt in multiple colors. Perfect for everyday casual wear.",
      },
      {
        name: "Running Shoes Ultra", brand: "SpeedRun", price: 129.99,
        quantity: 75, countInStock: 8, category: getCat("Sports"),
        description: "Lightweight running shoes with responsive cushioning for marathon training and daily runs",
        image: IMAGES.shoes,
        priceHistory: [{ price: 119.99, date: new Date("2025-01-01") }, { price: 129.99, date: new Date("2025-04-01") }],
        metaKeywords: ["running shoes", "marathon", "sneakers", "sports footwear"],
        metaDescription: "Lightweight running shoes with responsive cushioning. Ideal for marathon training.",
      },
      {
        name: "Stainless Steel Cookware Set", brand: "ChefPro", price: 149.99,
        quantity: 30, countInStock: 30, category: getCat("Home & Kitchen"),
        description: "10-piece stainless steel cookware set with non-stick coating for professional home cooking",
        image: IMAGES.cookware,
        priceHistory: [{ price: 159.99, date: new Date("2025-01-01") }, { price: 149.99, date: new Date("2025-03-01") }],
        metaKeywords: ["cookware", "stainless steel", "non-stick", "kitchen"],
        metaDescription: "10-piece stainless steel cookware set with non-stick coating for home chefs.",
      },
      {
        name: "JavaScript Programming Guide", brand: "TechBooks", price: 39.99,
        quantity: 100, countInStock: 0, category: getCat("Books"),
        description: "Comprehensive guide to modern JavaScript programming with ES6+ features and React",
        image: IMAGES.book,
        priceHistory: [{ price: 34.99, date: new Date("2025-01-01") }, { price: 39.99, date: new Date("2025-02-01") }],
        metaKeywords: ["javascript", "programming", "ES6", "React", "web development"],
        metaDescription: "Master modern JavaScript with this comprehensive guide covering ES6+ and React.",
      },
      {
        name: "Laptop Stand Ergonomic", brand: "DeskPro", price: 49.99,
        quantity: 60, countInStock: 60, category: getCat("Electronics"),
        description: "Adjustable aluminum laptop stand for better posture and improved airflow while working",
        image: IMAGES.laptopstand,
        priceHistory: [{ price: 44.99, date: new Date("2025-02-01") }, { price: 49.99, date: new Date("2025-04-01") }],
        metaKeywords: ["laptop stand", "ergonomic", "aluminum", "desk accessory"],
        metaDescription: "Adjustable aluminum laptop stand improves posture and airflow for productive work.",
      },
      {
        name: "Yoga Mat Premium", brand: "FlexFit", price: 34.99,
        quantity: 45, countInStock: 5, category: getCat("Sports"),
        description: "Extra thick 6mm non-slip yoga mat with alignment lines for all yoga skill levels",
        image: IMAGES.yogamat,
        priceHistory: [{ price: 29.99, date: new Date("2025-01-01") }, { price: 34.99, date: new Date("2025-03-01") }],
        metaKeywords: ["yoga mat", "non-slip", "exercise", "fitness"],
        metaDescription: "Extra thick 6mm non-slip yoga mat with alignment guides. Perfect for all skill levels.",
      },
    ];

    await Product.insertMany(products);
    console.log("Products seeded:", products.length);
  } else {
    console.log("Products already exist:", existingProducts, "(images fixed above)");
  }

  // ── 5. Seed sample orders if none ─────────────────────────────────────────
  const existingOrders = await Order.countDocuments();
  if (existingOrders === 0) {
    const allProducts = await Product.find({});
    const orders = [];
    for (let i = 0; i < 15; i++) {
      const p1 = allProducts[Math.floor(Math.random() * allProducts.length)];
      const p2 = allProducts[Math.floor(Math.random() * allProducts.length)];
      const qty1 = Math.floor(Math.random() * 3) + 1;
      const qty2 = Math.floor(Math.random() * 2) + 1;
      const itemsPrice = p1.price * qty1 + p2.price * qty2;
      const taxPrice = itemsPrice * 0.15;
      const shippingPrice = itemsPrice > 100 ? 0 : 10;
      const totalPrice = itemsPrice + taxPrice + shippingPrice;
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 90));
      orders.push({
        user: admin._id,
        orderItems: [
          { name: p1.name, qty: qty1, image: p1.image, price: p1.price, product: p1._id },
          { name: p2.name, qty: qty2, image: p2.image, price: p2.price, product: p2._id },
        ],
        shippingAddress: { address: "123 Main St", city: "New York", postalCode: "10001", country: "US" },
        paymentMethod: "PayPal",
        itemsPrice, taxPrice, shippingPrice, totalPrice,
        isPaid: Math.random() > 0.3,
        paidAt: date, isDelivered: Math.random() > 0.5,
        deliveredAt: date, createdAt: date,
      });
    }
    await Order.insertMany(orders);
    console.log("Orders seeded:", orders.length);
  } else {
    console.log("Orders already exist:", existingOrders);
  }

  await mongoose.disconnect();
  console.log("\n✅ Done! Login with:  admin@test.com / admin123");
}

seed().catch(console.error);
