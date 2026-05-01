import { useState, useRef } from "react";
import Avatar from "./Avatar";
import ImageUpload from "./ImageUpload";
import RichText from "./RichText";
import SuggestionDropdown from "./SuggestionDropdown";
import { uploadMultipleImages } from "../../services/uploadService";
import { useHashtagMention } from "../../hooks/useHashtagMention";

export default function CreatePost({ currentUser, onPost }) {
  const [text, setText] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);

  // ── Hashtag / Mention ──
  const textareaRef = useRef(null);
  const { suggestions, suggestionType, handleTextChange, applySuggestion, closeSuggestions } =
    useHashtagMention();

  function handleChange(e) {
    const val = e.target.value;
    setText(val);
    handleTextChange(val, e.target.selectionStart);
  }

  function handleSelectSuggestion(item) {
    const ta = textareaRef.current;
    const cur = ta?.selectionStart ?? text.length;
    const { newText, newCursor } = applySuggestion(text, cur, item, suggestionType);
    setText(newText);
    closeSuggestions();
    setTimeout(() => { ta?.focus(); ta?.setSelectionRange(newCursor, newCursor); }, 0);
  }
  // ──────────────────────

  // Giữ nguyên hoàn toàn
  async function handlePost() {
    if (!text.trim() && imageFiles.length === 0) return;
    try {
      setLoading(true);
      let imageUrls = null;
      if (imageFiles.length > 0) {
        const urls = await uploadMultipleImages(imageFiles);
        imageUrls = JSON.stringify(urls);
      }
      await onPost(text, imageUrls);
      setText("");
      setImageFiles([]);
      setImagePreviews([]);
    } catch (err) {
      console.error(err);
      alert("Đăng bài thất bại!");
    } finally {
      setLoading(false);
    }
  }

  function handleImagesSelect(files) {
    setImageFiles(files);
    const readers = files.map(file => new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(file);
    }));
    Promise.all(readers).then(setImagePreviews);
  }

  function handleRemoveImage(index) {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="card create-post" style={{ marginBottom: 12 }}>
      <div className="create-post-input">
        <Avatar user={currentUser} />
        {/* Chỉ thêm ref + handler + dropdown, giữ nguyên class */}
        <div className="create-post-area" style={{ position: "relative" }}>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleChange}
            onKeyDown={e => { if (e.key === "Escape") closeSuggestions(); }}
            onBlur={() => setTimeout(closeSuggestions, 150)}
            placeholder={`${currentUser?.userName || currentUser?.name || "Bạn"} ơi, bạn đang nghĩ gì vậy?`}
            disabled={loading}
          />
          {suggestions.length > 0 && (
            <SuggestionDropdown
              suggestions={suggestions}
              type={suggestionType}
              onSelect={handleSelectSuggestion}
            />
          )}
        </div>
      </div>

      {/* Preview hashtag */}
      {/#\w+/.test(text) && text.trim() && (
        <div style={{
          margin: "8px 0 0", padding: "10px 14px",
          background: "var(--bg2)", borderRadius: 10, fontSize: 14,
          borderLeft: "3px solid var(--primary, #6366f1)",
        }}>
          <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 4 }}>Xem trước</div>
          <RichText text={text} />
        </div>
      )}

      <ImageUpload
        onImagesSelect={handleImagesSelect}
        onRemove={handleRemoveImage}
        previews={imagePreviews}
      />

      <div className="create-post-actions">
        <div style={{ flex: 1 }} />
        <button
          className="btn btn-primary btn-sm"
          onClick={handlePost}
          disabled={(!text.trim() && imageFiles.length === 0) || loading}
          style={{ opacity: (text.trim() || imageFiles.length > 0) && !loading ? 1 : 0.5 }}
        >
          {loading ? "Đang đăng..." : "Đăng"}
        </button>
      </div>
    </div>
  );
}