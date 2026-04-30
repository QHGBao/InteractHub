// Component này dùng để trả lời một bình luận đã có ở bài viết
// Ví dụ 
// Như bình luận của người dùng A là "Tôi không đồng ý", 
// Người dùng B có thể trả lời lại bình luận đó là "Kệ bạn, ai hỏi ?F"


// Hiện tại chưa xem phản hồi comment được
import { useState } from "react";
import Avatar from "./Avatar";

export default function CommentItem({
  comment,
  postId,
  onReply,
  onDelete,
  currentUserId,
  postAuthorId,
  level = 0
}) {
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  console.log("Comment author ID:", comment.author?.id);
  console.log("Current user ID:", currentUserId);
  console.log("Equal?", String(currentUserId) === String(comment.author?.id));
  async function handleSubmitReply() {
    if (!replyText.trim()) return;

    try {
      setSubmitting(true);
      await onReply(comment.id, replyText);
      setReplyText("");
      setShowReplyInput(false);
    } catch (err) {
      console.error("Reply error:", err);
    } finally {
      setSubmitting(false);
    }
  }

  const maxLevel = 2;
  const canReply = level < maxLevel;
  const isCommentOwner = currentUserId === comment.author?.id;
  const isPostOwner = currentUserId === postAuthorId;

  const canDelete = isCommentOwner || isPostOwner;

  // ✅ Debug: Log để check
  console.log("Comment author ID:", comment.author?.id);
  console.log("Current user ID:", currentUserId);
  console.log("Can delete?", currentUserId === comment.author?.id);

  return (
    <div
      style={{
        marginLeft: level > 0 ? 32 : 0,
        marginBottom: 12
      }}
    >
      <div style={{ display: "flex", gap: 8 }}>
        <Avatar user={comment.author} size="xs" />

        <div style={{ flex: 1 }}>
          <div
            style={{
              background: "var(--bg2)",
              padding: "8px 12px",
              borderRadius: 12,
            }}
          >
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>
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
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span>{new Date(comment.createdAt).toLocaleString("vi-VN")}</span>

            {canReply && (
              <button
                onClick={() => setShowReplyInput(!showReplyInput)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text3)",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: 11,
                }}
              >
                Trả lời
              </button>
            )}

            {comment.replies && comment.replies.length > 0 && (
              <button
                onClick={() => setShowReplies(!showReplies)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text3)",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: 11,
                }}
              >
                {showReplies
                  ? "Ẩn phản hồi"
                  : `Xem ${comment.replies.length} phản hồi`}
              </button>
            )}

            {/* Nút xóa */}
            {canDelete && (
              <button
                onClick={() => onDelete(comment.id, comment.author?.id)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--danger)",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: 11,
                }}
              >
                Xóa
              </button>
            )}
          </div>

          {showReplyInput && (
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Trả lời ${comment.author?.userName || ""}...`}
                style={{
                  flex: 1,
                  padding: "6px 12px",
                  borderRadius: 20,
                  border: "1px solid var(--border)",
                  fontSize: 12,
                  background: "var(--bg3)",
                  color: "var(--text)",
                }}
                onKeyPress={(e) => e.key === "Enter" && handleSubmitReply()}
                autoFocus
              />
              <button
                onClick={handleSubmitReply}
                disabled={!replyText.trim() || submitting}
                className="btn btn-primary btn-xs"
              >
                {submitting ? "..." : "Gửi"}
              </button>
            </div>
          )}

          {/* ✅ Nested replies */}
          {showReplies && comment.replies && comment.replies.length > 0 && (
            <div style={{ marginTop: 8 }}>
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  postId={postId}
                  onReply={onReply}
                  onDelete={onDelete}
                  currentUserId={currentUserId}
                  postAuthorId={postAuthorId}
                  level={level + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}