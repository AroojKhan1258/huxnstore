import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema;

const reviewSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  },
  { timestamps: true }
);

const priceHistorySchema = mongoose.Schema({
  price: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

const productSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, unique: true, sparse: true },
    image: { type: String, required: true },
    brand: { type: String, required: true },
    quantity: { type: Number, required: true },
    category: { type: ObjectId, ref: "Category", required: true },
    description: { type: String, required: true },
    reviews: [reviewSchema],
    rating: { type: Number, required: true, default: 0 },
    numReviews: { type: Number, required: true, default: 0 },
    price: { type: Number, required: true, default: 0 },
    countInStock: { type: Number, required: true, default: 0 },
    priceHistory: [priceHistorySchema],
    metaKeywords: [{ type: String }],
    metaTitle: { type: String, default: "" },
    metaDescription: { type: String, default: "" },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
export default Product;
