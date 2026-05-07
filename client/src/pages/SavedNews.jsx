import { useState, useEffect } from "react";
import { getSavedNews, removeSavedNews, summarizeNews } from "../services/api";
import { showToast } from "../components/Toast";
import { FaShareAlt, FaTrash, FaMagic } from "react-icons/fa";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80";

function SavedNews() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summaries, setSummaries] = useState({});
  const [summarizing, setSummarizing] = useState({});

  useEffect(() => {
    const token = localStorage.getItem("geointelx_token");
    if (!token) {
      setError("Session expired. Please login again.");
      return;
    }
    fetchSavedNews();
  }, []);

  async function fetchSavedNews() {
    try {
      setLoading(true);
      const { data } = await getSavedNews();
      setArticles(data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch saved news:", err);
      setError(err.response?.data?.message || "Failed to load saved news");
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(id) {
    try {
      await removeSavedNews(id);
      setArticles(articles.filter((a) => a._id !== id));
      showToast("Article removed successfully!", "success");
    } catch (err) {
      console.error("Failed to remove article:", err);
      showToast("Failed to remove article", "error");
    }
  }

  const handleSummarize = async (article) => {
    if (summaries[article.url]) {
      const newSummaries = { ...summaries };
      delete newSummaries[article.url];
      setSummaries(newSummaries);
      return;
    }

    setSummarizing(prev => ({ ...prev, [article.url]: true }));
    try {
      const { data } = await summarizeNews({
        title: article.title,
        description: article.description,
        content: article.content
      });
      setSummaries(prev => ({ ...prev, [article.url]: data.summary }));
      showToast("Summary generated!", "success");
    } catch (err) {
      console.error("Summarization failed:", err);
      showToast("Failed to generate summary.", "error");
    } finally {
      setSummarizing(prev => ({ ...prev, [article.url]: false }));
    }
  };

  const shareArticle = async (article) => {
    const url = article.url;
    const title = article.title;

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Share failed:", err);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        showToast("Link copied to clipboard!", "success");
      } catch (err) {
        console.error("Clipboard failed:", err);
        showToast("Failed to copy link", "error");
      }
    }
  };

  if (loading) {
    return (
      <div className="news-page">
        <div className="page-header">
          <h1 className="page-title">Saved News</h1>
        </div>
        <div className="status-box">
          <p>Loading your saved articles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="news-page">
        <div className="page-header">
          <h1 className="page-title">Saved News</h1>
        </div>
        <div className="status-box error">
          <p>{error}</p>
          <button onClick={fetchSavedNews} className="read-btn">Retry</button>
        </div>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="news-page">
        <div className="page-header">
          <h1 className="page-title">Saved News</h1>
          <p className="page-subtitle">
            Your bookmarked articles will appear here.
          </p>
        </div>

        <div className="status-box">
          <h3>No saved articles yet</h3>
          <p>Go to News, Hero, or Trending section and click the Save button.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="news-page">
      <div className="page-header">
        <h1 className="page-title">Saved News</h1>
        <p className="page-subtitle">Your bookmarked articles in one place.</p>
      </div>

      <div className="news-grid">
        {articles.map((news) => (
          <article key={news._id} className="news-card">
            <img
              src={news.urlToImage || FALLBACK_IMAGE}
              alt={news.title || "Saved article"}
              onError={(e) => {
                e.currentTarget.src = FALLBACK_IMAGE;
              }}
            />

            <div className="news-card-body">
              <p className="source">
                {news.source?.name || news.source || "News Source"}
              </p>

              <h3>{news.title}</h3>

              <p>{news.description || "Read the full article for more details."}</p>

              {summaries[news.url] && (
                <div className="article-summary-box">
                  <h4><FaMagic /> Quick Summary</h4>
                  <div className="summary-content">
                    {summaries[news.url].split('\n').map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                </div>
              )}

              <div className="saved-meta">
                Saved on: {new Date(news.createdAt).toLocaleDateString()}
              </div>

              <div className="btn-center">
                <a href={news.url} target="_blank" rel="noreferrer">
                  <button className="read-btn">Read Article</button>
                </a>

                <button
                  className={`summarize-btn ${summarizing[news.url] ? 'loading' : ''}`}
                  onClick={() => handleSummarize(news)}
                  disabled={summarizing[news.url]}
                  title="Summarize News"
                >
                  {summarizing[news.url] ? <div className="spinner-small"></div> : <FaMagic />}
                </button>

                <button
                  className="share-btn icon-only"
                  onClick={() => shareArticle(news)}
                >
                  <FaShareAlt />
                </button>

                <button
                  className="delete-btn icon-only"
                  onClick={() => handleRemove(news._id)}
                  title="Remove from saved"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default SavedNews;
