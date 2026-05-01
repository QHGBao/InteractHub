// Render nội dung post/comment với #hashtag màu xanh và @mention màu tím

export default function RichText({ text, style = {} }) {
  if (!text) return null;

  // Tách text thành các token: #hashtag, @mention, và text thường
  const parts = [];
  const regex = /(#\w+|@\w+)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Phần text thường trước token
    if (match.index > lastIndex) {
      parts.push({ type: "text", value: text.slice(lastIndex, match.index) });
    }

    const token = match[0];
    if (token.startsWith("#")) {
      parts.push({ type: "hashtag", value: token });
    } else {
      parts.push({ type: "mention", value: token });
    }

    lastIndex = regex.lastIndex;
  }

  // Phần text còn lại
  if (lastIndex < text.length) {
    parts.push({ type: "text", value: text.slice(lastIndex) });
  }

  return (
    <span style={{ lineHeight: 1.5, ...style }}>
      {parts.map((part, i) => {
        if (part.type === "hashtag") {
          return (
            <span
              key={i}
              style={{
                color: "var(--primary, #6366f1)",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              {part.value}
            </span>
          );
        }
        if (part.type === "mention") {
          return (
            <span
              key={i}
              style={{
                color: "#0ea5e9",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              {part.value}
            </span>
          );
        }
        return <span key={i}>{part.value}</span>;
      })}
    </span>
  );
}