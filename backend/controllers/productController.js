import asyncHandler from "../middlewares/asyncHandler.js";
import Product from "../models/productModel.js";

// ── Slug generator ────────────────────────────────────────────────
function toSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function uniqueSlug(name, excludeId = null) {
  let base = toSlug(name);
  let slug = base;
  let counter = 1;
  while (true) {
    const query = { slug };
    if (excludeId) query._id = { $ne: excludeId };
    const exists = await Product.findOne(query);
    if (!exists) return slug;
    slug = `${base}-${counter++}`;
  }
}

// ── Helper ────────────────────────────────────────────────────────
const getFields = (req) =>
  req.body && Object.keys(req.body).length > 0 ? req.body : req.fields || {};

const parseKeywords = (metaKeywords) => {
  if (!metaKeywords) return [];
  if (Array.isArray(metaKeywords)) return metaKeywords;
  return metaKeywords.split(",").map((k) => k.trim()).filter(Boolean);
};

// ── addProduct ────────────────────────────────────────────────────
const addProduct = asyncHandler(async (req, res) => {
  try {
    const fields = getFields(req);
    const { name, description, price, category, quantity, brand, image, countInStock, metaTitle, metaDescription, metaKeywords } = fields;

    if (!name)        return res.status(400).json({ error: "Name is required" });
    if (!brand)       return res.status(400).json({ error: "Brand is required" });
    if (!description) return res.status(400).json({ error: "Description is required" });
    if (!price)       return res.status(400).json({ error: "Price is required" });
    if (!category)    return res.status(400).json({ error: "Category is required" });
    if (!quantity)    return res.status(400).json({ error: "Quantity is required" });

    const slug = await uniqueSlug(name);

    const product = new Product({
      name, description, brand, category, slug,
      price: Number(price),
      quantity: Number(quantity),
      countInStock: Number(countInStock) || 0,
      image: image || "",
      metaTitle: metaTitle || name,
      metaDescription: metaDescription || "",
      metaKeywords: parseKeywords(metaKeywords),
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error("addProduct error:", error);
    res.status(400).json({ error: error.message });
  }
});

// ── updateProductDetails ──────────────────────────────────────────
const updateProductDetails = asyncHandler(async (req, res) => {
  try {
    const fields = getFields(req);
    const { name, description, price, category, quantity, brand, image, countInStock, metaTitle, metaDescription, metaKeywords } = fields;

    if (!name)        return res.status(400).json({ error: "Name is required" });
    if (!brand)       return res.status(400).json({ error: "Brand is required" });
    if (!description) return res.status(400).json({ error: "Description is required" });
    if (!price)       return res.status(400).json({ error: "Price is required" });
    if (!category)    return res.status(400).json({ error: "Category is required" });
    if (!quantity)    return res.status(400).json({ error: "Quantity is required" });

    const existing = await Product.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: "Product not found" });

    // Price history
    if (Number(price) !== existing.price) {
      existing.priceHistory.push({ price: existing.price, date: new Date() });
      await existing.save();
    }

    // Regenerate slug if name changed
    let slug = existing.slug;
    if (name !== existing.name || !slug) {
      slug = await uniqueSlug(name, existing._id);
    }

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name, description, brand, category, slug,
        price: Number(price),
        quantity: Number(quantity),
        countInStock: Number(countInStock) ?? existing.countInStock,
        image: image || existing.image,
        metaTitle: metaTitle || name,
        metaDescription: metaDescription !== undefined ? metaDescription : existing.metaDescription,
        metaKeywords: metaKeywords !== undefined ? parseKeywords(metaKeywords) : existing.metaKeywords,
      },
      { new: true }
    );

    res.json(updated);
  } catch (error) {
    console.error("updateProductDetails error:", error);
    res.status(400).json({ error: error.message });
  }
});

// ── removeProduct ─────────────────────────────────────────────────
const removeProduct = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// ── fetchProducts ─────────────────────────────────────────────────
const fetchProducts = asyncHandler(async (req, res) => {
  try {
    const pageSize = 6;
    const keyword = req.query.keyword
      ? { name: { $regex: req.query.keyword, $options: "i" } }
      : {};
    const count = await Product.countDocuments({ ...keyword });
    const products = await Product.find({ ...keyword }).limit(pageSize);
    res.json({ products, page: 1, pages: Math.ceil(count / pageSize), hasMore: false });
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
});

// ── fetchProductById — supports both ObjectId and slug ────────────
const fetchProductById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    let product;
    // Check if it looks like a MongoDB ObjectId
    if (/^[a-f\d]{24}$/i.test(id)) {
      product = await Product.findById(id);
    }
    // If not found by ID, try slug
    if (!product) {
      product = await Product.findOne({ slug: id });
    }
    if (product) return res.json(product);
    res.status(404).json({ error: "Product not found" });
  } catch (error) {
    res.status(404).json({ error: "Product not found" });
  }
});

// ── fetchAllProducts ──────────────────────────────────────────────
const fetchAllProducts = asyncHandler(async (req, res) => {
  try {
    const products = await Product.find({}).populate("category").limit(12).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
});

// ── addProductReview ──────────────────────────────────────────────
const addProductReview = asyncHandler(async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);
    if (product) {
      const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
      );
      if (alreadyReviewed) {
        res.status(400);
        throw new Error("Product already reviewed");
      }
      const review = { name: req.user.username, rating: Number(rating), comment, user: req.user._id };
      product.reviews.push(review);
      product.numReviews = product.reviews.length;
      product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;
      await product.save();
      res.status(201).json({ message: "Review added" });
    } else {
      res.status(404);
      throw new Error("Product not found");
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ── fetchTopProducts ──────────────────────────────────────────────
const fetchTopProducts = asyncHandler(async (req, res) => {
  try {
    const products = await Product.find({}).sort({ rating: -1 }).limit(4);
    res.json(products);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ── fetchNewProducts ──────────────────────────────────────────────
const fetchNewProducts = asyncHandler(async (req, res) => {
  try {
    const products = await Product.find().sort({ _id: -1 }).limit(5);
    res.json(products);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ── filterProducts ────────────────────────────────────────────────
const filterProducts = asyncHandler(async (req, res) => {
  try {
    const { checked, radio } = req.body;
    let args = {};
    if (checked.length > 0) args.category = checked;
    if (radio.length) args.price = { $gte: radio[0], $lte: radio[1] };
    const products = await Product.find(args);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
});

export {
  addProduct, updateProductDetails, removeProduct,
  fetchProducts, fetchProductById, fetchAllProducts,
  addProductReview, fetchTopProducts, fetchNewProducts, filterProducts,
};
