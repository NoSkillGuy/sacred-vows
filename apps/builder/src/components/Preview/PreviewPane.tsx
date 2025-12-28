import { useState, useEffect, useMemo } from "react";
import { useBuilderStore, SECTION_TYPES } from "../../store/builderStore";
import { useLanguage } from "../../hooks/useLanguage";
import {
  getLayout,
  getViewComponents,
  getEditableComponents,
  getSharedComponents,
  hasLayout,
} from "../../layouts/registry";
import { parseInvitationData } from "../../layouts/editorial-elegance/utils/dataHelpers";
import { preloadDefaultAssets } from "../../services/defaultAssetService";
// Import layouts to ensure they're registered
import "../../layouts/classic-scroll";
import "../../layouts/editorial-elegance";
import "./PreviewPane.css";

function PreviewPane({ editMode = true, deviceMode = "desktop" }) {
  const currentInvitation = useBuilderStore((state) => state.currentInvitation);
  const getEnabledSections = useBuilderStore((state) => state.getEnabledSections);
  const loadLayoutManifest = useBuilderStore((state) => state.loadLayoutManifest);
  const validateSectionsAgainstManifest = useBuilderStore(
    (state) => state.validateSectionsAgainstManifest
  );
  const currentLayoutManifest = useBuilderStore((state) => state.currentLayoutManifest);
  const { currentLang, translations, updateLanguage } = useLanguage();
  const [showRSVPModal, setShowRSVPModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showGuestNameModal, setShowGuestNameModal] = useState(false);

  // Force re-render when switching modes to ensure fresh data
  const [modeKey, setModeKey] = useState(0);

  // Get layout-specific components from registry
  let layoutId = currentInvitation.layoutId || "classic-scroll";

  // Fallback for unsupported layouts (defensive check)
  if (!hasLayout(layoutId)) {
    console.warn(`Layout '${layoutId}' is not available. Falling back to 'classic-scroll'.`);
    layoutId = "classic-scroll";
  }

  const layout = getLayout(layoutId);
  const viewComponents = layout ? getViewComponents(layoutId) : {};
  const editableComponents = layout ? getEditableComponents(layoutId) : {};
  const sharedComponents = layout ? getSharedComponents(layoutId) : {};
  const useEditable = layout?.hooks?.useEditable || (() => ({ handleUpdate: () => {} }));

  // Get the editable hook
  const { handleUpdate } = useEditable();

  // Ensure layout manifest is loaded and sections are initialized
  useEffect(() => {
    const initializeSections = async () => {
      if (!currentLayoutManifest || currentLayoutManifest.id !== layoutId) {
        await loadLayoutManifest();
      } else {
        // Manifest is loaded, ensure sections are validated
        const currentSections = currentInvitation.layoutConfig?.sections || [];
        if (currentSections.length === 0 && currentLayoutManifest.sections) {
          validateSectionsAgainstManifest(currentLayoutManifest);
        }
      }
    };

    initializeSections();
  }, [
    layoutId,
    currentLayoutManifest,
    loadLayoutManifest,
    validateSectionsAgainstManifest,
    currentInvitation.layoutConfig?.sections,
  ]);

  useEffect(() => {
    setModeKey((prev) => prev + 1);
  }, [editMode]);

  // Preload default assets when layout changes
  useEffect(() => {
    if (layoutId && currentInvitation.data) {
      // Extract asset paths from invitation data
      const assetPaths = [];

      // Hero image
      if (currentInvitation.data.hero?.mainImage) {
        assetPaths.push(currentInvitation.data.hero.mainImage);
      }

      // Editorial intro image
      if (currentInvitation.data.editorialIntro?.image) {
        assetPaths.push(currentInvitation.data.editorialIntro.image);
      }

      // Gallery images
      if (currentInvitation.data.gallery?.images) {
        currentInvitation.data.gallery.images.forEach((img) => {
          if (img.src) assetPaths.push(img.src);
        });
      }

      // Couple images
      if (currentInvitation.data.couple?.bride?.image) {
        assetPaths.push(currentInvitation.data.couple.bride.image);
      }
      if (currentInvitation.data.couple?.groom?.image) {
        assetPaths.push(currentInvitation.data.couple.groom.image);
      }

      // Wedding party images
      if (currentInvitation.data.weddingParty?.bride?.image) {
        assetPaths.push(currentInvitation.data.weddingParty.bride.image);
      }
      if (currentInvitation.data.weddingParty?.groom?.image) {
        assetPaths.push(currentInvitation.data.weddingParty.groom.image);
      }

      // Preload assets in background
      if (assetPaths.length > 0) {
        preloadDefaultAssets(layoutId, assetPaths).catch((err) => {
          console.warn("Failed to preload some assets:", err);
        });
      }
    }
  }, [layoutId, currentInvitation.data]);

  // Get enabled sections in order
  const enabledSections = useMemo(() => {
    let sections = getEnabledSections();

    // Only fallback to manifest if sections haven't been configured yet
    // This handles the case where:
    // 1. New invitation created (no sections in layoutConfig yet)
    // 2. Layout switched (sections reset)
    // We DON'T fallback if user has explicitly disabled all sections (hasConfiguredSections = true)
    const hasConfiguredSections =
      currentInvitation.layoutConfig?.sections &&
      currentInvitation.layoutConfig.sections.length > 0;

    if (sections.length === 0 && !hasConfiguredSections) {
      // No sections configured at all - use manifest defaults (first time loading layout)
      if (currentLayoutManifest?.sections) {
        sections = currentLayoutManifest.sections
          .filter((s) => s.enabled !== false)
          .map((s, index) => ({
            id: s.id,
            enabled: true,
            order: s.order !== undefined ? s.order : index,
          }))
          .sort((a, b) => a.order - b.order);
      } else if (layout?.manifest?.sections) {
        // Fallback to layout's manifest if currentLayoutManifest not set
        sections = layout.manifest.sections
          .filter((s) => s.enabled !== false)
          .map((s, index) => ({
            id: s.id,
            enabled: true,
            order: s.order !== undefined ? s.order : index,
          }))
          .sort((a, b) => a.order - b.order);
      }

      // If we found sections from manifest, they will be validated by loadLayoutManifest
    }

    return sections;
  }, [currentLayoutManifest, layout, getEnabledSections, currentInvitation.layoutConfig]);

  // Apply theme to CSS variables
  useEffect(() => {
    const theme = currentInvitation?.layoutConfig?.theme || currentInvitation?.data?.theme || {};
    const colors = theme.colors || {};
    const fonts = theme.fonts || {};
    const root = document.documentElement;

    const setColor = (name, value) => {
      if (value) root.style.setProperty(name, value);
    };

    setColor("--bg-page", colors.background);
    setColor("--bg-card", colors.background);
    setColor("--bg-card-deep", colors.background);
    setColor("--border-gold", colors.primary);
    setColor("--border-soft", colors.secondary || colors.primary);
    setColor("--accent-gold", colors.primary);
    setColor("--accent-gold-soft", colors.accent || colors.primary);
    setColor("--accent-rose", colors.accent || colors.primary);
    setColor("--accent-blush", colors.secondary || colors.accent || colors.primary);
    setColor("--accent-sage", colors.secondary || colors.accent || colors.primary);
    setColor("--text-main", colors.text);
    setColor("--text-muted", colors.text);
    setColor("--button-primary", colors.primary);
    setColor("--button-primary-hover", colors.secondary || colors.primary);

    if (fonts.heading) root.style.setProperty("--font-heading", fonts.heading);
    if (fonts.body) root.style.setProperty("--font-body", fonts.body);
    if (fonts.script) root.style.setProperty("--font-script", fonts.script);
    if (fonts.body) document.body.style.setProperty("font-family", fonts.body);
  }, [currentInvitation?.layoutConfig?.theme, currentInvitation?.data?.theme]);

  const handleRSVPClick = () => {
    setShowRSVPModal(true);
  };

  const handleLanguageClick = () => {
    setShowLanguageModal(true);
  };

  const handleLanguageSelect = (lang) => {
    localStorage.setItem("wedding-lang", lang);
    updateLanguage(lang);
    setShowLanguageModal(false);
  };

  // Ensure data is an object, not an array or string
  const invitationData = parseInvitationData(currentInvitation.data, {});

  // Common props for editable sections
  const editableProps = {
    translations,
    currentLang,
    config: invitationData,
    onUpdate: handleUpdate,
  };

  // Common props for view-only sections
  const viewProps = {
    translations,
    currentLang,
    config: invitationData,
  };

  // Device width classes
  const deviceWidths = {
    desktop: "100%",
    tablet: "768px",
    mobile: "375px",
  };

  // Render a single section
  const renderSection = (sectionConfig, index) => {
    const { id } = sectionConfig;

    // Skip header and footer - they're rendered separately
    if (id === SECTION_TYPES.HEADER || id === SECTION_TYPES.FOOTER) {
      return null;
    }

    // Get component from registry based on edit mode
    const Component = editMode ? editableComponents[id] : viewComponents[id];

    if (!Component) {
      console.warn(
        `Component not found for section: ${id} in ${editMode ? "editable" : "view"} mode`
      );
      return null;
    }

    const props = editMode ? editableProps : viewProps;
    // Hero and RSVP sections need RSVP click handler
    const extraProps = id === "hero" || id === "rsvp" ? { onRSVPClick: handleRSVPClick } : {};

    return <Component key={`${id}-${index}`} {...props} {...extraProps} />;
  };

  // Check if footer is enabled
  const isFooterEnabled = useMemo(() => {
    return enabledSections.some((s) => s.id === SECTION_TYPES.FOOTER);
  }, [enabledSections]);

  // Get sections without header/footer for main content
  const mainSections = useMemo(() => {
    return enabledSections.filter(
      (s) => s.id !== SECTION_TYPES.HEADER && s.id !== SECTION_TYPES.FOOTER
    );
  }, [enabledSections]);

  // Get shared components from registry
  const Header = sharedComponents.Header || viewComponents.header;
  const Blessings = sharedComponents.Blessings || viewComponents.blessings;
  const ConfettiLayer = sharedComponents.ConfettiLayer || viewComponents.confetti;
  const ScrollAnimationsInit = sharedComponents.ScrollAnimationsInit;
  const CelebrateButton = sharedComponents.CelebrateButton || viewComponents.celebrate;
  const LanguageModal = sharedComponents.LanguageModal;
  const GuestNameModal = sharedComponents.GuestNameModal;
  const RSVPModal = sharedComponents.RSVPModal;
  const Footer = viewComponents.footer;
  const EditableFooter = editableComponents.footer;

  // If layout not found, show error
  if (!layout) {
    return (
      <div className="preview-pane">
        <div className="preview-error">
          <h2>Layout not found</h2>
          <p>Layout &quot;{layoutId}&quot; is not registered in the registry.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="preview-pane">
      <div className="preview-content" data-preview-scroll-container>
        <div
          className={`preview-device-frame device-${deviceMode}`}
          style={{
            maxWidth: deviceWidths[deviceMode],
            margin: deviceMode !== "desktop" ? "20px auto" : "0 auto",
          }}
        >
          <div className="preview-wrapper" data-edit-mode={editMode}>
            {/* Header is always rendered (required section) */}
            {Header && (
              <Header
                onLanguageClick={handleLanguageClick}
                translations={translations}
                currentLang={currentLang}
                config={currentInvitation.data}
              />
            )}
            {Blessings && <Blessings />}
            {/* Initialize scroll animations for editorial-elegance layout */}
            {ScrollAnimationsInit && layoutId === "editorial-elegance" && <ScrollAnimationsInit />}
            <main
              className={`page-shell ${layoutId === "editorial-elegance" ? "editorial-elegance" : ""}`}
              key={editMode ? "edit" : `view-${modeKey}`}
            >
              {/* Dynamically render enabled sections in order */}
              {mainSections.map((section, index) => renderSection(section, index))}

              {/* Footer is always rendered if enabled (required section) */}
              {isFooterEnabled &&
                Footer &&
                EditableFooter &&
                (editMode ? <EditableFooter {...editableProps} /> : <Footer {...viewProps} />)}
            </main>

            {ConfettiLayer && <ConfettiLayer />}
            {LanguageModal && (
              <LanguageModal
                isOpen={showLanguageModal}
                onClose={() => setShowLanguageModal(false)}
                onSelect={handleLanguageSelect}
                currentLang={currentLang}
                translations={translations}
              />
            )}
            {GuestNameModal && (
              <GuestNameModal
                isOpen={showGuestNameModal}
                onClose={() => setShowGuestNameModal(false)}
                translations={translations}
                currentLang={currentLang}
              />
            )}
            {RSVPModal && (
              <RSVPModal
                isOpen={showRSVPModal}
                onClose={() => setShowRSVPModal(false)}
                translations={translations}
                currentLang={currentLang}
                config={currentInvitation.data}
              />
            )}
          </div>
          {CelebrateButton && <CelebrateButton />}
        </div>
      </div>
    </div>
  );
}

export default PreviewPane;
