import { Router } from "express";
import * as dashboardController from "../controllers/Dashboard";
import { validate } from "../middleware/validate";
import { salesAnalyticsQuerySchema } from "../schemas";

const router = Router();

// GET /api/dashboard/todays-orders
router.get("/todays-orders", dashboardController.getTodaysOrdersCount);

// GET /api/dashboard/stats
router.get("/stats", dashboardController.getStats);

// GET /api/dashboard/sales-analytics
router.get(
  "/sales-analytics",
  validate(salesAnalyticsQuerySchema, "query"),
  dashboardController.getSalesAnalytics
);

export default router;
