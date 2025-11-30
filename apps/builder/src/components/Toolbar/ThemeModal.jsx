import { useState, useEffect } from 'react';
import { useBuilderStore } from '../../store/builderStore';
import './ThemeModal.css';

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
  { value: 'Great Vibes', label: 'Great Vibes', style: 'script' },
  { value: 'Dancing Script', label: 'Dancing Script', style: 'script' },
  { value: 'Tangerine', label: 'Tangerine', style: 'script' },
  { value: 'Alex Brush', label: 'Alex Brush', style: 'script' },
];

const colorPresets = [
  { name: 'Royal Gold', primary: '#d4af37', secondary: '#8b6914', background: '#fff8f0', text: '#2c2c2c' },
  { name: 'Rose Garden', primary: '#c77d8a', secondary: '#9b5c6a', background: '#fff5f7', text: '#4a3539' },
  { name: 'Forest Sage', primary: '#6b8e6b', secondary: '#4a6f4a', background: '#f5f8f5', text: '#2c3c2c' },
  { name: 'Ocean Blue', primary: '#5b8fa8', secondary: '#3d6b82', background: '#f5fafc', text: '#2c3640' },
  { name: 'Lavender Dream', primary: '#9b8bb4', secondary: '#7a6a96', background: '#f8f5fc', text: '#3c3544' },
  { name: 'Sunset Coral', primary: '#e07c5f', secondary: '#c45d42', background: '#fff7f5', text: '#3c3230' },
];

function ThemeModal({ isOpen, onClose }) {
  const { currentInvitation, updateNestedData } = useBuilderStore();
  const theme = currentInvitation.data.theme || {};
  const colors = theme.colors || {};
  const fonts = theme.fonts || {};

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
    setFormData({
      primaryColor: colors.primary || '#d4af37',
      secondaryColor: colors.secondary || '#8b6914',
      backgroundColor: colors.background || '#fff8f0',
      textColor: colors.text || '#2c2c2c',
      headingFont: fonts.heading || 'Playfair Display',
      bodyFont: fonts.body || 'Poppins',
      scriptFont: fonts.script || 'Great Vibes',
    });
  }, [colors, fonts]);

  const handleChange = (field, value) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    
    // Update store immediately for live preview
    updateNestedData('theme', {
      colors: {
        primary: newData.primaryColor,
        secondary: newData.secondaryColor,
        background: newData.backgroundColor,
        text: newData.textColor,
      },
      fonts: {
        heading: newData.headingFont,
        body: newData.bodyFont,
        script: newData.scriptFont,
      },
    });
  };

  const applyPreset = (preset) => {
    const newData = {
      ...formData,
      primaryColor: preset.primary,
      secondaryColor: preset.secondary,
      backgroundColor: preset.background,
      textColor: preset.text,
    };
    setFormData(newData);
    
    updateNestedData('theme', {
      colors: {
        primary: preset.primary,
        secondary: preset.secondary,
        background: preset.background,
        text: preset.text,
      },
      fonts: {
        heading: newData.headingFont,
        body: newData.bodyFont,
        script: newData.scriptFont,
      },
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
          {/* Color Presets */}
          <div className="theme-section">
            <h4 className="theme-section-title">Color Presets</h4>
            <div className="color-presets">
              {colorPresets.map((preset) => (
                <button
                  key={preset.name}
                  className="preset-btn"
                  onClick={() => applyPreset(preset)}
                  title={preset.name}
                >
                  <div className="preset-colors">
                    <span style={{ background: preset.primary }} />
                    <span style={{ background: preset.secondary }} />
                    <span style={{ background: preset.background }} />
                  </div>
                  <span className="preset-name">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Colors */}
          <div className="theme-section">
            <h4 className="theme-section-title">Custom Colors</h4>
            <div className="color-grid">
              <ColorPicker
                label="Primary"
                value={formData.primaryColor}
                onChange={(v) => handleChange('primaryColor', v)}
              />
              <ColorPicker
                label="Secondary"
                value={formData.secondaryColor}
                onChange={(v) => handleChange('secondaryColor', v)}
              />
              <ColorPicker
                label="Background"
                value={formData.backgroundColor}
                onChange={(v) => handleChange('backgroundColor', v)}
              />
              <ColorPicker
                label="Text"
                value={formData.textColor}
                onChange={(v) => handleChange('textColor', v)}
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
                onChange={(v) => handleChange('headingFont', v)}
              />
              <FontPicker
                label="Body Text"
                value={formData.bodyFont}
                options={fontOptions.filter(f => f.style === 'sans-serif')}
                onChange={(v) => handleChange('bodyFont', v)}
              />
              <FontPicker
                label="Script/Accent"
                value={formData.scriptFont}
                options={fontOptions.filter(f => f.style === 'script')}
                onChange={(v) => handleChange('scriptFont', v)}
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


