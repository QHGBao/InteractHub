// Trang hiện tất cả bài viết có hashtag cụ thể
// URL: /hashtag/:tag  →  vd: /hashtag/python

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import PostCard from "../components/Shared/PostCard";
import { getPostsByHashtag } from "../services/hashtagService";
import { useApp } from "../context/AppContext";

export default function HashtagPage() {
  // useParams đọc phần :tag từ URL
  // vd URL là /hashtag/python thì tag = "python"
  const { tag } = useParams();
  const { toast } = useApp();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);

  // Mỗi khi tag trên URL thay đổi (nhấn hashtag khác) → reset về trang 1 và load lại
  useEffect(() => {
    setPage(1);
    setPosts([]);
  }, [tag]);

  // Load bài viết khi tag hoặc page thay đổi
  useEffect(() => {
    loadPosts();
  }, [tag, page]);

  async function loadPosts() {
    try {
      setLoading(true);
      const res = await getPostsByHashtag(tag, page, 20);
      // Backend trả về { success, data: { posts, totalPages } }
      setPosts(res.data?.posts || []);
      setTotalPage(res.data?.totalPages || 1);
    } catch (err) {
      console.error(err);
      toast("Không tải được bài viết", "error");
    } finally {
      setLoading(false);
    }
  }

  function handlePostUpdate(updatedPost) {
    setPosts((prev) =>
      prev.map((p) => (p.id === updatedPost.id ? { ...p, ...updatedPost } : p))
    );
  }

  function handleDeletePost(postId) {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  }

  return (
    <div className="page">
      {/* Header */}
      <div
        className="card"
        style={{ marginBottom: 16, padding: "20px 24px" }}
      >
        <div style={{ fontSize: 22, fontWeight: 700 }}>
          <span style={{ color: "var(--primary, #6366f1)" }}>#{tag}</span>
        </div>
        {!loading && (
          <div style={{ fontSize: 13, color: "var(--text3)", marginTop: 4 }}>
            {posts.length > 0
              ? `${posts.length} bài viết`
              : "Chưa có bài viết nào"}
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text3)" }}>
          Đang tải...
        </div>
      )}

      {/* Danh sách bài viết */}
      {!loading && posts.length === 0 && (
        <div
          className="card"
          style={{ textAlign: "center", padding: "40px 24px", color: "var(--text3)" }}
        >
          Không có bài viết nào với <strong>#{tag}</strong>
        </div>
      )}

      {Array.isArray(posts) &&
        posts.map((p) => (
          <PostCard
            key={p.id}
            post={p}
            onUpdate={handlePostUpdate}
            onDelete={handleDeletePost}
          />
        ))}

      {/* Pagination */}
      {totalPage > 1 && (
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 16 }}>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn btn-sm"
          >
            Trước
          </button>
          <span style={{ padding: "0 12px", lineHeight: "32px" }}>
            Trang {page} / {totalPage}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPage, p + 1))}
            disabled={page === totalPage}
            className="btn btn-sm"
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
}