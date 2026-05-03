import { useState, useRef } from "react";
import { useApp } from "../../context/AppContext";
import Avatar from "./Avatar";
import Icon from "./Icon";
import { createStory } from "../../services/storyService";

const BASE_URL = "http://localhost:5022";

const BG_PRESETS = [
  "linear-gradient(135deg, #1a1a2e, #16213e)",
  "linear-gradient(135deg, #0f3460, #533483)",
  "linear-gradient(135deg, #2d6a4f, #1b4332)",
  "linear-gradient(135deg, #7b2d8b, #3a0ca3)",
  "linear-gradient(135deg, #c1121f, #780000)",
  "linear-gradient(135deg, #e07c24, #9e2a2b)",
  "linear-gradient(135deg, #023e8a, #0077b6)",
  "linear-gradient(135deg, #3d405b, #1a1a2e)",
];

function getTimeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "Vừa xong";
  if (mins < 60) return `${mins} phút trước`;
  const hrs = Math.floor(mins / 60);
  if (hrs  < 24) return `${hrs} giờ trước`;
  return `${Math.floor(hrs / 24)} ngày trước`;
}

function storyBg(s, index = 0) {
  if (s.mediaUrl) {
    const url = s.mediaUrl.startsWith("http") ? s.mediaUrl : BASE_URL + s.mediaUrl;
    return `url(${url}) center/cover no-repeat`;
  }
  if (s.background) return s.background;
  return `linear-gradient(135deg,
    hsl(${index * 60 + 200},50%,15%),
    hsl(${index * 60 + 260},60%,10%))`;
}

// ─── Modal tạo story (giống StoriesPage) ─────────────────────────
function CreateStoryModal({ onClose, onCreated }) {
  const app = useApp();
  const fileRef = useRef();

  const [text, setText]               = useState("");
  const [selectedBg, setSelectedBg]   = useState(BG_PRESETS[0]);
  const [imageFile, setImageFile]     = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting]   = useState(false);

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function removeImage() {
    setImageFile(null);
    setImagePreview(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleSubmit() {
    if (!text.trim() && !imageFile) {
      app.toast("Vui lòng nhập nội dung hoặc chọn ảnh", "error");
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      if (text.trim()) formData.append("TextContent", text.trim());
      if (imageFile)   formData.append("Image", imageFile);
      formData.append("Background", selectedBg);

      await createStory(formData);
      app.toast("Đã đăng story thành công!", "success");
      onCreated?.();
    } catch (err) {
      console.error(err);
      app.toast("Không đăng được story", "error");
    } finally {
      setSubmitting(false);
    }
  }

  const previewBg = imagePreview
    ? `url(${imagePreview}) center/cover no-repeat`
    : selectedBg;

  return (
    <div style={{ position:"fixed", inset:0, zIndex:1000, background:"rgba(0,0,0,.7)", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div style={{ background:"#98969e", color:"#111", borderRadius:16, width:"100%", maxWidth:500, boxShadow:"0 24px 60px rgba(0,0,0,.6)" }}>
        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 20px", borderBottom:"1px solid #e0e0e0" }}>
          <h2 style={{ fontFamily:"var(--font-head)", fontSize:17, fontWeight:700, margin:0, color:"#111" }}>Tạo story mới</h2>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:"#666", display:"flex" }}>
            <Icon name="x" size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ display:"flex", gap:20, padding:20 }}>
          <div style={{ flex:1, display:"flex", flexDirection:"column", gap:14 }}>
            {/* Text */}
            <div>
              <label style={{ fontSize:12, color:"#111", display:"block", marginBottom:6 }}>Nội dung</label>
              <textarea
                value={text} onChange={e => setText(e.target.value)}
                placeholder="Bạn đang nghĩ gì?" maxLength={200} rows={3}
                style={{ width:"100%", padding:"10px 12px", borderRadius:10, border:"1px solid #ddd", background:"#f5f5f5", color:"#111", fontSize:14, resize:"none", outline:"none", boxSizing:"border-box", lineHeight:1.5 }}
              />
              <div style={{ fontSize:11, color:"#111", textAlign:"right", marginTop:2 }}>{text.length}/200</div>
            </div>

            {/* Ảnh */}
            <div>
              <label style={{ fontSize:12, color:"#111", display:"block", marginBottom:6 }}>Hình ảnh (tuỳ chọn)</label>
              {imagePreview ? (
                <div style={{ position:"relative" }}>
                  <img src={imagePreview} alt="preview" style={{ width:"100%", maxHeight:120, objectFit:"cover", borderRadius:8 }} />
                  <button onClick={removeImage} style={{ position:"absolute", top:6, right:6, background:"rgba(0,0,0,.6)", border:"none", borderRadius:"50%", width:24, height:24, cursor:"pointer", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <Icon name="x" size={12} />
                  </button>
                </div>
              ) : (
                <button onClick={() => fileRef.current.click()} style={{ width:"100%", padding:10, borderRadius:10, border:"1px dashed #ccc", background:"#f5f5f5", color:"#888", cursor:"pointer", fontSize:13, display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                  <Icon name="image" size={15} /> Chọn ảnh
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleImageChange} />
            </div>

            {/* Màu nền */}
            <div>
              <label style={{ fontSize:12, color:"#111", display:"block", marginBottom:8 }}>
                Màu nền {imagePreview && <span style={{ color:"#aaa", fontWeight:400 }}>(dùng khi không có ảnh)</span>}
              </label>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {BG_PRESETS.map((bg, i) => (
                  <button key={i} onClick={() => setSelectedBg(bg)} style={{ width:32, height:32, borderRadius:8, background:bg, border:"2px solid transparent", cursor:"pointer", padding:0, outline:"none", boxShadow: selectedBg === bg ? "0 0 0 2px #fff, 0 0 0 4px #6366f1" : "none", transition:"box-shadow .15s" }} />
                ))}
              </div>
            </div>
          </div>

          {/* Preview */}
          <div style={{ flexShrink:0, width:100 }}>
            <div style={{ fontSize:12, color:"#111", marginBottom:8 }}>Xem trước</div>
            <div style={{ width:100, aspectRatio:"9/16", borderRadius:12, background:previewBg, display:"flex", alignItems:"center", justifyContent:"center", padding:8, textAlign:"center", overflow:"hidden" }}>
              <div style={{ fontSize:10, color:"rgba(255,255,255,.9)", lineHeight:1.4, wordBreak:"break-word" }}>
                {text || "Nội dung story..."}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display:"flex", justifyContent:"flex-end", gap:10, padding:"14px 20px", borderTop:"1px solid #e0e0e0" }}>
          <button onClick={onClose} disabled={submitting} style={{ padding:"7px 16px", borderRadius:8, border:"1px solid #ddd", background:"#f5f5f5", color:"#444", cursor:"pointer", fontSize:13, fontWeight:500 }}>Huỷ</button>
          <button onClick={handleSubmit} disabled={submitting} style={{ padding:"7px 16px", borderRadius:8, border:"none", background:"#6366f1", color:"#fff", cursor: submitting ? "not-allowed" : "pointer", fontSize:13, fontWeight:600, opacity: submitting ? 0.7 : 1 }}>
            {submitting ? "Đang đăng..." : "Đăng story"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Story Viewer (giống StoriesPage) ────────────────────────────
function StoryViewerModal({ stories, startIndex, onClose }) {
  const [viewing, setViewing] = useState(startIndex);
  const story = stories[viewing];

  if (!story) return null;

  const bg = storyBg(story, viewing);

  return (
    <div className="story-viewer" onClick={onClose}>
      {/* Progress bar */}
      <div style={{ display:"flex", gap:8, marginBottom:20, width:360, maxWidth:"90vw" }}>
        {stories.map((_, i) => (
          <div key={i} style={{ flex:1, height:3, borderRadius:2, background: i === viewing ? "#fff" : "rgba(255,255,255,.3)" }} />
        ))}
      </div>

      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20, width:360, maxWidth:"90vw" }}>
        <Avatar user={story.user} />
        <div>
          <div style={{ fontWeight:600 }}>{story.user?.displayName || story.user?.name}</div>
          <div style={{ fontSize:12, color:"rgba(255,255,255,.6)" }}>{getTimeAgo(story.createdAt)}</div>
        </div>
        <button className="icon-btn" onClick={onClose} style={{ marginLeft:"auto", background:"rgba(255,255,255,.1)", border:"none", color:"#fff" }}>
          <Icon name="x" />
        </button>
      </div>

      {/* Story content */}
      <div style={{ width:360, maxWidth:"90vw", aspectRatio:"9/16", maxHeight:"65vh", borderRadius:20, background:bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16, padding:24, textAlign:"center" }}>
        <Avatar user={story.user} size="xl" />
        <div style={{ fontFamily:"var(--font-head)", fontSize:18, fontWeight:700, color:"#fff", textShadow:"0 1px 4px rgba(0,0,0,.8)" }}>
          {story.user?.displayName || story.user?.name}
        </div>
        <div style={{ fontSize:14, color:"rgba(255,255,255,.85)", lineHeight:1.6, textShadow:"0 1px 3px rgba(0,0,0,.7)" }}>
          {story.textContent}
        </div>
      </div>

      {/* Điều hướng */}
      <div style={{ display:"flex", gap:12, marginTop:20 }}>
        <button onClick={e => { e.stopPropagation(); setViewing(v => Math.max(0, v - 1)); }} className="btn btn-ghost btn-sm">◀ Trước</button>
        <button onClick={e => { e.stopPropagation(); setViewing(v => v < stories.length - 1 ? v + 1 : v); }} className="btn btn-ghost btn-sm">Tiếp ▶</button>
      </div>
    </div>
  );
}

// ─── StoryBar — component chính ──────────────────────────────────
export default function StoryBar({ stories = [], onReload }) {
  const [showCreate, setShowCreate]     = useState(false);
  const [viewerIndex, setViewerIndex]   = useState(null);

  return (
    <>
      {/* Modal tạo story */}
      {showCreate && (
        <CreateStoryModal
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); onReload?.(); }}
        />
      )}

      {/* Story viewer */}
      {viewerIndex !== null && (
        <StoryViewerModal
          stories={stories}
          startIndex={viewerIndex}
          onClose={() => setViewerIndex(null)}
        />
      )}

      <div className="story-bar" style={{ display:"flex", gap:12, marginBottom:16, overflowX:"auto", paddingBottom:4 }}>
        {/* Nút thêm story */}
        <div className="story-item" onClick={() => setShowCreate(true)} style={{ cursor:"pointer", flexShrink:0 }}>
          <div className="story-ring add">
            <div className="story-inner" style={{ display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, color:"var(--primary)" }}>+</div>
          </div>
          <span>Thêm</span>
        </div>

        {/* Danh sách story */}
        {stories.map((s, i) => {
          const thumbBg = storyBg(s, i);
          const name = s.user?.displayName || s.user?.name || "User";
          const shortName = name.split(" ").pop();

          return (
            <div
              key={s.id}
              className="story-item"
              onClick={() => setViewerIndex(i)}
              style={{ cursor:"pointer", flexShrink:0 }}
            >
              <div className="story-ring">
                <div
                  className="story-inner"
                  style={{ background: thumbBg, borderRadius:"50%", overflow:"hidden", width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center" }}
                >
                  {/* Nếu không có ảnh thì hiện Avatar */}
                  {!s.mediaUrl && <Avatar user={s.user} />}
                </div>
              </div>
              <span className="story-name">{shortName}</span>
            </div>
          );
        })}
      </div>
    </>
  );
}