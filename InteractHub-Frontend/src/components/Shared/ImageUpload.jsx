import { useState, useRef } from "react";
import Icon from "./Icon";

export default function ImageUpload({ onImagesSelect, onRemove, previews = [] }) {
  const fileInputRef = useRef(null);

  function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const validFiles = files.filter(file => {
      if (!file.type.startsWith("image/")) {
        alert(`${file.name} không phải ảnh!`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert(`${file.name} quá lớn! Tối đa 10MB`);
        return false;
      }
      return true;
    });
    if (validFiles.length > 0) {
      onImagesSelect && onImagesSelect(validFiles);
    }
  }

  function handleRemove(index) {
    onRemove && onRemove(index);
  }

  return (
    <div>
      {previews.length === 0 ? (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            style={{ display: "none" }}
            id="image-upload-input"
          />
          
          <label htmlFor="image-upload-input" className="create-icon-btn" style={{ cursor: 'pointer' }}>
            <Icon name="image" size={15} /> Ảnh
          </label>
        </>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: previews.length === 1 ? '1fr' : 'repeat(2, 1fr)',
          gap: 8,
          marginTop: 12
        }}>
          {previews.map((preview, index) => (
            <div key={index} style={{ position: "relative" }}>
              <img
                src={preview}
                alt={`Preview ${index + 1}`}
                style={{
                  width: "100%",
                  height: previews.length === 1 ? 400 : 200,
                  objectFit: "cover",
                  borderRadius: 12,
                }}
              />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  background: "rgba(0,0,0,0.7)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "50%",
                  width: 32,
                  height: 32,
                  cursor: "pointer",
                  fontSize: 20,
                  lineHeight: "32px",
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}