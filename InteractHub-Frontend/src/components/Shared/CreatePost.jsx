import { useState, useRef } from "react";
import Avatar from "./Avatar";
import Icon from "./Icon";
import ImageUpload from "./ImageUpload";
import { uploadMultipleImages } from "../../services/uploadService";

export default function CreatePost({ currentUser, onPost }) {
  const [text, setText] = useState("");
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const fileInputRef = useRef(null); // ← Ref cho input

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
      {/* Textarea */}
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

      {/* ✅ Preview ảnh (nếu có) */}
      <ImageUpload
        onImagesSelect={handleImagesSelect}
        onRemove={handleRemoveImage}
        previews={imagePreviews}
        fileInputRef={fileInputRef}
      />

      {/* ✅ Actions: Nút Ảnh (trái) và Nút Đăng (phải) */}
      <div className="create-post-actions">
        {/* Nút Ảnh - BÊN TRÁI */}
        <label 
          htmlFor="image-upload-input" 
          className="create-icon-btn" 
          style={{ cursor: 'pointer' }}
        >
          <Icon name="image" size={15} /> Ảnh
        </label>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Nút Đăng - BÊN PHẢI */}
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