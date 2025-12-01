import { useState, useEffect } from 'react';
import { useBuilderStore, SECTION_TYPES } from '../../store/builderStore';
import { SECTION_METADATA } from '../../../../../packages/shared/src/types/wedding-data.js';
import './SectionManager.css';

// SVG Icons
const DragHandleIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
    <path d="M9 5h2v2H9V5zm4 0h2v2h-2V5zM9 9h2v2H9V9zm4 0h2v2h-2V9zm-4 4h2v2H9v-2zm4 0h2v2h-2v-2zm-4 4h2v2H9v-2zm4 0h2v2h-2v-2z"/>
  </svg>
);

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeOffIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const ChevronUpIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <polyline points="18 15 12 9 6 15"/>
  </svg>
);

const ChevronDownIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

function SectionManager({ isOpen, onClose }) {
  const { 
    getAllSections, 
    toggleSection, 
    reorderSections,
    currentTemplateManifest 
  } = useBuilderStore();

  const [sections, setSections] = useState([]);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverItem, setDragOverItem] = useState(null);

  // Load sections when component mounts or store changes
  useEffect(() => {
    const allSections = getAllSections();
    setSections(allSections);
  }, [getAllSections]);

  // Get section metadata (name, icon, description)
  const getSectionInfo = (sectionId) => {
    // First check template manifest
    const manifestSection = currentTemplateManifest?.sections?.find(s => s.id === sectionId);
    if (manifestSection) {
      return manifestSection;
    }
    // Fall back to global metadata
    return SECTION_METADATA[sectionId] || { 
      id: sectionId, 
      name: sectionId.charAt(0).toUpperCase() + sectionId.slice(1).replace(/-/g, ' '),
      icon: '📄',
      description: '',
      required: false,
    };
  };

  // Check if section is required
  const isRequired = (sectionId) => {
    const manifestSection = currentTemplateManifest?.sections?.find(s => s.id === sectionId);
    return manifestSection?.required || SECTION_METADATA[sectionId]?.required || false;
  };

  // Handle drag start
  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index);
    // Add drag image
    e.target.classList.add('dragging');
  };

  // Handle drag end
  const handleDragEnd = (e) => {
    e.target.classList.remove('dragging');
    setDraggedItem(null);
    setDragOverItem(null);
  };

  // Handle drag over
  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedItem === null) return;
    if (draggedItem !== index) {
      setDragOverItem(index);
    }
  };

  // Handle drop
  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === dropIndex) return;

    const newSections = [...sections];
    const [draggedSection] = newSections.splice(draggedItem, 1);
    newSections.splice(dropIndex, 0, draggedSection);
    
    setSections(newSections);
    
    // Update store with new order
    const newOrder = newSections.map(s => s.id);
    reorderSections(newOrder);
    
    setDraggedItem(null);
    setDragOverItem(null);
  };

  // Handle toggle visibility
  const handleToggle = (sectionId) => {
    if (isRequired(sectionId)) return;
    toggleSection(sectionId);
    // Update local state
    setSections(prev => prev.map(s => 
      s.id === sectionId ? { ...s, enabled: !s.enabled } : s
    ));
  };

  // Move section up/down
  const moveSection = (index, direction) => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sections.length) return;

    const newSections = [...sections];
    [newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]];
    
    setSections(newSections);
    
    const newOrder = newSections.map(s => s.id);
    reorderSections(newOrder);
  };

  if (!isOpen) return null;

  return (
    <div className="section-manager-overlay" onClick={onClose}>
      <div className="section-manager-panel" onClick={e => e.stopPropagation()}>
        <div className="section-manager-header">
          <h3>Manage Sections</h3>
          <button className="section-manager-close" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <div className="section-manager-description">
          <p>Drag to reorder sections. Toggle visibility with the eye icon.</p>
        </div>

        <div className="section-list">
          {sections.map((section, index) => {
            const info = getSectionInfo(section.id);
            const required = isRequired(section.id);
            const isDragOver = dragOverItem === index;

            return (
              <div
                key={section.id}
                className={`section-item ${!section.enabled ? 'disabled' : ''} ${isDragOver ? 'drag-over' : ''} ${required ? 'required' : ''}`}
                draggable={!required}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
              >
                <div className="section-item-drag">
                  {!required && <DragHandleIcon />}
                </div>
                
                <div className="section-item-icon">
                  <span>{info.icon}</span>
                </div>

                <div className="section-item-info">
                  <div className="section-item-name">
                    {info.name}
                    {required && (
                      <span className="section-required-badge" title="Required section">
                        <LockIcon />
                      </span>
                    )}
                  </div>
                  {info.description && (
                    <div className="section-item-description">{info.description}</div>
                  )}
                </div>

                <div className="section-item-actions">
                  {!required && (
                    <>
                      <button
                        className="section-move-btn"
                        onClick={() => moveSection(index, 'up')}
                        disabled={index === 0}
                        title="Move up"
                      >
                        <ChevronUpIcon />
                      </button>
                      <button
                        className="section-move-btn"
                        onClick={() => moveSection(index, 'down')}
                        disabled={index === sections.length - 1}
                        title="Move down"
                      >
                        <ChevronDownIcon />
                      </button>
                    </>
                  )}
                  <button
                    className={`section-toggle-btn ${section.enabled ? 'enabled' : ''}`}
                    onClick={() => handleToggle(section.id)}
                    disabled={required}
                    title={required ? 'Required section' : section.enabled ? 'Hide section' : 'Show section'}
                  >
                    {section.enabled ? <EyeIcon /> : <EyeOffIcon />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="section-manager-footer">
          <div className="section-manager-stats">
            {sections.filter(s => s.enabled).length} of {sections.length} sections visible
          </div>
          <button className="btn btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export default SectionManager;

