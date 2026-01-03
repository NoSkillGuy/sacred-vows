import { ReactNode, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { isAuthenticated } from "../../services/authService";
import LandingFooter from "../Landing/LandingFooter";
import "./PageLayout.css";

// SVG Components matching brand
const RingIcon = (): JSX.Element => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="12" stroke="#d4af37" strokeWidth="2.5" fill="none" />
    <circle cx="20" cy="8" r="3" fill="#d4af37" />
    <path d="M17 8L20 3L23 8" stroke="#d4af37" strokeWidth="1.5" fill="none" />
  </svg>
);

interface Breadcrumb {
  label: string;
  path?: string;
}

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  breadcrumbs?: Breadcrumb[];
}

function PageLayout({ children, title, subtitle, breadcrumbs = [] }: PageLayoutProps): JSX.Element {
  const navigate = useNavigate();
  const [isAuth, setIsAuth] = useState(() => isAuthenticated());

  useEffect(() => {
    setIsAuth(isAuthenticated());
  }, []);

  return (
    <div className="page-layout">
      {/* Navigation Header */}
      <header className="page-header">
        <nav className="page-nav">
          <Link to={isAuth ? "/dashboard" : "/"} className="nav-logo">
            <span className="logo-icon">
              <RingIcon />
            </span>
            <span className="logo-text">Sacred Vows</span>
          </Link>

          <div className="nav-links">
            <Link to="/layouts-gallery">Layouts</Link>
            <Link to="/pricing">Pricing</Link>
            <Link to="/about">About</Link>
            <Link to="/help">Support</Link>
            <button className="nav-login" onClick={() => navigate("/login")}>
              <span>Sign In</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button className="mobile-menu-btn" aria-label="Toggle menu">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </nav>
      </header>

      {/* Page Hero */}
      {title && (
        <section className="page-hero">
          <div className="page-hero-bg" />
          <div className="page-hero-content">
            {breadcrumbs.length > 0 && (
              <nav className="page-breadcrumbs">
                <Link to="/">Home</Link>
                {breadcrumbs.map((crumb, index) => (
                  <span key={index}>
                    <span className="breadcrumb-separator">›</span>
                    {crumb.path ? (
                      <Link to={crumb.path}>{crumb.label}</Link>
                    ) : (
                      <span className="breadcrumb-current">{crumb.label}</span>
                    )}
                  </span>
                ))}
              </nav>
            )}
            <h1 className="page-title">{title}</h1>
            {subtitle && <p className="page-subtitle">{subtitle}</p>}
          </div>
          <div className="page-hero-ornament left">✦</div>
          <div className="page-hero-ornament right">✦</div>
        </section>
      )}

      {/* Page Content */}
      <main className="page-content">{children}</main>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}

export default PageLayout;
