import { useState, useEffect } from 'react';
import { useBuilderStore } from '../../store/builderStore';
import { getTemplates, getTemplateManifest } from '../../services/templateService';
import TemplateCardUnified from '../Templates/TemplateCardUnified';
import './TemplateSwitcher.css';

// SVG Icons
const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const WarningIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

function TemplateSwitcher({ isOpen, onClose }) {
  const { 
    currentInvitation, 
    switchTemplate,
  } = useBuilderStore();
  
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
    }
  }, [isOpen]);

  async function loadTemplates() {
    try {
      setLoading(true);
      const data = await getTemplates();
      setTemplates(data.templates || []);
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleTemplateClick = (template) => {
    if (!template.isAvailable) return;
    if (template.id === currentInvitation.templateId) return;
    
    setSelectedTemplate(template);
    setShowConfirmation(true);
  };

  const handleConfirmSwitch = async () => {
    if (!selectedTemplate) return;
    
    try {
      setSwitching(true);
      
      // Load the new template's manifest
      const manifest = await getTemplateManifest(selectedTemplate.id);
      
      // Switch template (preserves content data)
      await switchTemplate(selectedTemplate.id, manifest);
      
      setShowConfirmation(false);
      setSelectedTemplate(null);
      onClose();
    } catch (error) {
      console.error('Failed to switch template:', error);
      alert('Failed to switch template. Please try again.');
    } finally {
      setSwitching(false);
    }
  };

  const handleCancelSwitch = () => {
    setShowConfirmation(false);
    setSelectedTemplate(null);
  };

  if (!isOpen) return null;

  return (
    <div className="template-switcher-overlay" onClick={onClose}>
      <div className="template-switcher-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="template-switcher-header">
          <div>
            <h3>Change Template</h3>
            <p>Your content will be preserved when switching templates</p>
          </div>
          <button className="template-switcher-close" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        {/* Template Grid */}
        <div className="template-switcher-body">
          {loading ? (
            <div className="template-switcher-loading">
              <div className="loading-spinner"></div>
              <p>Loading templates...</p>
            </div>
          ) : (
            <div className="template-switcher-grid">
              {templates.map((template) => {
                const isActive = template.id === currentInvitation.templateId;
                const isReady = template.status === 'ready' || template.isAvailable;
                return (
                  <TemplateCardUnified
                    key={template.id}
                    template={template}
                    active={isActive}
                    showActiveBadge
                    onCardClick={() => handleTemplateClick(template)}
                    onPrimaryAction={handleTemplateClick}
                    primaryLabel={isActive ? 'Current Template' : isReady ? 'Switch Template' : 'Coming Soon'}
                    primaryDisabled={!isReady}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Confirmation Dialog */}
        {showConfirmation && selectedTemplate && (
          <div className="template-switch-confirm">
            <div className="confirm-content">
              <div className="confirm-icon">
                <WarningIcon />
              </div>
              <h4>Switch to {selectedTemplate.name}?</h4>
              <p>
                Your content (names, dates, photos, etc.) will be preserved. 
                However, the section order and theme will reset to the new template's defaults.
              </p>
              <div className="confirm-actions">
                <button 
                  className="btn btn-secondary"
                  onClick={handleCancelSwitch}
                  disabled={switching}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={handleConfirmSwitch}
                  disabled={switching}
                >
                  {switching ? (
                    <>
                      <span className="loading-spinner small"></span>
                      Switching...
                    </>
                  ) : (
                    'Switch Template'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TemplateSwitcher;

