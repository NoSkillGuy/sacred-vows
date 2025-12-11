import { useState, useEffect, useMemo } from 'react';
import { useBuilderStore, SECTION_TYPES } from '../../store/builderStore';
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
import Blessings from '../Invitation/Blessings';
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

/**
 * Section Registry
 * Maps section IDs to their editable and view-only components
 */
const SECTION_REGISTRY = {
  [SECTION_TYPES.HERO]: {
    editable: EditableHeroSection,
    view: Hero,
    needsRSVP: true,
  },
  [SECTION_TYPES.COUPLE]: {
    editable: EditableCoupleSection,
    view: Couple,
  },
  [SECTION_TYPES.FATHERS_LETTER]: {
    editable: EditableFathersLetterSection,
    view: FathersLetter,
  },
  [SECTION_TYPES.GALLERY]: {
    editable: EditableGallerySection,
    view: Gallery,
  },
  [SECTION_TYPES.EVENTS]: {
    editable: EditableEventsSection,
    view: Events,
  },
  [SECTION_TYPES.VENUE]: {
    editable: EditableVenueSection,
    view: Venue,
  },
  [SECTION_TYPES.RSVP]: {
    editable: EditableRSVPSection,
    view: RSVP,
    needsRSVP: true,
  },
  [SECTION_TYPES.FOOTER]: {
    editable: EditableFooter,
    view: Footer,
  },
};

function PreviewPane({ editMode = true, deviceMode = 'desktop' }) {
  const currentInvitation = useBuilderStore((state) => state.currentInvitation);
  const getEnabledSections = useBuilderStore((state) => state.getEnabledSections);
  const { currentLang, translations, updateLanguage } = useLanguage();
  const { handleUpdate } = useEditable();
  const [showRSVPModal, setShowRSVPModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showGuestNameModal, setShowGuestNameModal] = useState(false);
  
  // Force re-render when switching modes to ensure fresh data
  const [modeKey, setModeKey] = useState(0);
  
  useEffect(() => {
    setModeKey(prev => prev + 1);
  }, [editMode]);

  // Get enabled sections in order
  const enabledSections = useMemo(() => {
    return getEnabledSections();
  }, [currentInvitation.templateConfig?.sections]);

  // Apply theme to CSS variables
  useEffect(() => {
    const theme = currentInvitation?.templateConfig?.theme || currentInvitation?.data?.theme || {};
    const colors = theme.colors || {};
    const fonts = theme.fonts || {};
    const root = document.documentElement;

    const setColor = (name, value) => {
      if (value) root.style.setProperty(name, value);
    };

    setColor('--bg-page', colors.background);
    setColor('--bg-card', colors.background);
    setColor('--bg-card-deep', colors.background);
    setColor('--border-gold', colors.primary);
    setColor('--border-soft', colors.secondary || colors.primary);
    setColor('--accent-gold', colors.primary);
    setColor('--accent-gold-soft', colors.accent || colors.primary);
    setColor('--accent-rose', colors.accent || colors.primary);
    setColor('--accent-blush', colors.secondary || colors.accent || colors.primary);
    setColor('--accent-sage', colors.secondary || colors.accent || colors.primary);
    setColor('--text-main', colors.text);
    setColor('--text-muted', colors.text);
    setColor('--button-primary', colors.primary);
    setColor('--button-primary-hover', colors.secondary || colors.primary);

    if (fonts.heading) root.style.setProperty('--font-heading', fonts.heading);
    if (fonts.body) root.style.setProperty('--font-body', fonts.body);
    if (fonts.script) root.style.setProperty('--font-script', fonts.script);
    if (fonts.body) document.body.style.setProperty('font-family', fonts.body);
  }, [currentInvitation?.templateConfig?.theme]);

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

  // Device width classes
  const deviceWidths = {
    desktop: '100%',
    tablet: '768px',
    mobile: '375px',
  };

  // Render a single section
  const renderSection = (sectionConfig, index) => {
    const { id } = sectionConfig;
    
    // Skip header and footer - they're rendered separately
    if (id === SECTION_TYPES.HEADER || id === SECTION_TYPES.FOOTER) {
      return null;
    }

    const registry = SECTION_REGISTRY[id];
    if (!registry) {
      console.warn(`Unknown section type: ${id}`);
      return null;
    }

    const Component = editMode ? registry.editable : registry.view;
    if (!Component) return null;

    const props = editMode ? editableProps : viewProps;
    const extraProps = registry.needsRSVP ? { onRSVPClick: handleRSVPClick } : {};

    return (
      <Component
        key={`${id}-${index}`}
        {...props}
        {...extraProps}
      />
    );
  };

  // Check if footer is enabled
  const isFooterEnabled = useMemo(() => {
    return enabledSections.some(s => s.id === SECTION_TYPES.FOOTER);
  }, [enabledSections]);

  // Get sections without header/footer for main content
  const mainSections = useMemo(() => {
    return enabledSections.filter(
      s => s.id !== SECTION_TYPES.HEADER && s.id !== SECTION_TYPES.FOOTER
    );
  }, [enabledSections]);

  return (
    <div className="preview-pane">
      <div className="preview-content" data-preview-scroll-container>
        <div 
          className={`preview-device-frame device-${deviceMode}`}
          style={{ 
            maxWidth: deviceWidths[deviceMode],
            margin: deviceMode !== 'desktop' ? '20px auto' : '0 auto',
          }}
        >
          <div className="preview-wrapper" data-edit-mode={editMode}>
            {/* Header is always rendered (required section) */}
            <Header 
              onLanguageClick={handleLanguageClick}
              translations={translations}
              currentLang={currentLang}
              config={currentInvitation.data}
            />
            <Blessings />
            <main className="page-shell" key={editMode ? 'edit' : `view-${modeKey}`}>
              {/* Dynamically render enabled sections in order */}
              {mainSections.map((section, index) => renderSection(section, index))}
              
              {/* Footer is always rendered if enabled (required section) */}
              {isFooterEnabled && (
                editMode ? (
                  <EditableFooter {...editableProps} />
                ) : (
                  <Footer {...viewProps} />
                )
              )}
            </main>
            
            <ConfettiLayer />
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
          <CelebrateButton />
        </div>
      </div>
    </div>
  );
}

export default PreviewPane;
