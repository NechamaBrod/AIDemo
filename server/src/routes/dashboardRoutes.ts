import { Router } from "express";
import * as dashboardController from "../controllers/Dashboard";

const router = Router();

// GET /api/dashboard/todays-orders
router.get("/todays-orders", dashboardController.getTodaysOrdersCount);

export default router;
