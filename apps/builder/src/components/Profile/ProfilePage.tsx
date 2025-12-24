import { useState, useEffect, useCallback, ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  getCurrentUserFromAPI,
  requestPasswordChangeOTP,
  verifyPasswordChangeOTP,
} from "../../services/authService";
import { User } from "../../services/authService";
import "./ProfilePage.css";

type PasswordChangeState = "idle" | "requesting" | "otp-sent" | "verifying" | "success" | "error";

function ProfilePage(): JSX.Element {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [passwordChangeState, setPasswordChangeState] = useState<PasswordChangeState>("idle");
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
    otp: "",
  });
  const [error, setError] = useState("");
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [expirySeconds, setExpirySeconds] = useState(0);
  const [attemptsRemaining, setAttemptsRemaining] = useState(5);

  const loadUser = useCallback(async (): Promise<void> => {
    try {
      const userData = await getCurrentUserFromAPI();
      setUser(userData);
    } catch (err) {
      console.error("Failed to load user:", err);
      navigate("/login");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (cooldownSeconds > 0) {
      interval = setInterval(() => {
        setCooldownSeconds((prev) => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [cooldownSeconds]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (expirySeconds > 0 && passwordChangeState === "otp-sent") {
      interval = setInterval(() => {
        setExpirySeconds((prev) => {
          if (prev <= 1) {
            setPasswordChangeState("idle");
            setError("OTP has expired. Please request a new one.");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [expirySeconds, passwordChangeState]);

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleRequestOTP = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError("");
    setPasswordChangeState("requesting");

    // Validate passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match. Please try again.");
      setPasswordChangeState("idle");
      return;
    }

    // Validate password strength (basic check)
    if (formData.newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      setPasswordChangeState("idle");
      return;
    }

    try {
      if (!user?.email) {
        throw new Error("User email not found");
      }
      await requestPasswordChangeOTP(user.email);
      setPasswordChangeState("otp-sent");
      setCooldownSeconds(30);
      setExpirySeconds(300); // 5 minutes
      setAttemptsRemaining(5);
      setFormData({ ...formData, otp: "" });
    } catch (err) {
      setError((err as Error).message || "Failed to send OTP. Please try again.");
      setPasswordChangeState("idle");
    }
  };

  const handleVerifyOTP = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError("");
    setPasswordChangeState("verifying");

    // Validate OTP format (6 digits)
    if (!/^\d{6}$/.test(formData.otp)) {
      setError("Please enter a valid 6-digit OTP code.");
      setPasswordChangeState("otp-sent");
      return;
    }

    try {
      await verifyPasswordChangeOTP(formData.otp, formData.newPassword);
      setPasswordChangeState("success");
      setFormData({ newPassword: "", confirmPassword: "", otp: "" });
      setExpirySeconds(0);
      setCooldownSeconds(0);

      // Reset to idle after 3 seconds
      setTimeout(() => {
        setPasswordChangeState("idle");
      }, 3000);
    } catch (err) {
      const errorMessage = (err as Error).message || "Failed to verify OTP. Please try again.";
      setError(errorMessage);
      setPasswordChangeState("otp-sent");

      // Extract attempt count from error message if available
      const attemptMatch = errorMessage.match(/(\d+) attempt\(s\) remaining/);
      if (attemptMatch) {
        setAttemptsRemaining(parseInt(attemptMatch[1], 10));
      } else if (errorMessage.includes("Maximum attempts reached")) {
        setAttemptsRemaining(0);
        setPasswordChangeState("idle");
        setExpirySeconds(0);
      }
    }
  };

  const handleResendOTP = async (): Promise<void> => {
    if (cooldownSeconds > 0) {
      return;
    }
    setError("");
    setPasswordChangeState("requesting");

    // Validate passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match. Please try again.");
      setPasswordChangeState("idle");
      return;
    }

    // Validate password strength (basic check)
    if (formData.newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      setPasswordChangeState("idle");
      return;
    }

    try {
      if (!user?.email) {
        throw new Error("User email not found");
      }
      await requestPasswordChangeOTP(user.email);
      setPasswordChangeState("otp-sent");
      setCooldownSeconds(30);
      setExpirySeconds(300); // 5 minutes
      setAttemptsRemaining(5);
      setFormData({ ...formData, otp: "" });
    } catch (err) {
      setError((err as Error).message || "Failed to send OTP. Please try again.");
      setPasswordChangeState("idle");
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <div className="loading">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <header className="profile-header">
          <h1>Profile Settings</h1>
        </header>

        <div className="profile-content">
          {/* User Information */}
          <section className="profile-section">
            <h2>Account Information</h2>
            <div className="user-info">
              <div className="info-row">
                <span className="info-label">Email:</span>
                <span className="info-value">{user?.email || "N/A"}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Name:</span>
                <span className="info-value">{user?.name || "Not set"}</span>
              </div>
            </div>
          </section>

          {/* Password Change Section */}
          <section className="profile-section">
            <h2>Change Password</h2>

            {passwordChangeState === "idle" && (
              <form onSubmit={handleRequestOTP} className="password-form">
                <div className="form-group">
                  <label htmlFor="newPassword">New Password</label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handlePasswordChange}
                    required
                    minLength={8}
                    placeholder="Enter new password"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                    minLength={8}
                    placeholder="Confirm new password"
                  />
                </div>
                {error && <div className="error-message">{error}</div>}
                <button type="submit" className="btn btn-primary">
                  Request Verification Code
                </button>
              </form>
            )}

            {passwordChangeState === "requesting" && (
              <div className="loading-state">
                <p>Sending verification code...</p>
              </div>
            )}

            {passwordChangeState === "otp-sent" && (
              <div className="otp-section">
                <div className="otp-info">
                  <p className="otp-message">
                    We&apos;ve sent a 6-digit verification code to <strong>{user?.email}</strong>.
                    Please check your email and enter the code below.
                  </p>
                  {expirySeconds > 0 && (
                    <p className="expiry-info">
                      Code expires in: <strong>{formatTime(expirySeconds)}</strong>
                    </p>
                  )}
                  {attemptsRemaining > 0 && (
                    <p className="attempts-info">
                      Attempts remaining: <strong>{attemptsRemaining}</strong>
                    </p>
                  )}
                </div>
                <form onSubmit={handleVerifyOTP} className="otp-form">
                  <div className="form-group">
                    <label htmlFor="otp">Verification Code</label>
                    <input
                      type="text"
                      id="otp"
                      name="otp"
                      value={formData.otp}
                      onChange={handlePasswordChange}
                      required
                      maxLength={6}
                      pattern="[0-9]{6}"
                      placeholder="000000"
                      className="otp-input"
                      autoComplete="one-time-code"
                    />
                  </div>
                  {error && <div className="error-message">{error}</div>}
                  <div className="form-actions">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={passwordChangeState === "verifying"}
                    >
                      {passwordChangeState === "verifying"
                        ? "Verifying..."
                        : "Verify & Update Password"}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleResendOTP}
                      disabled={cooldownSeconds > 0}
                    >
                      {cooldownSeconds > 0 ? `Resend (${cooldownSeconds}s)` : "Resend Code"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {passwordChangeState === "verifying" && (
              <div className="loading-state">
                <p>Verifying code...</p>
              </div>
            )}

            {passwordChangeState === "success" && (
              <div className="success-message">
                <p>✓ Password updated successfully!</p>
              </div>
            )}

            {passwordChangeState === "error" && error && (
              <div className="error-message">{error}</div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
