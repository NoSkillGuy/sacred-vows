import { useState, useEffect } from "react";
import { useBuilderStore } from "../../store/builderStore";
import "./ThemeModal.css";

// All available font options
const fontOptions = [
  { value: "Playfair Display", label: "Playfair Display", style: "serif" },
  { value: "Cormorant Garamond", label: "Cormorant Garamond", style: "serif" },
  { value: "Libre Baskerville", label: "Libre Baskerville", style: "serif" },
  { value: "Crimson Text", label: "Crimson Text", style: "serif" },
  { value: "EB Garamond", label: "EB Garamond", style: "serif" },
  { value: "Poppins", label: "Poppins", style: "sans-serif" },
  { value: "Inter", label: "Inter", style: "sans-serif" },
  { value: "Lato", label: "Lato", style: "sans-serif" },
  { value: "Montserrat", label: "Montserrat", style: "sans-serif" },
  { value: "Quicksand", label: "Quicksand", style: "sans-serif" },
  { value: "Great Vibes", label: "Great Vibes", style: "script" },
  { value: "Dancing Script", label: "Dancing Script", style: "script" },
  { value: "Tangerine", label: "Tangerine", style: "script" },
  { value: "Alex Brush", label: "Alex Brush", style: "script" },
  { value: "Parisienne", label: "Parisienne", style: "script" },
];

function ThemeModal({ isOpen, onClose }) {
  const {
    currentInvitation,
    currentLayoutManifest,
    applyThemePreset,
    updateThemeColors,
    updateThemeFonts,
    getTheme,
  } = useBuilderStore();

  // Get current theme
  const theme = getTheme();
  const colors = theme.colors || {};
  const fonts = theme.fonts || {};
  const currentPreset = theme.preset || "custom";

  // Get theme presets from manifest; if manifest has none, fall back to layout config
  const themePresets =
    (currentLayoutManifest?.themes?.length
      ? currentLayoutManifest.themes
      : currentInvitation?.layoutConfig?.themes) || [];

  const [formData, setFormData] = useState({
    primaryColor: colors.primary || "#000000",
    secondaryColor: colors.secondary || "#000000",
    backgroundColor: colors.background || "#ffffff",
    textColor: colors.text || "#000000",
    headingFont: fonts.heading || "",
    bodyFont: fonts.body || "",
    scriptFont: fonts.script || "",
  });

  // Update local state when store changes
  useEffect(() => {
    const currentTheme = getTheme();
    const themeColors = currentTheme.colors || {};
    const themeFonts = currentTheme.fonts || {};

    setFormData({
      primaryColor: themeColors.primary || "#000000",
      secondaryColor: themeColors.secondary || "#000000",
      backgroundColor: themeColors.background || "#ffffff",
      textColor: themeColors.text || "#000000",
      headingFont: themeFonts.heading || "",
      bodyFont: themeFonts.body || "",
      scriptFont: themeFonts.script || "",
    });
  }, [currentInvitation.layoutConfig?.theme]);

  const handleColorChange = (field, value) => {
    const colorMap = {
      primaryColor: "primary",
      secondaryColor: "secondary",
      backgroundColor: "background",
      textColor: "text",
    };

    setFormData((prev) => ({ ...prev, [field]: value }));
    updateThemeColors({ [colorMap[field]]: value });
  };

  const handleFontChange = (field, value) => {
    const fontMap = {
      headingFont: "heading",
      bodyFont: "body",
      scriptFont: "script",
    };

    setFormData((prev) => ({ ...prev, [field]: value }));
    updateThemeFonts({ [fontMap[field]]: value });
  };

  const handleApplyPreset = (preset) => {
    applyThemePreset(preset.id);

    // Update local form data
    setFormData({
      primaryColor: preset.colors.primary,
      secondaryColor: preset.colors.secondary,
      backgroundColor: preset.colors.background,
      textColor: preset.colors.text,
      headingFont: preset.fonts.heading,
      bodyFont: preset.fonts.body,
      scriptFont: preset.fonts.script,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="theme-modal-overlay" onClick={onClose}>
      <div className="theme-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="theme-modal-header">
          <h3>🎨 Theme Settings</h3>
          <button className="theme-modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="theme-modal-body">
          {/* Layout Theme Presets */}
          <div className="theme-section">
            <h4 className="theme-section-title">
              Theme Presets
              {currentLayoutManifest && (
                <span className="theme-section-subtitle">for {currentLayoutManifest.name}</span>
              )}
            </h4>
            {themePresets.length === 0 ? (
              <p className="muted">No theme presets defined for this layout.</p>
            ) : (
              <div className="theme-presets-grid">
                {themePresets.map((preset) => (
                  <button
                    key={preset.id}
                    className={`theme-preset-card ${currentPreset === preset.id ? "active" : ""}`}
                    onClick={() => handleApplyPreset(preset)}
                  >
                    <div className="preset-color-preview">
                      <div
                        className="preset-color-bg"
                        style={{ background: preset.colors.background }}
                      >
                        <span
                          className="preset-color-primary"
                          style={{ background: preset.colors.primary }}
                        />
                        <span
                          className="preset-color-secondary"
                          style={{ background: preset.colors.secondary }}
                        />
                      </div>
                    </div>
                    <div className="preset-info">
                      <span className="preset-name">{preset.name}</span>
                      {preset.isDefault && <span className="preset-default-badge">Default</span>}
                    </div>
                    {currentPreset === preset.id && (
                      <div className="preset-active-indicator">✓</div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Custom Colors */}
          <div className="theme-section">
            <h4 className="theme-section-title">
              Custom Colors
              {currentPreset !== "custom" && (
                <span className="theme-section-hint">(changes will switch to custom theme)</span>
              )}
            </h4>
            <div className="color-grid">
              <ColorPicker
                label="Primary"
                value={formData.primaryColor}
                onChange={(v) => handleColorChange("primaryColor", v)}
              />
              <ColorPicker
                label="Secondary"
                value={formData.secondaryColor}
                onChange={(v) => handleColorChange("secondaryColor", v)}
              />
              <ColorPicker
                label="Background"
                value={formData.backgroundColor}
                onChange={(v) => handleColorChange("backgroundColor", v)}
              />
              <ColorPicker
                label="Text"
                value={formData.textColor}
                onChange={(v) => handleColorChange("textColor", v)}
              />
            </div>
          </div>

          {/* Fonts */}
          <div className="theme-section">
            <h4 className="theme-section-title">Typography</h4>
            <div className="font-grid">
              <FontPicker
                label="Headings"
                value={formData.headingFont}
                options={fontOptions.filter((f) => f.style === "serif")}
                onChange={(v) => handleFontChange("headingFont", v)}
              />
              <FontPicker
                label="Body Text"
                value={formData.bodyFont}
                options={fontOptions.filter((f) => f.style === "sans-serif")}
                onChange={(v) => handleFontChange("bodyFont", v)}
              />
              <FontPicker
                label="Script/Accent"
                value={formData.scriptFont}
                options={fontOptions.filter((f) => f.style === "script")}
                onChange={(v) => handleFontChange("scriptFont", v)}
              />
            </div>
          </div>

          {/* Preview */}
          <div className="theme-section">
            <h4 className="theme-section-title">Preview</h4>
            <div
              className="theme-preview"
              style={{
                background: formData.backgroundColor,
                color: formData.textColor,
              }}
            >
              <h2
                style={{
                  fontFamily: formData.headingFont,
                  color: formData.primaryColor,
                  margin: "0 0 8px",
                }}
              >
                Wedding Day
              </h2>
              <p
                style={{
                  fontFamily: formData.scriptFont,
                  color: formData.secondaryColor,
                  fontSize: "18px",
                  margin: "0 0 12px",
                }}
              >
                Together Forever
              </p>
              <p
                style={{
                  fontFamily: formData.bodyFont,
                  fontSize: "14px",
                  margin: 0,
                }}
              >
                Join us for the celebration of love
              </p>
            </div>
          </div>
        </div>

        <div className="theme-modal-footer">
          <button className="btn btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

function ColorPicker({ label, value, onChange }) {
  return (
    <div className="color-picker">
      <label className="color-picker-label">{label}</label>
      <div className="color-picker-input">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="color-input"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="color-text"
          placeholder="#000000"
        />
      </div>
    </div>
  );
}

function FontPicker({ label, value, options, onChange }) {
  return (
    <div className="font-picker">
      <label className="font-picker-label">{label}</label>
      <select
        className="font-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ fontFamily: value }}
      >
        {options.map((font) => (
          <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
            {font.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default ThemeModal;
