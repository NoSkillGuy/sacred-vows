// createElement removed - unused
import EditableText from "./EditableText";
import EditableImage from "./EditableImage";
import { useEditable } from "../../hooks/useEditable";

/**
 * EditableWrapper - HOC that makes components editable
 * Wraps components and adds WYSIWYG editing capabilities
 */
export function withEditable(Component, editableFields = {}) {
  return function EditableComponent({ config, ...props }) {
    const { handleUpdate } = useEditable();

    // Create editable config by replacing specified fields with editable components
    const editableConfig = { ...config };

    Object.entries(editableFields).forEach(([path, fieldConfig]) => {
      const keys = path.split(".");
      let current = editableConfig;

      // Navigate to the field location
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }

      const fieldKey = keys[keys.length - 1];
      const fieldValue = current[fieldKey];

      // Replace with editable component
      if (fieldConfig.type === "image") {
        current[fieldKey] = (
          <EditableImage
            src={fieldValue}
            alt={fieldConfig.alt || ""}
            onUpdate={handleUpdate}
            path={path}
            className={fieldConfig.className}
          />
        );
      } else {
        current[fieldKey] = (
          <EditableText
            value={fieldValue}
            onUpdate={handleUpdate}
            path={path}
            className={fieldConfig.className}
            tag={fieldConfig.tag || "div"}
            placeholder={fieldConfig.placeholder}
            multiline={fieldConfig.multiline}
          />
        );
      }
    });

    return <Component config={editableConfig} {...props} />;
  };
}

export default withEditable;
