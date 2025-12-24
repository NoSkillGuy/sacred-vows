import { useState, useRef } from "react";
import "./EditableImage.css";
import ImageDeletionNotice from "../../../../components/AssetManager/ImageDeletionNotice";
import { uploadImage } from "../../../../services/assetService";
import { useToast } from "../../../../components/Toast/ToastProvider";

/**
 * EditableImage - WYSIWYG image editing component
 * Allows direct image replacement in the preview
 */
function EditableImage({ src, alt, onUpdate, path, className = "", ...props }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const { addToast } = useToast();

  const handleClick = (e) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Client-side validation
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];

    if (!file.type.startsWith("image/") || !allowedTypes.includes(file.type)) {
      addToast({
        tone: "error",
        title: "Invalid File",
        description: "Please select a valid image file (JPG, PNG, GIF, or WebP)",
        icon: "bell",
      });
      return;
    }

    if (file.size > maxSize) {
      addToast({
        tone: "error",
        title: "File Too Large",
        description: `File size exceeds ${maxSize / 1024 / 1024}MB limit`,
        icon: "bell",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Show temporary preview while uploading
      const tempUrl = URL.createObjectURL(file);

      const result = await uploadImage(file, (progress) => {
        setUploadProgress(progress);
      });

      // Clean up temp URL
      URL.revokeObjectURL(tempUrl);

      if (result.url) {
        onUpdate(path, result.url);
        addToast({
          tone: "info",
          title: "Image Updated",
          description: "Image has been successfully uploaded",
          icon: "heart",
        });
      } else {
        throw new Error("No URL returned from upload");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      addToast({
        tone: "error",
        title: "Upload Failed",
        description: error.message || "Failed to upload image. Please try again.",
        icon: "bell",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div
      className={`editable-image ${isHovered ? "hovered" : ""} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      data-editable="true"
      data-path={path}
      style={{ position: "relative", width: "100%", height: "100%", display: "block" }}
    >
      <img
        src={src}
        alt={alt}
        {...props}
        className={isUploading ? "uploading" : ""}
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      />
      {isUploading && (
        <div className="editable-image-upload-progress">
          <div className="editable-image-progress-bar">
            <div className="editable-image-progress-fill" style={{ width: `${uploadProgress}%` }} />
          </div>
          <span className="editable-image-progress-text">{Math.round(uploadProgress)}%</span>
        </div>
      )}
      {isHovered && !isUploading && (
        <div className="editable-image-overlay">
          <div className="editable-image-overlay-content">
            <span className="editable-image-icon">📷</span>
            <span className="editable-image-text">Click to change image</span>
            <ImageDeletionNotice variant="inline" />
          </div>
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
    </div>
  );
}

export default EditableImage;
