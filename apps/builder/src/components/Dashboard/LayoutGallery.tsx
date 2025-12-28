import { useState, useEffect, useRef, MouseEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getCurrentUser, logout, type User } from "../../services/authService";
import type { LayoutManifest } from "@shared/types/layout";
import LayoutCardUnified from "../Layouts/LayoutCardUnified";
import { useLayoutsQuery } from "../../hooks/queries/useLayouts";
import { useCreateInvitationMutation } from "../../hooks/queries/useInvitations";
import { presetToSectionConfigs } from "../../config/layout-presets";
import type { LayoutPreset } from "@shared/types/layout";
import "./Dashboard.css";

// SVG Icons
const RingsIcon = (): JSX.Element => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="12" stroke="currentColor" strokeWidth="2.5" fill="none" />
    <circle cx="20" cy="8" r="3" fill="currentColor" />
    <path d="M17 8L20 3L23 8" stroke="currentColor" strokeWidth="1.5" fill="none" />
  </svg>
);

// StarIcon removed - unused

const LayoutIcon = (): JSX.Element => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18" />
    <path d="M9 21V9" />
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

interface LayoutWithStatus extends LayoutManifest {
  isAvailable?: boolean;
  status?: string;
}

function LayoutGallery(): JSX.Element {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [creating, setCreating] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [presetModalOpen, setPresetModalOpen] = useState(false);
  const [selectedLayout, setSelectedLayout] = useState<LayoutWithStatus | null>(null);

  // Query hooks
  const {
    data: layoutsData,
    isLoading: loading,
    error: queryError,
    refetch,
  } = useLayoutsQuery({
    category: selectedCategory !== "all" ? selectedCategory : undefined,
  });
  const createMutation = useCreateInvitationMutation();

  const layouts = layoutsData?.layouts || [];
  const categories = layoutsData?.categories || ["all"];
  const error = queryError
    ? (queryError as Error).message || "Failed to load layouts. Please try again."
    : null;

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent): void {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside as EventListener);
    return () => document.removeEventListener("mousedown", handleClickOutside as EventListener);
  }, []);

  function loadUser(): void {
    const currentUser = getCurrentUser();
    setUser(currentUser);
  }

  async function handleSelectLayout(layout: LayoutWithStatus): Promise<void> {
    if (!layout.isAvailable) return;

    // If layout doesn't have presets from API, try loading from local manifest
    let layoutWithPresets = layout;
    if ((!layout.presets || layout.presets.length === 0) && layout.id === "editorial-elegance") {
      try {
        const { editorialEleganceManifest } =
          await import("../../layouts/editorial-elegance/manifest");
        if (editorialEleganceManifest.presets && editorialEleganceManifest.presets.length > 0) {
          layoutWithPresets = {
            ...layout,
            presets: editorialEleganceManifest.presets,
          };
        }
      } catch (error) {
        console.warn("Failed to load local manifest for presets:", error);
      }
    }

    // If no presets exist, directly create invitation without showing modal
    if (!layoutWithPresets.presets || layoutWithPresets.presets.length === 0) {
      await handlePresetSelection(null, layoutWithPresets);
      return;
    }

    // Show preset selection modal only if presets exist
    setSelectedLayout(layoutWithPresets);
    setPresetModalOpen(true);
  }

  async function handlePresetSelection(
    preset: LayoutPreset | null,
    layoutOverride?: LayoutWithStatus
  ): Promise<void> {
    const layoutToUse = layoutOverride || selectedLayout;
    if (!layoutToUse) {
      console.error("No layout available for preset selection");
      return;
    }

    setPresetModalOpen(false);

    try {
      setCreating(layoutToUse.id);

      // Initialize data with layout-specific defaults if available
      let initialData: Record<string, unknown> = {};
      if (layoutToUse.id === "editorial-elegance") {
        try {
          const { editorialEleganceDefaults } =
            await import("../../layouts/editorial-elegance/defaults");
          initialData = editorialEleganceDefaults as Record<string, unknown>;
        } catch (error) {
          console.warn("Failed to load editorial-elegance defaults for new invitation:", error);
        }
      }

      // Prepare layout config with preset sections
      // Always include sections - either from preset or default from manifest
      let layoutConfig:
        | { sections: Array<{ id: string; enabled: boolean; order: number }>; theme?: unknown }
        | undefined;
      if (
        layoutToUse.sections &&
        Array.isArray(layoutToUse.sections) &&
        layoutToUse.sections.length > 0
      ) {
        try {
          const presetSections = presetToSectionConfigs(preset, layoutToUse.sections);
          layoutConfig = {
            sections: presetSections,
          };
        } catch (error) {
          console.error("Failed to convert preset to section configs:", error);
          // Fallback: create sections from manifest
          layoutConfig = {
            sections: layoutToUse.sections.map((section, index) => ({
              id: section.id,
              enabled: true,
              order: section.order !== undefined ? section.order : index,
              config: {},
            })),
          };
        }
      } else {
        // No sections in manifest, create empty config
        console.warn(`Layout ${layoutToUse.id} has no sections defined`);
        layoutConfig = {
          sections: [],
        };
      }

      // Merge layoutConfig into data for backend (backend stores everything in data field)
      const dataWithLayoutConfig = {
        ...initialData,
        ...(layoutConfig ? { layoutConfig } : {}),
      };

      console.log("Creating invitation with:", {
        layoutId: layoutToUse.id,
        sectionsCount: layoutConfig?.sections?.length || 0,
        hasInitialData: Object.keys(initialData).length > 0,
      });

      const invitation = await createMutation.mutateAsync({
        layoutId: layoutToUse.id,
        title: "My Wedding Invitation",
        data: dataWithLayoutConfig as never,
        layoutConfig: layoutConfig as never,
      });

      if (!invitation || !invitation.id) {
        throw new Error("Invitation created but missing ID");
      }

      navigate(`/builder/${invitation.id}`);
    } catch (error) {
      console.error("Failed to create invitation:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create invitation. Please try again.";
      alert(errorMessage);
    } finally {
      setCreating(null);
      setSelectedLayout(null);
    }
  }

  function handleLogout(): void {
    logout();
    navigate("/login");
  }

  function getInitials(name?: string): string {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  if (loading) {
    return (
      <div className="layout-gallery-page">
        <div className="gallery-container">
          <div className="page-loading">
            <div className="page-loading-spinner">
              <RingsIcon />
            </div>
            <p>Loading beautiful layouts...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="layout-gallery-page">
      <div className="gallery-container">
        {/* Header */}
        <header className="gallery-header">
          <div className="header-left">
            <Link to="/" className="header-logo">
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

        {/* Intro */}
        <div className="gallery-intro">
          <h2>Choose Your Perfect Layout</h2>
          <p>
            Select from our beautifully crafted wedding invitation layouts. Each design is
            customizable to match your unique love story.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="category-tabs">
          {categories.map((category) => (
            <button
              key={category}
              className={`category-tab ${selectedCategory === category ? "active" : ""}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Error State */}
        {error && (
          <div className="gallery-error">
            <div className="error-icon">⚠️</div>
            <h3>Unable to Load Layouts</h3>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={() => refetch()}>
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!error && !loading && layouts.length === 0 && (
          <div className="gallery-empty">
            <div className="empty-icon">
              <LayoutIcon />
            </div>
            <h3>No Layouts Available</h3>
            <p>There are no layouts available at the moment. Please check back later.</p>
          </div>
        )}

        {/* Layout Grid */}
        {!error && layouts.length > 0 && (
          <div className="layout-grid">
            {layouts.map((layout) => {
              const isCreating = creating === layout.id;
              const isReady = layout.status === "ready" || layout.isAvailable;
              return (
                <LayoutCardUnified
                  key={layout.id}
                  layout={layout}
                  onPrimaryAction={handleSelectLayout}
                  primaryLabel={
                    isCreating ? "Creating..." : isReady ? "Select Layout" : "Coming Soon"
                  }
                  primaryDisabled={!isReady || isCreating}
                  primaryLoading={isCreating}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Preset Selection Modal */}
      {presetModalOpen && selectedLayout && (
        <div className="preset-modal-overlay" onClick={() => setPresetModalOpen(false)}>
          <div className="preset-modal" onClick={(e) => e.stopPropagation()}>
            <div className="preset-modal-header">
              <h2>Choose Your Invitation Flow</h2>
              <p>Select a preset to get started, or start from scratch</p>
              <button
                className="preset-modal-close"
                onClick={() => setPresetModalOpen(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="preset-grid">
              {selectedLayout.presets && selectedLayout.presets.length > 0 ? (
                selectedLayout.presets.map((preset) => (
                  <div
                    key={preset.id}
                    className="preset-card"
                    onClick={() => handlePresetSelection(preset)}
                  >
                    <div className="preset-emoji">{preset.emoji}</div>
                    <h3>{preset.name}</h3>
                    <p className="preset-description">{preset.description}</p>
                    <p className="preset-use-case">{preset.useCase}</p>
                    <div className="preset-best-for">
                      <strong>Best for:</strong> {preset.bestFor}
                    </div>
                    <div className="preset-sections">
                      <strong>{preset.sectionIds.length} sections</strong>
                    </div>
                  </div>
                ))
              ) : (
                <div className="preset-empty">
                  <p>No presets available for this layout.</p>
                </div>
              )}
            </div>

            <div className="preset-modal-actions">
              <button className="btn btn-secondary" onClick={() => handlePresetSelection(null)}>
                Start from Scratch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LayoutGallery;
