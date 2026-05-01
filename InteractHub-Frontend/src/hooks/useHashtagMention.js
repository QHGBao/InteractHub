// src/hooks/useHashtagMention.js
// Hook dùng chung cho CreatePost (#hashtag) và comment (@mention)
import { useState, useCallback } from "react";
import { searchHashtags } from "../services/hashtagService";
import axiosInstance from "../api/axiosInstance";

// Lấy danh sách bạn bè để gợi ý @mention
async function fetchFriends(query) {
  const res = await axiosInstance.get(`/friends?q=${encodeURIComponent(query)}`);
  return res.data?.data || [];
}

export function useHashtagMention() {
  const [suggestions, setSuggestions]     = useState([]);
  const [suggestionType, setSuggestionType] = useState(null); // "hashtag" | "mention"
  const [triggerIndex, setTriggerIndex]   = useState(-1); // vị trí # hoặc @ trong text

  // Gọi sau mỗi lần text thay đổi
  const handleTextChange = useCallback(async (value, cursorPos) => {
    // Tìm ký tự trigger gần nhất trước cursor
    const textBeforeCursor = value.slice(0, cursorPos);
    const hashMatch    = textBeforeCursor.match(/#(\w*)$/);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);

    if (hashMatch) {
      const query = hashMatch[1];
      setTriggerIndex(cursorPos - hashMatch[0].length);
      setSuggestionType("hashtag");
      if (query.length >= 0) {
        const results = await searchHashtags(query || " ");
        setSuggestions(results.slice(0, 8));
      }
    } else if (mentionMatch) {
      const query = mentionMatch[1];
      setTriggerIndex(cursorPos - mentionMatch[0].length);
      setSuggestionType("mention");
      if (query.length >= 0) {
        const results = await fetchFriends(query);
        setSuggestions(results.slice(0, 8));
      }
    } else {
      closeSuggestions();
    }
  }, []);

  // Chèn hashtag hoặc mention vào text
  function applySuggestion(text, cursorPos, item, type) {
    const textBeforeCursor = text.slice(0, cursorPos);
    const textAfterCursor  = text.slice(cursorPos);

    let insert = "";
    let newCursorOffset = 0;

    if (type === "hashtag") {
      const match = textBeforeCursor.match(/#(\w*)$/);
      if (!match) return { newText: text, newCursor: cursorPos };
      const before = textBeforeCursor.slice(0, textBeforeCursor.length - match[0].length);
      insert = `#${item.name} `;
      newCursorOffset = before.length + insert.length;
      return {
        newText: before + insert + textAfterCursor,
        newCursor: newCursorOffset,
      };
    } else {
      const match = textBeforeCursor.match(/@(\w*)$/);
      if (!match) return { newText: text, newCursor: cursorPos };
      const before = textBeforeCursor.slice(0, textBeforeCursor.length - match[0].length);
      insert = `@${item.userName || item.displayName} `;
      newCursorOffset = before.length + insert.length;
      return {
        newText: before + insert + textAfterCursor,
        newCursor: newCursorOffset,
      };
    }
  }

  function closeSuggestions() {
    setSuggestions([]);
    setSuggestionType(null);
    setTriggerIndex(-1);
  }

  return {
    suggestions,
    suggestionType,
    handleTextChange,
    applySuggestion,
    closeSuggestions,
  };
}