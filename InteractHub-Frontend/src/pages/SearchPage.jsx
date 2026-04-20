import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useApp } from "../context/AppContext";
import Avatar from "../components/Shared/Avatar";
import Icon from "../components/Shared/Icon";
import { searchUsers, searchPosts } from "../services/searchService";

export default function SearchPage() {
  const app = useApp();
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const [activeTab, setActiveTab] = useState("users"); // "users" | "posts"
  const [results, setResults] = useState({ users: [], posts: [] });
  const [loading, setLoading] = useState(false);

  // Mỗi khi query trên URL thay đổi → fetch lại, giống StoriesPage dùng useEffect
  useEffect(() => {
    if (!query.trim()) return;
    loadResults(query.trim());
  }, [query]);

  async function loadResults(q) {
    setLoading(true);
    try {
      const [usersRes, postsRes] = await Promise.all([
        searchUsers(q),
        searchPosts(q),
      ]);

      console.log("users:", usersRes);
      console.log("posts:", postsRes);

      setResults({
        users: usersRes.data || [],
        posts: postsRes.data || [],
      });
    } catch (err) {
      console.error(err);
      app.toast("Không tìm kiếm được", "error");
    } finally {
      setLoading(false);
    }
  }

  const currentResults = results[activeTab];

  // Chưa có query (user vào /search không có ?q=)
  if (!query.trim()) {
    return (
      <div className="page">
        <h1 style={{ fontFamily: "var(--font-head)", fontSize: 22, fontWeight: 700, marginBottom: 20 }}>
          Tìm kiếm
        </h1>
        <div className="card" style={{ padding: 40, textAlign: "center" }}>
          <p style={{ color: "var(--text3)" }}>Nhập từ khóa vào thanh tìm kiếm để bắt đầu</p>
        </div>
      </div>
    );
  }

  // Đang load
  if (loading) {
    return (
      <div className="page">
        <h1 style={{ fontFamily: "var(--font-head)", fontSize: 22, fontWeight: 700, marginBottom: 20 }}>
          Kết quả cho "{query}"
        </h1>
        <div className="card" style={{ padding: 40, textAlign: "center" }}>
          <p style={{ color: "var(--text3)" }}>Đang tìm kiếm...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      {/* Header */}
      <h1 style={{ fontFamily: "var(--font-head)", fontSize: 22, fontWeight: 700, marginBottom: 20 }}>
        Kết quả cho "{query}"
      </h1>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {[
          { key: "users", label: "Người dùng", count: results.users.length },
          { key: "posts", label: "Bài viết", count: results.posts.length },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`btn btn-sm ${activeTab === tab.key ? "btn-primary" : "btn-ghost"}`}
          >
            {tab.label}
            <span style={{
              marginLeft: 6,
              background: activeTab === tab.key ? "rgba(255,255,255,.25)" : "var(--bg2)",
              borderRadius: 10, padding: "1px 7px", fontSize: 11
            }}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Không có kết quả */}
      {currentResults.length === 0 && (
        <div className="card" style={{ padding: 40, textAlign: "center" }}>
          <p style={{ color: "var(--text3)" }}>
            Không tìm thấy {activeTab === "users" ? "người dùng" : "bài viết"} nào cho "{query}"
          </p>
        </div>
      )}

      {/* Kết quả Users */}
      {activeTab === "users" && results.users.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {results.users.map((user, i) => (
            <div
              key={user.id || i}
              className="card"
              style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", cursor: "pointer" }}
              onClick={() => app.navigate?.(`/profile/${user.id || user.username}`)}
            >
              <Avatar user={user} size="md" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>
                  {user.displayName || user.name}
                </div>
                {user.username && (
                  <div style={{ fontSize: 12, color: "var(--text3)" }}>@{user.username}</div>
                )}
                {user.bio && (
                  <div style={{
                    fontSize: 12, color: "var(--text2)", marginTop: 2,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
                  }}>
                    {user.bio}
                  </div>
                )}
              </div>
              <Icon name="chevron-right" size={14} style={{ color: "var(--text3)", flexShrink: 0 }} />
            </div>
          ))}
        </div>
      )}

      {/* Kết quả Posts */}
      {activeTab === "posts" && results.posts.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {results.posts.map((post, i) => (
            <div
              key={post.id || i}
              className="card"
              style={{ padding: "14px 16px", cursor: "pointer" }}
              onClick={() => app.navigate?.(`/post/${post.id}`)}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <Avatar user={post.user} size="sm" />
                <div>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>
                    {post.user?.displayName || post.user?.name}
                  </span>
                  <span style={{ fontSize: 11, color: "var(--text3)", marginLeft: 8 }}>
                    {post.timeAgo}
                  </span>
                </div>
              </div>
              <div style={{
                fontSize: 13, color: "var(--text2)", lineHeight: 1.6,
                display: "-webkit-box", WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical", overflow: "hidden"
              }}>
                {post.content || post.text}
              </div>
              {post.image && (
                <div style={{ marginTop: 10, height: 120, borderRadius: 8, overflow: "hidden" }}>
                  <img src={post.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              )}
              <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
                <span style={{ fontSize: 12, color: "var(--text3)", display: "flex", alignItems: "center", gap: 4 }}>
                  <Icon name="heart" size={12} /> {post.likesCount ?? 0}
                </span>
                <span style={{ fontSize: 12, color: "var(--text3)", display: "flex", alignItems: "center", gap: 4 }}>
                  <Icon name="message-circle" size={12} /> {post.commentsCount ?? 0}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}