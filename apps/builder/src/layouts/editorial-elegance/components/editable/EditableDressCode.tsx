import EditableText from "../shared/EditableText";
import EditableImage from "../shared/EditableImage";

interface EditableDressCodeProps {
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
  onUpdate?: (path: string, value: unknown) => void;
}

/**
 * EditableDressCode - Color picker, style text, inspiration images
 */
function EditableDressCode({
  _translations,
  _currentLang,
  config = {},
  onUpdate,
}: EditableDressCodeProps) {
  const dressCode = config.dressCode || {};
  const colors = dressCode.colors || [];
  const styleText = dressCode.styleText || "";
  const inspirationImages = dressCode.inspirationImages || [];

  const handleAddColor = () => {
    const newColors = [...colors, { value: "#000000", label: "" }];
    if (onUpdate) {
      onUpdate("dressCode.colors", newColors);
    }
  };

  const handleUpdateColor = (index: number, field: string, value: string) => {
    const updated = [...colors];
    updated[index] = { ...updated[index], [field]: value };
    if (onUpdate) {
      onUpdate("dressCode.colors", updated);
    }
  };

  const handleAddImage = () => {
    const newImages = [...inspirationImages, { src: "", alt: "" }];
    if (onUpdate) {
      onUpdate("dressCode.inspirationImages", newImages);
    }
  };

  const handleUpdateImage = (index: number, field: string, value: string) => {
    const updated = [...inspirationImages];
    updated[index] = { ...updated[index], [field]: value };
    if (onUpdate) {
      onUpdate("dressCode.inspirationImages", updated);
    }
  };

  return (
    <section className="ee-section ee-dress-code-section">
      <div className="ee-dress-code-container">
        <h2 className="ee-section-heading">Dress Code</h2>
        <div className="ee-divider" />

        {/* Style Description */}
        <EditableText
          value={styleText}
          onUpdate={onUpdate}
          path="dressCode.styleText"
          className="ee-dress-code-text"
          tag="p"
          multiline={true}
        />

        {/* Color Palette Swatches */}
        <div className="ee-dress-code-colors">
          {colors.map((color, index) => (
            <div key={index} className="ee-color-swatch">
              <div
                className="ee-color-swatch-circle"
                style={{ backgroundColor: color.value || color }}
              />
              <input
                type="color"
                value={color.value || color}
                onChange={(e) => handleUpdateColor(index, "value", e.target.value)}
                className="ee-color-picker"
              />
              <EditableText
                value={color.label || ""}
                onUpdate={(path, value) => handleUpdateColor(index, "label", value)}
                className="ee-color-swatch-label"
                tag="span"
              />
            </div>
          ))}
          <button onClick={handleAddColor} className="ee-add-button" type="button">
            + Add Color
          </button>
        </div>

        {/* Inspiration Grid */}
        <div className="ee-dress-code-inspiration">
          {inspirationImages.map((image, index) => (
            <div key={index} className="ee-inspiration-image">
              <EditableImage
                src={image.src || image}
                alt={image.alt || `Inspiration ${index + 1}`}
                onUpdate={onUpdate}
                path={`dressCode.inspirationImages.${index}.src`}
              />
            </div>
          ))}
          <button onClick={handleAddImage} className="ee-add-button" type="button">
            + Add Inspiration Image
          </button>
        </div>
      </div>
    </section>
  );
}

export default EditableDressCode;
