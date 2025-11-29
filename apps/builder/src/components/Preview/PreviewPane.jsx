import { useState, useEffect } from 'react';
import { useBuilderStore } from '../../store/builderStore';
import { useLanguage } from '../../hooks/useLanguage';
import Header from '../Invitation/Header';
import Hero from '../Invitation/Hero';
import Couple from '../Invitation/Couple';
import FathersLetter from '../Invitation/FathersLetter';
import Gallery from '../Invitation/Gallery';
import Events from '../Invitation/Events';
import Venue from '../Invitation/Venue';
import RSVP from '../Invitation/RSVP';
import Footer from '../Invitation/Footer';
import ConfettiLayer from '../Invitation/ConfettiLayer';
import CelebrateButton from '../Invitation/CelebrateButton';
import RSVPModal from '../Invitation/RSVPModal';
import LanguageModal from '../Invitation/LanguageModal';
import GuestNameModal from '../Invitation/GuestNameModal';
// WYSIWYG Editable Components
import { useEditable } from '../WYSIWYG/useEditable';
import EditableHeroSection from '../WYSIWYG/EditableHeroSection';
import EditableCoupleSection from '../WYSIWYG/EditableCoupleSection';
import EditableFathersLetterSection from '../WYSIWYG/EditableFathersLetterSection';
import EditableGallerySection from '../WYSIWYG/EditableGallerySection';
import EditableEventsSection from '../WYSIWYG/EditableEventsSection';
import EditableVenueSection from '../WYSIWYG/EditableVenueSection';
import EditableRSVPSection from '../WYSIWYG/EditableRSVPSection';
import EditableFooter from '../WYSIWYG/EditableFooter';
import '../../styles/invitation.css';
import './PreviewPane.css';

function PreviewPane() {
  const currentInvitation = useBuilderStore((state) => state.currentInvitation);
  const { currentLang, translations, updateLanguage } = useLanguage();
  const { handleUpdate } = useEditable();
  const [showRSVPModal, setShowRSVPModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showGuestNameModal, setShowGuestNameModal] = useState(false);
  const [editMode, setEditMode] = useState(true); // WYSIWYG edit mode toggle
  
  // Force re-render when switching modes to ensure fresh data
  const [modeKey, setModeKey] = useState(0);
  
  const handleModeToggle = () => {
    setEditMode(!editMode);
    setModeKey(prev => prev + 1); // Force re-render
  };

  const handleRSVPClick = () => {
    setShowRSVPModal(true);
  };

  const handleLanguageClick = () => {
    setShowLanguageModal(true);
  };

  const handleLanguageSelect = (lang) => {
    localStorage.setItem('wedding-lang', lang);
    updateLanguage(lang);
    setShowLanguageModal(false);
  };

  // Common props for editable sections
  const editableProps = {
    translations,
    currentLang,
    config: currentInvitation.data,
    onUpdate: handleUpdate,
  };

  // Common props for view-only sections  
  const viewProps = {
    translations,
    currentLang,
    config: currentInvitation.data,
  };

  return (
    <div className="preview-pane">
      <div className="preview-header">
        <h3>Preview</h3>
        <div className="preview-actions">
          <AutosaveIndicator />
          <button 
            className={`preview-btn ${editMode ? 'active' : ''}`}
            onClick={handleModeToggle}
            title="Toggle WYSIWYG editing"
          >
            {editMode ? '✏️ Edit Mode' : '👁️ View Mode'}
          </button>
          <button className="preview-btn">Desktop</button>
          <button className="preview-btn">Tablet</button>
          <button className="preview-btn">Mobile</button>
        </div>
      </div>
      <div className="preview-content">
        <div className="preview-wrapper">
          <Header 
            onLanguageClick={handleLanguageClick}
            translations={translations}
            currentLang={currentLang}
            config={currentInvitation.data}
          />
          <main className="page-shell" data-edit-mode={editMode} key={editMode ? 'edit' : `view-${modeKey}`}>
            {editMode ? (
              <>
                {/* WYSIWYG Editable Sections */}
                <EditableHeroSection
                  onRSVPClick={handleRSVPClick}
                  {...editableProps}
                />
                <EditableCoupleSection {...editableProps} />
                <EditableFathersLetterSection {...editableProps} />
                <EditableGallerySection {...editableProps} />
                <EditableEventsSection {...editableProps} />
                <EditableVenueSection {...editableProps} />
                <EditableRSVPSection 
                  onRSVPClick={handleRSVPClick}
                  {...editableProps}
                />
                <EditableFooter {...editableProps} />
              </>
            ) : (
              <>
                {/* View-Only Sections */}
                <Hero 
                  onRSVPClick={handleRSVPClick}
                  {...viewProps}
                />
                <Couple {...viewProps} />
                <FathersLetter {...viewProps} />
                <Gallery {...viewProps} />
                <Events {...viewProps} />
                <Venue {...viewProps} />
                <RSVP 
                  onRSVPClick={handleRSVPClick}
                  {...viewProps}
                />
                <Footer {...viewProps} />
              </>
            )}
          </main>
          <ConfettiLayer />
          <CelebrateButton />
          <LanguageModal 
            isOpen={showLanguageModal}
            onClose={() => setShowLanguageModal(false)}
            onSelect={handleLanguageSelect}
            currentLang={currentLang}
            translations={translations}
          />
          <GuestNameModal 
            isOpen={showGuestNameModal}
            onClose={() => setShowGuestNameModal(false)}
            translations={translations}
            currentLang={currentLang}
          />
          <RSVPModal 
            isOpen={showRSVPModal}
            onClose={() => setShowRSVPModal(false)}
            translations={translations}
            currentLang={currentLang}
            config={currentInvitation.data}
          />
        </div>
      </div>
    </div>
  );
}

function AutosaveIndicator() {
  const saving = useBuilderStore((state) => state.saving);
  const lastSavedAt = useBuilderStore((state) => state.lastSavedAt);
  const [showSaved, setShowSaved] = useState(false);

  // Show "Saved" indicator when lastSavedAt changes (localStorage save)
  useEffect(() => {
    if (lastSavedAt) {
      setShowSaved(true);
      const timer = setTimeout(() => setShowSaved(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [lastSavedAt]);

  // Handle server saving state
  useEffect(() => {
    if (saving) {
      setShowSaved(false);
    }
  }, [saving]);

  if (saving) {
    return (
      <span className="autosave-indicator saving" title="Saving to server...">
        💾 Saving...
      </span>
    );
  }

  if (showSaved) {
    return (
      <span className="autosave-indicator saved" title="Saved to browser">
        ✅ Saved
      </span>
    );
  }

  return (
    <span className="autosave-indicator" title="Changes auto-saved to browser">
      💾 Auto-saved
    </span>
  );
}

export default PreviewPane;
