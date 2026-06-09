# Contact / Feedback Feature — Spec

## Overview

A public form that lets any visitor (authenticated or not) send feedback or contact the team. Submissions are stored server-side and exposed via a simple API.

---

## Data Model

### Feedback Interface (`shared/src/types/feedback.ts`)

```ts
export interface Feedback {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string; // ISO 8601
}

export interface FeedbackRequest {
  name: string;
  email: string;
  message: string;
}
```

Re-export from `shared/src/index.ts`.

---

## Validation Rules

| Field     | Type   | Required | Min Length | Max Length | Extra                              |
|-----------|--------|----------|-----------|------------|------------------------------------|
| `name`    | string | yes      | 2         | 100        | trimmed                            |
| `email`   | string | yes      | 5         | 254        | trimmed, must pass RFC 5322 regex  |
| `message` | string | yes      | 10        | 2000       | trimmed                            |

Server-side validation uses **Zod** (consistent with existing schemas in `server/src/schemas/`). Client-side mirrors the same rules for instant UX feedback.

---

## API Contract

### `POST /api/feedback`

**Auth:** none (public endpoint).

**Request body** (`application/json`):

```json
{
  "name": "דוד כהן",
  "email": "david@example.com",
  "message": "האתר נהדר! הייתי שמח לראות עוד מוצרים בקטגוריית אביזרים."
}
```

**Success — 201 Created:**

```json
{
  "data": {
    "id": "f_1718000000000",
    "name": "דוד כהן",
    "email": "david@example.com",
    "message": "האתר נהדר! הייתי שמח לראות עוד מוצרים בקטגוריית אביזרים.",
    "createdAt": "2026-06-09T12:00:00.000Z"
  },
  "message": "הפנייה נשלחה בהצלחה"
}
```

Response wraps in `ApiResponse<Feedback>` (existing pattern from `shared/src/types/api.ts`).

**Error — 400 Bad Request** (validation failure):

```json
{
  "errors": [
    {
      "code": "too_small",
      "minimum": 2,
      "path": ["name"],
      "message": "שם חייב להכיל לפחות 2 תווים"
    },
    {
      "code": "invalid_string",
      "path": ["email"],
      "message": "כתובת אימייל לא תקינה"
    }
  ]
}
```

Zod issues array — same shape returned by the existing `errorHandler.ts` for `ZodError`.

**Error — 500 Internal Server Error:**

```json
{
  "error": "Internal server error"
}
```

Handled by the global `errorHandler` middleware.

---

## Storage

In-memory array (no MongoDB model needed for MVP). The server module exports:

```ts
const feedbackStore: Feedback[] = [];
```

This keeps the feature self-contained and avoids a DB migration. Can be upgraded to a Mongoose model later.

---

## File Ownership

| File | Owner | Description |
|------|-------|-------------|
| `docs/feedback.md` | Planning | This spec |
| `shared/src/types/feedback.ts` | Shared | `Feedback` + `FeedbackRequest` types |
| `shared/src/index.ts` | Shared | Add re-export |
| `server/src/schemas/feedback.ts` | Server | Zod schema for request validation |
| `server/src/controllers/Feedback.ts` | Server | `createFeedback` handler |
| `server/src/routes/feedbackRoutes.ts` | Server | `POST /api/feedback` route |
| `server/src/server.ts` | Server | Mount `feedbackRoutes` |
| `client/src/pages/FeedbackPage.tsx` | Client | Form component + `/feedback` route |
| `client/src/services/feedbackService.ts` | Client | `submitFeedback()` API call |
| `client/src/App.tsx` | Client | Add `/feedback` route |
| `design-system.js` | Design | Token mapping reference (no changes needed — existing tokens cover all form elements) |

---

## Design Notes

The form should use the existing design-system components:
- `Input` for name and email fields
- A `<textarea>` styled with design-system spacing/colors for the message field
- `Button` (primary variant) for submit
- `Alert` (success/error variants) for submission result feedback

Layout: RTL, centered card on a clean background, consistent with `CustomerHomePage` styling.

---

## QA Test Plan

### Server — Endpoint Validation

| # | Scenario | Expected |
|---|----------|----------|
| 1 | Valid payload | 201 + `Feedback` object |
| 2 | Missing `name` | 400 + Zod error on `name` |
| 3 | `email` = `"notanemail"` | 400 + Zod error on `email` |
| 4 | `message` < 10 chars | 400 + Zod error on `message` |
| 5 | `name` > 100 chars | 400 + Zod error on `name` |
| 6 | `message` > 2000 chars | 400 + Zod error on `message` |
| 7 | Empty body | 400 + multiple Zod errors |
| 8 | Extra fields ignored | 201 (Zod `.strip()`) |

### Client — Form UX

| # | Scenario | Expected |
|---|----------|----------|
| 1 | Happy path: fill all fields, submit | Success alert, form clears |
| 2 | Submit with empty fields | Client-side validation errors shown |
| 3 | Submit with invalid email | Email field error message |
| 4 | Server returns 400 | Error alert with server message |
| 5 | Server unreachable | Error alert with generic message |
| 6 | Submit button disabled while request in-flight | Prevents double-submit |
