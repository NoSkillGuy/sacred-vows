import { useEffect, useMemo, useState, ReactElement, KeyboardEvent } from "react";
import { Link } from "react-router-dom";
import ThemeModal from "../Toolbar/ThemeModal";
import GalleryModal from "../Toolbar/GalleryModal";
import LayoutSwitcher from "../Toolbar/LayoutSwitcher";
import PublishModal from "../Export/ExportModal";
import SectionManager from "../SectionManager/SectionManager";
import { useBuilderStore } from "../../store/builderStore";
import SidebarSection from "./SidebarSection";
import "./BuilderSidebar.css";

const STORAGE_KEY = "builder.sidebarCollapsed";

type DeviceMode = "desktop" | "tablet" | "mobile";

// Icons (copied from Toolbar for now; keeps the refactor low-risk)
const RingsIcon = (): ReactElement => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="12" stroke="currentColor" strokeWidth="2.5" fill="none" />
    <circle cx="20" cy="8" r="3" fill="currentColor" />
    <path d="M17 8L20 3L23 8" stroke="currentColor" strokeWidth="1.5" fill="none" />
  </svg>
);

const EditIcon = (): ReactElement => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M16.5 3.5L20.5 7.5L7 21H3V17L16.5 3.5Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M14 6L18 10" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const EyeIcon = (): ReactElement => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const DesktopIcon = (): ReactElement => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M8 21H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M12 17V21" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const TabletIcon = (): ReactElement => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="2" width="16" height="20" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="12" cy="18" r="1" fill="currentColor" />
  </svg>
);

const MobileIcon = (): ReactElement => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="6" y="2" width="12" height="20" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M10 5H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="12" cy="18" r="1" fill="currentColor" />
  </svg>
);

const PaletteIcon = (): ReactElement => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22C12.8 22 13.5 21.3 13.5 20.5C13.5 20.1 13.3 19.8 13.1 19.5C12.9 19.2 12.7 18.9 12.7 18.5C12.7 17.7 13.4 17 14.2 17H16C19.3 17 22 14.3 22 11C22 6 17.5 2 12 2Z"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <circle cx="7.5" cy="11.5" r="1.5" fill="currentColor" />
    <circle cx="10.5" cy="7.5" r="1.5" fill="currentColor" />
    <circle cx="14.5" cy="7.5" r="1.5" fill="currentColor" />
    <circle cx="17.5" cy="11.5" r="1.5" fill="currentColor" />
  </svg>
);

const GalleryIcon = (): ReactElement => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="8.5" cy="8.5" r="2" stroke="currentColor" strokeWidth="1.5" />
    <path
      d="M3 16L8 11L12 15L16 11L21 16"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SectionsIcon = (): ReactElement => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="18" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
    <rect x="3" y="10" width="18" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
    <rect x="3" y="16" width="18" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const LayoutIcon = (): ReactElement => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const RocketIcon = (): ReactElement => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M4.5 16.5C3 18 3 21 3 21C3 21 6 21 7.5 19.5C8.32 18.68 8.32 17.32 7.5 16.5C6.68 15.68 5.32 15.68 4.5 16.5Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M14.5 4.5L19.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path
      d="M16 2L22 8L14 16C12 18 9 18 9 18C9 18 9 15 11 13L16 8V2Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M9 15L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const BackIcon = (): ReactElement => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

interface CollapseIconProps {
  collapsed: boolean;
}

const CollapseIcon = ({ collapsed }: CollapseIconProps): ReactElement => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {collapsed ? <polyline points="9 18 15 12 9 6" /> : <polyline points="15 18 9 12 15 6" />}
  </svg>
);

type AutosaveStatusType = "idle" | "saving" | "saved";

function AutosaveStatus(): ReactElement {
  const saving = useBuilderStore((state) => state.saving);
  const lastSavedAt = useBuilderStore((state) => state.lastSavedAt);
  const [showSaved, setShowSaved] = useState(false);

  // Derive status from props
  const status = useMemo<AutosaveStatusType>(() => {
    if (saving) return "saving";
    if (lastSavedAt && showSaved) return "saved";
    return "idle";
  }, [saving, lastSavedAt, showSaved]);

  // Show "saved" status for 2 seconds when lastSavedAt changes
  useEffect(() => {
    if (lastSavedAt && !saving) {
      setShowSaved(true);
      const timer = setTimeout(() => setShowSaved(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [lastSavedAt, saving]);

  const label = status === "saving" ? "Saving…" : status === "saved" ? "Saved" : "Auto-save";

  return (
    <div className={`autosave-status autosave-${status}`} title={label} aria-live="polite">
      <span className="autosave-dot" />
      <span className="autosave-text">{label}</span>
    </div>
  );
}

interface Section {
  key: string;
  title: string;
  icon: ReactElement;
}

interface BuilderSidebarProps {
  editMode: boolean;
  onEditModeToggle: () => void;
  deviceMode: DeviceMode;
  onDeviceModeChange: (mode: DeviceMode) => void;
}

// DrawerControls component - moved outside render to avoid recreation
interface DrawerControlsProps {
  onClose: () => void;
}

const DrawerControls = ({ onClose }: DrawerControlsProps): ReactElement => (
  <div className="sidebar-drawer-controls">
    <button
      type="button"
      className="sidebar-icon-btn"
      onClick={onClose}
      title="Close sidebar"
      aria-label="Close sidebar"
    >
      <BackIcon />
    </button>
    <div className="sidebar-brand" title="Sacred Vows">
      <span className="brand-icon" aria-hidden="true">
        <RingsIcon />
      </span>
      <span className="brand-text">Sacred Vows</span>
    </div>
    <div className="sidebar-spacer" />
  </div>
);

export default function BuilderSidebar({
  editMode,
  onEditModeToggle,
  deviceMode,
  onDeviceModeChange,
}: BuilderSidebarProps): ReactElement {
  const [showThemeModal, setShowThemeModal] = useState<boolean>(false);
  const [showGalleryModal, setShowGalleryModal] = useState<boolean>(false);
  const [showPublishModal, setShowPublishModal] = useState<boolean>(false);
  const [showSectionManager, setShowSectionManager] = useState<boolean>(false);
  const [showLayoutSwitcher, setShowLayoutSwitcher] = useState<boolean>(false);

  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw === "true";
    } catch {
      return false;
    }
  });
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [openKey, setOpenKey] = useState<string>("configure");

  useEffect(() => {
    const mq = window.matchMedia?.("(max-width: 768px)");
    if (!mq) return;
    const apply = () => setIsMobile(Boolean(mq.matches));
    apply();
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, []);

  // Close drawer when exiting mobile mode
  useEffect(() => {
    if (!isMobile && drawerOpen) {
      setDrawerOpen(false);
    }
  }, [isMobile, drawerOpen]);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKeyDown as EventListener);
    return () => window.removeEventListener("keydown", onKeyDown as EventListener);
  }, [drawerOpen]);

  useEffect(() => {
    // Prevent background scroll while drawer is open on mobile.
    if (!isMobile) return;
    if (!drawerOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [drawerOpen, isMobile]);

  // Collapsed state is initialized from localStorage in useState initializer above

  useEffect(() => {
    try {
      // Don't persist the forced mobile collapse; only persist the user's desktop preference.
      if (!isMobile) localStorage.setItem(STORAGE_KEY, collapsed ? "true" : "false");
    } catch {
      // ignore
    }
  }, [collapsed, isMobile]);

  const sections = useMemo<Section[]>(
    () => [
      {
        key: "mode",
        title: "Mode",
        icon: (
          <span className="icon-wrap">
            <EditIcon />
          </span>
        ),
      },
      {
        key: "device",
        title: "Device",
        icon: (
          <span className="icon-wrap">
            <DesktopIcon />
          </span>
        ),
      },
      {
        key: "configure",
        title: "Configure",
        icon: (
          <span className="icon-wrap">
            <LayoutIcon />
          </span>
        ),
      },
      {
        key: "publish",
        title: "Publish",
        icon: (
          <span className="icon-wrap">
            <RocketIcon />
          </span>
        ),
      },
    ],
    []
  );

  const toggleSection = (key: string): void => {
    setOpenKey((prev) => (prev === key ? "" : key));
  };

  const effectiveCollapsed = collapsed || isMobile;

  return (
    <>
      <aside
        className={`builder-sidebar ${effectiveCollapsed ? "is-collapsed" : ""}`}
        aria-label="Builder sidebar"
      >
        <div className="sidebar-top">
          <Link
            to="/dashboard"
            className="sidebar-icon-btn"
            title="Back to Dashboard"
            aria-label="Back to Dashboard"
          >
            <BackIcon />
          </Link>

          {!effectiveCollapsed && (
            <div className="sidebar-brand" title="Sacred Vows">
              <span className="brand-icon" aria-hidden="true">
                <RingsIcon />
              </span>
              <span className="brand-text">Sacred Vows</span>
            </div>
          )}

          {!effectiveCollapsed && <div className="sidebar-spacer" />}

          <button
            type="button"
            className="sidebar-icon-btn"
            onClick={() => {
              if (isMobile) {
                setDrawerOpen(true);
                return;
              }
              setCollapsed((v) => !v);
            }}
            title={
              isMobile ? "Open sidebar" : effectiveCollapsed ? "Expand sidebar" : "Collapse sidebar"
            }
            aria-label={
              isMobile ? "Open sidebar" : effectiveCollapsed ? "Expand sidebar" : "Collapse sidebar"
            }
          >
            <CollapseIcon collapsed={effectiveCollapsed} />
          </button>
        </div>

        <div className="sidebar-status">
          <AutosaveStatus />
        </div>

        <nav className="sidebar-nav" aria-label="Builder controls">
          {sections.map((s) => (
            <SidebarSection
              key={s.key}
              title={s.title}
              icon={s.icon}
              isOpen={!effectiveCollapsed && openKey === s.key}
              onToggle={() => toggleSection(s.key)}
              collapsed={effectiveCollapsed}
            >
              {s.key === "mode" && (
                <div className="sidebar-actions">
                  <button
                    type="button"
                    className={`sidebar-btn ${editMode ? "active" : ""}`}
                    onClick={onEditModeToggle}
                    title={editMode ? "Switch to Preview Mode" : "Switch to Edit Mode"}
                  >
                    <span className="btn-icon" aria-hidden="true">
                      {editMode ? <EditIcon /> : <EyeIcon />}
                    </span>
                    <span className="btn-label">{editMode ? "Editing" : "Preview"}</span>
                  </button>
                </div>
              )}

              {s.key === "device" && (
                <div className="sidebar-actions">
                  <div className="sidebar-segmented" role="group" aria-label="Device preview">
                    <button
                      type="button"
                      className={`seg-btn ${deviceMode === "desktop" ? "active" : ""}`}
                      onClick={() => onDeviceModeChange("desktop")}
                      title="Desktop Preview"
                      aria-label="Desktop Preview"
                    >
                      <DesktopIcon />
                    </button>
                    <button
                      type="button"
                      className={`seg-btn ${deviceMode === "tablet" ? "active" : ""}`}
                      onClick={() => onDeviceModeChange("tablet")}
                      title="Tablet Preview"
                      aria-label="Tablet Preview"
                    >
                      <TabletIcon />
                    </button>
                    <button
                      type="button"
                      className={`seg-btn ${deviceMode === "mobile" ? "active" : ""}`}
                      onClick={() => onDeviceModeChange("mobile")}
                      title="Mobile Preview"
                      aria-label="Mobile Preview"
                    >
                      <MobileIcon />
                    </button>
                  </div>
                </div>
              )}

              {s.key === "configure" && (
                <div className="sidebar-actions">
                  <button
                    type="button"
                    className="sidebar-btn"
                    onClick={() => setShowLayoutSwitcher(true)}
                  >
                    <span className="btn-icon" aria-hidden="true">
                      <LayoutIcon />
                    </span>
                    <span className="btn-label">Layout</span>
                  </button>
                  <button
                    type="button"
                    className="sidebar-btn"
                    onClick={() => setShowSectionManager(true)}
                  >
                    <span className="btn-icon" aria-hidden="true">
                      <SectionsIcon />
                    </span>
                    <span className="btn-label">Sections</span>
                  </button>
                  <button
                    type="button"
                    className="sidebar-btn"
                    onClick={() => setShowThemeModal(true)}
                  >
                    <span className="btn-icon" aria-hidden="true">
                      <PaletteIcon />
                    </span>
                    <span className="btn-label">Theme</span>
                  </button>
                  <button
                    type="button"
                    className="sidebar-btn"
                    onClick={() => setShowGalleryModal(true)}
                  >
                    <span className="btn-icon" aria-hidden="true">
                      <GalleryIcon />
                    </span>
                    <span className="btn-label">Gallery</span>
                  </button>
                </div>
              )}

              {s.key === "publish" && (
                <div className="sidebar-actions">
                  <button
                    type="button"
                    className="sidebar-btn primary"
                    onClick={() => setShowPublishModal(true)}
                  >
                    <span className="btn-icon" aria-hidden="true">
                      <RocketIcon />
                    </span>
                    <span className="btn-label">Publish</span>
                  </button>
                </div>
              )}
            </SidebarSection>
          ))}

          {effectiveCollapsed && (
            <div className="sidebar-rail">
              <button
                type="button"
                className={`rail-btn ${editMode ? "active" : ""}`}
                onClick={onEditModeToggle}
                title={editMode ? "Editing (toggle)" : "Preview (toggle)"}
                aria-label={editMode ? "Editing (toggle)" : "Preview (toggle)"}
              >
                {editMode ? <EditIcon /> : <EyeIcon />}
              </button>

              <div className="rail-group" aria-label="Device preview">
                <button
                  type="button"
                  className={`rail-btn ${deviceMode === "desktop" ? "active" : ""}`}
                  onClick={() => onDeviceModeChange("desktop")}
                  title="Desktop"
                  aria-label="Desktop"
                >
                  <DesktopIcon />
                </button>
                <button
                  type="button"
                  className={`rail-btn ${deviceMode === "tablet" ? "active" : ""}`}
                  onClick={() => onDeviceModeChange("tablet")}
                  title="Tablet"
                  aria-label="Tablet"
                >
                  <TabletIcon />
                </button>
                <button
                  type="button"
                  className={`rail-btn ${deviceMode === "mobile" ? "active" : ""}`}
                  onClick={() => onDeviceModeChange("mobile")}
                  title="Mobile"
                  aria-label="Mobile"
                >
                  <MobileIcon />
                </button>
              </div>

              <button
                type="button"
                className="rail-btn"
                onClick={() => setShowLayoutSwitcher(true)}
                title="Layout"
                aria-label="Layout"
              >
                <LayoutIcon />
              </button>
              <button
                type="button"
                className="rail-btn"
                onClick={() => setShowSectionManager(true)}
                title="Sections"
                aria-label="Sections"
              >
                <SectionsIcon />
              </button>
              <button
                type="button"
                className="rail-btn"
                onClick={() => setShowThemeModal(true)}
                title="Theme"
                aria-label="Theme"
              >
                <PaletteIcon />
              </button>
              <button
                type="button"
                className="rail-btn"
                onClick={() => setShowGalleryModal(true)}
                title="Gallery"
                aria-label="Gallery"
              >
                <GalleryIcon />
              </button>
              <button
                type="button"
                className="rail-btn rail-primary"
                onClick={() => setShowPublishModal(true)}
                title="Publish"
                aria-label="Publish"
              >
                <RocketIcon />
              </button>
            </div>
          )}
        </nav>
      </aside>

      {isMobile && drawerOpen && (
        <>
          <button
            type="button"
            className="sidebar-drawer-backdrop"
            aria-label="Close sidebar"
            onClick={() => setDrawerOpen(false)}
          />
          <aside className="sidebar-drawer" aria-label="Builder sidebar drawer">
            <DrawerControls onClose={() => setDrawerOpen(false)} />
            <div className="sidebar-status">
              <AutosaveStatus />
            </div>
            <nav className="sidebar-nav" aria-label="Builder controls">
              {sections.map((s) => (
                <SidebarSection
                  key={s.key}
                  title={s.title}
                  icon={s.icon}
                  isOpen={openKey === s.key}
                  onToggle={() => toggleSection(s.key)}
                  collapsed={false}
                >
                  {s.key === "mode" && (
                    <div className="sidebar-actions">
                      <button
                        type="button"
                        className={`sidebar-btn ${editMode ? "active" : ""}`}
                        onClick={() => {
                          onEditModeToggle();
                        }}
                        title={editMode ? "Switch to Preview Mode" : "Switch to Edit Mode"}
                      >
                        <span className="btn-icon" aria-hidden="true">
                          {editMode ? <EditIcon /> : <EyeIcon />}
                        </span>
                        <span className="btn-label">{editMode ? "Editing" : "Preview"}</span>
                      </button>
                    </div>
                  )}

                  {s.key === "device" && (
                    <div className="sidebar-actions">
                      <div className="sidebar-segmented" role="group" aria-label="Device preview">
                        <button
                          type="button"
                          className={`seg-btn ${deviceMode === "desktop" ? "active" : ""}`}
                          onClick={() => onDeviceModeChange("desktop")}
                          title="Desktop Preview"
                          aria-label="Desktop Preview"
                        >
                          <DesktopIcon />
                        </button>
                        <button
                          type="button"
                          className={`seg-btn ${deviceMode === "tablet" ? "active" : ""}`}
                          onClick={() => onDeviceModeChange("tablet")}
                          title="Tablet Preview"
                          aria-label="Tablet Preview"
                        >
                          <TabletIcon />
                        </button>
                        <button
                          type="button"
                          className={`seg-btn ${deviceMode === "mobile" ? "active" : ""}`}
                          onClick={() => onDeviceModeChange("mobile")}
                          title="Mobile Preview"
                          aria-label="Mobile Preview"
                        >
                          <MobileIcon />
                        </button>
                      </div>
                    </div>
                  )}

                  {s.key === "configure" && (
                    <div className="sidebar-actions">
                      <button
                        type="button"
                        className="sidebar-btn"
                        onClick={() => {
                          setShowLayoutSwitcher(true);
                          setDrawerOpen(false);
                        }}
                      >
                        <span className="btn-icon" aria-hidden="true">
                          <LayoutIcon />
                        </span>
                        <span className="btn-label">Layout</span>
                      </button>
                      <button
                        type="button"
                        className="sidebar-btn"
                        onClick={() => {
                          setShowSectionManager(true);
                          setDrawerOpen(false);
                        }}
                      >
                        <span className="btn-icon" aria-hidden="true">
                          <SectionsIcon />
                        </span>
                        <span className="btn-label">Sections</span>
                      </button>
                      <button
                        type="button"
                        className="sidebar-btn"
                        onClick={() => {
                          setShowThemeModal(true);
                          setDrawerOpen(false);
                        }}
                      >
                        <span className="btn-icon" aria-hidden="true">
                          <PaletteIcon />
                        </span>
                        <span className="btn-label">Theme</span>
                      </button>
                      <button
                        type="button"
                        className="sidebar-btn"
                        onClick={() => {
                          setShowGalleryModal(true);
                          setDrawerOpen(false);
                        }}
                      >
                        <span className="btn-icon" aria-hidden="true">
                          <GalleryIcon />
                        </span>
                        <span className="btn-label">Gallery</span>
                      </button>
                    </div>
                  )}

                  {s.key === "publish" && (
                    <div className="sidebar-actions">
                      <button
                        type="button"
                        className="sidebar-btn primary"
                        onClick={() => {
                          setShowPublishModal(true);
                          setDrawerOpen(false);
                        }}
                      >
                        <span className="btn-icon" aria-hidden="true">
                          <RocketIcon />
                        </span>
                        <span className="btn-label">Publish</span>
                      </button>
                    </div>
                  )}
                </SidebarSection>
              ))}
            </nav>
          </aside>
        </>
      )}

      <LayoutSwitcher isOpen={showLayoutSwitcher} onClose={() => setShowLayoutSwitcher(false)} />
      <SectionManager isOpen={showSectionManager} onClose={() => setShowSectionManager(false)} />
      <ThemeModal isOpen={showThemeModal} onClose={() => setShowThemeModal(false)} />
      <GalleryModal isOpen={showGalleryModal} onClose={() => setShowGalleryModal(false)} />
      <PublishModal isOpen={showPublishModal} onClose={() => setShowPublishModal(false)} />
    </>
  );
}
