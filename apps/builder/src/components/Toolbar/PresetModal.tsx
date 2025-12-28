import { useState, useEffect, useRef } from "react";
import { useBuilderStore } from "../../store/builderStore";
import { presetToSectionConfigs } from "../../config/layout-presets";
import type { LayoutPreset } from "@shared/types/layout";
import "./PresetModal.css";

interface PresetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function PresetModal({ isOpen, onClose }: PresetModalProps) {
  const { currentLayoutManifest, currentInvitation, setCurrentInvitation } = useBuilderStore();
  const modalRef = useRef<HTMLDivElement>(null);
  const [flippedPresetId, setFlippedPresetId] = useState<string | null>(null);

  // Get presets from layout manifest
  const presets: LayoutPreset[] = currentLayoutManifest?.presets || [];

  // Get section names from manifest
  const getSectionName = (sectionId: string): string => {
    const section = currentLayoutManifest?.sections?.find((s) => s.id === sectionId);
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
      console.warn("No sections available in layout manifest");
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
    }
  };

  // Reset flipped state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFlippedPresetId(null);
    }
  }, [isOpen]);

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
    <div className="preset-modal-overlay" onClick={onClose}>
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
          <button className="preset-modal-close" onClick={onClose} aria-label="Close" type="button">
            ×
          </button>
        </div>

        <div className="preset-modal-content">
          {presets.length > 0 ? (
            <>
              <div className="preset-grid">
                {presets.map((preset) => {
                  const isFlipped = flippedPresetId === preset.id;
                  return (
                    <div
                      key={preset.id}
                      className={`preset-card-wrapper ${isFlipped ? "flipped" : ""}`}
                    >
                      <div className="preset-card-inner">
                        {/* Front of card */}
                        <div className="preset-card-front">
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

              <div className="preset-modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => handlePresetSelection(null)}
                >
                  Reset to Default
                </button>
              </div>
            </>
          ) : (
            <div className="preset-empty">
              <p>No presets available for this layout.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PresetModal;
