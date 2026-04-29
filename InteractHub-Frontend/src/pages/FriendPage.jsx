import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import Avatar from "../components/Shared/Avatar";
import { getFriends, getRequests, getSuggestions, acceptFriend, rejectFriend, unfriend, sendRequest } from "../api/friendApi";

export default function FriendsPage() {
  const app = useApp();
  const navigate = useNavigate();

  const [tab, setTab] = useState("friends");
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [friendStatus, setFriendStatus] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [f, r, s] = await Promise.all([
        getFriends(),
        getRequests(),
        getSuggestions()
      ]);
      setFriends(f.data.data || []);
      setRequests(r.data.data || []);
      setSuggestions(s.data.data || []);
    } catch (err) {
      app.toast("Không tải được danh sách bạn bè", "error");
    }
  }

  return (
    <div className="page">
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
        <h1 style={{ fontFamily:'var(--font-head)', fontSize:22, fontWeight:700 }}>Bạn bè</h1>
        <div style={{ fontSize:13, color:'var(--text3)' }}>
          {friends.length} bạn bè
        </div>
      </div>

      <div className="tab-bar" style={{ maxWidth:400 }}>
        {[
          ['friends', 'Bạn bè'],
          ['requests', `Lời mời (${requests.length})`],
          ['suggestions', 'Gợi ý']
        ].map(([k, v]) => (
          <div key={k} className={`tab-btn ${tab===k ? 'active' : ''}`} onClick={() => setTab(k)}>
            {v}
          </div>
        ))}
      </div>

      {tab === 'friends' && (
        <div className="grid-3">
          {friends.length === 0 && (
            <div style={{ color:'var(--text3)', fontSize:14 }}>Chưa có bạn bè nào</div>
          )}
          {friends.map(u => (
            <div key={u.friendshipId} className="card friend-card" style={{ flexDirection:'column', alignItems:'flex-start', gap:12 }}>
              <div style={{ display:'flex', gap:12, alignItems:'center', width:'100%' }}>
                <Avatar user={u} size="lg"/>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600, fontSize:14 }}>{u.displayName}</div>
                  <div style={{ fontSize:12, color:'var(--text3)' }}>@{u.userName}</div>
                </div>
              </div>
              <div style={{ display:'flex', gap:8, width:'100%' }}>
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ flex:1 }}
                  onClick={() => navigate(`/profile/${u.userId}`)}
                >
                  Trang cá nhân
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={async () => {
                    await unfriend(u.userId);
                    app.toast("Đã hủy kết bạn");
                    loadData();
                  }}
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
          {requests.length === 0 && (
            <div style={{ color:'var(--text3)', fontSize:14 }}>Không có lời mời nào</div>
          )}
          {requests.map(u => (
            <div key={u.friendshipId} className="card" style={{ padding:16, marginBottom:10, display:'flex', gap:12, alignItems:'center' }}>
              <Avatar user={u} size="lg"/>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:600 }}>{u.displayName}</div>
                <div style={{ fontSize:12, color:'var(--text3)' }}>@{u.userName}</div>
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={async () => {
                    await acceptFriend(u.friendshipId);
                    app.toast("Đã chấp nhận lời mời!");
                    loadData();
                  }}
                >
                  Chấp nhận
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={async () => {
                    await rejectFriend(u.friendshipId);
                    app.toast("Đã từ chối lời mời");
                    loadData();
                  }}
                >
                  Từ chối
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'suggestions' && (
        <div className="grid-3">
          {suggestions.length === 0 && (
            <div style={{ color:'var(--text3)', fontSize:14 }}>Không có gợi ý nào</div>
          )}
          {suggestions.map((u, i) => (
            <div key={u.userId ?? i} className="card" style={{ padding:16, display:'flex', flexDirection:'column', alignItems:'center', gap:10, textAlign:'center' }}>
              <Avatar user={u} size="lg"/>
              <div>
                <div style={{ fontWeight:600, fontSize:14 }}>{u.displayName}</div>
              </div>
              <button
                className="btn btn-primary btn-sm"
                style={{ width:'100%' }}
                onClick={async () => {
                  await sendRequest(u.userId);
                  setFriendStatus(p => ({ ...p, [u.userId]: 'add' }));
                  app.toast("Đã gửi lời mời kết bạn!");
                }}
              >
                {friendStatus[u.userId] === 'add' ? '✓ Đã gửi' : '+ Kết bạn'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}