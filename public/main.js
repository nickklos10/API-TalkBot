const chatLog = document.getElementById("chat-log");
const userInput = document.getElementById("user-input");
const themeToggle = document.getElementById("theme-toggle");

themeToggle.addEventListener("change", () => {
  document.body.classList.toggle("dark-mode");
});

window.sendMessage = function () {
  const message = userInput.value.trim();
  if (message) {
    // Display the user's message in the chat
    displayMessage("user", message);

    // Send the message to the server to get a response from the OpenAI API
    getChatbotResponse(message).then((responseMessage) => {
      // Display the assistant's response in the chat
      displayMessage("chatbot", responseMessage);
    });

    userInput.value = "";
  }
};

function displayMessage(sender, message) {
  const messageElement = document.createElement("div");
  messageElement.classList.add("message", sender);
  messageElement.textContent = message;
  chatLog.appendChild(messageElement);
  chatLog.scrollTop = chatLog.scrollHeight;
}

async function getChatbotResponse(userMessage) {
  try {
    const response = await fetch("/getChatbotResponse", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userMessage }),
    });

    const data = await response.json();
    return data.chatbotResponse;
  } catch (error) {
    console.error("Error:", error);
    return "Sorry, something went wrong.";
  }
}
