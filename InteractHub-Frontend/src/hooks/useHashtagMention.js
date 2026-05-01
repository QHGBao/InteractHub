// src/hooks/useHashtagMention.js
import { useState, useCallback } from "react";
import { searchHashtags } from "../services/hashtagService";
import axiosInstance from "../api/axiosInstance";

async function fetchFriends(query) {
  try {
    const res = await axiosInstance.get("/friend/list");
    const friends = res.data?.data || [];
    if (!query) return friends.slice(0, 8);
    const q = query.toLowerCase();
    return friends
      .filter(f =>
        f.displayName?.toLowerCase().includes(q) ||
        f.userName?.toLowerCase().includes(q)
      )
      .slice(0, 8);
  } catch {
    return [];
  }
}

export function useHashtagMention() {
  const [suggestions, setSuggestions]       = useState([]);
  const [suggestionType, setSuggestionType] = useState(null);
  const [triggerIndex, setTriggerIndex]     = useState(-1);

  const handleTextChange = useCallback(async (value, cursorPos) => {
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

  function applySuggestion(text, cursorPos, item, type) {
    const textBeforeCursor = text.slice(0, cursorPos);
    const textAfterCursor  = text.slice(cursorPos);

    if (type === "hashtag") {
      const match = textBeforeCursor.match(/#(\w*)$/);
      if (!match) return { newText: text, newCursor: cursorPos };
      const before = textBeforeCursor.slice(0, textBeforeCursor.length - match[0].length);
      const insert = `#${item.name} `;
      return { newText: before + insert + textAfterCursor, newCursor: before.length + insert.length };
    } else {
      const match = textBeforeCursor.match(/@(\w*)$/);
      if (!match) return { newText: text, newCursor: cursorPos };
      const before = textBeforeCursor.slice(0, textBeforeCursor.length - match[0].length);
      const insert = `@${item.userName || item.displayName} `;
      return { newText: before + insert + textAfterCursor, newCursor: before.length + insert.length };
    }
  }

  function closeSuggestions() {
    setSuggestions([]);
    setSuggestionType(null);
    setTriggerIndex(-1);
  }

  return { suggestions, suggestionType, handleTextChange, applySuggestion, closeSuggestions };
}