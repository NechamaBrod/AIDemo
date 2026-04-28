import { Request, Response, NextFunction } from "express";
import type { ErrorResponse } from "@architect/shared";

// מידלוור מרכזי לטיפול בשגיאות - חייב לקבל 4 פרמטרים כדי ש-Express יזהה אותו כ-error handler
const errorHandler = (
  err: any,
  _req: Request,
  res: Response<ErrorResponse | { errors: unknown[] }>,
  _next: NextFunction
): void => {
  // שגיאת ולידציה של Zod (הגנה כפולה - בדרך כלל מטופלת ב-validate middleware)
  if (err?.name === "ZodError") {
    res.status(400).json({ errors: err.issues ?? [] });
    return;
  }

  // שגיאות Mongoose נפוצות - מזהה ObjectId לא תקין או ולידציה של סכמה
  if (err?.name === "CastError" || err?.name === "ValidationError") {
    res.status(400).json({ error: err.message });
    return;
  }

  // שגיאה כללית - לוג ושמירה על אבטחה (לא חושפים פרטים פנימיים)
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
};

export default errorHandler;
