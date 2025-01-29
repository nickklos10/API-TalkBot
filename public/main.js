// Keep type="module" in script tag

// Initialize all elements first
let chatLog, userInput, newChatButton, sendButton, themeToggle;
let chats = [];
let currentChatId = null;

// Initialize application
function init() {
  cacheDOMElements();
  setupEventListeners();
  setupThemeToggle(); // Uses Font Awesome icons for dark/light
  createNewChat();
}

function cacheDOMElements() {
  chatLog = document.getElementById("chat-log");
  userInput = document.getElementById("user-input");
  newChatButton = document.getElementById("new-chat-button");
  sendButton = document.getElementById("send-button");
  // This is the <div id="theme-toggle"> containing .fa-sun and .fa-moon
  themeToggle = document.getElementById("theme-toggle");
}

function setupEventListeners() {
  newChatButton.addEventListener("click", createNewChat);
  sendButton.addEventListener("click", sendMessage);
  userInput.addEventListener("keypress", handleInputKeyPress);

  // Click on chat item to switch active chat (unless clicking the edit button)
  document.getElementById("chat-history").addEventListener("click", (e) => {
    if (e.target.closest(".edit-chat-btn")) return;

    const chatItem = e.target.closest(".chat-item");
    if (chatItem) {
      const chatId = parseInt(chatItem.dataset.chatId);
      setActiveChat(chatId);
    }
  });

  // Double-click on chat name to edit
  document.getElementById("chat-history").addEventListener("dblclick", (e) => {
    const chatName = e.target.closest(".chat-name");
    if (chatName) {
      const chatItem = chatName.closest(".chat-item");
      const chatId = parseInt(chatItem.dataset.chatId);
      startEditChatName(chatId);
    }
  });
}

/**
 * Sets up dark/light mode based on localStorage
 * and toggles .light-mode on body on each click.
 */
function setupThemeToggle() {
  // Load saved theme from localStorage
  const savedTheme = localStorage.getItem("theme") || "dark";
  if (savedTheme === "light") {
    document.body.classList.add("light-mode");
  }

  // Click handler: toggle .light-mode, store preference
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
    const isLight = document.body.classList.contains("light-mode");
    localStorage.setItem("theme", isLight ? "light" : "dark");
  });
}

function createNewChat() {
  const newChat = {
    id: Date.now(),
    name: `Chat ${chats.length + 1}`,
    messages: [],
    createdAt: new Date(),
  };

  chats.push(newChat);
  currentChatId = newChat.id;
  renderChatHistory();
  clearChatLog();
}

function renderChatHistory() {
  const historyContainer = document.getElementById("chat-history");
  historyContainer.innerHTML = chats
    .map(
      (chat) => `
      <div class="chat-item ${
        chat.id === currentChatId ? "active" : ""
      }" data-chat-id="${chat.id}">
        <div class="chat-content">
          <span class="chat-name" title="Double click to edit">${
            chat.name
          }</span>
          <button class="edit-chat-btn" onclick="editChatName(${chat.id})">
            <ion-icon name="pencil"></ion-icon>
          </button>
        </div>
      </div>
    `
    )
    .join("");
}

/** Called when user clicks the pencil icon on a chat item. */
function editChatName(chatId) {
  const chatItem = document.querySelector(
    `.chat-item[data-chat-id="${chatId}"]`
  );
  const chatName = chatItem.querySelector(".chat-name");
  const currentName = chatName.textContent;

  // Create and show input field
  const input = document.createElement("input");
  input.type = "text";
  input.value = currentName;
  input.className = "chat-name-input";

  // Replace chat name with input
  chatName.style.display = "none";
  chatName.parentNode.insertBefore(input, chatName);

  // Focus and select all text
  input.focus();
  input.select();

  // Save new name on enter or blur
  function saveNewName() {
    const newName = input.value.trim() || currentName;
    const chat = chats.find((c) => c.id === chatId);
    if (chat) {
      chat.name = newName;
      chatName.textContent = newName;
    }
    chatName.style.display = "";
    input.remove();
  }

  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      saveNewName();
    }
  });

  input.addEventListener("blur", saveNewName);
}

/** Called when user double-clicks on the .chat-name text within a chat item. */
function startEditChatName(chatId) {
  editChatName(chatId);
}

function setActiveChat(chatId) {
  currentChatId = chatId;
  const chat = chats.find((c) => c.id === chatId);
  clearChatLog();
  if (chat) {
    chat.messages.forEach((msg) =>
      displayMessage(msg.sender, msg.content, false)
    );
  }
  renderChatHistory();
}

function clearChatLog() {
  chatLog.innerHTML = "";
}

function displayMessage(sender, message, animate = true) {
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${sender}`;
  messageDiv.textContent = message;

  if (animate) {
    messageDiv.style.opacity = "0";
    messageDiv.style.transform = "translateY(20px)";
    setTimeout(() => {
      messageDiv.style.opacity = "1";
      messageDiv.style.transform = "translateY(0)";
    }, 10);
  }

  chatLog.appendChild(messageDiv);
  chatLog.scrollTop = chatLog.scrollHeight;
}

function handleInputKeyPress(e) {
  if (e.key === "Enter") {
    sendMessage();
  }
}

async function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  userInput.value = "";
  displayMessage("user", message);

  try {
    const response = await getChatbotResponse(message);
    displayMessage("chatbot", response);

    // Save message to current chat
    const currentChat = chats.find((chat) => chat.id === currentChatId);
    if (currentChat) {
      currentChat.messages.push({ sender: "user", content: message });
      currentChat.messages.push({ sender: "chatbot", content: response });
    }
  } catch (error) {
    console.error("Error:", error);
    displayMessage("chatbot", "Sorry, something went wrong. Please try again.");
  }
}

async function getChatbotResponse(userMessage) {
  try {
    // Example POST request to your backend endpoint
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
    throw error; // Rethrow to handle in sendMessage
  }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", init);

// Expose necessary functions to global scope
window.createNewChat = createNewChat;
window.setActiveChat = setActiveChat;
window.editChatName = editChatName;
window.startEditChatName = startEditChatName;
