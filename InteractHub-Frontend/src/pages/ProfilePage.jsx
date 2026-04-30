import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";

import Avatar from "../components/Shared/Avatar";
import Icon from "../components/Shared/Icon";
import PostCard from "../components/Shared/PostCard";

import { getUserProfile, getUserPosts } from "../services/userService";
import { sendRequest, unfriend } from "../api/friendApi";

export default function ProfilePage() {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const app = useApp();

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [tab, setTab] = useState("posts");
  const [editMode, setEditMode] = useState(false);
  const [friendStatus, setFriendStatus] = useState("None");

  const isOwn = currentUser?.userId === userId || currentUser?.id === userId;

  useEffect(() => {
    if (userId) loadProfile();
  }, [userId]);

  async function loadProfile() {
    console.log("loadProfile called, userId:", userId);
    try {
      const [profileRes, postsRes] = await Promise.all([
        getUserProfile(userId),
        getUserPosts(userId).catch((err) => { 
          console.log("getUserPosts error:", err);
          return { data: { posts: [] } };
        })
      ]);

      console.log("profileRes:", profileRes);
      console.log("postsRes:", postsRes);

      setUser(profileRes.data?.profile || profileRes.data);
      setFriendStatus(profileRes.data?.friendStatus || "None");
      
      const postsData = postsRes.posts || postsRes.data?.posts || [];
      console.log("postsData:", postsData);
      setPosts(postsData);

    } catch (err) {
      console.error("loadProfile error:", err);
      app.toast("Không tải được hồ sơ", "error");
    }
}

  if (!user) return <div className="page">Đang tải...</div>;

  return (
    <div className="page" style={{ maxWidth: 800 }}>

      {/* Cover */}
      <div className="card" style={{ overflow: 'hidden', marginBottom: 16 }}>
        <div className="profile-cover">
          <div className="profile-cover-inner" />
          {isOwn && (
            <button className="btn btn-ghost btn-sm" style={{ position: 'absolute', bottom: 12, right: 12 }}>
              <Icon name="camera" size={14} /> Đổi ảnh bìa
            </button>
          )}
        </div>

        <div style={{ padding: '0 24px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginTop: -44, marginBottom: 12 }}>

            <div style={{ position: 'relative' }}>
              <Avatar user={user} size="xl" />
              {isOwn && (
                <button style={{
                  position: 'absolute', bottom: 0, right: 0, width: 28, height: 28,
                  borderRadius: '50%', background: 'var(--accent)', border: '2px solid var(--bg2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
                }}>
                  <Icon name="camera" size={12} />
                </button>
              )}
            </div>

            <div style={{ flex: 1, paddingBottom: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 20, fontWeight: 700 }}>
                  {user.displayName || user.name}
                </h2>
                {user.role === "Admin" && (
                  <span className="badge badge-purple">Admin</span>
                )}
              </div>
              <div style={{ color: 'var(--text3)', fontSize: 13 }}>
                @{user.userName || user.username}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              {isOwn ? (
                <button className="btn btn-ghost btn-sm" onClick={() => setEditMode(true)}>
                  <Icon name="edit" size={14} /> Chỉnh sửa
                </button>
              ) : (
                <>
                  {friendStatus === "Friend" ? (
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={async () => {
                        await unfriend(userId);
                        setFriendStatus("None");
                        app.toast("Đã hủy kết bạn");
                      }}
                    >
                      ✓ Bạn bè
                    </button>
                  ) : friendStatus === "Pending" ? (
                    <button className="btn btn-ghost btn-sm" disabled>
                      Đã gửi lời mời
                    </button>
                  ) : (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={async () => {
                        await sendRequest(userId);
                        setFriendStatus("Pending");
                        app.toast("Đã gửi lời mời kết bạn!");
                      }}
                    >
                      + Kết bạn
                    </button>
                  )}
                  <button className="btn btn-ghost btn-sm">Nhắn tin</button>
                </>
              )}
            </div>

          </div>

          <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.7, marginBottom: 12 }}>
            {user.bio || "Chưa có giới thiệu"}
          </p>

          <div style={{ display: 'flex', gap: 24 }}>
            {[
              ['Bài viết', user.postsCount ?? posts.length],
              ['Bạn bè', user.friendsCount ?? 0],
              ['Tham gia', user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'N/A']
            ].map(([k, v]) => (
              <div key={k}>
                <div style={{ fontFamily: 'var(--font-head)', fontSize: 18, fontWeight: 700 }}>
                  {v}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text3)' }}>{k}</div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Tabs */}
      <div className="tab-bar" style={{ maxWidth: 360 }}>
        {[
          ['posts', 'Bài viết'],
          ['photos', 'Ảnh'],
          ['about', 'Giới thiệu']
        ].map(([k, v]) => (
          <div key={k} className={`tab-btn ${tab === k ? 'active' : ''}`} onClick={() => setTab(k)}>
            {v}
          </div>
        ))}
      </div>

      {tab === 'posts' && (
        posts.length > 0
          ? posts.map(p => (
            <PostCard
              key={p.Id || p.id}
              post={{
                ...p,
                id: p.Id || p.id,
                imageUrl: p.ImageUrl || p.imageUrl,
                content: p.Content || p.content,
                likesCount: p.LikesCount || p.likesCount || 0,
                commentsCount: p.CommentsCount || p.commentsCount || 0,
                createdAt: p.createdAt,
                author: p.author
              }}
              onUpdate={() => loadProfile()}
              onDelete={() => loadProfile()}
            />
          ))
          : (
            <div className="empty">
              <div className="empty-icon">📝</div>
              <div className="empty-text">Chưa có bài viết nào</div>
            </div>
          )
      )}

      {tab === 'about' && (
        <div className="card" style={{ padding: 20 }}>
          <div style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.7 }}>
            {user.bio || "Chưa có giới thiệu"}
          </div>
        </div>
      )}

    </div>
  );
}