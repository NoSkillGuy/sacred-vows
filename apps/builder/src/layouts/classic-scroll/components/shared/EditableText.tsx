import { useState, useRef, useEffect, useCallback } from "react";
import "./EditableText.css";

/**
 * EditableText - WYSIWYG text editing component
 *
 * Uses an UNCONTROLLED approach for contentEditable to prevent React's
 * reconciliation from fighting with the browser's native input handling.
 *
 * Key principle: Let the browser handle all typing natively, only read
 * the final value when the user finishes editing (on blur).
 */
function EditableText({
  children,
  value,
  onUpdate,
  path,
  className = "",
  tag = "div",
  placeholder = "Click to edit...",
  multiline = false,
  ...props
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [displayValue, setDisplayValue] = useState(value || children || "");
  const [isHovered, setIsHovered] = useState(false);
  const elementRef = useRef(null);
  const editRef = useRef(null);
  // Track if we're currently setting up the edit mode
  const isSettingUpRef = useRef(false);
  // Track if we just finished editing - prevents sync from overwriting our value
  const justFinishedEditingRef = useRef(false);

  // Update display value when external value changes (but not during editing or just after)
  useEffect(() => {
    // Skip sync if we're editing or just finished editing
    if (isEditing) {
      return;
    }

    // If we just finished editing, skip this sync and reset the flag
    if (justFinishedEditingRef.current) {
      justFinishedEditingRef.current = false;
      return;
    }

    // Only sync from props when we're not in any edit-related state
    const newValue = value || children || "";
    if (newValue !== displayValue) {
      setDisplayValue(newValue);
    }
  }, [value, children, isEditing]);

  const handleClick = (e) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleBlur = useCallback(() => {
    // Don't process blur during setup
    if (isSettingUpRef.current) {
      return;
    }

    if (editRef.current) {
      const newValue = editRef.current.textContent || "";

      // Mark that we just finished editing - this prevents the sync effect
      // from overwriting our displayValue before the store updates propagate
      justFinishedEditingRef.current = true;

      // Update local display value first
      setDisplayValue(newValue);

      // Exit edit mode
      setIsEditing(false);

      // Notify parent of the change
      const originalValue = value || children || "";
      if (newValue !== originalValue) {
        onUpdate(path, newValue);
      }
    } else {
      setIsEditing(false);
    }
  }, [value, children, onUpdate, path]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !multiline) {
      e.preventDefault();
      editRef.current?.blur();
    }
    if (e.key === "Escape") {
      // Reset content to original value before blur
      if (editRef.current) {
        editRef.current.textContent = value || children || "";
      }
      justFinishedEditingRef.current = true;
      setDisplayValue(value || children || "");
      setIsEditing(false);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");

    // Insert text at cursor position using Selection API
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();

      const textNode = document.createTextNode(text);
      range.insertNode(textNode);

      // Move cursor after inserted text
      range.setStartAfter(textNode);
      range.setEndAfter(textNode);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  };

  // Focus and position cursor when entering edit mode
  useEffect(() => {
    if (isEditing && editRef.current) {
      isSettingUpRef.current = true;
      const el = editRef.current;

      // Set the initial content directly on DOM
      el.textContent = displayValue;

      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        if (!editRef.current) {
          isSettingUpRef.current = false;
          return;
        }

        el.focus();

        // Move cursor to end of content
        try {
          const range = document.createRange();
          const selection = window.getSelection();

          if (el.childNodes.length > 0) {
            // If there's text content, position at the end
            const textNode = el.childNodes[el.childNodes.length - 1];
            if (textNode.nodeType === Node.TEXT_NODE) {
              range.setStart(textNode, textNode.length);
              range.setEnd(textNode, textNode.length);
            } else {
              range.selectNodeContents(el);
              range.collapse(false);
            }
          } else {
            // Empty element
            range.setStart(el, 0);
            range.collapse(true);
          }

          selection.removeAllRanges();
          selection.addRange(range);
        } catch (error) {
          // Fallback: just let the focus work
          console.warn("Could not position cursor:", error);
        }

        isSettingUpRef.current = false;
      });
    }
  }, [isEditing]); // Intentionally not including displayValue to prevent re-runs

  const Tag = tag;

  if (isEditing) {
    // IMPORTANT: No children/content rendered by React during editing!
    // Content is set via DOM manipulation in the useEffect above.
    // This prevents React from fighting with browser's native input.
    return (
      <Tag
        {...props}
        ref={editRef}
        contentEditable
        suppressContentEditableWarning
        className={`editable-text editing ${className}`}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        // NO onInput handler - let browser handle typing completely
        // NO children - we set content via DOM, not React
      />
    );
  }

  return (
    <Tag
      {...props}
      ref={elementRef}
      className={`editable-text ${isHovered ? "hovered" : ""} ${className}`}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-editable="true"
      data-path={path}
    >
      {displayValue || <span className="editable-placeholder">{placeholder}</span>}
    </Tag>
  );
}

export default EditableText;
