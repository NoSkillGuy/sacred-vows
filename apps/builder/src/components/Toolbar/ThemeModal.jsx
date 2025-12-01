import { useState, useEffect } from 'react';
import { useBuilderStore } from '../../store/builderStore';
import './ThemeModal.css';

// All available font options
const fontOptions = [
  { value: 'Playfair Display', label: 'Playfair Display', style: 'serif' },
  { value: 'Cormorant Garamond', label: 'Cormorant Garamond', style: 'serif' },
  { value: 'Libre Baskerville', label: 'Libre Baskerville', style: 'serif' },
  { value: 'Crimson Text', label: 'Crimson Text', style: 'serif' },
  { value: 'EB Garamond', label: 'EB Garamond', style: 'serif' },
  { value: 'Poppins', label: 'Poppins', style: 'sans-serif' },
  { value: 'Inter', label: 'Inter', style: 'sans-serif' },
  { value: 'Lato', label: 'Lato', style: 'sans-serif' },
  { value: 'Montserrat', label: 'Montserrat', style: 'sans-serif' },
  { value: 'Quicksand', label: 'Quicksand', style: 'sans-serif' },
  { value: 'Great Vibes', label: 'Great Vibes', style: 'script' },
  { value: 'Dancing Script', label: 'Dancing Script', style: 'script' },
  { value: 'Tangerine', label: 'Tangerine', style: 'script' },
  { value: 'Alex Brush', label: 'Alex Brush', style: 'script' },
  { value: 'Parisienne', label: 'Parisienne', style: 'script' },
];

// Fallback presets if template manifest is not available
const fallbackPresets = [
  { 
    id: 'royal-gold', 
    name: 'Royal Gold', 
    colors: { primary: '#d4af37', secondary: '#8b6914', background: '#fff8f0', text: '#2c2c2c', accent: '#c9a227' },
    fonts: { heading: 'Playfair Display', body: 'Poppins', script: 'Great Vibes' }
  },
  { 
    id: 'rose-blush', 
    name: 'Rose Blush', 
    colors: { primary: '#c77d8a', secondary: '#9b5c6a', background: '#fff5f7', text: '#4a3539', accent: '#e8b4b8' },
    fonts: { heading: 'Cormorant Garamond', body: 'Lato', script: 'Dancing Script' }
  },
  { 
    id: 'forest-sage', 
    name: 'Forest Sage', 
    colors: { primary: '#6b8e6b', secondary: '#4a6f4a', background: '#f5f8f5', text: '#2c3c2c', accent: '#8fbc8f' },
    fonts: { heading: 'EB Garamond', body: 'Montserrat', script: 'Tangerine' }
  },
];

function ThemeModal({ isOpen, onClose }) {
  const { 
    currentInvitation, 
    currentTemplateManifest,
    applyThemePreset,
    updateThemeColors,
    updateThemeFonts,
    getTheme,
  } = useBuilderStore();

  // Get current theme
  const theme = getTheme();
  const colors = theme.colors || {};
  const fonts = theme.fonts || {};
  const currentPreset = theme.preset || 'custom';

  // Get theme presets from template manifest or use fallback
  const themePresets = currentTemplateManifest?.themes || fallbackPresets;

  const [formData, setFormData] = useState({
    primaryColor: colors.primary || '#d4af37',
    secondaryColor: colors.secondary || '#8b6914',
    backgroundColor: colors.background || '#fff8f0',
    textColor: colors.text || '#2c2c2c',
    headingFont: fonts.heading || 'Playfair Display',
    bodyFont: fonts.body || 'Poppins',
    scriptFont: fonts.script || 'Great Vibes',
  });

  // Update local state when store changes
  useEffect(() => {
    const currentTheme = getTheme();
    const themeColors = currentTheme.colors || {};
    const themeFonts = currentTheme.fonts || {};
    
    setFormData({
      primaryColor: themeColors.primary || '#d4af37',
      secondaryColor: themeColors.secondary || '#8b6914',
      backgroundColor: themeColors.background || '#fff8f0',
      textColor: themeColors.text || '#2c2c2c',
      headingFont: themeFonts.heading || 'Playfair Display',
      bodyFont: themeFonts.body || 'Poppins',
      scriptFont: themeFonts.script || 'Great Vibes',
    });
  }, [currentInvitation.templateConfig?.theme]);

  const handleColorChange = (field, value) => {
    const colorMap = {
      primaryColor: 'primary',
      secondaryColor: 'secondary',
      backgroundColor: 'background',
      textColor: 'text',
    };
    
    setFormData(prev => ({ ...prev, [field]: value }));
    updateThemeColors({ [colorMap[field]]: value });
  };

  const handleFontChange = (field, value) => {
    const fontMap = {
      headingFont: 'heading',
      bodyFont: 'body',
      scriptFont: 'script',
    };
    
    setFormData(prev => ({ ...prev, [field]: value }));
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
          <button className="theme-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="theme-modal-body">
          {/* Template Theme Presets */}
          <div className="theme-section">
            <h4 className="theme-section-title">
              Theme Presets
              {currentTemplateManifest && (
                <span className="theme-section-subtitle">
                  for {currentTemplateManifest.name}
                </span>
              )}
            </h4>
            <div className="theme-presets-grid">
              {themePresets.map((preset) => (
                <button
                  key={preset.id}
                  className={`theme-preset-card ${currentPreset === preset.id ? 'active' : ''}`}
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
                    {preset.isDefault && (
                      <span className="preset-default-badge">Default</span>
                    )}
                  </div>
                  {currentPreset === preset.id && (
                    <div className="preset-active-indicator">✓</div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Colors */}
          <div className="theme-section">
            <h4 className="theme-section-title">
              Custom Colors
              {currentPreset !== 'custom' && (
                <span className="theme-section-hint">
                  (changes will switch to custom theme)
                </span>
              )}
            </h4>
            <div className="color-grid">
              <ColorPicker
                label="Primary"
                value={formData.primaryColor}
                onChange={(v) => handleColorChange('primaryColor', v)}
              />
              <ColorPicker
                label="Secondary"
                value={formData.secondaryColor}
                onChange={(v) => handleColorChange('secondaryColor', v)}
              />
              <ColorPicker
                label="Background"
                value={formData.backgroundColor}
                onChange={(v) => handleColorChange('backgroundColor', v)}
              />
              <ColorPicker
                label="Text"
                value={formData.textColor}
                onChange={(v) => handleColorChange('textColor', v)}
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
                options={fontOptions.filter(f => f.style === 'serif')}
                onChange={(v) => handleFontChange('headingFont', v)}
              />
              <FontPicker
                label="Body Text"
                value={formData.bodyFont}
                options={fontOptions.filter(f => f.style === 'sans-serif')}
                onChange={(v) => handleFontChange('bodyFont', v)}
              />
              <FontPicker
                label="Script/Accent"
                value={formData.scriptFont}
                options={fontOptions.filter(f => f.style === 'script')}
                onChange={(v) => handleFontChange('scriptFont', v)}
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
              <h2 style={{ 
                fontFamily: formData.headingFont, 
                color: formData.primaryColor,
                margin: '0 0 8px'
              }}>
                Wedding Day
              </h2>
              <p style={{ 
                fontFamily: formData.scriptFont, 
                color: formData.secondaryColor,
                fontSize: '18px',
                margin: '0 0 12px'
              }}>
                Together Forever
              </p>
              <p style={{ 
                fontFamily: formData.bodyFont,
                fontSize: '14px',
                margin: 0
              }}>
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
