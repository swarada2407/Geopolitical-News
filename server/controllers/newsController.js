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
      console.error("NEWS_API_KEY is missing or using default placeholder");
      return res.json(getMockArticles());
    }

    let articles = [];
    
    // For specific categories (except general), /top-headlines usually works better
    if (category !== "general") {
      try {
        const response = await axios.get("https://newsapi.org/v2/top-headlines", {
          params: {
            category,
            language: "en",
            pageSize: 50,
            apiKey: apiKey,
          },
          timeout: 8000, // Reduced slightly to stay within Vercel limits
        });
        articles = response.data?.articles || [];
      } catch (err) {
        console.error(`Top-headlines fetch error for ${category}:`, err.message);
      }
    }

    // Safety check for articles array
    if (!Array.isArray(articles)) articles = [];

    const articlesWithImages = articles.filter(a => a && a.urlToImage && a.description && a.description.length > 20);
    
    if (category === "general" || articlesWithImages.length < 5) {
      const queryMap = {
        general: "world news OR global events OR international news",
        business: "business news OR economy OR finance",
        technology: "technology OR tech news",
        science: "science news OR discovery",
        health: "health news OR medical",
        sports: "sports news",
      };

      let q = queryMap[category] || category;

      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      const fromDate = threeDaysAgo.toISOString().split('T')[0];

      try {
        const response = await axios.get("https://newsapi.org/v2/everything", {
          params: {
            q,
            language: "en",
            pageSize: 50,
            from: fromDate,
            sortBy: "publishedAt",
            apiKey: apiKey,
          },
          timeout: 8000,
        });
        
        const everythingArticles = response.data?.articles || [];
        if (Array.isArray(everythingArticles)) {
          articles = [...articles, ...everythingArticles];
        }
      } catch (err) {
        console.error(`Everything fetch error for ${category}:`, err.message);
      }
    }

    if (!Array.isArray(articles) || articles.length === 0) {
      return res.json(getMockArticles());
    }

    // Strict Filtering & Deduplication
    const seenUrls = new Set();
    const seenImages = new Set();
    const seenTitles = []; 
    
    const uniqueArticles = articles.filter((article) => {
      // Basic sanity check for required fields
      if (!article || !article.title || article.title === "[Removed]" || !article.url || !article.urlToImage || !article.description) {
        return false;
      }

      try {
        // Filter out duplicate images
        const imageUrl = typeof article.urlToImage === 'string' ? article.urlToImage.split('?')[0] : '';
        if (!imageUrl || seenImages.has(imageUrl)) return false;

        // Normalize URL
        const normalizedUrl = typeof article.url === 'string' ? article.url.split('?')[0].split('#')[0].toLowerCase() : '';
        if (!normalizedUrl || seenUrls.has(normalizedUrl)) return false;
        
        // Normalize Title
        const normalizedTitle = typeof article.title === 'string' 
          ? article.title.toLowerCase()
              .replace(/^(how|the|a|an|breaking|just in|exclusive|update):?\s+/i, "")
              .replace(/[^a-z0-9\s]/g, "")
              .trim()
          : '';

        if (!normalizedTitle) return false;

        const isDuplicateTitle = seenTitles.some(seen => {
          if (normalizedTitle.includes(seen) || seen.includes(normalizedTitle)) return true;
          
          const words1 = normalizedTitle.split(/\s+/);
          const words2 = seen.split(/\s+/);
          const wordsSet2 = new Set(words2);
          const commonWords = words1.filter(w => wordsSet2.has(w));
          const overlap = commonWords.length / Math.max(words1.length, words2.length);
          return overlap > 0.8;
        });

        if (isDuplicateTitle) return false;
        if (typeof article.description === 'string' && article.description.trim().length < 30) return false;

        seenUrls.add(normalizedUrl);
        seenImages.add(imageUrl);
        seenTitles.push(normalizedTitle);
        return true;
      } catch (err) {
        return false;
      }
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
    console.error("News fetch error:", error);
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
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent",
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
          "x-goog-api-key": process.env.GEMINI_API_KEY,
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

    if (status === 429) {
      return res.status(429).json({
        message: "Summarization is temporarily unavailable due to API quota limits. Please try again later.",
      });
    }

    const backendError = errorData?.message || error.message;
    res.status(status || 500).json({ message: `Failed to summarize news article: ${backendError}` });
  }
}