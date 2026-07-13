import { useEffect, useRef, useState } from "react";

const WELCOME_MESSAGE = {
  role: "assistant",
  text: "👋 Welcome! I am BuildFlow AI. Describe your construction project.",
};

export default function AIChat() {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("buildflow-chat");

    if (saved) {
      try {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (error) {
        console.error("Chat history error:", error);
      }
    }

    return [WELCOME_MESSAGE];
  });

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(
      "buildflow-chat",
      JSON.stringify(messages)
    );
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  function startNewChat() {
    localStorage.removeItem("buildflow-chat");
    setMessages([WELCOME_MESSAGE]);
    setInput("");
    setLoading(false);
  }

  async function sendMessage() {
    if (!input.trim() || loading) {
      return;
    }

    const userMessage = {
      role: "user",
      text: input.trim(),
    };

    const nextMessages = [
      ...messages,
      userMessage,
    ];

    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(
        "https://intelligent-clarity-production-0bcd.up.railway.app/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: nextMessages,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "AI server error"
        );
      }

      if (!data.reply) {
        throw new Error(
          "Empty AI response"
        );
      }

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          role: "assistant",
          text: data.reply,
        },
      ]);
    } catch (error) {
      console.error(
        "BuildFlow AI error:",
        error
      );

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          role: "assistant",
          text: "❌ BuildFlow AI is temporarily unavailable. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      sendMessage();
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
          className="new-chat-button"
          onClick={startNewChat}
        >
          New Chat
        </button>
      </div>

      <div className="messages">
        {messages.map((message, index) => (
          <div
            key={index}
            className={
              message.role === "user"
                ? "message user"
                : "message assistant"
            }
          >
            {message.role === "assistant" && (
              <div className="avatar">
                🏗
              </div>
            )}

            <div className="bubble">
              {message.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="message assistant">
            <div className="avatar">
              🏗
            </div>

            <div className="bubble">
              Thinking...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
       <input
  type="text"
          value={input}
          onChange={(event) =>
            setInput(event.target.value)
          }
          onKeyDown={handleKeyDown}
          placeholder="Describe your project..."
          disabled={loading}
        />

        <button
          type="button"
          onClick={sendMessage}
          disabled={
            loading || !input.trim()
          }
        >
          {loading ? "Thinking..." : "Send"}
        </button>
      </div>
    </div>
  );
}