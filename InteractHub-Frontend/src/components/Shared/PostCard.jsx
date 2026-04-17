import { useState } from "react";
import Avatar from "./Avatar";
import Icon from "./Icon";

export default function PostCard({ post, onLike }) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(post.likesCount || 0);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState("");

  function handleLike() {
    setLiked((p) => !p);
    setCount((c) => (liked ? c - 1 : c + 1));
    onLike && onLike();
  }

  return (
    <div className="card post-card">
      <div className="post-header">
        <Avatar user={post.author} />

        <div>
          <div>{post.author?.displayName}</div>
          <div>{new Date(post.createdAt).toLocaleString()}</div>
        </div>

        <button>
          <Icon name="more" />
        </button>
      </div>

      <p>{post.content}</p>

      <div>
        <button onClick={handleLike}>
          ❤️ {count}
        </button>

        <button onClick={() => setShowComments((p) => !p)}>
          💬 {post.commentsCount}
        </button>
      </div>

      {showComments && (
        <div>
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <button onClick={() => setComment("")}>Gửi</button>
        </div>
      )}
    </div>
  );
}