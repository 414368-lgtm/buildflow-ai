import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import ollama from "ollama";

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
    const { message } = req.body;

    const response = await ollama.chat({
      model: "qwen2.5:7b",
      messages: [
        {
          role: "system",
          content: `
You are BuildFlow AI.

You help construction companies.

Your tasks:
- Project planning
- Cost estimation
- Risk analysis
- Resource management
- Scheduling
- Contract advice
- Productivity improvement

Always answer professionally.
`,
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    res.json({
      reply: response.message.content,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message,
    });
  }
});

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`AI Server running on http://localhost:${PORT}`);
});