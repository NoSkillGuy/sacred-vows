import { useState, useRef, useEffect } from "react";
import { formatEventDate, isValidDate } from "../../utils/dateFormatter";
import "./EditableDate.css";

interface EditableDateProps {
  value?: string;
  onUpdate: (path: string, value: string) => void;
  path: string;
  className?: string;
  placeholder?: string;
  [key: string]: unknown;
}

/**
 * EditableDate - Inline editable date input component
 * Uses native HTML5 date picker
 */
function EditableDate({
  value,
  onUpdate,
  path,
  className = "",
  placeholder = "Click to set date...",
  ...props
}: EditableDateProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [displayValue, setDisplayValue] = useState(value || "");
  const [isHovered, setIsHovered] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update display value when external value changes
  // This is intentional - we need to sync external state to internal state when not editing
  useEffect(() => {
    if (!isEditing) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplayValue(value || "");
    }
  }, [value, isEditing]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      // Feature detection for showPicker() - not supported in all browsers
      if (typeof inputRef.current.showPicker === "function") {
        inputRef.current.showPicker();
      }
    }
  }, [isEditing]);

  const handleClick = (e: React.MouseEvent<HTMLParagraphElement>) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setDisplayValue(newValue);
  };

  const handleBlur = () => {
    const originalValue = value || "";
    if (displayValue !== originalValue) {
      onUpdate(path, displayValue);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      inputRef.current?.blur();
    }
    if (e.key === "Escape") {
      setDisplayValue(value || "");
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="date"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`editable-date editing ${className}`}
        onClick={(e) => e.stopPropagation()}
        {...props}
      />
    );
  }

  return (
    <p
      className={`editable-date ${isHovered ? "hovered" : ""} ${className}`}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-editable="true"
      data-path={path}
    >
      {isValidDate(displayValue) && formatEventDate(displayValue) ? (
        formatEventDate(displayValue)
      ) : (
        <span className="editable-placeholder">{placeholder}</span>
      )}
    </p>
  );
}

export default EditableDate;
