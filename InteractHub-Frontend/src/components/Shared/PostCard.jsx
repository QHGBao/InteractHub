import { useState, useEffect } from "react";
import Avatar from "./Avatar";
import Icon from "./Icon";
import { toggleLike, getComments, addComment } from "../../services/postService";

export default function PostCard({ post, onUpdate }) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(()=>{
    if (showComments && comments.length === 0){
      loadComments();
    }
  }, [showComments]);

  async function loadComments(){
    try {
      setLoadingComments(true);
      const data = await getComments(post.id);
      setComments(data || []);
    } catch (err) {
      console.error("Load comments error: ",err);
    } finally{
      setLoadingComments(false);
    }
  }

  async function handleLike() {
    try {
      const result = await toggleLike(post.id);
      setLiked(result.isLiked);
      setLikesCount(result.likesCount);
      onUpdate && onUpdate({ id: post.id, likesCount: result.likesCount });
    } catch (err){
      console.error("Like error: ", err);
    }
  }

  async function handleAddComment(){
    if (!commentText.trim()) return;
    try {
      setSubmitting(true);
      const newComment = await addComment(post.id, {
        content: commentText,
        parentCommentId: null,
      });
      setComments(prev => [newComment, ...prev]);
      setCommentsCount(prev => prev + 1);
      setCommentText("");
      onUpdate && onUpdate({ id: post.id, commentsCount: commentsCount + 1 });
    } catch (err){
      console.error("Add comment error: ", err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="card post-card">
      {/* Header */}
      <div className="post-header">
        <Avatar user={post.author} />
        <div style={{ flex: 1}}>
          <div style={{ fontWeight: 600, fontSize: 14}}>
            {post.author?.userName ||post.author?.displayName || post.author?.name || "Unknown"}
          </div>
          <div style={{ fontSize: 12, color: `var(--text3)`}}>
            {new Date(post.createdAt).toLocaleString('vi-VN')}
          </div>
        </div>
        <button className="btn btn-ghost btn-xs">
          <Icon name="more" />
        </button>
      </div>

      {/* Content */}
      <p style={{ margin: '12px 0', lineHeight: 1.5 }}>{post.content}</p>

      {/* Image nếu có */}
      {post.imageUrl && (
        <img 
          src={post.imageUrl} 
          alt="Post" 
          style={{ width: '100%', borderRadius: 8, marginBottom: 12 }}
        />
      )}

      {/* Actions */}
      <div style={{ 
        display: 'flex', 
        gap: 12, 
        paddingTop: 12, 
        borderTop: '1px solid var(--border)' 
      }}>
        <button 
          onClick={handleLike}
          className="btn btn-ghost btn-sm"
          style={{ color: liked ? '#e74c3c' : 'inherit' }}
        >
          {liked ? '❤️' : '🤍'} {likesCount}
        </button>

        <button 
          onClick={() => setShowComments(prev => !prev)}
          className="btn btn-ghost btn-sm"
        >
          💬 {commentsCount}
        </button>

        <button className="btn btn-ghost btn-sm">
          🔗 Chia sẻ
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div style={{ 
          marginTop: 12, 
          paddingTop: 12, 
          borderTop: '1px solid var(--border)' 
        }}>
          {/* Add Comment */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Viết bình luận..."
              style={{ 
                flex: 1, 
                padding: '8px 12px', 
                borderRadius: 20,
                border: '1px solid var(--border)',
                fontSize: 13
              }}
              onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
            />
            <button 
              onClick={handleAddComment}
              disabled={!commentText.trim() || submitting}
              className="btn btn-primary btn-sm"
            >
              {submitting ? '...' : 'Gửi'}
            </button>
          </div>

          {/* Comments List */}
          {loadingComments ? (
            <div style={{ textAlign: 'center', padding: 16, color: 'var(--text3)' }}>
              Đang tải...
            </div>
          ) : comments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 16, color: 'var(--text3)' }}>
              Chưa có bình luận nào
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {comments.map(comment => (
                <div key={comment.id} style={{ display: 'flex', gap: 8 }}>
                  <Avatar user={comment.author} size="xs" />
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      background: 'var(--bg2)', 
                      padding: '8px 12px', 
                      borderRadius: 12 
                    }}>
                      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>
                        {comment.author?.userName || "Unknown"}
                      </div>
                      <div style={{ fontSize: 13 }}>{comment.content}</div>
                    </div>
                    <div style={{ 
                      fontSize: 11, 
                      color: 'var(--text3)', 
                      marginTop: 4,
                      paddingLeft: 12
                    }}>
                      {new Date(comment.createdAt).toLocaleString('vi-VN')}
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
    </div>
  );
}