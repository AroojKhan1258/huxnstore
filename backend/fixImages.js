/**
 * fixImages.js
 * Run once to fix all broken / mismatched product images in your database:
 *   node fixImages.js
 */
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/huxnStore";

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
  keyboard:    "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=500&q=80",
  mouse:       "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=500&q=80",
  monitor:     "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=500&q=80",
  tablet:      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=500&q=80",
  gaming:      "https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=500&q=80",
  jacket:      "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=500&q=80",
  sunglasses:  "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=500&q=80",
  bag:         "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=500&q=80",
  backpack:    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=500&q=80",
  furniture:   "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=500&q=80",
  plant:       "https://images.unsplash.com/photo-1526397751294-331021109fbd?auto=format&fit=crop&w=500&q=80",
  bicycle:     "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=500&q=80",
  perfume:     "https://images.unsplash.com/photo-1541643600914-78b084683702?auto=format&fit=crop&w=500&q=80",
  bottle:      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=500&q=80",
  skincare:    "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=500&q=80",
  lamp:        "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=500&q=80",
  blender:     "https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=500&q=80",
  dumbbell:    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=500&q=80",
  default:     "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=500&q=80",
};

function pickImage(name = "", description = "") {
  const t = `${name} ${description}`.toLowerCase();
  if (/headphone|earphone|earbud|noise cancel/.test(t)) return IMAGES.headphones;
  if (/coffee|espresso|cappuccino|latte|brew/.test(t))  return IMAGES.coffee;
  if (/smart.?watch|wrist.?watch/.test(t))               return IMAGES.smartwatch;
  if (/watch/.test(t))                                   return IMAGES.smartwatch;
  if (/t.shirt|tshirt|polo|blouse/.test(t))              return IMAGES.tshirt;
  if (/running shoe|sneaker/.test(t))                    return IMAGES.shoes;
  if (/shoe|footwear/.test(t))                           return IMAGES.shoes;
  if (/cookware|non.?stick|casserole/.test(t))           return IMAGES.cookware;
  if (/yoga mat|exercise mat/.test(t))                   return IMAGES.yogamat;
  if (/laptop stand|desk stand/.test(t))                 return IMAGES.laptopstand;
  if (/laptop|macbook|notebook/.test(t))                 return IMAGES.laptop;
  if (/phone|smartphone|mobile/.test(t))                 return IMAGES.phone;
  if (/camera|dslr|mirrorless/.test(t))                  return IMAGES.camera;
  if (/speaker|woofer/.test(t))                          return IMAGES.speaker;
  if (/keyboard/.test(t))                                return IMAGES.keyboard;
  if (/\bmouse\b/.test(t))                               return IMAGES.mouse;
  if (/monitor|display screen/.test(t))                  return IMAGES.monitor;
  if (/tablet|ipad/.test(t))                             return IMAGES.tablet;
  if (/gaming|game controller/.test(t))                  return IMAGES.gaming;
  if (/book|novel|guide|programming|javascript|python/.test(t)) return IMAGES.book;
  if (/jacket|coat|hoodie/.test(t))                      return IMAGES.jacket;
  if (/sunglass|eyewear/.test(t))                        return IMAGES.sunglasses;
  if (/backpack|rucksack/.test(t))                       return IMAGES.backpack;
  if (/\bbag\b|handbag/.test(t))                         return IMAGES.bag;
  if (/sofa|couch|chair|furniture/.test(t))              return IMAGES.furniture;
  if (/plant|succulent/.test(t))                         return IMAGES.plant;
  if (/bicycle|bike/.test(t))                            return IMAGES.bicycle;
  if (/perfume|fragrance/.test(t))                       return IMAGES.perfume;
  if (/bottle|water bottle/.test(t))                     return IMAGES.bottle;
  if (/serum|moisturizer|skincare|cream|lotion/.test(t)) return IMAGES.skincare;
  if (/lamp|light|bulb/.test(t))                         return IMAGES.lamp;
  if (/blender|mixer|juicer/.test(t))                    return IMAGES.blender;
  if (/dumbbell|barbell|gym/.test(t))                    return IMAGES.dumbbell;
  if (/shirt|clothing|apparel|wear/.test(t))             return IMAGES.tshirt;
  return IMAGES.default;
}

function isBrokenPath(img) {
  return !img || img.startsWith("/uploads/") || img.trim() === "";
}

async function fix() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB\n");

  const productSchema = new mongoose.Schema(
    { name: String, image: String, description: String },
    { strict: false }
  );
  const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

  const products = await Product.find({});
  console.log(`Found ${products.length} products\n`);

  let fixed = 0;
  for (const p of products) {
    const correctImg = pickImage(p.name, p.description);

    // Fix if image is broken local path OR if assigned image clearly mismatches the product
    const isBroken = isBrokenPath(p.image);

    if (isBroken) {
      await Product.updateOne({ _id: p._id }, { $set: { image: correctImg } });
      console.log(`✅ Fixed (broken):   "${p.name}"  →  ${correctImg}`);
      fixed++;
    } else {
      console.log(`⏩ Skipped (has URL): "${p.name}"`);
    }
  }

  console.log(`\n${fixed} product(s) updated.`);
  await mongoose.disconnect();
}

fix().catch(console.error);
