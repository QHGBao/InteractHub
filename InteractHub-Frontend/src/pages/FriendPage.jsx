import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // ✅ thêm
import { useApp } from "../context/AppContext";
import Avatar from "../components/Shared/Avatar";
import { getFriends, getSuggestions } from "../services/friendService";

export default function FriendsPage() {
  const app = useApp();
  const navigate = useNavigate(); // ✅ thêm

  const [tab, setTab] = useState("friends");
  const [friends, setFriends] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [friendStatus, setFriendStatus] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [f, s] = await Promise.all([
        getFriends(),
        getSuggestions()
      ]);
      // ✅ thêm || [] để tránh undefined
      setFriends(f.data || []);
      setSuggestions(s.data || []);
    } catch (err) {
      app.toast("Không tải được danh sách bạn bè", "error");
    }
  }

  function handleFriendAction(userId, action) {
    setFriendStatus(p => ({ ...p, [userId]: action }));
    const msgs = {
      add:    "Đã gửi lời mời kết bạn!",
      remove: "Đã hủy kết bạn",
      accept: "Đã chấp nhận lời mời!",
      reject: "Đã từ chối lời mời",
    };
    app.toast(msgs[action] || "Thành công");
  }

  return (
    <div className="page">
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
        <h1 style={{ fontFamily:'var(--font-head)', fontSize:22, fontWeight:700 }}>Bạn bè</h1>
        <div style={{ fontSize:13, color:'var(--text3)' }}>
          {/* ✅ friends luôn là array nên .length an toàn */}
          {friends.length} bạn bè
        </div>
      </div>

      <div className="tab-bar" style={{ maxWidth:400 }}>
        {[['friends','Bạn bè'], ['requests','Lời mời (3)'], ['suggestions','Gợi ý']].map(([k,v]) => (
          <div key={k} className={`tab-btn ${tab===k ? 'active' : ''}`} onClick={() => setTab(k)}>
            {v}
          </div>
        ))}
      </div>

      {tab === 'friends' && (
        <div className="grid-3">
          {friends.map(u => (
            <div key={u.id} className="card friend-card" style={{ flexDirection:'column', alignItems:'flex-start', gap:12 }}>
              <div style={{ display:'flex', gap:12, alignItems:'center', width:'100%' }}>
                <Avatar user={u} size="lg"/>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600, fontSize:14 }}>{u.displayName || u.name}</div>
                  <div style={{ fontSize:12, color:'var(--text3)' }}>@{u.userName || u.username}</div>
                  <div style={{ fontSize:11, color:'var(--text3)', marginTop:2 }}>
                    {u.friends} bạn · {u.posts} bài
                  </div>
                </div>
              </div>
              <div style={{ fontSize:12, color:'var(--text2)', lineHeight:1.5 }}>{u.bio}</div>
              <div style={{ display:'flex', gap:8, width:'100%' }}>
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ flex:1 }}
                  // ✅ dùng useNavigate thay vì app.navigate
                  onClick={() => navigate(`/profile/${u.id || u.userId}`)}
                >
                  Trang cá nhân
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleFriendAction(u.id, 'remove')}
                >
                  Hủy kết bạn
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'requests' && (
        <div style={{ maxWidth:560 }}>
          {suggestions.map(u => (
            <div key={u.id} className="card" style={{ padding:16, marginBottom:10, display:'flex', gap:12, alignItems:'center' }}>
              <Avatar user={u} size="lg"/>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:600 }}>{u.displayName || u.name}</div>
                <div style={{ fontSize:12, color:'var(--text3)' }}>
                  @{u.userName || u.username} · {u.mutual ?? 0} bạn chung
                </div>
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <button className="btn btn-primary btn-sm" onClick={() => handleFriendAction(u.id, 'accept')}>Chấp nhận</button>
                <button className="btn btn-ghost btn-sm"   onClick={() => handleFriendAction(u.id, 'reject')}>Từ chối</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'suggestions' && (
        <div className="grid-3">
          {suggestions.slice(0, 6).map((u, i) => (
            <div key={u.id ?? i} className="card" style={{ padding:16, display:'flex', flexDirection:'column', alignItems:'center', gap:10, textAlign:'center' }}>
              <Avatar user={u} size="lg"/>
              <div>
                <div style={{ fontWeight:600, fontSize:14 }}>{u.displayName || u.name}</div>
                <div style={{ fontSize:12, color:'var(--text3)' }}>{u.mutual ?? 0} bạn chung</div>
              </div>
              <button
                className="btn btn-primary btn-sm"
                style={{ width:'100%' }}
                onClick={() => handleFriendAction(u.id, 'add')}
              >
                {friendStatus[u.id] === 'add' ? '✓ Đã gửi' : '+ Kết bạn'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}