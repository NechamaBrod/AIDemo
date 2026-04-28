import { Request, Response, NextFunction } from "express";
import type { ErrorResponse } from "@architect/shared";
import { HttpError } from "../utils/HttpError";

// מידלוור מרכזי לטיפול בשגיאות - חייב לקבל 4 פרמטרים כדי ש-Express יזהה אותו כ-error handler
const errorHandler = (
  err: any,
  _req: Request,
  res: Response<ErrorResponse | { error: string; code?: string } | { errors: unknown[] }>,
  _next: NextFunction
): void => {
  // שגיאות מותאמות שלנו (HttpError) - status + code אחיד
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message, code: err.code });
    return;
  }

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

  // duplicate key (למשל email unique)
  if (err?.code === 11000) {
    res.status(409).json({ error: "ערך כפול - כבר קיים במערכת" });
    return;
  }

  // שגיאה כללית - לוג ושמירה על אבטחה (לא חושפים פרטים פנימיים)
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
};

export default errorHandler;
