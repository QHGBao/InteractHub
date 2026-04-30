import { useState, useEffect, useRef } from "react";
import Avatar from "./Avatar";
import ConfirmDeleteModal from "./ConfirmDelete";
import Icon from "./Icon";
import { toggleLike, getComments, addComment, deletePost } from "../../services/postService";
import { useNavigate } from "react-router-dom";

export default function PostCard({ post, onUpdate, onDelete }) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);
  const navigate = useNavigate();

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ✅ State cho dropdown menu
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (showComments && comments.length === 0) {
      loadComments();
    }
  }, [showComments]);

  // ✅ Close menu khi click bên ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showMenu]);

  async function loadComments() {
    try {
      setLoadingComments(true);
      const data = await getComments(post.id);
      setComments(data || []);
    } catch (err) {
      console.error("Load comments error:", err);
    } finally {
      setLoadingComments(false);
    }
  }

  async function handleLike() {
    try {
      const result = await toggleLike(post.id);
      setLiked(result.isLiked);
      setLikesCount(result.likesCount);
      onUpdate && onUpdate({ id: post.id, likesCount: result.likesCount });
    } catch (err) {
      console.error("Like error:", err);
    }
  }

  async function handleAddComment() {
    if (!commentText.trim()) return;

    try {
      setSubmitting(true);
      const newComment = await addComment(post.id, {
        content: commentText,
        parentCommentId: null,
      });
      setComments((prev) => [newComment, ...prev]);
      setCommentsCount((prev) => prev + 1);
      setCommentText("");
      onUpdate && onUpdate({ id: post.id, commentsCount: commentsCount + 1 });
    } catch (err) {
      console.error("Add comment error:", err);
    } finally {
      setSubmitting(false);
    }
  }

  // ✅ Handle delete post
  async function handleDelete() {
    try {
      setDeleting(true);

      await deletePost(post.id);
      window.location.reload();
      setShowConfirm(false);
      onDelete && onDelete(post.id);

    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="card post-card">
      {/* Header */}
      <div className="post-header">
        <div onClick={() => navigate(`/profile/${post.author?.id}`)} style={{ cursor: "pointer" }}>
          <Avatar user={post.author} />
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{ fontWeight: 600, fontSize: 14, cursor: "pointer" }}
            onClick={() => navigate(`/profile/${post.author?.id}`)}
          >
            {post.author?.userName || post.author?.displayName || "Unknown"}
          </div>
          <div style={{ fontSize: 12, color: "var(--text3)" }}>
            {new Date(post.createdAt).toLocaleString("vi-VN")}
          </div>
        </div>

        {/* ✅ Dropdown menu */}
        <div style={{ position: "relative" }} ref={menuRef}>
          <button
            className="btn btn-ghost btn-xs"
            onClick={() => setShowMenu(!showMenu)}
          >
            <Icon name="more" />
          </button>

          {showMenu && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                right: 0,
                background: "var(--bg3)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                marginTop: 4,
                minWidth: 150,
                boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                zIndex: 10,
              }}
            >
              <button
                onClick={() => {
                  setShowConfirm(true);
                  setShowMenu(false);
                }}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  textAlign: "left",
                  fontSize: 13,
                  color: "var(--danger)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  borderRadius: 8,
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "var(--bg4)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <Icon name="trash" size={14} />
                Xóa bài viết
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <p style={{ margin: "12px 0", lineHeight: 1.5 }}>{post.content}</p>

      {/* Image */}
      {post.imageUrl && (
        <img
          src={post.imageUrl}
          alt="Post"
          style={{ width: "100%", borderRadius: 8, marginBottom: 12 }}
        />
      )}

      {/* Actions */}
      <div
        style={{
          display: "flex",
          gap: 12,
          paddingTop: 12,
          borderTop: "1px solid var(--border)",
        }}
      >
        <button
          onClick={handleLike}
          className="btn btn-ghost btn-sm"
          style={{ color: liked ? "#e74c3c" : "inherit" }}
        >
          {liked ? "❤️" : "🤍"} {likesCount}
        </button>

        <button
          onClick={() => setShowComments((prev) => !prev)}
          className="btn btn-ghost btn-sm"
        >
          💬 {commentsCount}
        </button>

        <button className="btn btn-ghost btn-sm">🔗 Chia sẻ</button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div
          style={{
            marginTop: 12,
            paddingTop: 12,
            borderTop: "1px solid var(--border)",
          }}
        >
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Viết bình luận..."
              style={{
                flex: 1,
                padding: "8px 12px",
                borderRadius: 20,
                border: "1px solid var(--border)",
                fontSize: 13,
                background: "var(--bg3)",
                color: "var(--text)",
              }}
              onKeyPress={(e) => e.key === "Enter" && handleAddComment()}
            />
            <button
              onClick={handleAddComment}
              disabled={!commentText.trim() || submitting}
              className="btn btn-primary btn-sm"
            >
              {submitting ? "..." : "Gửi"}
            </button>
          </div>

          {loadingComments ? (
            <div
              style={{ textAlign: "center", padding: 16, color: "var(--text3)" }}
            >
              Đang tải...
            </div>
          ) : comments.length === 0 ? (
            <div
              style={{ textAlign: "center", padding: 16, color: "var(--text3)" }}
            >
              Chưa có bình luận nào
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {comments.map((comment) => (
                <div key={comment.id} style={{ display: "flex", gap: 8 }}>
                  <Avatar user={comment.author} size="xs" />
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        background: "var(--bg2)",
                        padding: "8px 12px",
                        borderRadius: 12,
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: 13,
                          marginBottom: 4,
                        }}
                      >
                        {comment.author?.userName || "Unknown"}
                      </div>
                      <div style={{ fontSize: 13 }}>{comment.content}</div>
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--text3)",
                        marginTop: 4,
                        paddingLeft: 12,
                      }}
                    >
                      {new Date(comment.createdAt).toLocaleString("vi-VN")}
                      {comment.repliesCount > 0 && (
                        <span style={{ marginLeft: 12 }}>
                          {comment.repliesCount} phản hồi
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      <ConfirmDeleteModal
        open={showConfirm}
        title="Xóa bài viết?"
        description="Bài viết sẽ bị xóa vĩnh viễn và không thể khôi phục."
        confirmText="Xóa"
        cancelText="Hủy"
        loading={deleting}
        onCancel={() => setShowConfirm(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
}