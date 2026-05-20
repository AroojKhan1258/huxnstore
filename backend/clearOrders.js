/**
 * clearOrders.js — Admin ke fake orders delete karta hai
 * Run: node clearOrders.js
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/huxnStore";
const Order = mongoose.model("Order", new mongoose.Schema({}, { strict: false }));

async function run() {
  await mongoose.connect(MONGO_URI);
  const result = await Order.deleteMany({});
  console.log(`✅ ${result.deletedCount} fake orders deleted.`);
  console.log("Ab dashboard clean hai — sirf real orders dikhenge.");
  await mongoose.disconnect();
}
run().catch(console.error);
