import { useState, useEffect, useRef } from "react";
import Avatar from "./Avatar";
import ConfirmDeleteModal from "./ConfirmDelete";
import Icon from "./Icon";
import CommentItem from "./CommentItem";

import { postApi } from "../../api/postApi";
import { commentApi } from "../../api/commentApi";
import { likeApi } from "../../api/likeApi";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function PostCard({ post, onUpdate, onDelete }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteType, setDeleteType] = useState(null);
  const [targetId, setTargetId] = useState(null);

  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  const currentUserId = user?.userId;
  const isPostOwner = String(currentUserId) === String(post.author?.id);

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
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
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

      await loadComments();
      setCommentsCount((prev) => prev + 1);
      setCommentText("");
    } catch (err) {
      console.error("Add comment error:", err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReplyToComment(parentCommentId, content) {
    try {
      await commentApi.createComment(post.id, {
        content,
        parentCommentId,
      });

      await loadComments();
      setCommentsCount((prev) => prev + 1);
    } catch (err) {
      console.error("Reply error:", err);
      throw err;
    }
  }

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

  return (
    <div className="card post-card">
      <div className="post-header">
        <div
          onClick={() => navigate(`/profile/${post.author?.id}`)}
          style={{ cursor: "pointer" }}
        >
          <Avatar user={post.author} />
        </div>

        <div style={{ flex: 1 }}>
          <div
            style={{ fontWeight: 600, fontSize: 14, cursor: "pointer" }}
            onClick={() => navigate(`/profile/${post.author?.id}`)}
          >
            {post.author?.userName ||
              post.author?.displayName ||
              "Unknown"}
          </div>
          <div style={{ fontSize: 12, color: "var(--text3)" }}>
            {new Date(post.createdAt).toLocaleString("vi-VN", {
              timeZone: "Asia/Ho_Chi_Minh",
            })}
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

      <p style={{ margin: "12px 0", lineHeight: 1.5 }}>
        {post.content}
      </p>

      {post.imageUrl && (
        <img
          src={post.imageUrl}
          alt="Post"
          style={{ width: "100%", borderRadius: 8, marginBottom: 12 }}
        />
      )}

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

      {showComments && (
        <div style={{ marginTop: 12 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Viết bình luận..."
              style={{ flex: 1 }}
            />
            <button onClick={handleAddComment}>Gửi</button>
          </div>

          {comments.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
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