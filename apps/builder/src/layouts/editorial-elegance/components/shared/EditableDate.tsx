import { useState, useRef, useEffect } from "react";
import { formatEventDate } from "../../utils/dateFormatter";
import "./EditableDate.css";

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
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [displayValue, setDisplayValue] = useState(value || "");
  const [isHovered, setIsHovered] = useState(false);
  const inputRef = useRef(null);

  // Update display value when external value changes
  useEffect(() => {
    if (!isEditing) {
      setDisplayValue(value || "");
    }
  }, [value, isEditing]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.showPicker?.();
    }
  }, [isEditing]);

  const handleClick = (e) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleChange = (e) => {
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

  const handleKeyDown = (e) => {
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
      {formatEventDate(displayValue) || <span className="editable-placeholder">{placeholder}</span>}
    </p>
  );
}

export default EditableDate;
