import { useEffect, useState } from "react";

import {
  onAuthStateChanged,
  signOut
} from "firebase/auth";

import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  onSnapshot,
  serverTimestamp
} from "firebase/firestore";

import { auth, db } from "./firebase";

import {
  sendChatMessage,
  listenToMessages
} from "./services/messages";

import Login from "./pages/Login";
import Register from "./pages/Register";

import {
  Search,
  Plus,
  Send,
  LogOut,
  Users,
  MessageCircle,
  Settings,
  Loader2
} from "lucide-react";


function ChatApp({ user }) {

  const [contacts, setContacts] = useState([]);

  const [activeChat, setActiveChat] =
    useState(null);

  const [messages, setMessages] =
    useState([]);

  const [message, setMessage] =
    useState("");

  const [showNewChat, setShowNewChat] =
    useState(false);

  const [srId, setSrId] =
    useState("");

  const [searching, setSearching] =
    useState(false);

  const [searchResult, setSearchResult] =
    useState(null);

  const [searchError, setSearchError] =
    useState("");


  /* ===============================
     LOAD CONTACTS
  =============================== */

  useEffect(() => {

    const ref = collection(
      db,
      "users",
      user.uid,
      "contacts"
    );

    return onSnapshot(
      ref,
      (snapshot) => {

        setContacts(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
          }))
        );

      }
    );

  }, [user.uid]);


  /* ===============================
     SEARCH SR ID
  =============================== */

  const searchUser = async () => {

    const value =
      srId.trim().toUpperCase();

    if (!value) return;

    setSearching(true);
    setSearchError("");
    setSearchResult(null);

    try {

      const usersRef =
        collection(db, "users");

      const q = query(
        usersRef,
        where("srId", "==", value)
      );

      const snapshot =
        await getDocs(q);

      if (snapshot.empty) {

        setSearchError(
          "No user found."
        );

      } else {

        const doc =
          snapshot.docs[0];

        const data =
          doc.data();

        if (data.uid === user.uid) {

          setSearchError(
            "You cannot chat with yourself."
          );

        } else {

          setSearchResult({
            id: doc.id,
            ...data
          });

        }

      }

    } catch (error) {

      console.error(error);

      setSearchError(
        "Search failed."
      );

    } finally {

      setSearching(false);

    }

  };


  /* ===============================
     ADD CONTACT
  =============================== */

  const addContact = async () => {

    if (!searchResult) return;

    const exists =
      contacts.some(
        (c) =>
          c.uid === searchResult.uid
      );

    if (!exists) {

      await addDoc(
        collection(
          db,
          "users",
          user.uid,
          "contacts"
        ),
        {
          uid: searchResult.uid,
          name: searchResult.name,
          email: searchResult.email,
          srId: searchResult.srId,
          photoURL:
            searchResult.photoURL || "",
          addedAt:
            serverTimestamp()
        }
      );

    }

    setActiveChat(searchResult);

    setShowNewChat(false);
    setSrId("");
    setSearchResult(null);

  };


  /* ===============================
     REALTIME MESSAGES
  =============================== */

  useEffect(() => {

    if (!activeChat?.uid) {

      setMessages([]);

      return;

    }


    const chatId =
      [user.uid, activeChat.uid]
        .sort()
        .join("_");


    return listenToMessages(
      chatId,
      (data) => {
        setMessages(data);
      }
    );

  }, [activeChat, user.uid]);


  /* ===============================
     SEND MESSAGE
  =============================== */

  const send = async () => {

    if (!message.trim()) return;

    if (!activeChat?.uid) return;


    const chatId =
      [user.uid, activeChat.uid]
        .sort()
        .join("_");


    try {

      await sendChatMessage(
        chatId,
        user.uid,
        message
      );

      setMessage("");

    } catch (error) {

      console.error(error);

      alert(
        "Message send failed."
      );

    }

  };


  return (

    <div className="app">


      {/* =========================
          SIDEBAR
      ========================== */}

      <aside className="sidebar">

        <div className="brand">

          <div className="brand-logo">
            SR
          </div>

          <div>

            <h1>
              SRChat
            </h1>

            <span>
              {user.displayName ||
                user.email}
            </span>

          </div>

        </div>


        {/* NEW CHAT */}

        <button
          className="new-chat-btn"
          onClick={() =>
            setShowNewChat(true)
          }
        >

          <Plus size={18} />

          New Chat

        </button>


        {/* CONTACTS */}

        <div className="section-title">

          <span>
            Contacts
          </span>

        </div>


        <div className="chat-list">

          {contacts.length === 0 ? (

            <div className="empty-contacts">

              <Users size={24} />

              <p>
                No contacts yet
              </p>

              <span>
                Press New Chat
              </span>

            </div>

          ) : (

            contacts.map(
              (contact) => (

                <button
                  key={contact.id}
                  className={`chat-item ${
                    activeChat?.uid ===
                    contact.uid
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setActiveChat(
                      contact
                    )
                  }
                >

                  <div className="avatar">

                    {contact.name
                      ?.charAt(0)
                      ?.toUpperCase() ||
                      "U"}

                  </div>


                  <div className="chat-info">

                    <strong>
                      {contact.name}
                    </strong>

                    <span>
                      {contact.srId}
                    </span>

                  </div>

                </button>

              )
            )

          )}

        </div>


        {/* BOTTOM */}

        <div className="sidebar-bottom">

          <button>
            <MessageCircle
              size={20}
            />
            <span>
              Chats
            </span>
          </button>

          <button>
            <Users size={20} />
            <span>
              Groups
            </span>
          </button>

          <button>
            <Settings size={20} />
            <span>
              Settings
            </span>
          </button>

          <button
            onClick={() =>
              signOut(auth)
            }
          >

            <LogOut size={20} />

            <span>
              Logout
            </span>

          </button>

        </div>

      </aside>


      {/* =========================
          CHAT
      ========================== */}

      <main className="chat">

        {!activeChat ? (

          <div className="empty-chat">

            <div className="empty-chat-logo">
              SR
            </div>

            <h2>
              Welcome to SRChat
            </h2>

            <p>
              Start a new chat using
              an SR ID.
            </p>

          </div>

        ) : (

          <>

            <header className="chat-header">

              <div className="chat-user">

                <div className="avatar large">

                  {activeChat.name
                    ?.charAt(0)
                    ?.toUpperCase() ||
                    "U"}

                </div>

                <div>

                  <h2>
                    {activeChat.name}
                  </h2>

                  <span>
                    {activeChat.srId}
                  </span>

                </div>

              </div>

            </header>


            <section className="messages">

              {messages.length === 0 ? (

                <div className="no-messages">

                  <p>
                    No messages yet.
                  </p>

                  <span>
                    Say hello 👋
                  </span>

                </div>

              ) : (

                messages.map(
                  (msg) => {

                    const mine =
                      msg.senderId ===
                      user.uid;

                    return (

                      <div
                        key={msg.id}
                        className={`message ${
                          mine
                            ? "sent"
                            : "received"
                        }`}
                      >

                        <p>
                          {msg.text}
                        </p>

                        {mine && (
                          <div className="message-meta">
                            <span>
                              ✓✓
                            </span>
                          </div>
                        )}

                      </div>

                    );

                  }
                )

              )}

            </section>


            <div className="message-area">

              <input
                value={message}
                onChange={(e) =>
                  setMessage(
                    e.target.value
                  )
                }
                onKeyDown={(e) => {

                  if (
                    e.key ===
                    "Enter"
                  ) {
                    send();
                  }

                }}
                placeholder="Write a message..."
              />


              <button
                className="send-btn"
                onClick={send}
              >

                <Send size={20} />

              </button>

            </div>

          </>

        )}

      </main>


      {/* =========================
          NEW CHAT MODAL
      ========================== */}

      {showNewChat && (

        <div className="modal-overlay">

          <div className="modal">

            <h2>
              New Chat
            </h2>

            <p>
              Enter the person's SR ID.
            </p>


            <div className="auth-input">

              <Search size={18} />

              <input
                value={srId}
                onChange={(e) =>
                  setSrId(
                    e.target.value
                  )
                }
                placeholder="SR-XXXXXX"
              />

            </div>


            {searchError && (

              <div className="auth-error">

                {searchError}

              </div>

            )}


            {searchResult && (

              <div className="user-result">

                <div className="avatar">

                  {searchResult.name
                    ?.charAt(0)
                    ?.toUpperCase()}

                </div>

                <div className="user-result-info">

                  <strong>
                    {searchResult.name}
                  </strong>

                  <span>
                    {searchResult.srId}
                  </span>

                </div>

              </div>

            )}


            <div className="modal-actions">

              {!searchResult ? (

                <button
                  className="auth-submit"
                  onClick={searchUser}
                  disabled={searching}
                >

                  {searching ? (
                    <>
                      <Loader2
                        size={18}
                        className="spin"
                      />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search size={18} />
                      Find User
                    </>
                  )}

                </button>

              ) : (

                <button
                  className="auth-submit"
                  onClick={addContact}
                >

                  <MessageCircle
                    size={18}
                  />

                  Start Chat

                </button>

              )}


              <button
                className="icon-btn"
                onClick={() => {

                  setShowNewChat(false);
                  setSrId("");
                  setSearchResult(null);
                  setSearchError("");

                }}
              >

                Cancel

              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );

}


/* ===============================
   ROOT APP
================================ */

function App() {

  const [user, setUser] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [showRegister, setShowRegister] =
    useState(false);


  useEffect(() => {

    return onAuthStateChanged(
      auth,
      (currentUser) => {

        setUser(currentUser);
        setLoading(false);

      }
    );

  }, []);


  if (loading) {

    return (
      <div className="loading-screen">

        <div className="loading-logo">
          SR
        </div>

        <p>
          Loading SRChat...
        </p>

      </div>
    );

  }


  if (!user) {

    if (showRegister) {

      return (
        <Register
          onLogin={() =>
            setShowRegister(false)
          }
        />
      );

    }

    return (
      <Login
        onRegister={() =>
          setShowRegister(true)
        }
      />
    );

  }


  return (
    <ChatApp user={user} />
  );

}


export default App;
