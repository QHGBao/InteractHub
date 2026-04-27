import { useState, useRef } from "react";
import Icon from "./Icon";

export default function ImageUpload({ onImageSelect, onRemove, preview }) {
  const fileInputRef = useRef(null);

  function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Chỉ chấp nhận file ảnh!");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("File quá lớn! Tối đa 10MB");
      return;
    }

    onImageSelect && onImageSelect(file);
  }

  function handleRemove() {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onRemove && onRemove();
  }

  return (
    <div>
      {!preview ? (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: "none" }}
            id="image-upload-input"
          />
          <label htmlFor="image-upload-input" className="create-icon-btn" style={{ cursor: 'pointer' }}>
            <Icon name="image" size={15} /> Ảnh
          </label>
        </>
      ) : (
        <div style={{ position: "relative", marginTop: 12 }}>
          <img
            src={preview}
            alt="Preview"
            style={{
              width: "100%",
              maxHeight: 400,
              objectFit: "cover",
              borderRadius: 12,
            }}
          />
          <button
            type="button"
            onClick={handleRemove}
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
      )}
    </div>
  );
}