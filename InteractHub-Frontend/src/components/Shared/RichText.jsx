// Render nội dung post/comment với #hashtag màu xanh và @mention màu tím
// Nhấn #hashtag → /hashtag/tênhashtag
// Nhấn @mention → /profile/tênuser

import { useNavigate } from "react-router-dom";

export default function RichText({ text, style = {} }) {
  const navigate = useNavigate();

  if (!text) return null;

  const parts = [];
  const regex = /(#\w+|@\w+)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
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

  if (lastIndex < text.length) {
    parts.push({ type: "text", value: text.slice(lastIndex) });
  }

  function handleHashtagClick(e, value) {
    e.stopPropagation();
    const tag = value.slice(1).toLowerCase();
    navigate(`/hashtag/${tag}`);
  }

  function handleMentionClick(e, value) {
    e.stopPropagation();
    const username = value.slice(1);
    navigate(`/profile/${username}`);
  }

  return (
    <span style={{ lineHeight: 1.5, ...style }}>
      {parts.map((part, i) => {
        if (part.type === "hashtag") {
          return (
            <span
              key={i}
              onClick={(e) => handleHashtagClick(e, part.value)}
              style={{ color: "var(--primary, #6366f1)", fontWeight: 500, cursor: "pointer" }}
            >
              {part.value}
            </span>
          );
        }
        if (part.type === "mention") {
          return (
            <span
              key={i}
              onClick={(e) => handleMentionClick(e, part.value)}
              style={{ color: "#0ea5e9", fontWeight: 500, cursor: "pointer" }}
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