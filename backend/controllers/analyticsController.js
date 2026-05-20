import Product from "../models/productModel.js";
import Order from "../models/orderModel.js";
import Category from "../models/categoryModel.js";

// ── AI Utility Functions ──

function extractKeywords(text, maxKeywords = 10) {
  const stopWords = new Set([
    "a","an","the","and","or","but","in","on","at","to","for","of","with",
    "by","from","is","it","its","this","that","are","was","were","be","been",
    "being","have","has","had","do","does","did","will","would","could","should",
    "may","might","can","shall","not","no","nor","so","if","then","than","too",
    "very","just","about","above","after","again","all","also","am","any","as",
    "because","before","between","both","each","few","get","got","he","her",
    "here","him","his","how","i","into","me","more","most","my","new","now",
    "off","old","only","other","our","out","over","own","same","she","some",
    "still","such","take","their","them","these","they","through","under","up",
    "us","use","used","using","want","we","what","when","where","which","while",
    "who","whom","why","you","your","product","item","feature","features",
  ]);

  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));

  const freq = {};
  words.forEach((w) => {
    freq[w] = (freq[w] || 0) + 1;
  });

  // Bigrams
  for (let i = 0; i < words.length - 1; i++) {
    const bigram = `${words[i]} ${words[i + 1]}`;
    if (!stopWords.has(words[i]) && !stopWords.has(words[i + 1])) {
      freq[bigram] = (freq[bigram] || 0) + 1.5;
    }
  }

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxKeywords)
    .map(([word]) => word);
}

function generateMetaDescription(name, description, brand, category) {
  const desc = description.length > 120 ? description.substring(0, 120) + "..." : description;
  return `${name} by ${brand}${category ? ` in ${category}` : ""}. ${desc}`;
}

function calculateSalesVelocity(orderItems, productId, daysPeriod = 30) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - daysPeriod);

  let totalQty = 0;
  orderItems.forEach((order) => {
    if (new Date(order.createdAt) >= cutoff) {
      order.orderItems.forEach((item) => {
        if (item.product && item.product.toString() === productId.toString()) {
          totalQty += item.qty;
        }
      });
    }
  });

  return totalQty / daysPeriod;
}

function predictDaysUntilOutOfStock(currentStock, salesVelocity) {
  if (salesVelocity <= 0) return Infinity;
  return Math.round(currentStock / salesVelocity);
}

function analyzePriceTrend(priceHistory) {
  if (!priceHistory || priceHistory.length < 2) {
    return { trend: "stable", changePercent: 0, suggestion: "Not enough data" };
  }

  const sorted = [...priceHistory].sort((a, b) => new Date(a.date) - new Date(b.date));
  const oldest = sorted[0].price;
  const newest = sorted[sorted.length - 1].price;
  const changePercent = ((newest - oldest) / oldest) * 100;

  // Moving average analysis
  const recentPrices = sorted.slice(-5).map((p) => p.price);
  const avgRecent = recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length;

  let trend = "stable";
  let suggestion = "Price is stable. No action needed.";

  if (changePercent > 15) {
    trend = "increasing";
    suggestion = "Price has increased significantly. Consider dropping the price to maintain competitiveness and boost sales volume.";
  } else if (changePercent > 5) {
    trend = "slightly_increasing";
    suggestion = "Price is gradually increasing. Monitor sales volume for any decline.";
  } else if (changePercent < -15) {
    trend = "decreasing";
    suggestion = "Price has dropped significantly. Evaluate if margins are sustainable.";
  } else if (changePercent < -5) {
    trend = "slightly_decreasing";
    suggestion = "Price is gradually decreasing. Good for sales volume but watch margins.";
  }

  return {
    trend,
    changePercent: Math.round(changePercent * 100) / 100,
    oldestPrice: oldest,
    newestPrice: newest,
    averageRecent: Math.round(avgRecent * 100) / 100,
    suggestion,
    history: sorted,
  };
}

function predictCategorySales(orders, categories, days = 30) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const categorySales = {};
  categories.forEach((cat) => {
    categorySales[cat._id.toString()] = {
      id: cat._id,
      name: cat.name,
      totalSold: 0,
      totalRevenue: 0,
      orderCount: 0,
    };
  });

  orders.forEach((order) => {
    if (new Date(order.createdAt) >= cutoff) {
      order.orderItems.forEach((item) => {
        if (item.product && item.product.category) {
          const catId = item.product.category.toString();
          if (categorySales[catId]) {
            categorySales[catId].totalSold += item.qty;
            categorySales[catId].totalRevenue += item.price * item.qty;
            categorySales[catId].orderCount += 1;
          }
        }
      });
    }
  });

  const results = Object.values(categorySales).map((cat) => {
    const dailyRate = cat.totalSold / days;
    const predictedNext30 = Math.round(dailyRate * 30);
    let demandLevel = "low";
    if (dailyRate > 2) demandLevel = "high";
    else if (dailyRate > 0.5) demandLevel = "medium";

    return {
      ...cat,
      dailyRate: Math.round(dailyRate * 100) / 100,
      predictedNext30Days: predictedNext30,
      demandLevel,
    };
  });

  return results.sort((a, b) => b.totalRevenue - a.totalRevenue);
}

// ── Controller Functions ──

const getInventoryAnalytics = async (req, res) => {
  try {
    const products = await Product.find({}).populate("category");
    const orders = await Order.find({}).populate({
      path: "orderItems.product",
      select: "category",
    });

    const analytics = products.map((product) => {
      const salesVelocity = calculateSalesVelocity(orders, product._id);
      const daysUntilOut = predictDaysUntilOutOfStock(product.countInStock, salesVelocity);

      let stockStatus = "healthy";
      if (product.countInStock === 0) stockStatus = "out_of_stock";
      else if (daysUntilOut <= 7) stockStatus = "critical";
      else if (daysUntilOut <= 14) stockStatus = "warning";
      else if (daysUntilOut <= 30) stockStatus = "low";

      return {
        _id: product._id,
        name: product.name,
        brand: product.brand,
        price: product.price,
        countInStock: product.countInStock,
        category: product.category?.name || "Uncategorized",
        salesVelocity: Math.round(salesVelocity * 100) / 100,
        daysUntilOutOfStock: daysUntilOut === Infinity ? null : daysUntilOut,
        stockStatus,
        image: product.image,
      };
    });

    const summary = {
      totalProducts: products.length,
      outOfStock: analytics.filter((a) => a.stockStatus === "out_of_stock").length,
      critical: analytics.filter((a) => a.stockStatus === "critical").length,
      warning: analytics.filter((a) => a.stockStatus === "warning").length,
      low: analytics.filter((a) => a.stockStatus === "low").length,
      healthy: analytics.filter((a) => a.stockStatus === "healthy").length,
    };

    res.json({ analytics, summary });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const getCategoryPredictions = async (req, res) => {
  try {
    const categories = await Category.find({});
    const orders = await Order.find({}).populate({
      path: "orderItems.product",
      select: "category",
    });

    const predictions = predictCategorySales(orders, categories);
    res.json(predictions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const getPriceTrends = async (req, res) => {
  try {
    const products = await Product.find({}).populate("category").select(
      "name brand price priceHistory category countInStock"
    );

    const trends = products.map((product) => {
      const analysis = analyzePriceTrend(product.priceHistory);
      return {
        _id: product._id,
        name: product.name,
        brand: product.brand,
        currentPrice: product.price,
        category: product.category?.name || "Uncategorized",
        countInStock: product.countInStock,
        ...analysis,
      };
    });

    res.json(trends);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const getProductPriceTrend = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category");
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const orders = await Order.find({
      "orderItems.product": product._id,
    });

    const salesVelocity = calculateSalesVelocity(orders, product._id);
    const analysis = analyzePriceTrend(product.priceHistory);

    res.json({
      _id: product._id,
      name: product.name,
      brand: product.brand,
      currentPrice: product.price,
      category: product.category?.name || "Uncategorized",
      salesVelocity: Math.round(salesVelocity * 100) / 100,
      ...analysis,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const generateKeywords = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId).populate("category");

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const textForAnalysis = `${product.name} ${product.brand} ${product.description} ${product.category?.name || ""}`;
    const keywords = extractKeywords(textForAnalysis);
    const metaDescription = generateMetaDescription(
      product.name,
      product.description,
      product.brand,
      product.category?.name
    );

    res.json({
      productId: product._id,
      productName: product.name,
      keywords,
      metaDescription,
      existingKeywords: product.metaKeywords,
      existingMetaDescription: product.metaDescription,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const saveKeywords = async (req, res) => {
  try {
    const { productId } = req.params;
    const { keywords, metaDescription } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    product.metaKeywords = keywords || product.metaKeywords;
    product.metaDescription = metaDescription || product.metaDescription;
    await product.save();

    res.json({
      message: "Keywords and meta description saved",
      metaKeywords: product.metaKeywords,
      metaDescription: product.metaDescription,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

const getDashboardSummary = async (req, res) => {
  try {
    const products = await Product.find({}).populate("category");
    const orders = await Order.find({}).populate({
      path: "orderItems.product",
      select: "category price",
    });
    const categories = await Category.find({});

    // Revenue over time (last 12 months)
    const monthlyRevenue = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const monthOrders = orders.filter((o) => {
        const d = new Date(o.createdAt);
        return d >= monthStart && d <= monthEnd;
      });

      const revenue = monthOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
      monthlyRevenue.push({
        month: monthStart.toLocaleString("default", { month: "short", year: "numeric" }),
        revenue: Math.round(revenue * 100) / 100,
        orders: monthOrders.length,
      });
    }

    // Category distribution
    const categoryDistribution = categories.map((cat) => {
      const catProducts = products.filter(
        (p) => p.category && p.category._id.toString() === cat._id.toString()
      );
      const totalStock = catProducts.reduce((sum, p) => sum + p.countInStock, 0);
      const totalValue = catProducts.reduce((sum, p) => sum + p.price * p.countInStock, 0);
      return {
        name: cat.name,
        productCount: catProducts.length,
        totalStock,
        totalValue: Math.round(totalValue * 100) / 100,
      };
    });

    // Stock level distribution
    const stockLevels = {
      outOfStock: products.filter((p) => p.countInStock === 0).length,
      low: products.filter((p) => p.countInStock > 0 && p.countInStock <= 10).length,
      medium: products.filter((p) => p.countInStock > 10 && p.countInStock <= 50).length,
      high: products.filter((p) => p.countInStock > 50).length,
    };

    // Top selling products
    const productSales = {};
    orders.forEach((order) => {
      order.orderItems.forEach((item) => {
        const pid = item.product?._id?.toString();
        if (pid) {
          if (!productSales[pid]) {
            productSales[pid] = { qty: 0, revenue: 0, name: item.name };
          }
          productSales[pid].qty += item.qty;
          productSales[pid].revenue += item.price * item.qty;
        }
      });
    });

    const topProducts = Object.entries(productSales)
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 10)
      .map(([id, data]) => ({ id, ...data }));

    // Price range distribution
    const priceRanges = {
      "0-25": products.filter((p) => p.price <= 25).length,
      "25-50": products.filter((p) => p.price > 25 && p.price <= 50).length,
      "50-100": products.filter((p) => p.price > 50 && p.price <= 100).length,
      "100-500": products.filter((p) => p.price > 100 && p.price <= 500).length,
      "500+": products.filter((p) => p.price > 500).length,
    };

    // Recent orders for dashboard table
    const recentOrders = await Order.find({})
      .sort({ createdAt: -1 })
      .limit(8)
      .populate("user", "username email");

    res.json({
      monthlyRevenue,
      categoryDistribution,
      stockLevels,
      topProducts,
      priceRanges,
      recentOrders,
      totalProducts: products.length,
      totalOrders: orders.length,
      totalRevenue: Math.round(orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0) * 100) / 100,
      totalCategories: categories.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export {
  getInventoryAnalytics,
  getCategoryPredictions,
  getPriceTrends,
  getProductPriceTrend,
  generateKeywords,
  saveKeywords,
  getDashboardSummary,
};
