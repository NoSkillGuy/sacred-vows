import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { http, HttpResponse } from "msw";
import { server } from "../../tests/mocks/server";
import SignupPage from "./SignupPage";

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

describe("SignupPage", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    localStorage.clear();
  });

  const renderSignupPage = () => {
    return render(
      <BrowserRouter>
        <SignupPage />
      </BrowserRouter>
    );
  };

  describe("Form Rendering", () => {
    it("should render signup form with all fields", () => {
      renderSignupPage();

      expect(screen.getByLabelText("Full Name")).toBeInTheDocument();
      expect(screen.getByLabelText("Email Address")).toBeInTheDocument();
      expect(screen.getByLabelText("Password")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /create account/i })).toBeInTheDocument();
    });

    it('should show "Create Your Account" heading', () => {
      renderSignupPage();

      expect(screen.getByText("Create Your Account")).toBeInTheDocument();
    });
  });

  describe("Password Strength (zxcvbn)", () => {
    it("should show weak password message for weak passwords", async () => {
      const user = userEvent.setup();
      renderSignupPage();

      const passwordInput = screen.getByLabelText("Password");

      await user.type(passwordInput, "123");
      await user.click(passwordInput); // Focus to show tooltip

      await waitFor(() => {
        expect(screen.getByText(/keep going/i)).toBeInTheDocument();
      });
    });

    it("should show medium password message for medium strength passwords", async () => {
      const user = userEvent.setup();
      renderSignupPage();

      const passwordInput = screen.getByLabelText("Password");

      // Medium strength password (score 2) - using a password that zxcvbn scores as 2
      await user.type(passwordInput, "Pass123Test");
      await user.click(passwordInput);

      await waitFor(() => {
        // Match the actual text with em dash
        const tooltip = screen.getByText(/Almost there|almost there/i);
        expect(tooltip).toBeInTheDocument();
      });
    });

    it("should show strong password message for strong passwords", async () => {
      const user = userEvent.setup();
      renderSignupPage();

      const passwordInput = screen.getByLabelText("Password");

      // Strong password (score 3+)
      await user.type(passwordInput, "StrongP@ssw0rd123!");
      await user.click(passwordInput);

      await waitFor(() => {
        expect(screen.getByText(/strong password/i)).toBeInTheDocument();
      });
    });

    it("should update strength as user types", async () => {
      const user = userEvent.setup();
      renderSignupPage();

      const passwordInput = screen.getByLabelText("Password");

      await user.type(passwordInput, "weak");
      await user.click(passwordInput);

      await waitFor(() => {
        expect(screen.getByText(/keep going/i)).toBeInTheDocument();
      });

      await user.clear(passwordInput);
      await user.type(passwordInput, "StrongP@ssw0rd123!");
      await user.click(passwordInput);

      await waitFor(() => {
        expect(screen.getByText(/strong password/i)).toBeInTheDocument();
      });
    });
  });

  describe("Form Validation", () => {
    it("should require all fields", () => {
      renderSignupPage();

      const nameInput = screen.getByLabelText("Full Name");
      const emailInput = screen.getByLabelText("Email Address");
      const passwordInput = screen.getByLabelText("Password");

      expect(nameInput).toBeRequired();
      expect(emailInput).toBeRequired();
      expect(passwordInput).toBeRequired();
    });

    it("should show error for password less than 6 characters", async () => {
      const user = userEvent.setup();
      renderSignupPage();

      const nameInput = screen.getByLabelText("Full Name");
      const emailInput = screen.getByLabelText("Email Address");
      const passwordInput = screen.getByLabelText("Password");
      const submitButton = screen.getByRole("button", { name: /create account/i });

      await user.type(nameInput, "Test User");
      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "12345"); // Less than 6 characters
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
      });
    });
  });

  describe("Form Submission", () => {
    it("should submit form with valid data", async () => {
      const user = userEvent.setup();
      renderSignupPage();

      const nameInput = screen.getByLabelText("Full Name");
      const emailInput = screen.getByLabelText("Email Address");
      const passwordInput = screen.getByLabelText("Password");
      const submitButton = screen.getByRole("button", { name: /create account/i });

      await user.type(nameInput, "Test User");
      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "SecurePassword123!");
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
      });
    });

    it("should show loading state during submission", async () => {
      const user = userEvent.setup();

      // Add a delay to the mock handler to ensure loading state is visible
      const API_BASE_URL = "http://localhost:3000/api";
      server.use(
        http.post(`${API_BASE_URL}/auth/register`, async () => {
          // Add a small delay to ensure loading state is visible
          await new Promise((resolve) => setTimeout(resolve, 100));
          return HttpResponse.json({
            accessToken: "mock-token",
            user: {
              id: "1",
              email: "test@example.com",
              name: "Test User",
            },
          });
        })
      );

      renderSignupPage();

      const nameInput = screen.getByLabelText("Full Name");
      const emailInput = screen.getByLabelText("Email Address");
      const passwordInput = screen.getByLabelText("Password");
      const submitButton = screen.getByRole("button", { name: /create account/i });

      await user.type(nameInput, "Test User");
      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "SecurePassword123!");
      await user.click(submitButton);

      // Button should show loading state
      await waitFor(() => {
        expect(screen.getByText(/Creating Account/i)).toBeInTheDocument();
      });
    });

    it("should handle API errors", async () => {
      const user = userEvent.setup();
      renderSignupPage();

      const nameInput = screen.getByLabelText("Full Name");
      const emailInput = screen.getByLabelText("Email Address");
      const passwordInput = screen.getByLabelText("Password");
      const submitButton = screen.getByRole("button", { name: /create account/i });

      // Use email that triggers error in MSW handler
      await user.type(nameInput, "Test User");
      await user.type(emailInput, "existing@example.com");
      await user.type(passwordInput, "SecurePassword123!");
      await user.click(submitButton);

      await waitFor(() => {
        // Check for error message (case insensitive)
        expect(
          screen.getByText(/Email already registered|email already registered/i)
        ).toBeInTheDocument();
      });
    });

    it("should clear error when user starts typing", async () => {
      const user = userEvent.setup();
      renderSignupPage();

      const nameInput = screen.getByLabelText("Full Name");
      const emailInput = screen.getByLabelText("Email Address");
      const passwordInput = screen.getByLabelText("Password");
      const submitButton = screen.getByRole("button", { name: /create account/i });

      // Trigger error - fill in all required fields
      await user.type(nameInput, "Test User");
      await user.type(emailInput, "existing@example.com");
      await user.type(passwordInput, "SecurePassword123!");
      await user.click(submitButton);

      await waitFor(() => {
        // Check for error message (case insensitive)
        expect(
          screen.getByText(/Email already registered|email already registered/i)
        ).toBeInTheDocument();
      });

      // Start typing to clear error
      await user.type(emailInput, "new");

      await waitFor(() => {
        expect(
          screen.queryByText(/Email already registered|email already registered/i)
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("Navigation", () => {
    it("should have link to login page", () => {
      renderSignupPage();

      const loginLink = screen.getByRole("link", { name: /sign in/i });
      expect(loginLink).toHaveAttribute("href", "/login");
    });

    it("should have link to home page in logo", () => {
      renderSignupPage();

      const logoLink = screen.getByRole("link", { name: /sacred vows/i });
      expect(logoLink).toHaveAttribute("href", "/");
    });
  });
});
