import axios from "axios";

function getMockArticles() {
  return [
    {
      title: "Global Intelligence Update: Monitoring International Events",
      description: "Our systems are currently monitoring global geopolitical developments. Stay tuned for real-time updates on international security and diplomacy.",
      url: "#",
      urlToImage: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80",
      source: { name: "GeoIntelX Monitor" },
      publishedAt: new Date().toISOString()
    },
    {
      title: "Economic Trends: Analysis of Global Market Stability",
      description: "Recent shifts in international trade patterns suggest a period of economic adjustment. Experts analyze the impact on global markets.",
      url: "#",
      urlToImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
      source: { name: "GeoIntelX Finance" },
      publishedAt: new Date().toISOString()
    }
  ];
}

export async function getTopNews(req, res) {
  try {
    const { category = "general", type = "standard" } = req.query;

    const apiKey = process.env.NEWS_API_KEY;
    if (!apiKey || apiKey === "" || (typeof apiKey === 'string' && apiKey.includes('your_api_key'))) {
      return res.json(getMockArticles());
    }

    let articles = [];
    
    // Determine which endpoint to use
    // Using a shorter timeout to stay within Vercel's 10s limit
    const fetchTimeout = 5000; 

    try {
      if (category === "general") {
        // For general news, 'everything' often gives better results than 'top-headlines'
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        const fromDate = threeDaysAgo.toISOString().split('T')[0];

        const response = await axios.get("https://newsapi.org/v2/everything", {
          params: {
            q: "world news OR global events OR international news",
            language: "en",
            pageSize: 40,
            from: fromDate,
            sortBy: "publishedAt",
            apiKey: apiKey,
          },
          timeout: fetchTimeout,
        });
        articles = response.data?.articles || [];
      } else {
        // For specific categories, use top-headlines
        const response = await axios.get("https://newsapi.org/v2/top-headlines", {
          params: {
            category,
            language: "en",
            pageSize: 40,
            apiKey: apiKey,
          },
          timeout: fetchTimeout,
        });
        articles = response.data?.articles || [];
      }
    } catch (err) {
      console.error(`News API fetch error:`, err.message);
      // If the first attempt fails, we'll fall back to mock data later
    }

    if (!Array.isArray(articles) || articles.length === 0) {
      return res.json(getMockArticles());
    }

    // Deduplication and Filtering
    const seenUrls = new Set();
    const uniqueArticles = articles.filter((article) => {
      if (!article || !article.title || article.title === "[Removed]" || !article.url || !article.urlToImage || !article.description) {
        return false;
      }
      const normalizedUrl = article.url.split('?')[0].toLowerCase();
      if (seenUrls.has(normalizedUrl)) return false;
      seenUrls.add(normalizedUrl);
      return true;
    });

    let result = [];
    if (type === "hero") {
      result = uniqueArticles.slice(0, 5);
    } else if (type === "trending") {
      result = uniqueArticles.slice(5, 15);
    } else {
      result = uniqueArticles.slice(0, 20);
    }

    if (result.length === 0) return res.json(getMockArticles());
    return res.json(result);
  } catch (error) {
    console.error("Top news controller error:", error);
    return res.json(getMockArticles());
  }
}

export async function searchNews(req, res) {
  try {
    const { q } = req.query;

    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const fromDate = threeDaysAgo.toISOString().split('T')[0];

    const excludeDomains = "allears.net,wdwnt.com,disneytouristblog.com,insidethemagic.net,disneyfoodblog.com";

    const response = await axios.get("https://newsapi.org/v2/everything", {
      params: {
        q,
        language: "en",
        pageSize: 50, // Reduced from 100
        from: fromDate,
        sortBy: "publishedAt",
        apiKey: process.env.NEWS_API_KEY,
      },
      timeout: 10000,
    });

    const articles = response.data.articles || [];
    
    if (articles.length === 0) {
      return res.json([]); // Return empty for search rather than mock data
    }
    const seenUrls = new Set();
    const seenImages = new Set();
    const seenTitles = [];

    const uniqueArticles = articles.filter((article) => {
      if (!article.title || article.title === "[Removed]" || !article.urlToImage || !article.description) {
        return false;
      }

      // Filter out duplicate images to ensure visual variety
      const imageUrl = article.urlToImage.split('?')[0]; // Ignore query params on images
      if (seenImages.has(imageUrl)) return false;

      // Normalize URL
      const normalizedUrl = article.url.split('?')[0].split('#')[0].toLowerCase();
      if (seenUrls.has(normalizedUrl)) return false;
      
      // Normalize Title for fuzzy matching
      const normalizedTitle = article.title
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .trim();

      const isDuplicateTitle = seenTitles.some(seen => {
        if (normalizedTitle.includes(seen) || seen.includes(normalizedTitle)) return true;
        const words1 = new Set(normalizedTitle.split(/\s+/));
        const words2 = new Set(seen.split(/\s+/));
        const commonWords = [...words1].filter(w => words2.has(w));
        const overlap = commonWords.length / Math.max(words1.size, words2.size);
        return overlap > 0.8;
      });

      if (isDuplicateTitle) return false;
      if (article.description.trim().length < 30) return false;

      seenUrls.add(normalizedUrl);
      seenImages.add(imageUrl);
      seenTitles.push(normalizedTitle);
      return true;
    });

    res.json(uniqueArticles.slice(0, 20));
  } catch (error) {
    console.error("News search error:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to search news" });
  }
}

export async function summarizeNews(req, res) {
  try {
    const { title, description, content } = req.body;

    if (!title && !description) {
      return res.status(400).json({ message: "Insufficient news data to summarize." });
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is missing in environment variables");
      return res.status(500).json({ message: "Summarization configuration error: API Key missing." });
    }

    const systemPrompt = `
      You are an expert news analyst. 
      Provide a concise summary of the following news article.
      
      Output requirements:
      - Exactly 3-5 bullet points.
      - Focus on key facts (Who, What, Where, When, Why).
      - Use professional and neutral tone.
      - Do not include any introductory or concluding remarks.
      - Start each point with "• ".
    `;

    const articleText = `Title: ${title}\nDescription: ${description}\nContent: ${content || ""}`;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `${systemPrompt}\n\nArticle to summarize:\n${articleText}`,
              },
            ],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const summary =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Could not generate summary.";

    res.json({ summary });
  } catch (error) {
    console.error("Summarization Error:", error.response?.data || error.message);
    
    const status = error.response?.status;
    const errorData = error.response?.data?.error;

    if (status === 403 && errorData?.message?.includes("leaked")) {
      return res.status(403).json({
        message: "Summarization error: Your Gemini API Key has been disabled because it was reported as leaked. Please generate a new key at Google AI Studio and update your .env file.",
      });
    }

    if (status === 429) {
      return res.status(429).json({
        message: "Summarization is temporarily unavailable due to API quota limits. Please try again later.",
      });
    }

    const backendError = errorData?.message || error.message;
    res.status(status || 500).json({ message: `Failed to summarize news article: ${backendError}` });
  }
}