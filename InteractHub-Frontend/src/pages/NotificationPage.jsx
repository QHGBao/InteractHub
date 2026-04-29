import { useEffect } from "react";
import { useNavigate } from "react-router-dom"; // ✅ thêm
import { useNotifications } from "../context/NotificationContext";
import axiosInstance from "../api/axiosInstance";

export default function NotificationsPage() {
  const { notifications, loading, error, markAsRead, markAllAsRead, fetchNotifications } =
    useNotifications();
  const navigate = useNavigate(); // ✅ thêm

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleTest = async () => {
    await axiosInstance.post('/notifications/test');
  };

  // ✅ Xử lý click: đánh dấu đã đọc + chuyển trang
  const handleClick = async (n) => {
    if (!n.isRead) await markAsRead(n.id);

    if (n.referenceId) {
      // Like/Comment → chuyển tới bài viết
      if (n.type === 'Like' || n.type === 'Comment') {
        navigate(`/post/${n.referenceId}`);
      }
      // FriendRequest/FriendAccepted → chuyển tới profile của actor
      if (n.type === 'FriendRequest' || n.type === 'FriendAccepted') {
        navigate(`/profile/${n.actor?.id}`);
      }
    }
  };

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 24, fontWeight: 900 }}>
          Thông báo
        </h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-primary btn-sm" onClick={handleTest}>
            🔔 Test
          </button>
          <button className="btn btn-ghost btn-sm" onClick={markAllAsRead}>
            Đọc tất cả
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 640 }}>
        <div className="card" style={{ overflow: 'hidden' }}>
          {loading && <div style={{ padding: 20, color: 'var(--text3)' }}>Đang tải...</div>}
          {error && <div style={{ padding: 20, color: 'red' }}>{error}</div>}
          {!loading && !error && notifications.length === 0 && (
            <div style={{ padding: 20, color: 'var(--text3)' }}>Không có thông báo nào</div>
          )}

          {notifications.map(n => (
            <div
              key={n.id}
              onClick={() => handleClick(n)} // ✅ dùng handleClick
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '14px 16px',
                cursor: 'pointer',
                borderBottom: '1px solid var(--border)',
                background: n.isRead ? 'transparent' : 'var(--bg2)',
                transition: 'background 0.2s',
              }}
            >
              <div style={{ fontSize: 24, flexShrink: 0 }}>
                {n.type === 'Like'           ? '❤️'  :
                 n.type === 'Comment'        ? '💬'  :
                 n.type === 'FriendRequest'  ? '👥'  :
                 n.type === 'FriendAccepted' ? '🤝'  : '🔔'}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 14,
                  fontWeight: n.isRead ? 400 : 800,
                  color: 'var(--text1)',
                  marginBottom: 4,
                }}>
                  {n.message}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text3)' }}>
                  {new Date(n.createdAt).toLocaleString('vi-VN')}
                </div>
              </div>

              {!n.isRead && (
                <div style={{
                  width: 10, height: 10,
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  flexShrink: 0,
                }} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}