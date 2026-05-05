import axios from "axios";

export async function askGemini(req, res) {
  console.log("Chatbot request received:", req.body);
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ reply: "Please enter a question." });
    }

    const systemPrompt = `
You are GeoIntelX AI Assistant.
Answer questions about geopolitics, military, countries, news, UPSC current affairs, and general knowledge.
Keep answers clear, short, and helpful.
`;

    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent",
      {
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `${systemPrompt}\n\nUser question: ${message}`,
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

    const reply =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I could not generate a response.";

    res.json({ reply });
  } catch (error) {
    console.error("Gemini API Error:", error.response?.data || error.message);
    
    const status = error.response?.status;
    const errorData = error.response?.data?.error;

    if (status === 429) {
      return res.status(429).json({
        reply: "Chatbot is temporarily unavailable due to high demand (API quota exceeded). Please try again in a few minutes.",
      });
    }

    const backendError = errorData?.message || error.message;
    res.status(status || 500).json({
      reply: `Chatbot error: ${backendError}`,
    });
  }
}