import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ThemeModal from './ThemeModal';
import GalleryModal from './GalleryModal';
import LayoutSwitcher from './LayoutSwitcher';
import PublishModal from '../Export/ExportModal';
import SectionManager from '../SectionManager/SectionManager';
import { useBuilderStore } from '../../store/builderStore';
import './Toolbar.css';

// SVG Icons
const RingsIcon = () => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="12" stroke="currentColor" strokeWidth="2.5" fill="none"/>
    <circle cx="20" cy="8" r="3" fill="currentColor"/>
    <path d="M17 8L20 3L23 8" stroke="currentColor" strokeWidth="1.5" fill="none"/>
  </svg>
);

const EditIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16.5 3.5L20.5 7.5L7 21H3V17L16.5 3.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14 6L18 10" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

const DesktopIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M8 21H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M12 17V21" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

const TabletIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="2" width="16" height="20" rx="2" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="12" cy="18" r="1" fill="currentColor"/>
  </svg>
);

const MobileIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="6" y="2" width="12" height="20" rx="2" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M10 5H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="12" cy="18" r="1" fill="currentColor"/>
  </svg>
);

const PaletteIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22C12.8 22 13.5 21.3 13.5 20.5C13.5 20.1 13.3 19.8 13.1 19.5C12.9 19.2 12.7 18.9 12.7 18.5C12.7 17.7 13.4 17 14.2 17H16C19.3 17 22 14.3 22 11C22 6 17.5 2 12 2Z" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="7.5" cy="11.5" r="1.5" fill="currentColor"/>
    <circle cx="10.5" cy="7.5" r="1.5" fill="currentColor"/>
    <circle cx="14.5" cy="7.5" r="1.5" fill="currentColor"/>
    <circle cx="17.5" cy="11.5" r="1.5" fill="currentColor"/>
  </svg>
);

const GalleryIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="8.5" cy="8.5" r="2" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M3 16L8 11L12 15L16 11L21 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SectionsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="18" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="3" y="10" width="18" height="4" rx="1" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="3" y="16" width="18" height="5" rx="1" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

const LayoutIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

const RocketIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4.5 16.5C3 18 3 21 3 21C3 21 6 21 7.5 19.5C8.32 18.68 8.32 17.32 7.5 16.5C6.68 15.68 5.32 15.68 4.5 16.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14.5 4.5L19.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M16 2L22 8L14 16C12 18 9 18 9 18C9 18 9 15 11 13L16 8V2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 15L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const BackIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);

function Toolbar({ editMode, onEditModeToggle, deviceMode, onDeviceModeChange }) {
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showSectionManager, setShowSectionManager] = useState(false);
  const [showLayoutSwitcher, setShowLayoutSwitcher] = useState(false);

  return (
    <>
      <div className="builder-toolbar">
        <div className="toolbar-left">
          <Link to="/dashboard" className="toolbar-back-btn" title="Back to Dashboard">
            <BackIcon />
          </Link>
          <div className="toolbar-brand">
            <span className="brand-icon">
              <RingsIcon />
            </span>
            <span className="brand-text">Sacred Vows</span>
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
              <span className="btn-icon">
                {editMode ? <EditIcon /> : <EyeIcon />}
              </span>
              <span className="btn-label">{editMode ? 'Editing' : 'Preview'}</span>
            </button>
          </div>

          <div className="toolbar-divider" />

          <div className="toolbar-group device-group">
            <button
              className={`toolbar-btn device-btn ${deviceMode === 'desktop' ? 'active' : ''}`}
              onClick={() => onDeviceModeChange('desktop')}
              title="Desktop Preview"
            >
              <span className="btn-icon">
                <DesktopIcon />
              </span>
            </button>
            <button
              className={`toolbar-btn device-btn ${deviceMode === 'tablet' ? 'active' : ''}`}
              onClick={() => onDeviceModeChange('tablet')}
              title="Tablet Preview"
            >
              <span className="btn-icon">
                <TabletIcon />
              </span>
            </button>
            <button
              className={`toolbar-btn device-btn ${deviceMode === 'mobile' ? 'active' : ''}`}
              onClick={() => onDeviceModeChange('mobile')}
              title="Mobile Preview"
            >
              <span className="btn-icon">
                <MobileIcon />
              </span>
            </button>
          </div>
        </div>

        <div className="toolbar-right">
          <button
            className="toolbar-btn"
            onClick={() => setShowLayoutSwitcher(true)}
            title="Change Layout"
          >
            <span className="btn-icon">
              <LayoutIcon />
            </span>
            <span className="btn-label">Layout</span>
          </button>

          <button
            className="toolbar-btn"
            onClick={() => setShowSectionManager(true)}
            title="Manage Sections"
          >
            <span className="btn-icon">
              <SectionsIcon />
            </span>
            <span className="btn-label">Sections</span>
          </button>

          <button
            className="toolbar-btn"
            onClick={() => setShowThemeModal(true)}
            title="Theme & Colors"
          >
            <span className="btn-icon">
              <PaletteIcon />
            </span>
            <span className="btn-label">Theme</span>
          </button>

          <button
            className="toolbar-btn"
            onClick={() => setShowGalleryModal(true)}
            title="Manage Gallery"
          >
            <span className="btn-icon">
              <GalleryIcon />
            </span>
            <span className="btn-label">Gallery</span>
          </button>

          <div className="toolbar-divider" />

          <button
            className="toolbar-btn publish-btn"
            onClick={() => setShowPublishModal(true)}
            title="Publish your invitation"
          >
            <span className="btn-icon">
              <RocketIcon />
            </span>
            <span className="btn-label">Publish</span>
          </button>
        </div>
      </div>

      <LayoutSwitcher
        isOpen={showLayoutSwitcher}
        onClose={() => setShowLayoutSwitcher(false)}
      />
      <SectionManager
        isOpen={showSectionManager}
        onClose={() => setShowSectionManager(false)}
      />
      <ThemeModal 
        isOpen={showThemeModal} 
        onClose={() => setShowThemeModal(false)} 
      />
      <GalleryModal 
        isOpen={showGalleryModal} 
        onClose={() => setShowGalleryModal(false)} 
      />
      <PublishModal 
        isOpen={showPublishModal} 
        onClose={() => setShowPublishModal(false)} 
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
