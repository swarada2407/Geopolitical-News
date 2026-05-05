import React from "react";

export function articleMatchesSearch(article, query) {
  if (!query || !query.trim()) return true;

  const text = `${article?.title || ""} ${article?.description || ""} ${article?.source?.name || ""}`.toLowerCase();
  return text.includes(query.toLowerCase().trim());
}

export function highlightText(text, query) {
  if (!query || !query.trim()) return text;

  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");

  return String(text || "").split(regex).map((part, index) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={index}>{part}</mark>
    ) : (
      part
    )
  );
}