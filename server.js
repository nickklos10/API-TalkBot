process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { OpenAIAPI } from "./openai.js"; // Correct import for backend

const app = express();
const port = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/getChatbotResponse", async (req, res) => {
  const userMessage = req.body.userMessage;

  try {
    // Use OpenAI API to generate a response
    const chatbotResponse = await OpenAIAPI.generateResponse(userMessage);

    // Send the response back to the client
    res.json({ chatbotResponse });
  } catch (error) {
    console.error("Error generating chatbot response:", error);
    res.status(500).json({ error: "Failed to generate chatbot response" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
