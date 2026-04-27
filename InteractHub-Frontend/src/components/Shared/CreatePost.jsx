import { useState } from "react";
import Avatar from "./Avatar";
import Icon from "./Icon";

export default function CreatePost({ currentUser, onPost }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  async function handlePost() {
    if (!text.trim()) return;
    
    try {
      setLoading(true);
      await onPost(text);
      setText('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card create-post" style={{ marginBottom: 12 }}>
      <div className="create-post-input">
        <Avatar user={currentUser} />
        <div className="create-post-area">
          <textarea 
            value={text} 
            onChange={e => setText(e.target.value)} 
            placeholder={`${currentUser?.userName || currentUser?.name || "Bạn"} ơi, bạn đang nghĩ gì vậy?`}
            disabled={loading}
          />
        </div>
      </div>
      <div className="create-post-actions">
        <button className="create-icon-btn">
          <Icon name="image" size={15} /> Ảnh
        </button>
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
          disabled={!text.trim() || loading} 
          style={{ opacity: text.trim() && !loading ? 1 : 0.5 }}
        >
          {loading ? 'Đang đăng...' : 'Đăng'}
        </button>
      </div>
    </div>
  );
}