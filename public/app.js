const socket = io();

const joinScreen = document.getElementById("joinScreen");
const chatScreen = document.getElementById("chatScreen");
const joinForm = document.getElementById("joinForm");
const messageForm = document.getElementById("messageForm");
const usernameInput = document.getElementById("username");
const messageInput = document.getElementById("messageInput");
const messages = document.getElementById("messages");
const onlineCount = document.getElementById("onlineCount");

let username = "";

joinForm.addEventListener("submit", (event) => {
event.preventDefault();

username = usernameInput.value.trim().slice(0, 20);

if (!username) return;

socket.emit("join", username);

joinScreen.hidden = true;
chatScreen.hidden = false;
messageInput.focus();
});

messageForm.addEventListener("submit", (event) => {
event.preventDefault();

const text = messageInput.value.trim();

if (!text || !username) return;

if (!socket.connected) {
addSystemMessage("Connection lost. Please wait...");
return;
}

socket.emit("chat message", text);
messageInput.value = "";
messageInput.focus();
});

socket.on("chat message", (message) => {
const item = document.createElement("article");
item.className = "message";

const name = document.createElement("span");
name.className = "name";
name.textContent = message.username;

const text = document.createElement("div");
text.className = "text";
text.textContent = message.text;

const time = document.createElement("time");
time.className = "time";

const date = new Date(message.time);

time.textContent = date.toLocaleTimeString([], {
hour: "2-digit",
minute: "2-digit"
});

item.append(name, text, time);
messages.appendChild(item);

messages.scrollTop = messages.scrollHeight;
});

socket.on("system", (data) => {
addSystemMessage(data.text);
});

socket.on("online", (count) => {
onlineCount.textContent = count;
});

socket.on("connect_error", () => {
addSystemMessage("Unable to connect. Please refresh the page.");
});

function addSystemMessage(text) {
const item = document.createElement("div");
item.className = "system-message";
item.textContent = text;

messages.appendChild(item);
messages.scrollTop = messages.scrollHeight;
  }
