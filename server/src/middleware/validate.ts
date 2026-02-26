import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

// מידלוור ולידציה גנרי שמקבל סכמת Zod ומוודא את גוף הבקשה
export const validate =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      // מיפוי שגיאות Zod לפורמט קריא
      const errors = (result.error as ZodError).errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));

      res.status(400).json({ errors });
      return;
    }

    // החלפת req.body בנתונים המאומתים והמנוקים
    req.body = result.data;
    next();
  };
