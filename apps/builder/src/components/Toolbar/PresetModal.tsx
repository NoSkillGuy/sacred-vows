import { useState, useEffect, useRef } from "react";
import { useBuilderStore } from "../../store/builderStore";
import { presetToSectionConfigs } from "../../config/layout-presets";
import { useToast } from "../Toast/ToastProvider";
import type { LayoutPreset } from "@shared/types/layout";
import "./PresetModal.css";

interface PresetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function PresetModal({ isOpen, onClose }: PresetModalProps) {
  const { currentLayoutManifest, currentInvitation, setCurrentInvitation } = useBuilderStore();
  const { addToast } = useToast();
  const modalRef = useRef<HTMLDivElement>(null);
  const [flippedPresetId, setFlippedPresetId] = useState<string | null>(null);

  // Get presets from layout manifest
  const presets: LayoutPreset[] = currentLayoutManifest?.presets || [];

  // Get section names from manifest
  const getSectionName = (sectionId: string): string => {
    if (!currentLayoutManifest?.sections) {
      return sectionId;
    }
    const section = currentLayoutManifest.sections.find((s) => s.id === sectionId);
    return section?.name || sectionId;
  };

  // Handle card flip
  const handleCardClick = (presetId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFlippedPresetId(flippedPresetId === presetId ? null : presetId);
  };

  // Handle preset selection
  const handlePresetSelection = async (preset: LayoutPreset | null) => {
    if (!currentLayoutManifest?.sections) {
      addToast({
        tone: "error",
        title: "Preset Application Failed",
        description: "No sections available in layout manifest. Please try again.",
        icon: "bell",
      });
      return;
    }

    try {
      // Convert preset to section configs
      const presetSections = presetToSectionConfigs(preset, currentLayoutManifest.sections);

      // Update invitation with new section configuration
      const updatedInvitation = {
        ...currentInvitation,
        layoutConfig: {
          ...currentInvitation.layoutConfig,
          sections: presetSections,
        },
      };

      await setCurrentInvitation(updatedInvitation);
      onClose();
    } catch (error) {
      console.error("Failed to apply preset:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to apply preset. Please try again.";
      addToast({
        tone: "error",
        title: "Preset Application Failed",
        description: errorMessage,
        icon: "bell",
      });
    }
  };

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent): void => {
      if (e.key === "Escape") {
        if (flippedPresetId) {
          setFlippedPresetId(null);
        } else {
          onClose();
        }
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose, flippedPresetId]);

  // Focus trap
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const modal = modalRef.current;
    const focusableElements = modal.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    firstElement.focus();

    const handleTab = (e: KeyboardEvent): void => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener("keydown", handleTab);
    return () => document.removeEventListener("keydown", handleTab);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="preset-modal-overlay"
      onClick={() => {
        setFlippedPresetId(null);
        onClose();
      }}
    >
      <div
        className="preset-modal"
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="preset-modal-title"
        aria-describedby="preset-modal-description"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="preset-modal-header">
          <h2 id="preset-modal-title">Layout Presets</h2>
          <p id="preset-modal-description">
            Apply a preset to quickly configure your invitation sections. You can customize them
            later.
          </p>
          <button
            className="preset-modal-close"
            onClick={() => {
              setFlippedPresetId(null);
              onClose();
            }}
            aria-label="Close"
            type="button"
          >
            ×
          </button>
        </div>

        <div className="preset-modal-content">
          {presets.length > 0 ? (
            <div className="preset-grid">
              {presets.map((preset) => {
                const isFlipped = flippedPresetId === preset.id;
                return (
                  <div
                    key={preset.id}
                    className={`preset-card-wrapper ${isFlipped ? "flipped" : ""}`}
                    tabIndex={0}
                    role="button"
                    aria-label={`${preset.name} preset card. Press Enter or Space to flip.`}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleCardClick(preset.id, e as unknown as React.MouseEvent);
                      }
                    }}
                  >
                    <div className="preset-card-inner">
                      {/* Front of card */}
                      <div className="preset-card-front">
                        <h3>{preset.name}</h3>
                        <p className="preset-description">{preset.description}</p>
                        <p className="preset-use-case">{preset.useCase}</p>
                        <div className="preset-best-for">
                          <div className="preset-best-for-text">
                            <strong>Best for:</strong> {preset.bestFor}
                          </div>
                        </div>
                        <div className="preset-sections">
                          <strong>{preset.sectionIds.length} sections</strong>
                        </div>
                        <button
                          type="button"
                          className="preset-flip-btn"
                          onClick={(e) => handleCardClick(preset.id, e)}
                          aria-label="View sections"
                        >
                          View Sections →
                        </button>
                      </div>

                      {/* Back of card */}
                      <div className="preset-card-back">
                        <h3>{preset.name}</h3>
                        <div className="preset-sections-list">
                          <strong>Sections included:</strong>
                          <ul className="preset-sections-list-items">
                            {preset.sectionIds.map((sectionId) => (
                              <li key={sectionId}>{getSectionName(sectionId)}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="preset-card-back-actions">
                          <button
                            type="button"
                            className="preset-flip-btn"
                            onClick={(e) => handleCardClick(preset.id, e)}
                            aria-label="Back"
                          >
                            ← Back
                          </button>
                          <button
                            type="button"
                            className="preset-apply-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePresetSelection(preset);
                            }}
                          >
                            Apply Preset
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="preset-empty">
              <p>No presets are available for this layout.</p>
              <p style={{ fontSize: "0.875rem", marginTop: "0.5rem", color: "var(--text-muted)" }}>
                You can still customize sections manually using the Section Manager.
              </p>
            </div>
          )}
        </div>

        {presets.length > 0 && (
          <div className="preset-modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => handlePresetSelection(null)}
            >
              Reset to Default
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default PresetModal;
