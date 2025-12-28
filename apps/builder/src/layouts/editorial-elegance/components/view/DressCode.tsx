interface DressCodeProps {
  _translations?: unknown;
  _currentLang?: string;
  config?: {
    dressCode?: {
      colors?: Array<
        | {
            value?: string;
            label?: string;
          }
        | string
      >;
      styleText?: string;
      inspirationImages?: Array<
        | {
            src?: string;
            alt?: string;
          }
        | string
      >;
    };
  };
}

/**
 * DressCode - Color palette swatches, style guide with inspiration grid
 * Fashion editorial aesthetic
 */
function DressCode({ _translations, _currentLang, config = {} }: DressCodeProps) {
  const dressCode = config.dressCode || {};
  const colors = dressCode.colors || [];
  const styleText = dressCode.styleText || "";
  const inspirationImages = dressCode.inspirationImages || [];

  return (
    <section className="ee-section ee-dress-code-section">
      <div className="ee-dress-code-container">
        <h2 className="ee-section-heading">Dress Code</h2>
        <div className="ee-divider" />

        {/* Style Description */}
        {styleText && <p className="ee-dress-code-text">{styleText}</p>}

        {/* Color Palette Swatches */}
        {colors.length > 0 && (
          <div className="ee-dress-code-colors">
            {colors.map((color, index) => (
              <div key={index} className="ee-color-swatch">
                <div
                  className="ee-color-swatch-circle"
                  style={{ backgroundColor: color.value || color }}
                />
                {color.label && <span className="ee-color-swatch-label">{color.label}</span>}
              </div>
            ))}
          </div>
        )}

        {/* Inspiration Grid */}
        {inspirationImages.length > 0 && (
          <div className="ee-dress-code-inspiration">
            {inspirationImages.map((image, index) => (
              <div key={index} className="ee-inspiration-image">
                <img src={image.src || image} alt={image.alt || `Inspiration ${index + 1}`} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default DressCode;
