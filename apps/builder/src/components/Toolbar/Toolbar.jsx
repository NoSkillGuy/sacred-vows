import { useState, useEffect } from 'react';
import ThemeModal from './ThemeModal';
import GalleryModal from './GalleryModal';
import ExportModal from '../Export/ExportModal';
import { useBuilderStore } from '../../store/builderStore';
import './Toolbar.css';

function Toolbar({ editMode, onEditModeToggle, deviceMode, onDeviceModeChange }) {
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  return (
    <>
      <div className="builder-toolbar">
        <div className="toolbar-left">
          <div className="toolbar-brand">
            <span className="brand-icon">💒</span>
            <span className="brand-text">Wedding Builder</span>
          </div>
          <AutosaveStatus />
        </div>

        <div className="toolbar-center">
          <div className="toolbar-group">
            <button
              className={`toolbar-btn mode-toggle ${editMode ? 'active' : ''}`}
              onClick={onEditModeToggle}
              title={editMode ? 'Switch to Preview Mode' : 'Switch to Edit Mode'}
            >
              {editMode ? (
                <>
                  <span className="btn-icon">✏️</span>
                  <span className="btn-label">Editing</span>
                </>
              ) : (
                <>
                  <span className="btn-icon">👁️</span>
                  <span className="btn-label">Preview</span>
                </>
              )}
            </button>
          </div>

          <div className="toolbar-divider" />

          <div className="toolbar-group device-group">
            <button
              className={`toolbar-btn device-btn ${deviceMode === 'desktop' ? 'active' : ''}`}
              onClick={() => onDeviceModeChange('desktop')}
              title="Desktop Preview"
            >
              <span className="btn-icon">🖥️</span>
            </button>
            <button
              className={`toolbar-btn device-btn ${deviceMode === 'tablet' ? 'active' : ''}`}
              onClick={() => onDeviceModeChange('tablet')}
              title="Tablet Preview"
            >
              <span className="btn-icon">📱</span>
            </button>
            <button
              className={`toolbar-btn device-btn ${deviceMode === 'mobile' ? 'active' : ''}`}
              onClick={() => onDeviceModeChange('mobile')}
              title="Mobile Preview"
            >
              <span className="btn-icon">📲</span>
            </button>
          </div>
        </div>

        <div className="toolbar-right">
          <button
            className="toolbar-btn"
            onClick={() => setShowThemeModal(true)}
            title="Theme & Colors"
          >
            <span className="btn-icon">🎨</span>
            <span className="btn-label">Theme</span>
          </button>

          <button
            className="toolbar-btn"
            onClick={() => setShowGalleryModal(true)}
            title="Manage Gallery"
          >
            <span className="btn-icon">🖼️</span>
            <span className="btn-label">Gallery</span>
          </button>

          <div className="toolbar-divider" />

          <button
            className="toolbar-btn publish-btn"
            onClick={() => setShowExportModal(true)}
            title="Publish your invitation"
          >
            <span className="btn-icon">🚀</span>
            <span className="btn-label">Publish</span>
          </button>
        </div>
      </div>

      <ThemeModal 
        isOpen={showThemeModal} 
        onClose={() => setShowThemeModal(false)} 
      />
      <GalleryModal 
        isOpen={showGalleryModal} 
        onClose={() => setShowGalleryModal(false)} 
      />
      <ExportModal 
        isOpen={showExportModal} 
        onClose={() => setShowExportModal(false)} 
      />
    </>
  );
}

export default Toolbar;

function AutosaveStatus() {
  const saving = useBuilderStore((state) => state.saving);
  const lastSavedAt = useBuilderStore((state) => state.lastSavedAt);
  const [status, setStatus] = useState('idle');

  useEffect(() => {
    if (saving) {
      setStatus('saving');
      return;
    }
    if (lastSavedAt) {
      setStatus('saved');
      const timer = setTimeout(() => setStatus('idle'), 2000);
      return () => clearTimeout(timer);
    }
    setStatus('idle');
  }, [saving, lastSavedAt]);

  const label = status === 'saving' ? 'Saving…' : status === 'saved' ? 'Saved' : 'Auto-save';

  return (
    <div className={`autosave-status autosave-${status}`} title={label} aria-live="polite">
      <span className="autosave-dot" />
      <span className="autosave-text">{label}</span>
    </div>
  );
}


