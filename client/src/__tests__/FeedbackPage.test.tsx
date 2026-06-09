import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import FeedbackPage from "../pages/FeedbackPage";

const mockSubmitFeedback = vi.fn();

vi.mock("../services/feedbackService", () => ({
  submitFeedback: (...args: unknown[]) => mockSubmitFeedback(...args),
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/feedback"]}>
      <FeedbackPage />
    </MemoryRouter>
  );
}

function getNameInput() {
  return screen.getByLabelText("שם");
}
function getEmailInput() {
  return screen.getByLabelText("אימייל");
}
function getMessageInput() {
  return screen.getByLabelText("הודעה");
}
function getSubmitButton() {
  return screen.getByRole("button", { name: /שלח פנייה/i });
}

describe("FeedbackPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Scenario 1: Happy path
  it("shows success alert and clears form after successful submission", async () => {
    mockSubmitFeedback.mockResolvedValueOnce({
      data: {
        id: "f_1",
        name: "דוד",
        email: "d@e.com",
        message: "test message!",
        createdAt: new Date().toISOString(),
      },
      message: "הפנייה נשלחה בהצלחה",
    });

    const user = userEvent.setup();
    renderPage();

    await user.type(getNameInput(), "דוד כהן");
    await user.type(getEmailInput(), "david@example.com");
    await user.type(getMessageInput(), "האתר נהדר! הייתי שמח לראות עוד.");

    await user.click(getSubmitButton());

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("תודה!");
    });

    expect(getNameInput()).toHaveValue("");
    expect(getEmailInput()).toHaveValue("");
    expect(getMessageInput()).toHaveValue("");
  });

  // Scenario 2: Submit with empty fields → client-side validation errors
  it("shows client-side validation errors for empty fields", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(getSubmitButton());

    await waitFor(() => {
      const alerts = screen.getAllByRole("alert");
      const errorTexts = alerts.map((a) => a.textContent);
      expect(errorTexts.some((t) => t?.includes("שם"))).toBe(true);
      expect(errorTexts.some((t) => t?.includes("אימייל"))).toBe(true);
      expect(errorTexts.some((t) => t?.includes("הודעה"))).toBe(true);
    });

    expect(mockSubmitFeedback).not.toHaveBeenCalled();
  });

  // Scenario 3: Invalid email → email field error
  it("shows email validation error for an invalid address", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(getNameInput(), "דוד כהן");
    await user.type(getEmailInput(), "not-an-email");
    await user.type(getMessageInput(), "הודעה ארוכה מספיק לעבור ולידציה");

    await user.click(getSubmitButton());

    await waitFor(() => {
      const alerts = screen.getAllByRole("alert");
      const errorTexts = alerts.map((a) => a.textContent);
      expect(errorTexts.some((t) => t?.includes("אימייל"))).toBe(true);
    });

    expect(mockSubmitFeedback).not.toHaveBeenCalled();
  });

  // Scenario 4: Server returns 400 → error alert
  it("shows error alert when the server returns an error", async () => {
    mockSubmitFeedback.mockRejectedValueOnce(new Error("שגיאת ולידציה בשרת"));

    const user = userEvent.setup();
    renderPage();

    await user.type(getNameInput(), "דוד כהן");
    await user.type(getEmailInput(), "david@example.com");
    await user.type(getMessageInput(), "האתר נהדר! הייתי שמח לראות עוד.");

    await user.click(getSubmitButton());

    await waitFor(() => {
      expect(screen.getByText("שגיאת ולידציה בשרת")).toBeInTheDocument();
    });
  });

  // Scenario 5: Server unreachable → generic error
  it("shows a generic error when the server is unreachable", async () => {
    mockSubmitFeedback.mockRejectedValueOnce(new TypeError("Failed to fetch"));

    const user = userEvent.setup();
    renderPage();

    await user.type(getNameInput(), "דוד כהן");
    await user.type(getEmailInput(), "david@example.com");
    await user.type(getMessageInput(), "האתר נהדר! הייתי שמח לראות עוד.");

    await user.click(getSubmitButton());

    await waitFor(() => {
      expect(screen.getByText("Failed to fetch")).toBeInTheDocument();
    });
  });

  // Scenario 6: Submit button disabled while request is in-flight
  it("disables the submit button while the request is in-flight", async () => {
    let resolveSubmit!: (v: unknown) => void;
    mockSubmitFeedback.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveSubmit = resolve;
      })
    );

    const user = userEvent.setup();
    renderPage();

    await user.type(getNameInput(), "דוד כהן");
    await user.type(getEmailInput(), "david@example.com");
    await user.type(getMessageInput(), "האתר נהדר! הייתי שמח לראות עוד.");

    await user.click(getSubmitButton());

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /שולח/i })).toBeDisabled();
    });

    resolveSubmit({
      data: { id: "f_1", name: "דוד כהן", email: "david@example.com", message: "test", createdAt: "" },
      message: "ok",
    });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /שלח פנייה/i })).toBeEnabled();
    });
  });
});
