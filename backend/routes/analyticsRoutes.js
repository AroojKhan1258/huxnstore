import express from "express";
const router = express.Router();

import {
  getInventoryAnalytics,
  getCategoryPredictions,
  getPriceTrends,
  getProductPriceTrend,
  generateKeywords,
  saveKeywords,
  getDashboardSummary,
} from "../controllers/analyticsController.js";

import { authenticate, authorizeAdmin } from "../middlewares/authMiddleware.js";

router.get("/inventory", authenticate, authorizeAdmin, getInventoryAnalytics);
router.get("/category-predictions", authenticate, authorizeAdmin, getCategoryPredictions);
router.get("/price-trends", authenticate, authorizeAdmin, getPriceTrends);
router.get("/price-trends/:id", authenticate, authorizeAdmin, getProductPriceTrend);
router.get("/keywords/:productId", authenticate, authorizeAdmin, generateKeywords);
router.put("/keywords/:productId", authenticate, authorizeAdmin, saveKeywords);
router.get("/dashboard-summary", authenticate, authorizeAdmin, getDashboardSummary);

export default router;
