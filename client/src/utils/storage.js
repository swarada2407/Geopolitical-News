// SAVE NEWS
export function saveArticle(article) {
  const saved = JSON.parse(localStorage.getItem("saved_news") || "[]");

  const exists = saved.some((a) => a.url === article.url);

  if (!exists) {
    saved.push({
      ...article,
      savedAt: new Date().toISOString(),
    });

    localStorage.setItem("saved_news", JSON.stringify(saved));
  }
}

// GET SAVED NEWS
export function getSavedArticles() {
  return JSON.parse(localStorage.getItem("saved_news") || "[]");
}

// REMOVE SAVED
export function removeSavedArticle(url) {
  const saved = getSavedArticles();
  const updated = saved.filter((a) => a.url !== url);
  localStorage.setItem("saved_news", JSON.stringify(updated));
}

// ARCHIVE NEWS (SAVE DAILY)
export function archiveArticles(articles) {
  const existing = JSON.parse(localStorage.getItem("archive_news") || "[]");

  const today = new Date().toISOString().split("T")[0];

  const updated = [
    ...existing,
    ...articles.map((a) => ({
      ...a,
      archivedDate: today,
    })),
  ];

  localStorage.setItem("archive_news", JSON.stringify(updated));
}

// GET ARCHIVE BY DATE
export function getArchiveByDate(date) {
  const data = JSON.parse(localStorage.getItem("archive_news") || "[]");
  return data.filter((a) => a.archivedDate === date);
}