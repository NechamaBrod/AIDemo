import { Request, Response } from "express";
import Order from "../models/Order";

/**
 * @swagger
 * /api/dashboard/todays-orders:
 *   get:
 *     summary: מחזיר את מספר ההזמנות של היום
 *     description: >
 *       סופר את ההזמנות שנוצרו היום (00:00 עד 23:59) ומתעלם מהזמנות
 *       עם סטטוס cancelled או returned.
 *     tags:
 *       - Dashboard
 *     responses:
 *       200:
 *         description: מספר ההזמנות של היום
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TodaysOrdersCountResponse'
 *       500:
 *         description: שגיאת שרת פנימית
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export const getTodaysOrdersCount = async (_req: Request, res: Response): Promise<void> => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const count = await Order.countDocuments({
      createdAt: { $gte: startOfToday, $lte: endOfToday },
      status: { $nin: ["cancelled", "returned"] },
    });

    res.json({ todaysOrdersCount: count });
  } catch (error) {
    console.error("Error fetching today's orders count:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
