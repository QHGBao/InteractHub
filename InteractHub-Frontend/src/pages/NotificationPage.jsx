import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../context/NotificationContext";
import axiosInstance from "../api/axiosInstance";

export default function NotificationsPage() {
  const {
    notifications,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
  } = useNotifications();
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleTest = async () => {
    await axiosInstance.post("/notifications/test");
  };

  const handleClick = async (n) => {
    if (!n.isRead) await markAsRead(n.id);

    if (n.type === "Like" || n.type === "Comment") {
      if (n.referenceId) navigate(`/post/${n.referenceId}`);
      return;
    }

    if (n.type === "Share") {
      if (n.referenceId) navigate(`/post/${n.referenceId}`);
      return;
    }

    if (n.type === "FriendRequest") {
      navigate("/friends?tab=requests");
      return;
    }

    if (n.type === "FriendAccepted") {
      navigate(`/profile/${n.actor?.id}`);
      return;
    }

    // NewReport: Admin click → đến bài viết bị báo cáo
    if (n.type === "NewReport") {
      if (n.referenceId) navigate(`/post/${n.referenceId}`);
      return;
    }

    // PostRemoved: không điều hướng vì bài đã bị xóa
    if (n.type === "PostRemoved") return;
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getIcon = (type) => {
    switch (type) {
      case "Like":           return "❤️";
      case "Comment":        return "💬";
      case "Share":          return "🔁";
      case "FriendRequest":  return "👥";
      case "FriendAccepted": return "🤝";
      case "NewReport":      return "⚠️";
      case "PostRemoved":    return "🚫";
      default:               return "🔔";
    }
  };

  return (
    <div className="page">
      {/* ── Header ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <h1
            style={{
              fontFamily: "var(--font-head)",
              fontSize: 24,
              fontWeight: 900,
            }}
          >
            Thông báo
          </h1>
          {unreadCount > 0 && (
            <span
              style={{
                background: "var(--primary)",
                color: "#fff",
                fontSize: 11,
                fontWeight: 700,
                padding: "2px 9px",
                borderRadius: 20,
                letterSpacing: 0.3,
              }}
            >
              {unreadCount} mới
            </span>
          )}
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={markAllAsRead}
            style={{ opacity: unreadCount > 0 ? 1 : 0.5 }}
          >
            ✓ Đọc tất cả
          </button>
        </div>
      </div>

      {/* ── List ── */}
      <div style={{ maxWidth: 640 }}>
        <div className="card" style={{ overflow: "hidden" }}>
          {loading && (
            <div style={{ padding: 20, color: "var(--text3)" }}>
              Đang tải...
            </div>
          )}
          {error && (
            <div style={{ padding: 20, color: "red" }}>{error}</div>
          )}
          {!loading && !error && notifications.length === 0 && (
            <div style={{ padding: 20, color: "var(--text3)" }}>
              Không có thông báo nào
            </div>
          )}

          {notifications.map((n) => {
            const isRemoved = n.type === "PostRemoved";
            return (
              <div
                key={n.id}
                onClick={() => handleClick(n)}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 14,
                  padding: n.isRead ? "16px 18px" : "16px 18px 16px 15px",
                  cursor: isRemoved ? "default" : "pointer",
                  borderBottom: "1px solid var(--border)",
                  borderLeft: n.isRead
                    ? "none"
                    : `3px solid ${isRemoved ? "var(--danger)" : "var(--primary)"}`,
                  background: n.isRead
                    ? "transparent"
                    : isRemoved
                    ? "linear-gradient(90deg, rgba(231,76,60,0.08) 0%, rgba(231,76,60,0.03) 100%)"
                    : "linear-gradient(90deg, rgba(var(--primary-rgb), 0.08) 0%, rgba(var(--primary-rgb), 0.03) 100%)",
                  opacity: n.isRead ? 0.72 : 1,
                  transition: "background 0.2s, opacity 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (isRemoved) return;
                  e.currentTarget.style.opacity = "1";
                  e.currentTarget.style.background = n.isRead
                    ? "var(--bg2)"
                    : "rgba(var(--primary-rgb), 0.13)";
                }}
                onMouseLeave={(e) => {
                  if (isRemoved) return;
                  e.currentTarget.style.opacity = n.isRead ? "0.72" : "1";
                  e.currentTarget.style.background = n.isRead
                    ? "transparent"
                    : "linear-gradient(90deg, rgba(var(--primary-rgb), 0.08) 0%, rgba(var(--primary-rgb), 0.03) 100%)";
                }}
              >
                {/* Icon */}
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                    background: n.isRead
                      ? "var(--bg2)"
                      : isRemoved
                      ? "rgba(231,76,60,0.15)"
                      : "rgba(var(--primary-rgb), 0.15)",
                    border: n.isRead
                      ? "1px solid var(--border)"
                      : isRemoved
                      ? "1px solid rgba(231,76,60,0.35)"
                      : "1px solid rgba(var(--primary-rgb), 0.35)",
                    boxShadow: n.isRead
                      ? "none"
                      : isRemoved
                      ? "0 0 12px rgba(231,76,60,0.2)"
                      : "0 0 12px rgba(var(--primary-rgb), 0.2)",
                    transition: "transform 0.15s",
                  }}
                >
                  {getIcon(n.type)}
                </div>

                {/* Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: n.isRead ? 400 : 600,
                      color: n.isRead
                        ? "var(--text2)"
                        : isRemoved
                        ? "var(--danger)"
                        : "var(--text1)",
                      marginBottom: 4,
                      lineHeight: 1.55,
                    }}
                  >
                    {n.message}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: n.isRead
                        ? "var(--text3)"
                        : isRemoved
                        ? "var(--danger)"
                        : "var(--primary)",
                      fontWeight: n.isRead ? 400 : 500,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    🕐 {new Date(n.createdAt).toLocaleString("vi-VN")}
                  </div>
                </div>

                {/* Trạng thái */}
                {!n.isRead ? (
                  <div
                    style={{
                      width: 9,
                      height: 9,
                      borderRadius: "50%",
                      background: isRemoved ? "var(--danger)" : "var(--primary)",
                      flexShrink: 0,
                      marginTop: 4,
                      boxShadow: isRemoved
                        ? "0 0 6px var(--danger)"
                        : "0 0 6px var(--primary)",
                      animation: "pulseDot 2s ease-in-out infinite",
                    }}
                  />
                ) : (
                  <span
                    style={{
                      fontSize: 16,
                      opacity: 0.25,
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  >
                    ✓
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty state khi đã đọc hết */}
        {!loading && !error && notifications.length > 0 &&
          notifications.every((n) => n.isRead) && (
            <div
              style={{
                textAlign: "center",
                padding: "24px 0",
                color: "var(--text3)",
                fontSize: 13,
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
              Bạn đã đọc hết thông báo!
            </div>
          )}
      </div>

      {/* CSS animation cho dot */}
      <style>{`
        @keyframes pulseDot {
          0%, 100% { box-shadow: 0 0 4px var(--primary); }
          50%       { box-shadow: 0 0 10px var(--primary); }
        }
      `}</style>
    </div>
  );
}