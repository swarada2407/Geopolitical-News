import { useState } from "react";
import { askChatbot } from "../services/api";

function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hi! I am GeoIntelX AI (Updated). Ask me about news, geopolitics, military, or UPSC current affairs.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!input.trim()) return;

    const userMessage = {
      sender: "user",
      text: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await askChatbot(input);

      console.log("Chatbot response:", res.data);

      if (res.data && res.data.reply) {
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: res.data.reply,
          },
        ]);
      } else {
        throw new Error("Invalid response format from server");
      }
    } catch (err) {
      console.error("Chatbot frontend error:", err);
      const errorMsg =
        err.response?.data?.reply || 
        err.response?.data?.message ||
        err.message ||
        "Sorry, chatbot is not available right now.";
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: `Error: ${errorMsg}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button className="chatbot-icon" onClick={() => setOpen(!open)}>
        💬
      </button>

      {open && (
        <div className="chatbot-box">
          <div className="chatbot-header">
            <div>
              <h3>GeoIntelX AI</h3>
              <p>Gemini Assistant</p>
            </div>

            <button onClick={() => setOpen(false)}>×</button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={
                  msg.sender === "user"
                    ? "chat-message user-message"
                    : "chat-message bot-message"
                }
              >
                {msg.text}
              </div>
            ))}

            {loading && (
              <div className="chat-message bot-message">Typing...</div>
            )}
          </div>

          <div className="chatbot-input">
            <input
              type="text"
              placeholder="Ask anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
            />

            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
    </>
  );
}

export default Chatbot;
