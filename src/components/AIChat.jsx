import { useState } from "react";

export default function AIChat() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "👋 Hello! I'm your Construction AI Assistant. Describe the house you want to build."
    }
  ]);

  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMessage = {
      role: "user",
      text: input
    };

    setMessages((prev) => [
      ...prev,
      userMessage,
      {
        role: "assistant",
        text: "⌛ AI connection will be added in the next step..."
      }
    ]);

    setInput("");
  };

  return (
    <div className="ai-chat">
      <div className="ai-chat-header">
        <h2>🏗 Construction AI</h2>
        <span>Online</span>
      </div>

      <div className="ai-chat-body">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.role}`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      <div className="ai-chat-footer">
        <input
          type="text"
          placeholder="Describe your project..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
        />

        <button onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
}