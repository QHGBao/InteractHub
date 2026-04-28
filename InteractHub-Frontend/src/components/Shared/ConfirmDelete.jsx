import Icon from "./Icon";

export default function ConfirmDeleteModal({
  open,
  title = "Xác nhận xoá?",
  description = "Hành động này không thể hoàn tác.",
  confirmText = "Xoá",
  cancelText = "Huỷ",
  loading = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1100,
        background: "rgba(0,0,0,.7)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: 16,
          width: "100%",
          maxWidth: 340,
          boxShadow: "0 24px 60px rgba(0,0,0,.6)",
        }}
      >
        {/* Content */}
        <div style={{ padding: "28px 24px 20px", textAlign: "center" }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "#fee2e2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <Icon name="trash" size={24} style={{ color: "#dc2626" }} />
          </div>

          <h3
            style={{
              fontSize: 17,
              fontWeight: 700,
              color: "#111",
              margin: "0 0 8px",
            }}
          >
            {title}
          </h3>

          <p
            style={{
              fontSize: 13,
              color: "#666",
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            {description}
          </p>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, padding: "0 24px 24px" }}>
          <button
            onClick={onCancel}
            disabled={loading}
            style={{
              flex: 1,
              padding: "9px 0",
              borderRadius: 10,
              border: "1px solid #ddd",
              background: "#f5f5f5",
              color: "#444",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              flex: 1,
              padding: "9px 0",
              borderRadius: 10,
              border: "none",
              background: "#dc2626",
              color: "#fff",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: 14,
              fontWeight: 600,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Đang xử lý..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}