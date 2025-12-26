import { useState, useRef, useEffect } from "react";
import "./EditableTime.css";

interface EditableTimeProps {
  value?: string;
  onUpdate: (path: string, value: string) => void;
  path: string;
  className?: string;
  placeholder?: string;
  [key: string]: unknown;
}

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
}: EditableTimeProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [displayValue, setDisplayValue] = useState(value || "");
  const [isHovered, setIsHovered] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Convert 12-hour format (e.g., "6:00 PM") to 24-hour format (e.g., "18:00")
  const convertTo24Hour = (time12h: string): string => {
    if (!time12h) return "";
    // More robust regex: handles times with/without leading zeros, optional seconds
    const time = time12h.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)$/i);
    if (!time) return time12h; // Return as-is if not in expected format

    let hours = parseInt(time[1], 10);
    const minutes = time[2];
    const ampm = time[4].toUpperCase();

    // Validate hours (1-12) and minutes (0-59)
    if (hours < 1 || hours > 12) {
      return time12h; // Return as-is if invalid
    }
    const minutesNum = parseInt(minutes, 10);
    if (minutesNum < 0 || minutesNum > 59) {
      return time12h; // Return as-is if invalid
    }

    if (ampm === "PM" && hours !== 12) {
      hours += 12;
    } else if (ampm === "AM" && hours === 12) {
      hours = 0;
    }

    return `${hours.toString().padStart(2, "0")}:${minutes}`;
  };

  // Convert 24-hour format (e.g., "18:00") to 12-hour format (e.g., "6:00 PM")
  const convertTo12Hour = (time24h: string): string => {
    if (!time24h) return "";
    // More robust regex: handles times with/without leading zeros, optional seconds
    const time = time24h.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
    if (!time) return time24h; // Return as-is if not in expected format

    let hours = parseInt(time[1], 10);
    const minutes = time[2];
    const ampm = hours >= 12 ? "PM" : "AM";

    // Validate hours (0-23) and minutes (0-59)
    if (hours < 0 || hours > 23) {
      return time24h; // Return as-is if invalid
    }
    const minutesNum = parseInt(minutes, 10);
    if (minutesNum < 0 || minutesNum > 59) {
      return time24h; // Return as-is if invalid
    }

    if (hours > 12) {
      hours -= 12;
    } else if (hours === 0) {
      hours = 12;
    }

    return `${hours}:${minutes} ${ampm}`;
  };

  // Update display value when external value changes (only when not editing)
  useEffect(() => {
    if (!isEditing) {
      // Keep original 12-hour format for display
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplayValue(value || "");
    }
  }, [value, isEditing]);

  // Initialize display value when entering edit mode
  // Note: Only depends on isEditing to avoid updating when value changes while editing
  useEffect(() => {
    if (isEditing) {
      // Convert to 24-hour format for the input
      const time24h = convertTo24Hour(value || "");
      setDisplayValue(time24h);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing]);

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
    // Convert back to 12-hour format for storage
    const time24h = displayValue;
    const time12h = convertTo12Hour(time24h);
    const originalValue = value || "";

    if (time12h !== originalValue) {
      onUpdate(path, time12h);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
