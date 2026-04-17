import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { getNotifications, markAllNotificationsRead } from "../services/notificationService";

export default function NotificationsPage() {

  const app = useApp();
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    try {
      const res = await getNotifications();
      setNotifs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function markAllRead() {
    try {
      await markAllNotificationsRead();
      setNotifs((n) =>
        n.map((x) => ({ ...x, isRead: true }))
      );
      app.toast("Đã đọc tất cả thông báo");
    } catch (err) {
      console.error(err);
    }
  }

  function markRead(id) {
    setNotifs((p) => p.map((x) => x.id === id ? { ...x, isRead: true } : x));
  }

  if (loading) {
    return (
      <div className="page">
        <p>Đang tải thông báo...</p>
      </div>
    );
  }

  return (
    <div className="page">

      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20}}>
        <h1 style={{ fontFamily:'var(--font-head)', fontSize:22, fontWeight:700}}> Thông báo </h1>
        <button className="btn btn-ghost btn-sm" onClick={markAllRead}> Đọc tất cả </button>
      </div>

      <div style={{maxWidth:640}}>
        <div className="card" style={{overflow:'hidden'}}>
          {notifs.length === 0 && (
            <div style={{padding:20,color:'var(--text3)'}}> Không có thông báo nào </div>
          )}

          {notifs.map(n => (
            <div key={n.id} className={`notif-item ${n.isRead ? "" : "unread"}`} onClick={() => markRead(n.id)}>
              <div style={{fontSize:22}}> {n.icon || "🔔"} </div>
              <div style={{flex:1}}> 
                <div className="notif-text"> {n.message} </div>
                <div className="notif-time"> {n.timeAgo} </div>
              </div>
              {!n.isRead && <div className="notif-dot"/>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}