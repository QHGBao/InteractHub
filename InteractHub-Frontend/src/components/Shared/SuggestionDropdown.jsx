// Dropdown gợi ý dùng chung cho #hashtag và @mention

export default function SuggestionDropdown({ suggestions, type, onSelect }) {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div style={{
      position: "absolute",
      top: "100%",
      left: 0,
      right: 0,
      background: "var(--card)",
      border: "1px solid var(--border)",
      borderRadius: 10,
      boxShadow: "0 8px 24px rgba(0,0,0,.25)",
      zIndex: 100,
      maxHeight: 220,
      overflowY: "auto",
      marginTop: 4,
    }}>
      {suggestions.map((item, i) => (
        <button
          key={item.id || i}
          onMouseDown={e => { e.preventDefault(); onSelect(item); }}
          style={{
            width: "100%",
            padding: "9px 14px",
            textAlign: "left",
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 13,
            color: "var(--text1)",
            borderBottom: i < suggestions.length - 1 ? "1px solid var(--border)" : "none",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "var(--bg2)"}
          onMouseLeave={e => e.currentTarget.style.background = "none"}
        >
          {type === "hashtag" ? (
            <>
              <span style={{ color: "var(--primary, #6366f1)", fontWeight: 600, fontSize: 15 }}>#</span>
              <span style={{ flex: 1 }}>
                <span style={{ fontWeight: 500 }}>{item.name}</span>
                <span style={{ color: "var(--text3)", marginLeft: 8, fontSize: 12 }}>
                  {item.postCount} bài viết
                </span>
              </span>
              {item.isFollowed && (
                <span style={{ fontSize: 11, color: "var(--primary, #6366f1)" }}>Đang theo dõi</span>
              )}
            </>
          ) : (
            <>
              {/* Avatar nhỏ */}
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: "var(--bg3)",
                backgroundImage: item.avatarUrl ? `url(${item.avatarUrl})` : "none",
                backgroundSize: "cover",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 600, color: "var(--text3)",
                flexShrink: 0,
              }}>
                {!item.avatarUrl && (item.displayName?.[0] || "?")}
              </div>
              <span style={{ flex: 1 }}>
                <span style={{ fontWeight: 500 }}>{item.displayName}</span>
                {item.userName && (
                  <span style={{ color: "var(--text3)", marginLeft: 6, fontSize: 12 }}>
                    @{item.userName}
                  </span>
                )}
              </span>
            </>
          )}
        </button>
      ))}
    </div>
  );
}