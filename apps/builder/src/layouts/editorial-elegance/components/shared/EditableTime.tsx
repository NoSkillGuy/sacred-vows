import { useState, useRef, useEffect } from "react";
import "./EditableTime.css";

/**
 * EditableTime - Inline editable time input component
 * Uses native HTML5 time picker
 */
function EditableTime({
  value,
  onUpdate,
  path,
  className = "",
  placeholder = "Click to set time...",
  ...props
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [displayValue, setDisplayValue] = useState(value || "");
  const [isHovered, setIsHovered] = useState(false);
  const inputRef = useRef(null);

  // Convert 12-hour format (e.g., "6:00 PM") to 24-hour format (e.g., "18:00")
  const convertTo24Hour = (time12h) => {
    if (!time12h) return "";
    const time = time12h.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!time) return time12h; // Return as-is if not in expected format

    let hours = parseInt(time[1], 10);
    const minutes = time[2];
    const ampm = time[3].toUpperCase();

    if (ampm === "PM" && hours !== 12) {
      hours += 12;
    } else if (ampm === "AM" && hours === 12) {
      hours = 0;
    }

    return `${hours.toString().padStart(2, "0")}:${minutes}`;
  };

  // Convert 24-hour format (e.g., "18:00") to 12-hour format (e.g., "6:00 PM")
  const convertTo12Hour = (time24h) => {
    if (!time24h) return "";
    const time = time24h.match(/(\d+):(\d+)/);
    if (!time) return time24h; // Return as-is if not in expected format

    let hours = parseInt(time[1], 10);
    const minutes = time[2];
    const ampm = hours >= 12 ? "PM" : "AM";

    if (hours > 12) {
      hours -= 12;
    } else if (hours === 0) {
      hours = 12;
    }

    return `${hours}:${minutes} ${ampm}`;
  };

  // Initialize display value when entering edit mode
  useEffect(() => {
    if (isEditing) {
      // Convert to 24-hour format for the input
      const time24h = convertTo24Hour(value || "");
      setDisplayValue(time24h);
    } else {
      // Keep original 12-hour format for display
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
    // Convert back to 12-hour format for storage
    const time24h = displayValue;
    const time12h = convertTo12Hour(time24h);
    const originalValue = value || "";

    if (time12h !== originalValue) {
      onUpdate(path, time12h);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      inputRef.current?.blur();
    }
    if (e.key === "Escape") {
      setDisplayValue(value ? convertTo24Hour(value) : "");
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="time"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`editable-time editing ${className}`}
        onClick={(e) => e.stopPropagation()}
        {...props}
      />
    );
  }

  return (
    <p
      className={`editable-time ${isHovered ? "hovered" : ""} ${className}`}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-editable="true"
      data-path={path}
    >
      {value || <span className="editable-placeholder">{placeholder}</span>}
    </p>
  );
}

export default EditableTime;
