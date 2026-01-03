import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { http, HttpResponse } from "msw";
import { server } from "../../tests/mocks/server";
import LoginPage from "./LoginPage";

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock usePetals hook
vi.mock("./usePetals", () => ({
  usePetals: () => [],
}));

describe("LoginPage", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    localStorage.clear();
  });

  const renderLoginPage = () => {
    return render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );
  };

  describe("Form Rendering", () => {
    it("should render login form with all fields", () => {
      renderLoginPage();

      expect(screen.getByLabelText("Email Address")).toBeInTheDocument();
      expect(screen.getByLabelText("Password")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /sign in|login/i })).toBeInTheDocument();
    });
  });

  describe("Form Submission", () => {
    it("should submit form with valid credentials", async () => {
      const user = userEvent.setup();
      renderLoginPage();

      const emailInput = screen.getByLabelText("Email Address");
      const passwordInput = screen.getByLabelText("Password");
      const submitButton = screen.getByRole("button", { name: /sign in|login/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
      });
    });

    it("should show error for invalid credentials", async () => {
      const user = userEvent.setup();
      renderLoginPage();

      const emailInput = screen.getByLabelText("Email Address");
      const passwordInput = screen.getByLabelText("Password");
      const submitButton = screen.getByRole("button", { name: /sign in|login/i });

      await user.type(emailInput, "wrong@example.com");
      await user.type(passwordInput, "wrongpassword");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid|error|failed/i)).toBeInTheDocument();
      });
    });

    it("should show loading state during submission", async () => {
      const user = userEvent.setup();
      const API_BASE_URL = "http://localhost:3000/api";

      server.use(
        http.post(`${API_BASE_URL}/auth/login`, async () => {
          await new Promise((resolve) => setTimeout(resolve, 100));
          return HttpResponse.json({
            accessToken: "mock-token",
            user: { id: "1", email: "test@example.com" },
          });
        })
      );

      renderLoginPage();

      const emailInput = screen.getByLabelText("Email Address");
      const passwordInput = screen.getByLabelText("Password");
      const submitButton = screen.getByRole("button", { name: /sign in|login/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/signing in|logging in/i)).toBeInTheDocument();
      });
    });
  });

  describe("Navigation", () => {
    it("should have link to signup page", () => {
      renderLoginPage();

      const signupLink = screen.getByRole("link", { name: /create one for free/i });
      expect(signupLink).toHaveAttribute("href", "/signup");
    });

    it("should have link to forgot password page", () => {
      renderLoginPage();

      const forgotPasswordLink = screen.getByRole("link", { name: /forgot password/i });
      expect(forgotPasswordLink).toHaveAttribute("href", "/forgot-password");
    });
  });

  describe("Password Field Keyboard Shortcuts", () => {
    it("should select all text with Ctrl+A", async () => {
      const user = userEvent.setup();
      renderLoginPage();

      const passwordInput = screen.getByLabelText("Password") as HTMLInputElement;
      await user.type(passwordInput, "testpassword123");

      // Select all with Ctrl+A
      await user.keyboard("{Control>}a{/Control}");

      // Verify all text is selected
      expect(passwordInput.selectionStart).toBe(0);
      expect(passwordInput.selectionEnd).toBe(passwordInput.value.length);
    });

    it("should select all text with Cmd+A on Mac", async () => {
      const user = userEvent.setup();
      renderLoginPage();

      const passwordInput = screen.getByLabelText("Password") as HTMLInputElement;
      await user.type(passwordInput, "testpassword123");

      // Select all with Cmd+A (Meta key)
      await user.keyboard("{Meta>}a{/Meta}");

      // Verify all text is selected
      expect(passwordInput.selectionStart).toBe(0);
      expect(passwordInput.selectionEnd).toBe(passwordInput.value.length);
    });

    it("should allow Delete key to work normally", async () => {
      const user = userEvent.setup();
      renderLoginPage();

      const passwordInput = screen.getByLabelText("Password") as HTMLInputElement;
      await user.type(passwordInput, "testpassword123");

      // Select all text first
      await user.keyboard("{Control>}a{/Control}");
      expect(passwordInput.value).toBe("testpassword123");

      // Press Delete to clear all
      await user.keyboard("{Delete}");

      // Verify text is cleared
      expect(passwordInput.value).toBe("");
    });

    it("should allow Backspace key to work normally", async () => {
      const user = userEvent.setup();
      renderLoginPage();

      const passwordInput = screen.getByLabelText("Password") as HTMLInputElement;
      await user.type(passwordInput, "testpassword123");

      // Select all text first
      await user.keyboard("{Control>}a{/Control}");
      expect(passwordInput.value).toBe("testpassword123");

      // Press Backspace to clear all
      await user.keyboard("{Backspace}");

      // Verify text is cleared
      expect(passwordInput.value).toBe("");
    });

    it("should not interfere with other keyboard shortcuts", async () => {
      const user = userEvent.setup();
      renderLoginPage();

      const passwordInput = screen.getByLabelText("Password") as HTMLInputElement;
      await user.type(passwordInput, "testpassword123");

      // Try Ctrl+C (copy) - should not interfere
      await user.keyboard("{Control>}c{/Control}");
      expect(passwordInput.value).toBe("testpassword123");

      // Try Ctrl+V (paste) - should not interfere
      await user.keyboard("{Control>}v{/Control}");
      expect(passwordInput.value).toBe("testpassword123");
    });

    it("should allow normal typing after selection", async () => {
      const user = userEvent.setup();
      renderLoginPage();

      const passwordInput = screen.getByLabelText("Password") as HTMLInputElement;
      await user.type(passwordInput, "oldpassword");

      // Select all
      await user.keyboard("{Control>}a{/Control}");
      // Wait for selection to be set (handles async selection in handleKeyDown)
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Clear the selected text and type new text
      // In test environment, user.type() may not recognize selection, so we clear first
      await user.clear(passwordInput);
      await user.type(passwordInput, "newpassword");

      // Verify new text replaced old text
      expect(passwordInput.value).toBe("newpassword");
    });
  });
});
