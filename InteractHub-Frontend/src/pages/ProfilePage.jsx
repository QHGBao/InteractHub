import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";

import Avatar from "../components/Shared/Avatar";
import Icon from "../components/Shared/Icon";
import PostCard from "../components/Shared/PostCard";

import { getUserProfile, getUserPosts } from "../services/userService";
import { updateProfile, uploadImage } from "../api/userApi";
import { sendRequest, unfriend } from "../api/friendApi";

import CreatePost from "../components/Shared/CreatePost";
import { createPost } from "../services/postService";
import AboutTab from "../components/Shared/AboutTab";
import PhotosTab from "../components/Shared/PhotosTab";

export default function ProfilePage() {
  const { userId } = useParams();
  const { user: currentUser, updateUser } = useAuth();
  const app = useApp();

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [tab, setTab] = useState("posts");
  const [friendStatus, setFriendStatus] = useState("None");

  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const isOwn = currentUser?.userId === userId || currentUser?.id === userId;

  useEffect(() => {
    if (userId) loadProfile();
  }, [userId]);

  async function loadProfile() {
    try {
      const [profileRes, postsRes] = await Promise.all([
        getUserProfile(userId),
        getUserPosts(userId).catch(() => ({ posts: [] }))
      ]);

      setUser(profileRes.data?.profile || profileRes.data);
      setFriendStatus(profileRes.data?.friendStatus || "None");
      setPosts(postsRes.posts || postsRes.data?.posts || []);

    } catch (err) {
      console.error(err);
      app.toast("Không tải được hồ sơ", "error");
    }
  }

  async function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setUploadingAvatar(true);
      const uploaded = await uploadImage(file);
      const imageUrl = `http://localhost:5022${uploaded.url}`;
      await updateProfile({ avatarUrl: imageUrl });
      updateUser({ avatarUrl: imageUrl });
      app.toast("Đã cập nhật ảnh đại diện!");
      loadProfile();
    } catch (err) {
      console.error(err);
      app.toast("Lỗi upload ảnh", "error");
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleCoverChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setUploadingCover(true);
      const uploaded = await uploadImage(file);
      const imageUrl = `http://localhost:5022${uploaded.url}`;
      await updateProfile({ coverUrl: imageUrl });
      app.toast("Đã cập nhật ảnh bìa!");
      loadProfile();
    } catch (err) {
      console.error(err);
      app.toast("Lỗi upload ảnh", "error");
    } finally {
      setUploadingCover(false);
    }
  }

  async function handlePost(text, imageUrl = null) {
    try {
      await createPost({ content: text, imageUrl });
      app.toast("Đã đăng bài viết!", "success");
      loadProfile();
    } catch (err) {
      console.error(err);
      app.toast("Đăng bài thất bại", "error");
    }
  }

  if (!user) return <div className="page">Đang tải...</div>;

  return (
    <div className="page" style={{ maxWidth: 800 }}>

      {/* Cover */}
      <div className="card" style={{ overflow: 'hidden', marginBottom: 16 }}>
        <div className="profile-cover" style={{ position: 'relative' }}>
          {user.coverUrl ? (
            <img
              src={user.coverUrl}
              alt="cover"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div className="profile-cover-inner" />
          )}
          {isOwn && (
            <>
              <input
                type="file"
                accept="image/*"
                ref={coverInputRef}
                style={{ display: 'none' }}
                onChange={handleCoverChange}
              />
              <button
                className="btn btn-ghost btn-sm"
                style={{ position: 'absolute', bottom: 12, right: 12 }}
                onClick={() => coverInputRef.current.click()}
                disabled={uploadingCover}
              >
                <Icon name="camera" size={14} />
                {uploadingCover ? " Đang upload..." : " Đổi ảnh bìa"}
              </button>
            </>
          )}
        </div>

        <div style={{ padding: '0 24px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginTop: -20, marginBottom: 12 }}>

            <div style={{ position: 'relative' }}>
              <Avatar user={user} size="xl" />
              {isOwn && (
                <>
                  <input
                    type="file"
                    accept="image/*"
                    ref={avatarInputRef}
                    style={{ display: 'none' }}
                    onChange={handleAvatarChange}
                  />
                  <button
                    onClick={() => avatarInputRef.current.click()}
                    disabled={uploadingAvatar}
                    style={{
                      position: 'absolute', bottom: 0, right: 0,
                      width: 28, height: 28, borderRadius: '50%',
                      background: 'var(--accent)', border: '2px solid var(--bg2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', cursor: 'pointer'
                    }}
                  >
                    <Icon name="camera" size={12} />
                  </button>
                </>
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
                <button className="btn btn-ghost btn-sm">
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
                <div style={{ fontFamily: 'var(--font-head)', fontSize: 18, fontWeight: 700 }}>{v}</div>
                <div style={{ fontSize: 12, color: 'var(--text3)' }}>{k}</div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Tabs */}
      <div className="tab-bar" style={{ maxWidth: 360 }}>
        {[['posts', 'Bài viết'], ['photos', 'Ảnh'], ['about', 'Giới thiệu']].map(([k, v]) => (
          <div key={k} className={`tab-btn ${tab === k ? 'active' : ''}`} onClick={() => setTab(k)}>
            {v}
          </div>
        ))}
      </div>

      {tab === 'posts' && (
        <>
          {isOwn && (
            <CreatePost currentUser={currentUser} onPost={handlePost} />
          )}
          {posts.length > 0
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
          }
        </>
      )}

      {tab === 'photos' && (
        <PhotosTab posts={posts} />
      )}

      {tab === 'about' && (
        <AboutTab
          user={user}
          isOwn={isOwn}
          onUpdate={loadProfile}
        />
      )}

    </div>
  );
}