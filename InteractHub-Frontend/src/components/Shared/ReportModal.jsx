import { useState } from "react";
import { postApi } from "../../api/postApi";

const REASONS = [
  { value: "Spam",        label: "Spam" },
  { value: "HateSpeech",  label: "Ngôn từ thù ghét" },
  { value: "Violence",    label: "Bạo lực" },
  { value: "Nudity",      label: "Nội dung nhạy cảm" },
  { value: "FakeNews",    label: "Tin giả" },
  { value: "Other",       label: "Khác" },
];

export default function ReportModal({ postId, onClose }) {
  const [selected, setSelected]   = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone]           = useState(false);
  const [error, setError]         = useState("");

  async function handleSubmit() {
    if (!selected) return;
    setSubmitting(true);
    setError("");
    try {
      await postApi.reportPost(postId, selected);
      setDone(true);
    } catch (err) {
      setError(err?.response?.data?.message || "Báo cáo thất bại, thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleBackdrop(e) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      onClick={handleBackdrop}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.55)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div style={{
        background: "var(--bg1)",
        border: "1px solid var(--border)",
        borderRadius: 14,
        width: "100%", maxWidth: 420,
        padding: "20px 22px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <span style={{ fontWeight: 700, fontSize: 16 }}>Báo cáo bài viết</span>
          <button className="btn btn-ghost btn-xs" onClick={onClose}>✕</button>
        </div>

        {done ? (
          /* Thành công */
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>✅</div>
            <p style={{ fontWeight: 600, marginBottom: 6 }}>Đã gửi báo cáo</p>
            <p style={{ fontSize: 13, color: "var(--text3)", marginBottom: 16 }}>
              Cảm ơn bạn. Chúng tôi sẽ xem xét và xử lý trong thời gian sớm nhất.
            </p>
            <button className="btn btn-primary btn-sm" onClick={onClose}>Đóng</button>
          </div>
        ) : (
          <>
            <p style={{ fontSize: 13, color: "var(--text3)", marginBottom: 14 }}>
              Chọn lý do báo cáo phù hợp nhất:
            </p>

            {/* Lý do */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
              {REASONS.map(r => (
                <label key={r.value} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 14px", borderRadius: 8, cursor: "pointer",
                  border: `1px solid ${selected === r.value ? "var(--accent1)" : "var(--border)"}`,
                  background: selected === r.value ? "var(--bg2)" : "transparent",
                  fontSize: 14,
                }}>
                  <input
                    type="radio"
                    name="reason"
                    value={r.value}
                    checked={selected === r.value}
                    onChange={() => setSelected(r.value)}
                    style={{ accentColor: "var(--accent1)" }}
                  />
                  {r.label}
                </label>
              ))}
            </div>

            {error && (
              <p style={{ color: "var(--danger)", fontSize: 13, marginBottom: 10 }}>{error}</p>
            )}

            {/* Actions */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button className="btn btn-ghost btn-sm" onClick={onClose}>Hủy</button>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleSubmit}
                disabled={!selected || submitting}
              >
                {submitting ? "Đang gửi..." : "Gửi báo cáo"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}