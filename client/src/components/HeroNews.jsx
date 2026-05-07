import { saveNews, getSavedNews, summarizeNews, getTopNews } from "../services/api";
import { useEffect, useState } from "react";
import { FaShareAlt, FaMagic } from "react-icons/fa";
import { highlightText, articleMatchesSearch } from "../utils/searchUtils";
import { showToast } from "./Toast";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80";

function HeroNews({ searchTerm }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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
    async function fetchTopStories() {
      setLoading(true);
      setError("");

      try {
        const { data } = await getTopNews({ country: 'us', type: 'hero' });

        if (!data || data.length === 0) {
          setArticles([]);
          setError("No featured stories available right now.");
        } else {
          setArticles(data.slice(0, 4));
        }
      } catch (err) {
        console.error("Hero News fetch error:", err);
        setArticles([]);
        const message = err.response?.data?.message || err.message || "Unable to load featured stories right now.";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    fetchTopStories();
  }, []);

  // Filter articles based on search term
  const filteredArticles = articles.filter(article => articleMatchesSearch(article, searchTerm));

  if (loading) {
    return (
      <div className="editorial-hero">
        <div className="hero-main skeleton-card">
          <div className="skeleton skeleton-image large"></div>
          <div className="hero-main-body">
            <div className="skeleton skeleton-source"></div>
            <div className="skeleton skeleton-title"></div>
            <div className="skeleton skeleton-text"></div>
            <div className="skeleton skeleton-text short"></div>
          </div>
        </div>

        <div className="hero-side-list">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="hero-side-card skeleton-card">
              <div className="skeleton skeleton-thumb"></div>
              <div className="hero-side-body">
                <div className="skeleton skeleton-source"></div>
                <div className="skeleton skeleton-title small"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="status-box error-box">
        <h3>Featured stories unavailable</h3>
        <p>{error}</p>
      </div>
    );
  }

  const mainStory = filteredArticles[0];
  const sideStories = filteredArticles.slice(1);

  return (
    <div className="editorial-hero">
      {mainStory && (
        <article className="hero-main">
          <img
            src={mainStory.urlToImage || FALLBACK_IMAGE}
            alt={mainStory.title || "Top story"}
            onError={(e) => {
              e.currentTarget.src = FALLBACK_IMAGE;
            }}
          />

          <div className="hero-main-body">
            <p className="story-source">
              {highlightText(mainStory.source?.name || "News Source", searchTerm)}
            </p>
            <h2>{highlightText(mainStory.title, searchTerm)}</h2>
            <p className="story-desc">
              {highlightText(mainStory.description || "Read the full report for more details.", searchTerm)}
            </p>

            {summaries[mainStory.url] && (
              <div className="article-summary-box hero">
                <h4><FaMagic /> Quick Summary</h4>
                <div className="summary-content">
                  {summaries[mainStory.url].split('\n').map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </div>
            )}

            <div className="story-actions">
              <a href={mainStory.url} target="_blank" rel="noreferrer">
                <button className="read-btn">Read Full Story</button>
              </a>

              <button
                className={`summarize-btn ${summarizing[mainStory.url] ? 'loading' : ''}`}
                onClick={() => handleSummarize(mainStory)}
                disabled={summarizing[mainStory.url]}
                title="Summarize News"
              >
                {summarizing[mainStory.url] ? <div className="spinner-small"></div> : <FaMagic />}
              </button>

              <button
                className="share-btn icon-only"
                onClick={() => shareArticle(mainStory)}
                aria-label="Share article"
                type="button"
              >
                <FaShareAlt />
              </button>

              <button
                className={`save-btn ${savedUrls.has(mainStory.url) ? 'already-saved' : ''}`}
                onClick={() => handleSave(mainStory)}
                disabled={savedUrls.has(mainStory.url)}
              >
                {savedUrls.has(mainStory.url) ? "✅ Saved" : "🔖 Save"}
              </button>
            </div>
          </div>
        </article>
      )}

      <div className="hero-side-list">
        {sideStories.map((news, index) => (
          <article key={index} className="hero-side-card">
            <img
              src={news.urlToImage || FALLBACK_IMAGE}
              alt={news.title || "Featured story"}
              onError={(e) => {
                e.currentTarget.src = FALLBACK_IMAGE;
              }}
            />

            <div className="hero-side-body">
              <p className="story-source">{highlightText(news.source?.name || "News Source", searchTerm)}</p>
              <h3>{highlightText(news.title, searchTerm)}</h3>

              {summaries[news.url] && (
                <div className="article-summary-box side">
                  <h4><FaMagic /> Quick Summary</h4>
                  <div className="summary-content">
                    {summaries[news.url].split('\n').map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                </div>
              )}

              <div className="story-actions">
                <a href={news.url} target="_blank" rel="noreferrer">
                  <button className="read-btn small">Read More</button>
                </a>

                <button
                  className={`summarize-btn small ${summarizing[news.url] ? 'loading' : ''}`}
                  onClick={() => handleSummarize(news)}
                  disabled={summarizing[news.url]}
                  title="Summarize News"
                >
                  {summarizing[news.url] ? <div className="spinner-small"></div> : <FaMagic />}
                </button>

                <button
                  className="share-btn icon-only small"
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
    </div>
  );
}

export default HeroNews;