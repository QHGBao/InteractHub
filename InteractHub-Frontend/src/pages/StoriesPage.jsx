import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import Avatar from "../components/Shared/Avatar";
import Icon from "../components/Shared/Icon";
import { getStories } from "../services/storyService";

export default function StoriesPage() {
  const app = useApp();

  const [stories, setStories] = useState([]);
  const [viewing, setViewing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStories();
  }, []);

  async function loadStories() {
    try {
      const res = await getStories();
      console.log('Raw response:', res); // ✅ thêm dòng này
      console.log('res.data:', res.data);
      // ✅ Thêm || [] để tránh crash khi res.data undefined
      const data = (res.data || []).map((s, i) => ({
        ...s,
        bg: `linear-gradient(135deg,
            hsl(${i*60+200},50%,15%),
            hsl(${i*60+260},60%,10%))`
      }));

      setStories(data);

    } catch (err) {
      console.error(err);
      app.toast("Không tải được stories", "error");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="page">
        <p>Đang tải stories...</p>
      </div>
    );
  }

  // ✅ Hiển thị message khi không có stories
  if (stories.length === 0) {
    return (
      <div className="page">
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <h1 style={{ fontFamily:'var(--font-head)', fontSize:22, fontWeight:700 }}>Stories</h1>
          <button className="btn btn-primary btn-sm">
            <Icon name="plus" size={14}/> Tạo story
          </button>
        </div>
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <p style={{ color: 'var(--text3)' }}>Chưa có story nào</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
        <h1 style={{ fontFamily:'var(--font-head)', fontSize:22, fontWeight:700 }}>Stories</h1>
        <button className="btn btn-primary btn-sm">
          <Icon name="plus" size={14}/> Tạo story
        </button>
      </div>

      {viewing !== null && (
        <div className="story-viewer" onClick={() => setViewing(null)}>
          <div style={{ display:'flex', gap:8, marginBottom:20, width:360, maxWidth:'90vw' }}>
            {stories.map((_, i) => (
              <div key={i} style={{
                flex:1, height:3, borderRadius:2,
                background: i === viewing ? '#fff' : 'rgba(255,255,255,.3)'
              }}/>
            ))}
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20, width:360, maxWidth:'90vw' }}>
            <Avatar user={stories[viewing].user}/>
            <div>
              <div style={{ fontWeight:600 }}>
                {stories[viewing].user?.displayName || stories[viewing].user?.name}
              </div>
              <div style={{ fontSize:12, color:'rgba(255,255,255,.6)' }}>
                {stories[viewing].timeAgo}
              </div>
            </div>
            <button
              className="icon-btn"
              onClick={() => setViewing(null)}
              style={{ marginLeft:'auto', background:'rgba(255,255,255,.1)', border:'none', color:'#fff' }}
            >
              <Icon name="x"/>
            </button>
          </div>

          <div style={{
            width:360, maxWidth:'90vw', aspectRatio:'9/16', maxHeight:'65vh',
            borderRadius:20, background:stories[viewing].bg,
            display:'flex', flexDirection:'column', alignItems:'center',
            justifyContent:'center', gap:16, padding:24, textAlign:'center'
          }}>
            <Avatar user={stories[viewing].user} size="xl"/>
            <div style={{ fontFamily:'var(--font-head)', fontSize:18, fontWeight:700 }}>
              {stories[viewing].user?.displayName || stories[viewing].user?.name}
            </div>
            <div style={{ fontSize:14, color:'rgba(255,255,255,.8)', lineHeight:1.6 }}>
              {stories[viewing].text}
            </div>
          </div>

          <div style={{ display:'flex', gap:12, marginTop:20 }}>
            <button
              onClick={e => { e.stopPropagation(); setViewing(v => Math.max(0, v - 1)); }}
              className="btn btn-ghost btn-sm"
            >
              ◀ Trước
            </button>
            <button
              onClick={e => {
                e.stopPropagation();
                setViewing(v => v < stories.length - 1 ? v + 1 : null);
              }}
              className="btn btn-ghost btn-sm"
            >
              Tiếp ▶
            </button>
          </div>
        </div>
      )}

      <div className="grid-3">
        {stories.map((s, i) => (
          <div key={i} className="card" style={{ overflow:'hidden', cursor:'pointer' }} onClick={() => setViewing(i)}>
            <div style={{
              height:240, background:s.bg, display:'flex', flexDirection:'column',
              alignItems:'center', justifyContent:'center', gap:12, position:'relative'
            }}>
              <Avatar user={s.user} size="lg"/>
              <div style={{ fontWeight:600, fontSize:14 }}>
                {s.user?.displayName || s.user?.name}
              </div>
              <div style={{
                position:'absolute', bottom:12, right:12, fontSize:11,
                background:'rgba(0,0,0,.5)', padding:'2px 8px', borderRadius:10
              }}>
                {s.timeAgo}
              </div>
            </div>
            <div style={{ padding:'10px 14px' }}>
              <div style={{ fontSize:12, color:'var(--text2)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {s.text}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}