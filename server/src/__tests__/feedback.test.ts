import { describe, it, expect } from "vitest";
import express from "express";
import request from "supertest";
import feedbackRoutes from "../routes/feedbackRoutes";
import errorHandler from "../middleware/errorHandler";

function createApp() {
  const app = express();
  app.use(express.json());
  app.use("/api/feedback", feedbackRoutes);
  app.use(errorHandler);
  return app;
}

const VALID_PAYLOAD = {
  name: "דוד כהן",
  email: "david@example.com",
  message: "האתר נהדר! הייתי שמח לראות עוד מוצרים.",
};

describe("POST /api/feedback", () => {
  const app = createApp();

  // Scenario 1: Valid payload → 201 + Feedback object
  it("returns 201 with a Feedback object for a valid payload", async () => {
    const res = await request(app)
      .post("/api/feedback")
      .send(VALID_PAYLOAD)
      .expect(201);

    expect(res.body.data).toMatchObject({
      name: VALID_PAYLOAD.name,
      email: VALID_PAYLOAD.email,
      message: VALID_PAYLOAD.message,
    });
    expect(res.body.data.id).toMatch(/^f_\d+$/);
    expect(res.body.data.createdAt).toBeDefined();
    expect(res.body.message).toBe("הפנייה נשלחה בהצלחה");
  });

  // Scenario 2: Missing name → 400
  it("returns 400 when name is missing", async () => {
    const res = await request(app)
      .post("/api/feedback")
      .send({ email: "a@b.com", message: "ten chars!!" })
      .expect(400);

    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "name" }),
      ])
    );
  });

  // Scenario 3: Invalid email → 400
  it("returns 400 when email is not a valid address", async () => {
    const res = await request(app)
      .post("/api/feedback")
      .send({ name: "דוד", email: "notanemail", message: "ten chars!!" })
      .expect(400);

    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "email" }),
      ])
    );
  });

  // Scenario 4: Message too short (< 10 chars) → 400
  it("returns 400 when message is shorter than 10 characters", async () => {
    const res = await request(app)
      .post("/api/feedback")
      .send({ name: "דוד", email: "d@e.com", message: "short" })
      .expect(400);

    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "message" }),
      ])
    );
  });

  // Scenario 5: Name too long (> 100 chars) → 400
  it("returns 400 when name exceeds 100 characters", async () => {
    const res = await request(app)
      .post("/api/feedback")
      .send({
        name: "א".repeat(101),
        email: "d@e.com",
        message: "ten chars!!",
      })
      .expect(400);

    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "name" }),
      ])
    );
  });

  // Scenario 6: Message too long (> 2000 chars) → 400
  it("returns 400 when message exceeds 2000 characters", async () => {
    const res = await request(app)
      .post("/api/feedback")
      .send({
        name: "דוד",
        email: "d@e.com",
        message: "א".repeat(2001),
      })
      .expect(400);

    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "message" }),
      ])
    );
  });

  // Scenario 7: Empty body → 400 with multiple errors
  it("returns 400 with multiple errors for an empty body", async () => {
    const res = await request(app)
      .post("/api/feedback")
      .send({})
      .expect(400);

    expect(res.body.errors.length).toBeGreaterThanOrEqual(3);
    const fields = res.body.errors.map((e: { field: string }) => e.field);
    expect(fields).toContain("name");
    expect(fields).toContain("email");
    expect(fields).toContain("message");
  });

  // Scenario 8: Extra fields stripped (Zod .strip()) → 201
  it("strips extra fields and returns 201", async () => {
    const res = await request(app)
      .post("/api/feedback")
      .send({ ...VALID_PAYLOAD, spam: true, admin: true })
      .expect(201);

    expect(res.body.data).not.toHaveProperty("spam");
    expect(res.body.data).not.toHaveProperty("admin");
    expect(res.body.data.name).toBe(VALID_PAYLOAD.name);
  });
});
