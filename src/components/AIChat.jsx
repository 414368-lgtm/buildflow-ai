import { useState, useEffect, useRef } from "react";

export default function AIChat() {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("buildflow-chat");

    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        localStorage.removeItem("buildflow-chat");
      }
    }

    return [
      {
        role: "assistant",
        text: "👋 Welcome! I am BuildFlow AI. Describe your construction project.",
      },
    ];
  });

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  useEffect(() => {
    localStorage.setItem("buildflow-chat", JSON.stringify(messages));
  }, [messages]);

  function startNewChat() {
    localStorage.removeItem("buildflow-chat");

    setMessages([
      {
        role: "assistant",
        text: "👋 Welcome! I am BuildFlow AI. Describe your construction project.",
      },
    ]);

    setInput("");
  }

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const prompt = input.trim();

    const nextMessages = [
      ...messages,
      {
        role: "user",
        text: prompt,
      },
    ];

    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:3001/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: nextMessages,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: data.reply,
        },
      ]);
    } catch (err) {
      console.error(err);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "❌ Error connecting to AI server.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div>
          <h2>🏗 BuildFlow AI</h2>

          <p className="chat-subtitle">
            Your AI construction assistant
          </p>
        </div>

        <span className="online-badge">
          🟢 Online
        </span>

        <button
          type="button"
          onClick={startNewChat}
          className="new-chat-button"
        >
          New Chat
        </button>
      </div>

      <div className="messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={
              msg.role === "user"
                ? "message user"
                : "message assistant"
            }
          >
            {msg.role === "assistant" && (
              <div className="avatar">🏗</div>
            )}

            <div className="bubble">
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="message assistant typing">
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sendMessage();
            }
          }}
          placeholder="Describe your project..."
          disabled={loading}
        />

        <button
          type="button"
          onClick={sendMessage}
          disabled={loading || !input.trim()}
        >
          {loading ? "Thinking..." : "Send"}
        </button>
      </div>
    </div>
  );
}