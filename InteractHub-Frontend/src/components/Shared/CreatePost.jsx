import { useState } from "react";
import Avatar from "./Avatar";
import ImageUpload from "./ImageUpload";
import { uploadMultipleImages } from "../../services/uploadService";

export default function CreatePost({ currentUser, onPost }) {
  const [text, setText] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);

  async function handlePost() {
    if (!text.trim() && imageFiles.length === 0) return;

    try {
      setLoading(true);

      let imageUrls = null;

      // Upload ảnh nếu có
      if (imageFiles.length > 0) {
        const urls = await uploadMultipleImages(imageFiles);
        imageUrls = JSON.stringify(urls); // ← Convert to JSON string
      }

      await onPost(text, imageUrls);

      // Reset
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
    
    // Tạo previews cho tất cả ảnh
    const readers = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });

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
        <div className="create-post-area">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`${
              currentUser?.userName || currentUser?.name || "Bạn"
            } ơi, bạn đang nghĩ gì vậy?`}
            disabled={loading}
          />
        </div>
      </div>

      {/* Image Preview */}
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