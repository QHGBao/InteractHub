import { useState, useEffect } from "react";
import { commentApi } from "../../api/commentApi";
import { likeApi } from "../../api/likeApi";
import { useAuth } from "../../context/AuthContext";
import Avatar from "./Avatar";

export default function ImageLightbox({ images, initialIndex = 0, onClose, post = null }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post?.likesCount || 0);
  const { user } = useAuth();

  const imageArray = typeof images === 'string' && images.startsWith('[')
    ? JSON.parse(images)
    : Array.isArray(images) ? images : [images];

  const currentImage = imageArray[currentIndex];
  const hasMultiple = imageArray.length > 1;
  const showSidebar = post !== null; // có post mới hiện sidebar

  useEffect(() => {
    if (post?.id) loadComments();
  }, [post?.id]);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex]);

  async function loadComments() {
    try {
      const data = await commentApi.getComments(post.id);
      setComments(data || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleAddComment() {
    if (!commentText.trim()) return;
    try {
      setSubmitting(true);
      await commentApi.createComment(post.id, { content: commentText, parentCommentId: null });
      await loadComments();
      setCommentText("");
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLike() {
    try {
      const result = await likeApi.toggleLike(post.id);
      setLiked(result.isLiked);
      setLikesCount(result.likesCount);
    } catch (err) {
      console.error(err);
    }
  }

  function prev() {
    setCurrentIndex(i => i === 0 ? imageArray.length - 1 : i - 1);
  }

  function next() {
    setCurrentIndex(i => i === imageArray.length - 1 ? 0 : i + 1);
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.95)",
        zIndex: 999, display: "flex",
      }}
    >
      {/* Nút đóng */}
      <button
        onClick={onClose}
        style={{
          position: "fixed", top: 16, left: 16, zIndex: 1000,
          background: "rgba(255,255,255,0.1)", border: "none",
          borderRadius: "50%", width: 40, height: 40,
          color: "#fff", cursor: "pointer", fontSize: 22,
          display: "flex", alignItems: "center", justifyContent: "center"
        }}
      >✕</button>

      {/* PHẦN TRÁI: Ảnh */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          flex: 1, display: "flex",
          alignItems: "center", justifyContent: "center",
          position: "relative", background: "#000"
        }}
      >
        {/* Counter */}
        {hasMultiple && (
          <div style={{
            position: "absolute", top: 16, left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(0,0,0,0.6)", color: "#fff",
            padding: "4px 12px", borderRadius: 20, fontSize: 13
          }}>
            {currentIndex + 1} / {imageArray.length}
          </div>
        )}

        {/* Nút trái */}
        {hasMultiple && (
          <button
            onClick={e => { e.stopPropagation(); prev(); }}
            style={{
              position: "absolute", left: 16,
              background: "rgba(255,255,255,0.15)", border: "none",
              borderRadius: "50%", width: 44, height: 44,
              color: "#fff", cursor: "pointer", fontSize: 24,
              display: "flex", alignItems: "center", justifyContent: "center"
            }}
          >‹</button>
        )}

        <img
          src={currentImage}
          alt="Full size"
          style={{
            maxWidth: showSidebar ? "100%" : "90vw",
            maxHeight: "90vh",
            objectFit: "contain",
            borderRadius: 4
          }}
        />

        {/* Nút phải */}
        {hasMultiple && (
          <button
            onClick={e => { e.stopPropagation(); next(); }}
            style={{
              position: "absolute", right: 16,
              background: "rgba(255,255,255,0.15)", border: "none",
              borderRadius: "50%", width: 44, height: 44,
              color: "#fff", cursor: "pointer", fontSize: 24,
              display: "flex", alignItems: "center", justifyContent: "center"
            }}
          >›</button>
        )}
      </div>

      {/* PHẦN PHẢI: Sidebar comments — chỉ hiện khi có post */}
      {showSidebar && (
        <div
          onClick={e => e.stopPropagation()}
          style={{
            width: 380, background: "var(--bg1)",
            borderLeft: "1px solid rgba(255,255,255,0.1)",
            display: "flex", flexDirection: "column",
            height: "100vh"
          }}
        >
          {/* Header: thông tin tác giả */}
          <div style={{
            padding: "16px", borderBottom: "1px solid var(--border)",
            display: "flex", alignItems: "center", gap: 10
          }}>
            <Avatar user={post.author} size="sm" />
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>
                {post.author?.displayName || post.author?.userName}
              </div>
              <div style={{ fontSize: 12, color: "var(--text3)" }}>
                {new Date(post.createdAt).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}
              </div>
            </div>
          </div>

          {/* Caption */}
          {post.content && (
            <div style={{ padding: "12px 16px", fontSize: 14, borderBottom: "1px solid var(--border)" }}>
              {post.content}
            </div>
          )}

          {/* Like count */}
          <div style={{ padding: "8px 16px", borderBottom: "1px solid var(--border)", display: "flex", gap: 16 }}>
            <button
              onClick={handleLike}
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: liked ? "#e74c3c" : "var(--text2)", fontSize: 14,
                display: "flex", alignItems: "center", gap: 6
              }}
            >
              {liked ? "❤️" : "🤍"} {likesCount}
            </button>
            <span style={{ fontSize: 14, color: "var(--text3)" }}>
              💬 {comments.length}
            </span>
          </div>

          {/* Danh sách comments */}
          <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
            {comments.length === 0
              ? <div style={{ color: "var(--text3)", fontSize: 13, textAlign: "center", marginTop: 20 }}>
                  Chưa có bình luận nào
                </div>
              : comments.map(c => (
                <div key={c.id} style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                  <Avatar user={c.author} size="xs" />
                  <div>
                    <div style={{
                      background: "var(--bg3)", borderRadius: 12,
                      padding: "8px 12px", fontSize: 13
                    }}>
                      <div style={{ fontWeight: 600, marginBottom: 2 }}>
                        {c.author?.displayName || c.author?.userName}
                      </div>
                      {c.content}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2, paddingLeft: 8 }}>
                      {new Date(c.createdAt).toLocaleString("vi-VN")}
                    </div>
                  </div>
                </div>
              ))
            }
          </div>

          {/* Input comment */}
          <div style={{
            padding: "12px 16px",
            borderTop: "1px solid var(--border)",
            display: "flex", gap: 8
          }}>
            <Avatar user={user} size="xs" />
            <input
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              onKeyPress={e => e.key === "Enter" && handleAddComment()}
              placeholder="Viết bình luận..."
              style={{ flex: 1, borderRadius: 20, padding: "8px 14px", fontSize: 13 }}
            />
            <button
              onClick={handleAddComment}
              disabled={!commentText.trim() || submitting}
              className="btn btn-primary btn-sm"
            >
              {submitting ? "..." : "Gửi"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}