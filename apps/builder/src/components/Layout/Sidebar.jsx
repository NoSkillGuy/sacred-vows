import { useState } from 'react';
import ExportModal from '../Export/ExportModal';
import './Sidebar.css';

const sections = [
  { id: 'couple', label: 'Couple', icon: '👫' },
  { id: 'wedding', label: 'Wedding Details', icon: '💒' },
  { id: 'events', label: 'Events', icon: '📅' },
  { id: 'gallery', label: 'Gallery', icon: '📸' },
  { id: 'venue', label: 'Venue', icon: '📍' },
  { id: 'rsvp', label: 'RSVP', icon: '✉️' },
  { id: 'theme', label: 'Theme', icon: '🎨' },
  { id: 'translations', label: 'Languages', icon: '🌐' },
];

function Sidebar({ activeSection, onSectionChange }) {
  return (
    <div className="builder-sidebar">
      <div className="sidebar-header">
        <h2>Wedding Builder</h2>
      </div>
      <nav className="sidebar-nav">
        {sections.map((section) => (
          <button
            key={section.id}
            className={`sidebar-nav-item ${activeSection === section.id ? 'active' : ''}`}
            onClick={() => onSectionChange(section.id)}
          >
            <span className="nav-icon">{section.icon}</span>
            <span className="nav-label">{section.label}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <PublishButton />
      </div>
    </div>
  );
}

function PublishButton() {
  const [showExportModal, setShowExportModal] = useState(false);

  return (
    <>
      <button
        className="sidebar-publish-btn"
        onClick={() => setShowExportModal(true)}
        title="Publish your invitation"
      >
        <span className="nav-icon">🚀</span>
        <span className="nav-label">Publish</span>
      </button>
      <ExportModal 
        isOpen={showExportModal} 
        onClose={() => setShowExportModal(false)} 
      />
    </>
  );
}

export default Sidebar;

