import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import Avatar from "../components/Shared/Avatar";
import Icon from "../components/Shared/Icon";
import PostCard from "../components/Shared/PostCard";
import { searchUsers, searchPosts } from "../services/searchService";
import { sendRequest } from "../api/friendApi";

export default function SearchPage() {
  const app = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const [activeTab, setActiveTab]   = useState("users");
  const [results, setResults]       = useState({ users: [], posts: [] });
  const [loading, setLoading]       = useState(false);
  // Lưu trạng thái đã gửi lời mời trong session
  const [sentRequests, setSentRequests] = useState({});

  useEffect(() => {
    if (!query.trim()) return;
    loadResults(query.trim());
  }, [query]);

  async function loadResults(q) {
    setLoading(true);
    try {
      const [users, posts] = await Promise.all([
        searchUsers(q),
        searchPosts(q),
      ]);
      setResults({ users: users || [], posts: posts || [] });
    } catch (err) {
      console.error(err);
      app.toast("Không tìm kiếm được", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleSendRequest(userId, displayName) {
    try {
      await sendRequest(userId);
      setSentRequests(p => ({ ...p, [userId]: true }));
      app.toast(`Đã gửi lời mời đến ${displayName}!`, "success");
    } catch {
      app.toast("Không gửi được lời mời", "error");
    }
  }

  // Tách bản thân ra khỏi danh sách mọi người
  const selfUser   = results.users.find(u => u.isSelf);
  const otherUsers = results.users.filter(u => !u.isSelf);
  const currentResults = results[activeTab];

  // ─── Chưa có query ───────────────────────────────────────────
  if (!query.trim()) {
    return (
      <div className="page">
        <h1 style={{ fontFamily:"var(--font-head)", fontSize:22, fontWeight:700, marginBottom:20 }}>
          Tìm kiếm
        </h1>
        <div className="card" style={{ padding:40, textAlign:"center" }}>
          <p style={{ color:"var(--text3)" }}>Nhập từ khóa vào thanh tìm kiếm để bắt đầu</p>
        </div>
      </div>
    );
  }

  // ─── Đang load ───────────────────────────────────────────────
  if (loading) {
    return (
      <div className="page">
        <h1 style={{ fontFamily:"var(--font-head)", fontSize:22, fontWeight:700, marginBottom:20 }}>
          Kết quả cho "{query}"
        </h1>
        <div className="card" style={{ padding:40, textAlign:"center" }}>
          <p style={{ color:"var(--text3)" }}>Đang tìm kiếm...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      {/* Header */}
      <h1 style={{ fontFamily:"var(--font-head)", fontSize:22, fontWeight:700, marginBottom:20 }}>
        Kết quả cho "{query}"
      </h1>

      {/* Tabs */}
      <div style={{ display:"flex", gap:8, marginBottom:16 }}>
        {[
          { key:"users", label:"Người dùng", count: results.users.length },
          { key:"posts", label:"Bài viết",   count: results.posts.length },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`btn btn-sm ${activeTab === tab.key ? "btn-primary" : "btn-ghost"}`}
          >
            {tab.label}
            <span style={{
              marginLeft:6,
              background: activeTab === tab.key ? "rgba(255,255,255,.25)" : "var(--bg2)",
              borderRadius:10, padding:"1px 7px", fontSize:11,
            }}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* ═══ Tab: Người dùng ═══════════════════════════════════ */}
      {activeTab === "users" && (
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

          {/* Phần: Bản thân — chỉ hiện khi query khớp với mình */}
          {selfUser && (
            <div>
              <div style={{ fontSize:12, fontWeight:600, color:"var(--text3)", textTransform:"uppercase", letterSpacing:".05em", marginBottom:8 }}>
                Bản thân
              </div>
              <UserCard
                user={selfUser}
                isSelf
                onProfile={() => navigate(`/profile/${selfUser.id}`)}
              />
            </div>
          )}

          {/* Phần: Mọi người */}
          <div>
            {selfUser && otherUsers.length > 0 && (
              <div style={{ fontSize:12, fontWeight:600, color:"var(--text3)", textTransform:"uppercase", letterSpacing:".05em", marginBottom:8 }}>
                Mọi người
              </div>
            )}

            {otherUsers.length === 0 && !selfUser && (
              <div className="card" style={{ padding:40, textAlign:"center" }}>
                <p style={{ color:"var(--text3)" }}>Không tìm thấy người dùng nào cho "{query}"</p>
              </div>
            )}

            {otherUsers.length === 0 && selfUser && (
              <div className="card" style={{ padding:24, textAlign:"center" }}>
                <p style={{ color:"var(--text3)", fontSize:13 }}>Không có người dùng nào khác</p>
              </div>
            )}

            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {otherUsers.map((user, i) => (
                <UserCard
                  key={user.id || i}
                  user={user}
                  isSelf={false}
                  alreadySent={sentRequests[user.id]}
                  onSendRequest={() => handleSendRequest(user.id, user.displayName)}
                  onProfile={() => navigate(`/profile/${user.id}`)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══ Tab: Bài viết ═════════════════════════════════════ */}
      {activeTab === "posts" && (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {results.posts.length === 0 && (
            <div className="card" style={{ padding:40, textAlign:"center" }}>
              <p style={{ color:"var(--text3)" }}>
                Không tìm thấy bài viết nào cho "{query}"
              </p>
            </div>
          )}

          {results.posts.map((post, i) => (
            <PostCard
              key={post.id || i}
              post={post}
              onUpdate={(updated) =>
                setResults(prev => ({
                  ...prev,
                  posts: prev.posts.map(p => p.id === updated.id ? { ...p, ...updated } : p)
                }))
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── UserCard component ───────────────────────────────────────────
function UserCard({ user, isSelf, alreadySent, onSendRequest, onProfile }) {
  // So sánh không phân biệt hoa thường — backend có thể trả "Accepted" hoặc "accepted"
  const status     = (user.friendshipStatus || "").toLowerCase();
  const isAccepted = status === "accepted";
  const isPending  = status === "pending" || alreadySent;

  return (
    <div
      className="card"
      style={{ display:"flex", alignItems:"center", gap:14, padding:"12px 16px" }}
    >
      <Avatar user={user} size="md" />

      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontWeight:600, fontSize:14 }}>
          {user.displayName}
          {isSelf && (
            <span style={{
              marginLeft:8, fontSize:11, color:"var(--primary)",
              background:"var(--bg2)", padding:"1px 8px", borderRadius:10, fontWeight:500,
            }}>
              Bạn
            </span>
          )}
        </div>
        {user.userName && (
          <div style={{ fontSize:12, color:"var(--text3)" }}>@{user.userName}</div>
        )}
        {user.bio && (
          <div style={{
            fontSize:12, color:"var(--text2)", marginTop:2,
            overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
          }}>
            {user.bio}
          </div>
        )}
      </div>

      {/* Nút hành động */}
      <div style={{ flexShrink:0 }}>
        {isSelf ? (
          // Bản thân → xem trang cá nhân
          <button
            className="btn btn-ghost btn-sm"
            onClick={onProfile}
          >
            Trang cá nhân
          </button>
        ) : isAccepted ? (
          // Đã kết bạn → xem trang cá nhân (chức năng để sau)
          <button
            className="btn btn-ghost btn-sm"
            onClick={onProfile}
          >
            Trang cá nhân
          </button>
        ) : isPending ? (
          // Đã gửi lời mời → disabled
          <button
            className="btn btn-ghost btn-sm"
            disabled
            style={{ opacity:0.6, cursor:"not-allowed" }}
          >
            Đã gửi
          </button>
        ) : (
          // Chưa kết bạn → nút kết bạn (màu giống btn-primary của FriendsPage)
          <button
            className="btn btn-primary btn-sm"
            onClick={onSendRequest}
          >
            + Kết bạn
          </button>
        )}
      </div>
    </div>
  );
}