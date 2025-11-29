import React from 'react';
import { mergeTemplateData } from './loadTemplate';

/**
 * Template Renderer Component
 * Renders a template with provided data
 */
export function TemplateRenderer({ templateId, userData, translations, currentLang, onRSVPClick, onLanguageClick }) {
  const [templateConfig, setTemplateConfig] = React.useState(null);
  const [mergedConfig, setMergedConfig] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        // In a real implementation, this would load the template dynamically
        // For now, we'll use the default config from the main app
        const { defaultWeddingConfig } = await import('../../../src/config/wedding-config');
        const config = defaultWeddingConfig;
        
        setTemplateConfig(config);
        const merged = mergeTemplateData(config, userData || {});
        setMergedConfig(merged);
        setError(null);
      } catch (err) {
        console.error('Error loading template:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (templateId) {
      load();
    }
  }, [templateId, userData]);

  if (loading) {
    return <div>Loading template...</div>;
  }

  if (error) {
    return <div>Error loading template: {error}</div>;
  }

  if (!mergedConfig) {
    return <div>No template configuration available</div>;
  }

  // Dynamically import template components
  // In a real implementation, this would load template-specific components
  // For now, we'll use the existing components from the main app
  const TemplateComponents = React.lazy(() => 
    import('../../../src/components').then(components => ({
      default: () => (
        <>
          {React.createElement(components.Header || require('../../../src/components/Header').default, {
            onLanguageClick,
            translations,
            currentLang,
            config: mergedConfig,
          })}
          <main className="page-shell">
            {React.createElement(components.Hero || require('../../../src/components/Hero').default, {
              onRSVPClick,
              translations,
              currentLang,
              config: mergedConfig,
            })}
            {React.createElement(components.Couple || require('../../../src/components/Couple').default, {
              translations,
              currentLang,
              config: mergedConfig,
            })}
            {React.createElement(components.FathersLetter || require('../../../src/components/FathersLetter').default, {
              translations,
              currentLang,
              config: mergedConfig,
            })}
            {React.createElement(components.Gallery || require('../../../src/components/Gallery').default, {
              translations,
              currentLang,
              config: mergedConfig,
            })}
            {React.createElement(components.Events || require('../../../src/components/Events').default, {
              translations,
              currentLang,
              config: mergedConfig,
            })}
            {React.createElement(components.Venue || require('../../../src/components/Venue').default, {
              translations,
              currentLang,
              config: mergedConfig,
            })}
            {React.createElement(components.RSVP || require('../../../src/components/RSVP').default, {
              onRSVPClick,
              translations,
              currentLang,
              config: mergedConfig,
            })}
            {React.createElement(components.Footer || require('../../../src/components/Footer').default, {
              translations,
              currentLang,
            })}
          </main>
        </>
      ),
    }))
  );

  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <TemplateComponents />
    </React.Suspense>
  );
}

export default TemplateRenderer;

