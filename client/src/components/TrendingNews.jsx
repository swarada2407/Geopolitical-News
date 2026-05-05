import { saveNews, getSavedNews, summarizeNews, getTopNews } from "../services/api";
import { useEffect, useState } from "react";
import { FaShareAlt, FaMagic } from "react-icons/fa";
import { highlightText, articleMatchesSearch } from "../utils/searchUtils";
import { showToast } from "./Toast";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1200&q=80";

function TrendingNews({ searchTerm }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedUrls, setSavedUrls] = useState(new Set());
  const [summaries, setSummaries] = useState({});
  const [summarizing, setSummarizing] = useState({});

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

  useEffect(() => {
    async function fetchTrending() {
      try {
        const { data } = await getTopNews({ country: 'us', type: 'trending' });
        setArticles(data || []);
      } catch (error) {
        console.error("Failed to fetch trending news:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTrending();
  }, []);

  // Filter articles based on search term
  const filteredArticles = articles.filter(article => articleMatchesSearch(article, searchTerm));

  if (loading) {
    return (
      <div className="headline-grid">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="headline-card skeleton-card">
            <div className="skeleton skeleton-image"></div>
            <div className="headline-body">
              <div className="skeleton skeleton-source"></div>
              <div className="skeleton skeleton-title"></div>
              <div className="skeleton skeleton-text"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="headline-grid">
      {filteredArticles.map((news, index) => (
        <article key={index} className="headline-card">
          <img
            src={news.urlToImage || FALLBACK_IMAGE}
            alt={news.title || "Headline"}
            onError={(e) => {
              e.currentTarget.src = FALLBACK_IMAGE;
            }}
          />

          <div className="headline-body">
            <p className="story-source">{highlightText(news.source?.name || "News Source", searchTerm)}</p>
            <h3>{highlightText(news.title, searchTerm)}</h3>
            <p>{highlightText(news.description || "Read more about this trending news.", searchTerm)}</p>

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
        </article>
      ))}
    </div>
  );
}

export default TrendingNews;