import { useState } from "react";
import Avatar from "./Avatar";
import Icon from "./Icon";
import ImageUpload from "./ImageUpload";
import { uploadImage } from "../../services/uploadService";

export default function CreatePost({ currentUser, onPost }) {
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handlePost() {
    if (!text.trim() && !imageFile) return;

    try {
      setLoading(true);

      let finalImageUrl = null;

      // Upload ảnh nếu có
      if (imageFile) {
        const uploadResult = await uploadImage(imageFile);
        // Backend trả về: /uploads/images/xxx.jpg
        // Ghép với domain backend
        finalImageUrl = `http://localhost:5022${uploadResult.url}`;
      }

      await onPost(text, finalImageUrl);

      // Reset
      setText("");
      setImageFile(null);
      setImagePreview(null);
    } catch (err) {
      console.error(err);
      alert("Đăng bài thất bại!");
    } finally {
      setLoading(false);
    }
  }

  function handleImageSelect(file) {
    setImageFile(file);
    
    // Tạo preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  }

  function handleImageRemove() {
    setImageFile(null);
    setImagePreview(null);
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
        onImageSelect={handleImageSelect}
        onRemove={handleImageRemove}
        preview={imagePreview}
      />

      <div className="create-post-actions">
        {/* Nút Image đã move vào ImageUpload component */}
        
        <button className="create-icon-btn">
          <Icon name="video" size={15} /> Video
        </button>
        <button className="create-icon-btn">
          <Icon name="smile" size={15} /> Cảm xúc
        </button>
        <div style={{ flex: 1 }} />
        <button
          className="btn btn-primary btn-sm"
          onClick={handlePost}
          disabled={(!text.trim() && !imageFile) || loading}
          style={{ opacity: (text.trim() || imageFile) && !loading ? 1 : 0.5 }}
        >
          {loading ? "Đang đăng..." : "Đăng"}
        </button>
      </div>
    </div>
  );
}