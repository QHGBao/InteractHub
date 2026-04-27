import { useState, useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";
import Avatar from "../components/Shared/Avatar";
import Icon from "../components/Shared/Icon";
import { getStories, createStory, deleteStory } from "../services/storyService";

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

function storyBg(s, index) {
  if (s.imageUrl) return `url(${s.imageUrl}) center/cover no-repeat`;
  if (s.bg) return s.bg;
  return `linear-gradient(135deg,
    hsl(${index * 60 + 200},50%,15%),
    hsl(${index * 60 + 260},60%,10%))`;
}

// ─── Modal xác nhận xoá ──────────────────────────────────────────
function ConfirmDeleteModal({ onConfirm, onCancel, loading }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1100,
      background: "rgba(0,0,0,.7)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
    }}>
      <div style={{
        background: "#ffffff", borderRadius: 16, width: "100%", maxWidth: 340,
        boxShadow: "0 24px 60px rgba(0,0,0,.6)",
      }}>
        <div style={{ padding: "28px 24px 20px", textAlign: "center" }}>
          <div style={{
            width: 56, height: 56, borderRadius: "50%",
            background: "#fee2e2", display: "flex",
            alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
          }}>
            <Icon name="trash" size={24} style={{ color: "#dc2626" }} />
          </div>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: "#111", margin: "0 0 8px" }}>
            Xoá story này?
          </h3>
          <p style={{ fontSize: 13, color: "#666", margin: 0, lineHeight: 1.5 }}>
            Story sẽ bị xoá vĩnh viễn và không thể khôi phục.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, padding: "0 24px 24px" }}>
          <button
            onClick={onCancel}
            disabled={loading}
            style={{
              flex: 1, padding: "9px 0", borderRadius: 10,
              border: "1px solid #ddd", background: "#f5f5f5",
              color: "#444", cursor: "pointer", fontSize: 14, fontWeight: 500,
            }}
          >
            Huỷ
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              flex: 1, padding: "9px 0", borderRadius: 10,
              border: "none", background: "#dc2626",
              color: "#fff", cursor: loading ? "not-allowed" : "pointer",
              fontSize: 14, fontWeight: 600, opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Đang xoá..." : "Xoá"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal tạo Story ─────────────────────────────────────────────
function CreateStoryModal({ onClose, onCreated }) {
  const app = useApp();
  const fileRef = useRef();

  const [text, setText] = useState("");
  const [selectedBg, setSelectedBg] = useState(BG_PRESETS[0]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

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
      onCreated();
      onClose();
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
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,.7)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
    }}>
      <div style={{
        background: "#ffffff", color: "#111",
        borderRadius: 16, width: "100%", maxWidth: 500,
        boxShadow: "0 24px 60px rgba(0,0,0,.6)",
      }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 20px", borderBottom: "1px solid #e0e0e0",
        }}>
          <h2 style={{ fontFamily: "var(--font-head)", fontSize: 17, fontWeight: 700, margin: 0, color: "#111" }}>
            Tạo story mới
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#666", display: "flex" }}>
            <Icon name="x" size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ display: "flex", gap: 20, padding: 20 }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Nội dung */}
            <div>
              <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 6 }}>Nội dung</label>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Bạn đang nghĩ gì?"
                maxLength={200}
                rows={3}
                style={{
                  width: "100%", padding: "10px 12px", borderRadius: 10,
                  border: "1px solid #ddd", background: "#f5f5f5",
                  color: "#111", fontSize: 14, resize: "none",
                  outline: "none", boxSizing: "border-box", lineHeight: 1.5,
                }}
              />
              <div style={{ fontSize: 11, color: "#999", textAlign: "right", marginTop: 2 }}>{text.length}/200</div>
            </div>

            {/* Ảnh */}
            <div>
              <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 6 }}>
                Hình ảnh (tuỳ chọn)
              </label>
              {imagePreview ? (
                <div style={{ position: "relative" }}>
                  <img src={imagePreview} alt="preview"
                    style={{ width: "100%", maxHeight: 120, objectFit: "cover", borderRadius: 8 }} />
                  <button
                    onClick={removeImage}
                    style={{
                      position: "absolute", top: 6, right: 6,
                      background: "rgba(0,0,0,.6)", border: "none", borderRadius: "50%",
                      width: 24, height: 24, cursor: "pointer", color: "#fff",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <Icon name="x" size={12} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileRef.current.click()}
                  style={{
                    width: "100%", padding: 10, borderRadius: 10,
                    border: "1px dashed #ccc", background: "#f5f5f5",
                    color: "#888", cursor: "pointer", fontSize: 13,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  }}
                >
                  <Icon name="image" size={15} /> Chọn ảnh
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*"
                style={{ display: "none" }} onChange={handleImageChange} />
            </div>

            {/* Màu nền — luôn hiện */}
            <div>
              <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 8 }}>
                Màu nền {imagePreview && <span style={{ color: "#aaa", fontWeight: 400 }}>(dùng khi không có ảnh)</span>}
              </label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {BG_PRESETS.map((bg, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedBg(bg)}
                    style={{
                      width: 32, height: 32, borderRadius: 8, background: bg,
                      border: "2px solid transparent", cursor: "pointer", padding: 0, outline: "none",
                      boxShadow: selectedBg === bg ? "0 0 0 2px #fff, 0 0 0 4px #6366f1" : "none",
                      transition: "box-shadow .15s",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Preview */}
          <div style={{ flexShrink: 0, width: 100 }}>
            <div style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>Xem trước</div>
            <div style={{
              width: 100, aspectRatio: "9/16", borderRadius: 12,
              background: previewBg,
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: 8, textAlign: "center", overflow: "hidden",
            }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,.9)", lineHeight: 1.4, wordBreak: "break-word" }}>
                {text || "Nội dung story..."}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: "flex", justifyContent: "flex-end", gap: 10,
          padding: "14px 20px", borderTop: "1px solid #e0e0e0",
        }}>
          <button
            onClick={onClose}
            disabled={submitting}
            style={{
              padding: "7px 16px", borderRadius: 8,
              border: "1px solid #ddd", background: "#f5f5f5",
              color: "#444", cursor: "pointer", fontSize: 13, fontWeight: 500,
            }}
          >
            Huỷ
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              padding: "7px 16px", borderRadius: 8,
              border: "none", background: "#6366f1",
              color: "#fff", cursor: submitting ? "not-allowed" : "pointer",
              fontSize: 13, fontWeight: 600, opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? "Đang đăng..." : "Đăng story"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── StoriesPage ─────────────────────────────────────────────────
export default function StoriesPage() {
  const app = useApp();

  const [stories, setStories] = useState([]);
  const [viewing, setViewing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null); // id story cần xoá
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadStories();
  }, []);

  async function loadStories() {
    try {
      const data = await getStories();
      console.log("stories:", data);
      setStories(data || []);
    } catch (err) {
      console.error(err);
      app.toast("Không tải được stories", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmDelete() {
    setDeleting(true);
    try {
      await deleteStory(confirmDelete);
      app.toast("Đã xoá story!", "success");
      if (viewing !== null && stories[viewing]?.id === confirmDelete) {
        setViewing(null);
      }
      setConfirmDelete(null);
      await loadStories();
    } catch (err) {
      console.error(err);
      app.toast("Không xoá được story", "error");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="page">
        <p>Đang tải stories...</p>
      </div>
    );
  }

  return (
    <div className="page">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <h1 style={{ fontFamily: "var(--font-head)", fontSize: 22, fontWeight: 700 }}>Stories</h1>
        <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>
          <Icon name="plus" size={14} /> Tạo story
        </button>
      </div>

      {/* Modal tạo story */}
      {showCreate && (
        <CreateStoryModal
          onClose={() => setShowCreate(false)}
          onCreated={loadStories}
        />
      )}

      {/* Modal xác nhận xoá */}
      {confirmDelete && (
        <ConfirmDeleteModal
          loading={deleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {/* Story viewer */}
      {viewing !== null && stories[viewing] && (
        <div className="story-viewer" onClick={() => setViewing(null)}>
          <div style={{ display: "flex", gap: 8, marginBottom: 20, width: 360, maxWidth: "90vw" }}>
            {stories.map((_, i) => (
              <div key={i} style={{
                flex: 1, height: 3, borderRadius: 2,
                background: i === viewing ? "#fff" : "rgba(255,255,255,.3)",
              }} />
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, width: 360, maxWidth: "90vw" }}>
            <Avatar user={stories[viewing].user} />
            <div>
              <div style={{ fontWeight: 600 }}>
                {stories[viewing].user?.displayName || stories[viewing].user?.name}
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,.6)" }}>
                {stories[viewing].timeAgo}
              </div>
            </div>
            <button
              className="icon-btn"
              onClick={() => setViewing(null)}
              style={{ marginLeft: "auto", background: "rgba(255,255,255,.1)", border: "none", color: "#fff" }}
            >
              <Icon name="x" />
            </button>
          </div>

          <div style={{
            width: 360, maxWidth: "90vw", aspectRatio: "9/16", maxHeight: "65vh",
            borderRadius: 20, background: storyBg(stories[viewing], viewing),
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", gap: 16, padding: 24, textAlign: "center",
          }}>
            <Avatar user={stories[viewing].user} size="xl" />
            <div style={{ fontFamily: "var(--font-head)", fontSize: 18, fontWeight: 700 }}>
              {stories[viewing].user?.displayName || stories[viewing].user?.name}
            </div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,.8)", lineHeight: 1.6 }}>
              {stories[viewing].text}
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
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

      {/* Empty state */}
      {stories.length === 0 && (
        <div className="card" style={{ padding: 40, textAlign: "center" }}>
          <p style={{ color: "var(--text3)" }}>Chưa có story nào</p>
        </div>
      )}

      {/* Grid stories */}
      {stories.length > 0 && (
        <div className="grid-3">
          {stories.map((s, i) => (
            <div
              key={s.id || i}
              className="card"
              style={{ overflow: "hidden", cursor: "pointer", position: "relative" }}
              onClick={() => setViewing(i)}
            >
              <div style={{
                height: 240, background: storyBg(s, i),
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                gap: 12, position: "relative",
              }}>
                <Avatar user={s.user} size="lg" />
                <div style={{ fontWeight: 600, fontSize: 14 }}>
                  {s.user?.displayName || s.user?.name}
                </div>
                <div style={{
                  position: "absolute", bottom: 12, right: 12, fontSize: 11,
                  background: "rgba(0,0,0,.5)", padding: "2px 8px", borderRadius: 10,
                }}>
                  {s.timeAgo}
                </div>

                {/* Nút xoá */}
                <button
                  onClick={e => { e.stopPropagation(); setConfirmDelete(s.id); }}
                  style={{
                    position: "absolute", top: 8, right: 8,
                    background: "rgba(220,38,38,.8)",
                    border: "none", borderRadius: 8,
                    padding: "4px 10px", cursor: "pointer", color: "#fff",
                    display: "flex", alignItems: "center", gap: 4,
                    fontSize: 12, fontWeight: 500,
                    backdropFilter: "blur(4px)",
                  }}
                >
                  <Icon name="trash" size={12} /> Xoá
                </button>
              </div>

              <div style={{ padding: "10px 14px" }}>
                <div style={{ fontSize: 12, color: "var(--text2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {s.text}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}