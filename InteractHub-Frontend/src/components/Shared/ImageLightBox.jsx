import { useState, useEffect } from "react";
import Icon from "./Icon";

export default function ImageLightbox({ images, initialIndex = 0, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Parse images nếu là JSON string
  const imageArray = typeof images === 'string' && images.startsWith('[') 
    ? JSON.parse(images) 
    : Array.isArray(images) 
    ? images 
    : [images];

  const currentImage = imageArray[currentIndex];
  const hasMultiple = imageArray.length > 1;

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex]);

  function prev() {
    setCurrentIndex((i) => (i === 0 ? imageArray.length - 1 : i - 1));
  }

  function next() {
    setCurrentIndex((i) => (i === imageArray.length - 1 ? 0 : i + 1));
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.95)",
        zIndex: 999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          background: "rgba(255,255,255,0.1)",
          border: "1px solid rgba(255,255,255,0.2)",
          borderRadius: "50%",
          width: 40,
          height: 40,
          color: "#fff",
          cursor: "pointer",
          fontSize: 24,
        }}
      >
        ×
      </button>

      {/* Image counter */}
      {hasMultiple && (
        <div
          style={{
            position: "absolute",
            top: 20,
            left: "50%",
            transform: "translateX(-50%)",
            color: "#fff",
            fontSize: 14,
            background: "rgba(0,0,0,0.5)",
            padding: "6px 12px",
            borderRadius: 20,
          }}
        >
          {currentIndex + 1} / {imageArray.length}
        </div>
      )}

      {/* Previous button */}
      {hasMultiple && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            prev();
          }}
          style={{
            position: "absolute",
            left: 20,
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "50%",
            width: 50,
            height: 50,
            color: "#fff",
            cursor: "pointer",
            fontSize: 24,
          }}
        >
          ‹
        </button>
      )}

      {/* Image */}
      <img
        src={currentImage}
        alt="Full size"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "90vw",
          maxHeight: "90vh",
          objectFit: "contain",
          borderRadius: 8,
        }}
      />

      {/* Next button */}
      {hasMultiple && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            next();
          }}
          style={{
            position: "absolute",
            right: 20,
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "50%",
            width: 50,
            height: 50,
            color: "#fff",
            cursor: "pointer",
            fontSize: 24,
          }}
        >
          ›
        </button>
      )}
    </div>
  );
}