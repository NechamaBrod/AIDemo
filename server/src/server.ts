import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import dashboardRoutes from "./routes/dashboardRoutes";
import authRoutes from "./routes/authRoutes";
import errorHandler from "./middleware/errorHandler";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// אבטחת headers - חייב להיות בראש שרשרת ה-middleware
app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));

// חיבור ל-MongoDB
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/techstore";
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Swagger UI - זמין בנתיב /api-docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// נתיבי Auth (פתוחים, עם rate-limit פנימי)
app.use("/api/auth", authRoutes);

// נתיבי Dashboard (מוגנים ב-requireAuth בתוך הראוטר עצמו)
app.use("/api/dashboard", dashboardRoutes);

// מידלוור מרכזי לטיפול בשגיאות - חייב להירשם אחרי כל הנתיבים
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Swagger UI available at http://localhost:${PORT}/api-docs`);
});

export default app;
