import { useState, useEffect, useRef } from "react";
import Avatar from "./Avatar";
import ConfirmDeleteModal from "./ConfirmDelete";
import Icon from "./Icon";
import CommentItem from "./CommentItem"; // Import component mới
import ImageLightbox from "./ImageLightBox";

import { postApi } from "../../api/postApi";
import { commentApi } from "../../api/commentApi";
import { likeApi } from "../../api/likeApi";

import { useAuth } from "../../context/AuthContext";

export default function PostCard({ post, onUpdate, onDelete }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // delete state chung
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteType, setDeleteType] = useState(null); // "post" | "comment"
  const [targetId, setTargetId] = useState(null);

  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  // Get current user ID (từ AuthContext)
  const currentUserId = user.userId;
  const isPostOwner = String(currentUserId) === String(post.author?.id);

  const [showLightbox, setShowLightbox] = useState(false); // ← Add
  const [lightboxIndex, setLightboxIndex] = useState(0);
  useEffect(() => {
    if (showComments && comments.length === 0) {
      loadComments();
    }
  }, [showComments]);

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
      const data = await commentApi.getComments(post.id);
      setComments(data || []);
    } catch (err) {
      console.error("Load comments error:", err);
    } finally {
      setLoadingComments(false);
    }
  }


  async function handleLike() {
    try {
      const result = await likeApi.toggleLike(post.id);
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
      await commentApi.createComment(post.id, {
        content: commentText,
        parentCommentId: null,
      });

      // Reload comments để lấy structure mới
      await loadComments();
      setCommentsCount((prev) => prev + 1);
      setCommentText("");
      onUpdate && onUpdate({ id: post.id, commentsCount: commentsCount + 1 });
    } catch (err) {
      console.error("Add comment error:", err);
    } finally {
      setSubmitting(false);
    }
  }

  // Handle reply to comment
  async function handleReplyToComment(parentCommentId, content) {
    try {
      await commentApi.createComment(post.id, {
        content,
        parentCommentId,
      });

      // Reload comments
      await loadComments();
      setCommentsCount((prev) => prev + 1);
    } catch (err) {
      console.error("Reply error:", err);
      throw err;
    }
  }

  // ================= DELETE LOGIC =================
  function openDeletePost() {
    setDeleteType("post");
    setTargetId(post.id);
    setShowConfirm(true);
  }

  function handleDeleteComment(commentId) {
    setDeleteType("comment");
    setTargetId(commentId);
    setShowConfirm(true);
  }

  async function handleConfirmDelete() {
    try {
      setDeleting(true);

      if (deleteType === "post") {
        await postApi.deletePost(targetId);
        onDelete && onDelete(targetId);
      } else if (deleteType === "comment") {
        await commentApi.deleteComment(post.id, targetId);
        await loadComments();
        setCommentsCount((prev) => prev - 1);
      }

      setShowConfirm(false);
      setTargetId(null);
      setDeleteType(null);
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setDeleting(false);
    }
  }
  const postImages = post.imageUrl
    ? (post.imageUrl.startsWith('[') ? JSON.parse(post.imageUrl) : [post.imageUrl])
    : [];

  function openLightbox(index = 0) {
    setLightboxIndex(index);
    setShowLightbox(true);
  }

  return (
    <div className="card post-card">
      {/* Header - giữ nguyên */}
      <div className="post-header">
        <Avatar user={post.author} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 14 }}>
            {post.author?.userName ||
              post.author?.displayName ||
              post.author?.name ||
              "Unknown"}
          </div>
          <div style={{ fontSize: 12, color: "var(--text3)" }}>
            {new Date(post.createdAt).toLocaleString("vi-VN")}
          </div>
        </div>
        {isPostOwner && (
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
                    openDeletePost();
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
                >
                  <Icon name="trash" size={14} />
                  Xóa bài viết
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Images Grid */}
      {postImages.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: postImages.length === 1 ? '1fr' : 'repeat(2, 1fr)',
          gap: 4,
          marginBottom: 12,
          borderRadius: 8,
          overflow: 'hidden'
        }}>
          {postImages.slice(0, 4).map((img, index) => (
            <div
              key={index}
              onClick={() => openLightbox(index)}
              style={{
                position: 'relative',
                height: postImages.length === 1 ? 400 : 200,
                cursor: 'pointer',
                overflow: 'hidden'
              }}
            >
              <img
                src={img}
                alt={`Post image ${index + 1}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.2s'
                }}
              />

              {/* More overlay */}
              {index === 3 && postImages.length > 4 && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(0,0,0,0.7)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: 32,
                  fontWeight: 700
                }}>
                  +{postImages.length - 4}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Actions - giữ nguyên */}
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

      {/* ✅ Comments Section - ĐÃ SỬA */}
      {showComments && (
        <div
          style={{
            marginTop: 12,
            paddingTop: 12,
            borderTop: "1px solid var(--border)",
          }}
        >
          {/* Add root comment */}
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

          {/* Comments list */}
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
            <div>
              {comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  postId={post.id}
                  onReply={handleReplyToComment}
                  onDelete={handleDeleteComment}
                  currentUserId={currentUserId}
                  postAuthorId={post.author?.id}
                  level={0}
                />
              ))}
            </div>
          )}
        </div>
      )}
      {/* Lightbox */}
      {showLightbox && (
        <ImageLightbox
          images={postImages}
          initialIndex={lightboxIndex}
          onClose={() => setShowLightbox(false)}
        />
      )}
      <ConfirmDeleteModal
        open={showConfirm}
        title={
          deleteType === "post"
            ? "Xóa bài viết?"
            : "Xóa bình luận?"
        }
        description="Không thể khôi phục nếu xác nhận xóa."
        confirmText="Xóa"
        cancelText="Hủy"
        loading={deleting}
        onCancel={() => setShowConfirm(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}