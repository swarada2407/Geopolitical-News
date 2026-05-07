import { saveNews, getSavedNews, summarizeNews, getTopNews } from "../services/api";
import { useEffect, useState, useRef } from "react";
import { FaShareAlt, FaMagic } from "react-icons/fa";
import { highlightText, articleMatchesSearch } from "../utils/searchUtils";

const CATEGORY_IMAGES = {
  general: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
  business: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
  technology: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
  science: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=1200&q=80",
  health: "https://images.unsplash.com/photo-1505751172107-573225a9627c?auto=format&fit=crop&w=1200&q=80",
  sports: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80"
};

const FALLBACK_IMAGE = CATEGORY_IMAGES.general;

import { showToast } from "../components/Toast";

function News() {
  const [articles, setArticles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("general");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savedUrls, setSavedUrls] = useState(new Set());
  const [summaries, setSummaries] = useState({}); // { url: summaryText }
  const [summarizing, setSummarizing] = useState({}); // { url: true/false }
  const newsSectionRef = useRef(null);

  useEffect(() => {
    async function fetchSavedStatus() {
      const token = localStorage.getItem("geointelx_token");
      if (token) {
        try {
          const { data } = await getSavedNews();
          setSavedUrls(new Set(data.map(item => item.url)));
        } catch (err) {
          console.error("Failed to fetch saved status:", err);
        }
      }
    }
    fetchSavedStatus();
  }, []);

  useEffect(() => {
    if (searchTerm && newsSectionRef.current) {
      newsSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [searchTerm]);

  const handleSave = async (article) => {
    const token = localStorage.getItem("geointelx_token");
    if (!token) {
      showToast("Please login to save articles.", "info");
      return;
    }

    try {
      const formattedArticle = {
        title: article.title,
        description: article.description,
        url: article.url,
        urlToImage: article.urlToImage,
        source: article.source?.name || article.source,
        publishedAt: article.publishedAt,
      };
      await saveNews(formattedArticle);
      setSavedUrls(prev => new Set(prev).add(article.url));
      showToast("Article saved successfully!", "success");
    } catch (err) {
      console.error("Save failed:", err);
      const message = err.response?.data?.message || "Failed to save article. Please try again.";
      showToast(message, "error");
    }
  };

  const shareArticle = async (article) => {
    const url = article.url;
    try {
      if (navigator.share) {
        await navigator.share({
          title: article.title,
          text: article.description || "Check out this article",
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        showToast("Article link copied to clipboard.", "success");
      }
    } catch (err) {
      console.warn("Share failed", err);
      showToast("Unable to share this article right now.", "error");
    }
  };

  const handleSummarize = async (article) => {
    if (summaries[article.url]) {
      // Toggle off if already summarized
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
      
      if (data && data.summary) {
        setSummaries(prev => ({ ...prev, [article.url]: data.summary }));
        showToast("Summary generated!", "success");
      } else {
        throw new Error("No summary returned from server");
      }
    } catch (err) {
      console.error("Summarization failed:", err);
      const errorMsg = err.response?.data?.message || err.message || "Failed to generate summary.";
      showToast(errorMsg, "error");
    } finally {
      setSummarizing(prev => ({ ...prev, [article.url]: false }));
    }
  };

  useEffect(() => {
    async function fetchNews() {
      setLoading(true);
      setError("");

      try {
        const { data } = await getTopNews({ country: 'us', category });

        if (!data || data.length === 0) {
          setArticles([]);
          setError("No news found for this category.");
        } else {
          setArticles(data);
        }
      } catch (err) {
        console.error("News fetch error:", err);
        setArticles([]);
        const backendMessage = err.response?.data?.message;
        setError(backendMessage || "Unable to load news right now. This might be due to a slow internet connection or API limits.");
      } finally {
        setLoading(false);
      }
    }

    fetchNews();
  }, [category]);

  const handleRetry = () => {
    setCategory(prev => prev); // Trigger useEffect
  };

  // Filter articles based on search term
  const filteredArticles = articles.filter(article => articleMatchesSearch(article, searchTerm));

  return (
    <div className="news-page">
      <div className="page-header">
        <h1 className="page-title">🌍 Global News Intelligence</h1>
        <p className="page-subtitle">
          Stay updated with world events and geopolitical insights.
        </p>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search news..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="filters">
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="general">General</option>
          <option value="business">Business</option>
          <option value="technology">Technology</option>
          <option value="science">Science</option>
          <option value="health">Health</option>
          <option value="sports">Sports</option>
        </select>
      </div>

      <section ref={newsSectionRef}>
        {loading && (
        <div className="news-grid">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="news-card skeleton-card">
              <div className="skeleton skeleton-image"></div>
              <div className="news-card-body">
                <div className="skeleton skeleton-source"></div>
                <div className="skeleton skeleton-title"></div>
                <div className="skeleton skeleton-text"></div>
                <div className="skeleton skeleton-text short"></div>
                <div className="skeleton skeleton-btn"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="status-box error-box">
          <h3>Something went wrong</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="read-btn" style={{ marginTop: '1rem' }}>
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="news-grid">
          {filteredArticles.map((news, index) => (
            <div key={index} className="news-card">
              <img
                src={news.urlToImage || CATEGORY_IMAGES[category] || FALLBACK_IMAGE}
                alt="news"
                onError={(e) => {
                  e.currentTarget.src = CATEGORY_IMAGES[category] || FALLBACK_IMAGE;
                }}
              />

              <div className="news-card-body">
                <p className="source">{highlightText(news.source?.name || "News Source", searchTerm)}</p>

                <h3>{highlightText(news.title, searchTerm)}</h3>

                <p>{highlightText(news.description || "Read the full article for more details.", searchTerm)}</p>

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
                    aria-label="Share article"
                    type="button"
                  >
                    <FaShareAlt />
                  </button>

                  <button
                    className={`save-btn ${savedUrls.has(news.url) ? 'already-saved' : ''}`}
                    onClick={() => handleSave(news)}
                    disabled={savedUrls.has(news.url)}
                  >
                    {savedUrls.has(news.url) ? "✅ Saved" : "🔖 Save"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </section>
    </div>
  );
}

export default News;