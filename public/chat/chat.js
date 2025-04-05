// Generate and store unique userId in localStorage
let userId = localStorage.getItem("userId");
if (!userId) {
  userId = crypto.randomUUID();
  localStorage.setItem("userId", userId);
}

// Load token if available
const token = localStorage.getItem('token');

// Get pageId from query string
const urlParams = new URLSearchParams(window.location.search);
const pageId = urlParams.get("pageId");

const chatBox = document.getElementById("chat-box");
const messageInput = document.getElementById("message-input");
const sendBtn = document.getElementById("send-btn");

// Scroll chat to bottom
const scrollToBottom = () => {
  chatBox.scrollTop = chatBox.scrollHeight;
};

// Render message
function appendMessage(sender, content) {
  const messageElement = document.createElement("div");
  messageElement.classList.add("message", sender);
  messageElement.innerHTML = `<span>${content}</span>`;
  chatBox.appendChild(messageElement);
  scrollToBottom();
}

// Send message to server
async function sendMessage() {
  const content = messageInput.value.trim();
  if (!content) return;

  appendMessage("user", content);
  messageInput.value = "";

  try {
    const response = await fetch("/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { "Authorization": `Bearer ${token}` }),
      },
      body: JSON.stringify({
        pageId,
        userId,
        message: content,
        source: "web",
      }),
    });

    const data = await response.json();
    if (data.response) {
      appendMessage("bot", data.response);
    } else {
      appendMessage("bot", "❌ لم أستطع معالجة رسالتك.");
    }
  } catch (err) {
    console.error("Error sending message:", err);
    appendMessage("bot", "❌ حدث خطأ أثناء الاتصال بالخادم.");
  }
}

// Handle send button click or Enter key
sendBtn.addEventListener("click", sendMessage);
messageInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    sendMessage();
  }
});
