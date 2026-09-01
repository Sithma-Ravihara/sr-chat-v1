import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";
import Login from "./pages/Login";
import Register from "./pages/Register";
import {
  Search,
  MessageCircle,
  Users,
  Settings,
  Plus,
  Send,
  Paperclip,
  Mic,
  MoreVertical,
  Phone,
  Video,
  Smile,
  CheckCheck,
  LogOut
} from "lucide-react";

const contacts = [
  {
    id: 1,
    name: "Alex",
    message: "Hey! Are you online?",
    time: "12:32",
    avatar: "A",
    online: true,
    unread: 2
  },
  {
    id: 2,
    name: "Nimal",
    message: "Let's build the app 🚀",
    time: "11:48",
    avatar: "N",
    online: true,
    unread: 0
  },
  {
    id: 3,
    name: "Kasun",
    message: "See you later!",
    time: "Yesterday",
    avatar: "K",
    online: false,
    unread: 0
  }
];

function ChatApp({ user }) {
  const [activeChat, setActiveChat] = useState(contacts[0]);
  const [message, setMessage] = useState("");

  const sendMessage = () => {
    if (!message.trim()) return;
    setMessage("");
  };

  return (
    <div className="app">

      <aside className="sidebar">

        <div className="brand">
          <div className="brand-logo">SR</div>

          <div>
            <h1>SRChat</h1>
            <span>
              {user.displayName || user.email}
            </span>
          </div>
        </div>

        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search chats..."
          />
        </div>

        <div className="section-title">
          <span>Recent chats</span>

          <button className="icon-btn">
            <Plus size={18} />
          </button>
        </div>

        <div className="chat-list">

          {contacts.map((contact) => (
            <button
              key={contact.id}
              className={`chat-item ${
                activeChat.id === contact.id
                  ? "active"
                  : ""
              }`}
              onClick={() => setActiveChat(contact)}
            >

              <div className="avatar">
                {contact.avatar}

                {contact.online && (
                  <span className="online-dot" />
                )}
              </div>

              <div className="chat-info">

                <div className="chat-top">
                  <strong>{contact.name}</strong>
                  <span>{contact.time}</span>
                </div>

                <div className="chat-bottom">
                  <p>{contact.message}</p>

                  {contact.unread > 0 && (
                    <span className="unread">
                      {contact.unread}
                    </span>
                  )}
                </div>

              </div>

            </button>
          ))}

        </div>

        <div className="sidebar-bottom">

          <button>
            <MessageCircle size={20} />
            <span>Chats</span>
          </button>

          <button>
            <Users size={20} />
            <span>Groups</span>
          </button>

          <button>
            <Settings size={20} />
            <span>Settings</span>
          </button>

          <button
            onClick={() => signOut(auth)}
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>

        </div>

      </aside>

      <main className="chat">

        <header className="chat-header">

          <div className="chat-user">

            <div className="avatar large">
              {activeChat.avatar}

              {activeChat.online && (
                <span className="online-dot" />
              )}
            </div>

            <div>
              <h2>{activeChat.name}</h2>

              <span>
                {activeChat.online
                  ? "Online"
                  : "Offline"}
              </span>
            </div>

          </div>

          <div className="header-actions">

            <button className="icon-btn">
              <Phone size={19} />
            </button>

            <button className="icon-btn">
              <Video size={19} />
            </button>

            <button className="icon-btn">
              <MoreVertical size={20} />
            </button>

          </div>

        </header>

        <section className="messages">

          <div className="date-divider">
            <span>Today</span>
          </div>

          <div className="message received">
            <p>Hey! 👋</p>
            <span>12:30</span>
          </div>

          <div className="message received">
            <p>
              Are you working on the new chat app?
            </p>
            <span>12:31</span>
          </div>

          <div className="message sent">
            <p>
              Yes! 🔥 I'm building SRChat.
            </p>

            <div className="message-meta">
              <span>12:31</span>
              <CheckCheck size={15} />
            </div>
          </div>

          <div className="message sent">
            <p>
              It's going to have realtime chat,
              contacts and groups.
            </p>

            <div className="message-meta">
              <span>12:32</span>
              <CheckCheck size={15} />
            </div>
          </div>

        </section>

        <div className="message-area">

          <button className="icon-btn">
            <Paperclip size={21} />
          </button>

          <button className="icon-btn">
            <Smile size={21} />
          </button>

          <input
            value={message}
            onChange={(e) =>
              setMessage(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
            placeholder="Write a message..."
          />

          {message.trim() ? (
            <button
              className="send-btn"
              onClick={sendMessage}
            >
              <Send size={20} />
            </button>
          ) : (
            <button className="send-btn">
              <Mic size={20} />
            </button>
          )}

        </div>

      </main>

    </div>
  );
}

function App() {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {

    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
        setLoading(false);
      }
    );

    return unsubscribe;

  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-logo">
          SR
        </div>

        <p>Loading SRChat...</p>
      </div>
    );
  }

  if (!user) {

    if (showRegister) {
      return (
        <Register
          onLogin={() => setShowRegister(false)}
        />
      );
    }

    return (
      <Login
        onRegister={() => setShowRegister(true)}
      />
    );
  }

  return <ChatApp user={user} />;
}

export default App;
