import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    status: "BuildFlow AI Server is running",
  });
});

app.post("/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!Array.isArray(messages)) {
      return res.status(400).json({
        error: "Messages must be an array",
      });
    }

    if (!process.env.OLLAMA_API_KEY) {
      throw new Error("OLLAMA_API_KEY is missing");
    }

    const latestUserMessage =
      [...messages]
        .reverse()
        .find((message) => message.role === "user")
        ?.text?.trim() || "";

    const isRussian = /[а-яА-ЯёЁ]/.test(latestUserMessage);

    const languageInstruction = isRussian
      ? `
LANGUAGE MODE: RUSSIAN.

The user's most recent message is written in Russian.

You MUST answer ONLY in Russian.
Do not answer in English.
`
      : `
LANGUAGE MODE: ENGLISH.

The user's most recent message is written in English.

You MUST answer ONLY in English.
Do not answer in Russian.
`;

    const systemPrompt = `
You are BuildFlow AI, a professional AI construction assistant.

${languageInstruction}

The language mode above is mandatory.

Use the full conversation history as context.

You are an experienced:
- construction engineer
- project manager
- construction planner
- cost estimator

Your areas of expertise include:
- construction planning
- cost estimation
- material selection
- engineering
- architecture
- project risks
- scheduling
- budgeting

Give practical and structured answers.

When enough information is available, provide:
1. Recommendation
2. Estimated cost
3. Estimated duration
4. Risks
5. Better alternatives

If important project information is missing, ask concise clarifying questions first.
`;

    const ollamaMessages = messages
      .filter(
        (message) =>
          message &&
          typeof message.text === "string" &&
          ["user", "assistant"].includes(message.role)
      )
      .map((message) => ({
        role: message.role,
        content: message.text,
      }));

    console.log("Последнее сообщение:", latestUserMessage);
    console.log("Русский язык:", isRussian);
    console.log("История сообщений:", ollamaMessages.length);

    const response = await fetch("https://ollama.com/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + process.env.OLLAMA_API_KEY,
      },
      body: JSON.stringify({
      model: "gpt-oss:20b",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          ...ollamaMessages,
        ],
        stream: false,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Ollama API response:", data);

      throw new Error(
        data?.error?.message ||
          data?.error ||
          "Ollama API request failed"
      );
    }

    const reply = data?.message?.content?.trim();

    if (!reply) {
      throw new Error("Ollama returned an empty response");
    }

    console.log("Ответ BuildFlow получен.");

    res.json({
      reply,
    });
  } catch (error) {
    console.error("BuildFlow AI error:", error);

    res.status(500).json({
      error: error.message || "Internal server error",
    });
  }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`AI Server running on port ${PORT}`);
});