import { useState, useEffect } from "react";
import { useParams } from "react-router-dom"; // ✅ thêm
import { useAuth } from "../context/AuthContext"; // ✅ thêm
import { useApp } from "../context/AppContext";

import Avatar from "../components/Shared/Avatar";
import Icon from "../components/Shared/Icon";
import PostCard from "../components/Shared/PostCard";

import { getUserProfile, getUserPosts } from "../services/userService";

export default function ProfilePage() {
  const { userId } = useParams(); // ✅ lấy userId từ URL
  const { user: currentUser } = useAuth(); // ✅ lấy currentUser từ AuthContext
  const app = useApp();

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [tab, setTab] = useState("posts");
  const [editMode, setEditMode] = useState(false);

  const isOwn = currentUser?.userId === userId || currentUser?.id === userId;

  useEffect(() => {
    if (userId) loadProfile();
  }, [userId]); // ✅ reload khi userId thay đổi

  async function loadProfile() {
    try {
      const [profile, userPosts] = await Promise.all([
        getUserProfile(userId),
        getUserPosts(userId)
      ]);

      // ✅ Handle cả 2 trường hợp: res.data là object hoặc trực tiếp là data
      setUser(profile.data || profile);
      setPosts(Array.isArray(userPosts) ? userPosts : (userPosts?.data || []));

    } catch (err) {
      console.error(err);
      app.toast("Không tải được hồ sơ", "error");
    }
  }

  if (!user) return <div className="page">Đang tải...</div>;

  return (
    <div className="page" style={{ maxWidth:800 }}>

      {/* Cover */}
      <div className="card" style={{ overflow:'hidden', marginBottom:16 }}>
        <div className="profile-cover">
          <div className="profile-cover-inner"/>
          {isOwn && (
            <button className="btn btn-ghost btn-sm" style={{ position:'absolute', bottom:12, right:12 }}>
              <Icon name="camera" size={14}/> Đổi ảnh bìa
            </button>
          )}
        </div>

        <div style={{ padding:'0 24px 20px' }}>
          <div style={{ display:'flex', alignItems:'flex-end', gap:16, marginTop:-44, marginBottom:12 }}>

            <div style={{ position:'relative' }}>
              <Avatar user={user} size="xl"/>
              {isOwn && (
                <button style={{
                  position:'absolute', bottom:0, right:0, width:28, height:28,
                  borderRadius:'50%', background:'var(--accent)', border:'2px solid var(--bg2)',
                  display:'flex', alignItems:'center', justifyContent:'center', color:'#fff'
                }}>
                  <Icon name="camera" size={12}/>
                </button>
              )}
            </div>

            <div style={{ flex:1, paddingBottom:4 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <h2 style={{ fontFamily:'var(--font-head)', fontSize:20, fontWeight:700 }}>
                  {user.displayName || user.name}
                </h2>
                {user.role === "Admin" && (
                  <span className="badge badge-purple">Admin</span>
                )}
              </div>
              <div style={{ color:'var(--text3)', fontSize:13 }}>
                @{user.userName || user.username}
              </div>
            </div>

            <div style={{ display:'flex', gap:8 }}>
              {isOwn ? (
                <button className="btn btn-ghost btn-sm" onClick={() => setEditMode(true)}>
                  <Icon name="edit" size={14}/> Chỉnh sửa
                </button>
              ) : (
                <>
                  <button className="btn btn-primary btn-sm">+ Kết bạn</button>
                  <button className="btn btn-ghost btn-sm">Nhắn tin</button>
                </>
              )}
            </div>

          </div>

          <p style={{ fontSize:14, color:'var(--text2)', lineHeight:1.7, marginBottom:12 }}>
            {user.bio}
          </p>

          <div style={{ display:'flex', gap:24 }}>
            {[
              ['Bài viết', posts.length],
              ['Bạn bè', user.friendsCount || 0],
              ['Tham gia', user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'N/A']
            ].map(([k, v]) => (
              <div key={k}>
                <div style={{ fontFamily:'var(--font-head)', fontSize:18, fontWeight:700 }}>
                  {v}
                </div>
                <div style={{ fontSize:12, color:'var(--text3)' }}>{k}</div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Tabs */}
      <div className="tab-bar" style={{ maxWidth:360 }}>
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
          ? posts.map(p => <PostCard key={p.id} post={p} onLike={() => app.toast("Đã thích!", "success")} />)
          : <div className="empty">
              <div className="empty-icon">📝</div>
              <div className="empty-text">Chưa có bài viết nào</div>
            </div>
      )}

    </div>
  );
}