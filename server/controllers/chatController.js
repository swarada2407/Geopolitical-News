import axios from "axios";

export async function askGemini(req, res) {
  const { message } = req.body;
  console.log("Chatbot request for message:", message);
  
  try {
    if (!message || !message.trim()) {
      return res.status(400).json({ reply: "Please enter a message." });
    }

    const systemPrompt = "You are GeoIntelX AI Assistant. Answer questions about geopolitics, military, and news concisely.";

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `${systemPrompt}\n\nUser: ${message}`,
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

    const reply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't generate a response.";
    res.json({ reply });
  } catch (error) {
    console.error("Gemini API Error:", error.response?.data || error.message);
    
    const status = error.response?.status;
    const errorData = error.response?.data?.error;

    if (status === 403 && errorData?.message?.includes("leaked")) {
      return res.status(403).json({
        reply: "Chatbot error: Your Gemini API Key has been disabled because it was reported as leaked. Please generate a new key at Google AI Studio and update your .env file.",
      });
    }

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