/**
 * generateSlugs.js
 * Run once to add slugs to all existing products:
 *   node generateSlugs.js
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/huxnStore";

function toSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-");
}

const Product = mongoose.model("Product", new mongoose.Schema({ name: String, slug: String }, { strict: false }));

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected\n");

  const products = await Product.find({});
  const usedSlugs = new Set();
  let updated = 0;

  for (const p of products) {
    if (p.slug) { usedSlugs.add(p.slug); continue; }
    let base = toSlug(p.name || "product");
    let slug = base;
    let i = 1;
    while (usedSlugs.has(slug)) slug = `${base}-${i++}`;
    usedSlugs.add(slug);
    await Product.updateOne({ _id: p._id }, { $set: { slug } });
    console.log(`✅ ${p.name}  →  /product/${slug}`);
    updated++;
  }

  console.log(`\n${updated} slugs generated. ${products.length - updated} already had slugs.`);
  await mongoose.disconnect();
}

run().catch(console.error);
