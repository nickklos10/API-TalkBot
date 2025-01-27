import fetch from "node-fetch"; // Import fetch for server-side use (if using Node.js)
import { OpenAIAPIKey } from "./config.js"; // Import the API key from config.js

export class OpenAIAPI {
  static conversationHistory = [
    { role: "system", content: "You are a helpful assistant." },
  ];

  static async generateResponse(userMessage) {
    const apiKey = OpenAIAPIKey;
    const endpoint = "https://api.openai.com/v1/chat/completions";

    // Add the user's message to the conversation history
    OpenAIAPI.conversationHistory.push({ role: "user", content: userMessage });

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: OpenAIAPI.conversationHistory,
          max_tokens: 150,
        }),
      });

      const responseData = await response.json();

      // Log the entire response for debugging
      console.log("Response from OpenAI API:", responseData);

      // Check if choices array exists and has at least one item
      if (responseData.choices && responseData.choices.length > 0) {
        const assistantMessage = responseData.choices[0].message.content.trim();
        OpenAIAPI.conversationHistory.push({
          role: "assistant",
          content: assistantMessage,
        });
        return assistantMessage;
      } else {
        console.error(
          "Error: No valid response from OpenAI API:",
          responseData
        );
        return "Sorry, I could not understand that.";
      }
    } catch (error) {
      console.error("Error while communicating with OpenAI API:", error);
      return "Sorry, there was an error processing your request.";
    }
  }
}
