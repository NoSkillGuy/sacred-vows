interface RegistryProps {
  _translations?: unknown;
  _currentLang?: string;
  config?: {
    registry?: {
      introText?: string;
      links?: Array<{
        label?: string;
        url?: string;
      }>;
    };
  };
}

/**
 * Registry - Minimal gift registry with soft copy
 * "Your presence is our present" editorial angle
 */
function Registry({ _translations, _currentLang, config = {} }: RegistryProps) {
  const registry = config.registry || {};
  const introText = registry.introText || "Your presence is our present";
  const links = registry.links || [];

  return (
    <section className="ee-section ee-registry-section">
      <div className="ee-registry-container">
        <h2 className="ee-section-heading">Registry</h2>
        <div className="ee-divider" />

        {/* Soft Copy */}
        {introText && <p className="ee-registry-intro">{introText}</p>}

        {/* Minimal Links */}
        {links.length > 0 && (
          <div className="ee-registry-links">
            {links.map((link, index) => (
              <a
                key={index}
                href={link.url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="ee-link ee-registry-link"
              >
                {link.label || link.url}
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default Registry;
