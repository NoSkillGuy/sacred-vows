import { useState, useEffect } from "react";
import { useBuilderStore } from "../../store/builderStore";
import { getLayouts, getLayoutManifest } from "../../services/layoutService";
import LayoutCardUnified from "../Layouts/LayoutCardUnified";
import "./LayoutSwitcher.css";

// SVG Icons
const CloseIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    width="20"
    height="20"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const WarningIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    width="20"
    height="20"
  >
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

function LayoutSwitcher({ isOpen, onClose }) {
  const { currentInvitation, switchLayout } = useBuilderStore();

  const [layouts, setLayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedLayout, setSelectedLayout] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadLayouts();
    }
  }, [isOpen]);

  async function loadLayouts() {
    try {
      setLoading(true);
      const data = await getLayouts();
      setLayouts(data.layouts || []);
    } catch (error) {
      console.error("Failed to load layouts:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleLayoutClick = (layout) => {
    if (!layout.isAvailable) return;
    if (layout.id === currentInvitation.layoutId) return;

    setSelectedLayout(layout);
    setShowConfirmation(true);
  };

  const handleConfirmSwitch = async () => {
    if (!selectedLayout) return;

    try {
      setSwitching(true);

      // Load the new layout's manifest
      const manifest = await getLayoutManifest(selectedLayout.id);

      // Switch layout (preserves content data)
      await switchLayout(selectedLayout.id, manifest);

      setShowConfirmation(false);
      setSelectedLayout(null);
      onClose();
    } catch (error) {
      console.error("Failed to switch layout:", error);
      alert("Failed to switch layout. Please try again.");
    } finally {
      setSwitching(false);
    }
  };

  const handleCancelSwitch = () => {
    setShowConfirmation(false);
    setSelectedLayout(null);
  };

  if (!isOpen) return null;

  return (
    <div className="layout-switcher-overlay" onClick={onClose}>
      <div className="layout-switcher-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="layout-switcher-header">
          <div>
            <h3>Change Layout</h3>
            <p>Your content will be preserved when switching layouts</p>
          </div>
          <button className="layout-switcher-close" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        {/* Layout Grid */}
        <div className="layout-switcher-body">
          {loading ? (
            <div className="layout-switcher-loading">
              <div className="loading-spinner"></div>
              <p>Loading layouts...</p>
            </div>
          ) : (
            <div className="layout-switcher-grid">
              {layouts.map((layout) => {
                const isActive = layout.id === currentInvitation.layoutId;
                const isReady = layout.status === "ready" || layout.isAvailable;
                return (
                  <LayoutCardUnified
                    key={layout.id}
                    layout={layout}
                    active={isActive}
                    showActiveBadge
                    onCardClick={() => handleLayoutClick(layout)}
                    onPrimaryAction={handleLayoutClick}
                    primaryLabel={
                      isActive ? "Current Layout" : isReady ? "Switch Layout" : "Coming Soon"
                    }
                    primaryDisabled={!isReady}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Confirmation Dialog */}
        {showConfirmation && selectedLayout && (
          <div className="layout-switch-confirm">
            <div className="confirm-content">
              <div className="confirm-icon">
                <WarningIcon />
              </div>
              <h4>Switch to {selectedLayout.name}?</h4>
              <p>
                Your content (names, dates, photos, etc.) will be preserved. However, the section
                order and theme will reset to the new layout's defaults.
              </p>
              <div className="confirm-actions">
                <button
                  className="btn btn-secondary"
                  onClick={handleCancelSwitch}
                  disabled={switching}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleConfirmSwitch}
                  disabled={switching}
                >
                  {switching ? (
                    <>
                      <span className="loading-spinner small"></span>
                      Switching...
                    </>
                  ) : (
                    "Switch Layout"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LayoutSwitcher;
