import {
  useState,
  useEffect,
  useCallback,
  useRef,
  ChangeEvent,
  FormEvent,
  MouseEvent,
} from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  getCurrentUserFromAPI,
  requestPasswordChangeOTP,
  verifyPasswordChangeOTP,
  logout,
} from "../../services/authService";
import { User } from "../../services/authService";
import "./ProfilePage.css";
import "../Dashboard/Dashboard.css";

// SVG Icons
const RingsIcon = (): JSX.Element => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="12" stroke="currentColor" strokeWidth="2.5" fill="none" />
    <circle cx="20" cy="8" r="3" fill="currentColor" />
    <path d="M17 8L20 3L23 8" stroke="currentColor" strokeWidth="1.5" fill="none" />
  </svg>
);

const ProfileIcon = (): JSX.Element => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const LogoutIcon = (): JSX.Element => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const DashboardIcon = (): JSX.Element => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="7" height="9" />
    <rect x="14" y="3" width="7" height="5" />
    <rect x="14" y="12" width="7" height="9" />
    <rect x="3" y="16" width="7" height="5" />
  </svg>
);

type PasswordChangeState = "idle" | "requesting" | "otp-sent" | "verifying" | "success" | "error";

function ProfilePage(): JSX.Element {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
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
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    function handleClickOutside(event: MouseEvent): void {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside as EventListener);
    return () => document.removeEventListener("mousedown", handleClickOutside as EventListener);
  }, []);

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

  function getInitials(name?: string): string {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  async function handleLogout(): Promise<void> {
    await logout();
    navigate("/login");
  }

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <div className="loading" aria-live="polite" role="status">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Header - Same as Dashboard */}
        <header className="dashboard-header">
          <div className="header-left">
            <Link to="/dashboard" className="header-logo">
              <div className="header-logo-icon">
                <RingsIcon />
              </div>
              <span className="header-logo-text">Sacred Vows</span>
            </Link>
          </div>

          <div className="header-actions">
            <Link to="/dashboard" className="btn btn-secondary">
              <DashboardIcon />
              <span>My Invitations</span>
            </Link>

            <div className="user-menu" ref={dropdownRef}>
              <div className="user-avatar" onClick={() => setDropdownOpen(!dropdownOpen)}>
                {getInitials(user?.name)}
              </div>

              <div className={`user-dropdown ${dropdownOpen ? "open" : ""}`}>
                <div className="user-dropdown-header">
                  <div className="user-dropdown-name">{user?.name || "Guest"}</div>
                  <div className="user-dropdown-email">{user?.email || ""}</div>
                </div>
                <Link
                  to="/profile"
                  className="user-dropdown-item"
                  onClick={() => setDropdownOpen(false)}
                >
                  <ProfileIcon />
                  Profile
                </Link>
                <button className="user-dropdown-item logout" onClick={handleLogout}>
                  <LogoutIcon />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="profile-container-inner">
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
                      aria-invalid={error ? "true" : "false"}
                      aria-describedby={error ? "password-error" : undefined}
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
                      aria-invalid={error ? "true" : "false"}
                      aria-describedby={error ? "password-error" : undefined}
                    />
                  </div>
                  {error && (
                    <div
                      id="password-error"
                      className="error-message"
                      role="alert"
                      aria-live="polite"
                    >
                      {error}
                    </div>
                  )}
                  <button type="submit" className="btn btn-primary">
                    Request Verification Code
                  </button>
                </form>
              )}

              {passwordChangeState === "requesting" && (
                <div className="loading-state" aria-live="polite" role="status">
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
                        aria-invalid={error ? "true" : "false"}
                        aria-describedby={error ? "otp-error" : undefined}
                      />
                    </div>
                    {error && (
                      <div id="otp-error" className="error-message" role="alert" aria-live="polite">
                        {error}
                      </div>
                    )}
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
                <div className="loading-state" aria-live="polite" role="status">
                  <p>Verifying code...</p>
                </div>
              )}

              {passwordChangeState === "success" && (
                <div className="success-message" role="status" aria-live="polite">
                  <p>✓ Password updated successfully!</p>
                </div>
              )}

              {passwordChangeState === "error" && error && (
                <div className="error-message" role="alert" aria-live="polite">
                  {error}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
