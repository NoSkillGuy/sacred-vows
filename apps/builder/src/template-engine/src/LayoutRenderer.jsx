import React from 'react';
import { loadLayout, mergeLayoutData } from './loadLayout';
import { applyThemeToDocument, mergeBrandThemes } from '../../shared/src/theme/applyTheme';

const DEFAULT_LAYOUT_ID = 'royal-elegance';

function mergeSections(baseSections = [], overrides = []) {
  const sectionMap = new Map(
    baseSections.map((section) => [section.id, { enabled: true, ...section }]),
  );

  overrides.forEach((override) => {
    if (!override?.id) return;
    const existing = sectionMap.get(override.id) || { id: override.id, enabled: true };
    sectionMap.set(override.id, { ...existing, ...override });
  });

  return Array.from(sectionMap.values());
}

function orderSections(sections = [], defaultOrder = []) {
  const orderIndex = (id) => {
    const idx = defaultOrder.indexOf(id);
    return idx === -1 ? Number.MAX_SAFE_INTEGER : idx;
  };

  return sections
    .filter((section) => section.enabled !== false)
    .sort((a, b) => {
      const aOrder = a.order ?? orderIndex(a.id);
      const bOrder = b.order ?? orderIndex(b.id);
      return aOrder - bOrder;
    });
}

function resolveTheme(layoutTheme = {}, manifest = {}, userTheme = {}) {
  const manifestDefault = manifest.themes?.find((theme) => theme.isDefault) || {};
  const merged = mergeBrandThemes(manifestDefault, layoutTheme, userTheme);
  return {
    ...merged,
    preset: userTheme?.preset || layoutTheme?.preset || manifestDefault.id || merged.preset || 'custom',
  };
}

function getSectionProps(sectionId, commonProps) {
  switch (sectionId) {
    case 'header':
      return { ...commonProps, onLanguageClick: commonProps.onLanguageClick };
    case 'hero':
      return { ...commonProps, onRSVPClick: commonProps.onRSVPClick };
    case 'rsvp':
      return { ...commonProps, onRSVPClick: commonProps.onRSVPClick };
    default:
      return commonProps;
  }
}

/**
 * Layout Renderer Component
 * Renders a layout with provided data
 */
export function LayoutRenderer({ layoutId, userData, translations, currentLang, onRSVPClick, onLanguageClick }) {
  const [mergedConfig, setMergedConfig] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const layoutToLoad = layoutId || DEFAULT_LAYOUT_ID;
        const definition = await loadLayout(layoutToLoad);

        // Universal content base (sample data for now)
        const { defaultWeddingConfig } = await import('../../../src/config/wedding-config');
        const contentConfig = mergeLayoutData(defaultWeddingConfig, userData || {});

        // Section ordering and theme resolution
        const userLayoutConfig = userData?.layoutConfig || {};
        const combinedSections = mergeSections(
          definition.config?.sections || [],
          userLayoutConfig.sections || [],
        );
        const orderedSections = orderSections(
          combinedSections,
          definition.manifest?.defaultSectionOrder || [],
        );
        const theme = resolveTheme(
          definition.config?.theme || {},
          definition.manifest || {},
          userLayoutConfig.theme || {},
        );

        const merged = {
          ...contentConfig,
          sections: orderedSections,
          theme,
          layoutMeta: {
            id: definition.config?.id || definition.manifest?.id || layoutToLoad,
            name: definition.config?.name || definition.manifest?.name,
            version: definition.config?.version || definition.manifest?.version,
            metadata: definition.config?.metadata,
            manifest: definition.manifest,
          },
        };

        setMergedConfig(merged);
        setError(null);
      } catch (err) {
        console.error('Error loading layout:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [layoutId, userData]);

  React.useEffect(() => {
    if (mergedConfig?.theme) {
      applyThemeToDocument(mergedConfig.theme);
    }
  }, [mergedConfig?.theme]);

  if (loading) {
    return <div>Loading layout...</div>;
  }

  if (error) {
    return <div>Error loading layout: {error}</div>;
  }

  if (!mergedConfig) {
    return <div>No layout configuration available</div>;
  }

  // Dynamically import layout components
  const LayoutComponents = React.lazy(() => 
    import('../../../src/components').then(components => ({
      default: () => (
        <main className="page-shell">
          {(() => {
            const registry = {
              header: components.Header || require('../../../src/components/Header').default,
              hero: components.Hero || require('../../../src/components/Hero').default,
              couple: components.Couple || require('../../../src/components/Couple').default,
              'fathers-letter': components.FathersLetter || require('../../../src/components/FathersLetter').default,
              gallery: components.Gallery || require('../../../src/components/Gallery').default,
              events: components.Events || require('../../../src/components/Events').default,
              venue: components.Venue || require('../../../src/components/Venue').default,
              rsvp: components.RSVP || require('../../../src/components/RSVP').default,
              footer: components.Footer || require('../../../src/components/Footer').default,
            };

            const commonProps = {
              translations,
              currentLang,
              config: mergedConfig,
              onRSVPClick,
              onLanguageClick,
            };

            const sectionsToRender = mergedConfig.sections || [];

            return sectionsToRender.map((section) => {
              const SectionComponent = registry[section.id];

              if (!SectionComponent) {
                console.warn(`Section component not found for id: ${section.id}`);
                return null;
              }

              const sectionProps = getSectionProps(section.id, commonProps);

              return (
                <SectionComponent
                  key={section.id}
                  {...sectionProps}
                />
              );
            });
          })()}
        </main>
      ),
    }))
  );

  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <LayoutComponents />
    </React.Suspense>
  );
}

export default LayoutRenderer;
