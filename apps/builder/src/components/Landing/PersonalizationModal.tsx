import { useState, useEffect, ReactElement, FormEvent, ChangeEvent, KeyboardEvent } from "react";
import "./PersonalizationModal.css";

const STORAGE_KEY = "landing-personalization-data";

// Default values for preview
const DEFAULT_BRIDE_NAME = "Priya";
const DEFAULT_GROOM_NAME = "Rahul";
const DEFAULT_DATE = "December 15, 2025";
const DEFAULT_VENUE = "The Grand Palace, Mumbai";

// Ornament SVG component
const OrnamentSVG = (): ReactElement => (
  <svg viewBox="0 0 60 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M30 20C30 20 20 10 10 10C5 10 0 15 0 20C0 25 5 30 10 30C20 30 30 20 30 20Z"
      fill="currentColor"
    />
    <path
      d="M30 20C30 20 40 10 50 10C55 10 60 15 60 20C60 25 55 30 50 30C40 30 30 20 30 20Z"
      fill="currentColor"
    />
    <circle cx="30" cy="20" r="4" fill="currentColor" />
  </svg>
);

interface PersonalizationData {
  brideName: string;
  groomName: string;
  weddingDate: string;
  venue: string;
}

// Format date to UPPERCASE format (e.g., "DECEMBER 15, 2025")
function formatDate(dateStr: string | undefined): string | null {
  if (!dateStr) return null;

  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;

    return date
      .toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
      .toUpperCase();
  } catch (error) {
    console.error("Date formatting error:", error);
    return null;
  }
}

interface PersonalizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (data: PersonalizationData) => void;
}

function PersonalizationModal({
  isOpen,
  onClose,
  onSave,
}: PersonalizationModalProps): ReactElement | null {
  const [brideName, setBrideName] = useState<string>("");
  const [groomName, setGroomName] = useState<string>("");
  const [weddingDate, setWeddingDate] = useState<string>("");
  const [venue, setVenue] = useState<string>("");

  const handleSkip = (): void => {
    onClose();
  };

  const handleSave = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    const data: PersonalizationData = {
      brideName: brideName.trim(),
      groomName: groomName.trim(),
      weddingDate: weddingDate.trim(),
      venue: venue.trim(),
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      if (onSave) {
        onSave(data);
      }
      onClose();
    } catch (error) {
      console.error("Failed to save personalization data:", error);
      // Still close the modal even if save fails
      onClose();
    }
  };

  // Load data when modal opens
  useEffect(() => {
    if (!isOpen) return;

    // Load existing data if any
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored) as PersonalizationData;
        // Use setTimeout to defer setState and avoid synchronous setState in effect
        setTimeout(() => {
          setBrideName(data.brideName || "");
          setGroomName(data.groomName || "");
          setWeddingDate(data.weddingDate || "");
          setVenue(data.venue || "");
        }, 0);
      } else {
        // Reset to empty if no stored data - use setTimeout to defer setState
        setTimeout(() => {
          setBrideName("");
          setGroomName("");
          setWeddingDate("");
          setVenue("");
        }, 0);
      }
    } catch (error) {
      console.error("Failed to load personalization data:", error);
    }

    // Handle ESC key to close modal
    const handleEscape = (e: KeyboardEvent): void => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape as EventListener);
    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape as EventListener);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  // Get display values with fallbacks for preview
  const displayBrideName = brideName.trim() || DEFAULT_BRIDE_NAME;
  const displayGroomName = groomName.trim() || DEFAULT_GROOM_NAME;
  const displayDate = weddingDate ? formatDate(weddingDate) || DEFAULT_DATE : DEFAULT_DATE;
  const displayVenue = venue.trim() || DEFAULT_VENUE;

  if (!isOpen) return null;

  return (
    <div
      className="personalization-modal-overlay"
      onClick={handleSkip}
      role="dialog"
      aria-modal="true"
      aria-labelledby="personalization-modal-title"
    >
      <div className="personalization-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="personalization-modal-header">
          <h3 id="personalization-modal-title">Personalize Your Preview</h3>
          <button
            className="personalization-modal-close"
            onClick={handleSkip}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <div className="personalization-modal-body">
          <div className="personalization-modal-layout">
            {/* Form Section */}
            <div className="personalization-form-section">
              <p className="personalization-explanation">
                We&apos;d love to personalize your preview! Share your details below to see them
                update in real-time.
              </p>

              <form onSubmit={handleSave}>
                <div className="form-group">
                  <label htmlFor="bride-name" className="form-label">
                    Bride&apos;s Name
                  </label>
                  <input
                    type="text"
                    id="bride-name"
                    className="form-input"
                    value={brideName}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setBrideName(e.target.value)}
                    placeholder="Enter bride's name"
                    autoComplete="name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="groom-name" className="form-label">
                    Groom&apos;s Name
                  </label>
                  <input
                    type="text"
                    id="groom-name"
                    className="form-input"
                    value={groomName}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setGroomName(e.target.value)}
                    placeholder="Enter groom's name"
                    autoComplete="name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="wedding-date" className="form-label">
                    Wedding Date
                  </label>
                  <input
                    type="date"
                    id="wedding-date"
                    className="form-input"
                    value={weddingDate}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setWeddingDate(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="venue" className="form-label">
                    Venue / Place
                  </label>
                  <input
                    type="text"
                    id="venue"
                    className="form-input"
                    value={venue}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setVenue(e.target.value)}
                    placeholder="Enter wedding venue or place"
                  />
                </div>

                <div className="personalization-modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={handleSkip}>
                    Skip
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save & Preview
                  </button>
                </div>
              </form>
            </div>

            {/* Live Preview Section */}
            <div className="personalization-preview-section">
              <div className="preview-label">Live Preview</div>
              <div className="modal-preview-card">
                <div className="modal-preview-inner">
                  <div className="modal-preview-ornament">
                    <OrnamentSVG />
                  </div>
                  <div className="modal-preview-names">{displayBrideName}</div>
                  <div className="modal-preview-and">&</div>
                  <div className="modal-preview-names">{displayGroomName}</div>
                  <div className="modal-preview-date">{displayDate}</div>
                  <div className="modal-preview-venue">{displayVenue}</div>
                  <div className="modal-preview-ornament" style={{ transform: "rotate(180deg)" }}>
                    <OrnamentSVG />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PersonalizationModal;
