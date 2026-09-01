import { useEffect, useState } from "react";

import {
  onAuthStateChanged,
  signOut
} from "firebase/auth";

import {
  collection,
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
  LogOut,
  UserPlus,
  Loader2
} from "lucide-react";


/* =========================================
   CHAT APP
========================================= */

function ChatApp({ user }) {

  const [search, setSearch] = useState("");

  const [searchResults, setSearchResults] =
    useState([]);

  const [searching, setSearching] =
    useState(false);

  const [searchError, setSearchError] =
    useState("");

  const [contacts, setContacts] =
    useState([]);

  const [activeChat, setActiveChat] =
    useState(null);

  const [messages, setMessages] =
    useState([]);

  const [message, setMessage] =
    useState("");

  const [sending, setSending] =
    useState(false);


  /* =========================================
     SEARCH USERS
  ========================================= */

  useEffect(() => {

    const timer = setTimeout(async () => {

      const value =
        search.trim().toLowerCase();

      setSearchError("");
      setSearchResults([]);

      if (!value) {
        return;
      }

      if (
        value ===
        user.email?.toLowerCase()
      ) {

        setSearchError(
          "You cannot add yourself."
        );

        return;
      }

      try {

        setSearching(true);

        const { searchUsers } =
          await import(
            "./services/users"
          );

        const results =
          await searchUsers(value);

        setSearchResults(results);

        if (results.length === 0) {

          setSearchError(
            "No users found."
          );

        }

      } catch (error) {

        console.error(
          "Search error:",
          error
        );

        setSearchError(
          "Search failed."
        );

      } finally {

        setSearching(false);

      }

    }, 400);


    return () =>
      clearTimeout(timer);

  }, [search, user]);


  /* =========================================
     LOAD CONTACTS
  ========================================= */

  useEffect(() => {

    if (!user?.uid) {
      return;
    }

    const contactsRef =
      collection(
        db,
        "users",
        user.uid,
        "contacts"
      );


    const unsubscribe =
      onSnapshot(
        contactsRef,
        (snapshot) => {

          const list =
            snapshot.docs.map(
              (item) => ({
                id: item.id,
                ...item.data()
              })
            );

          setContacts(list);

        },
        (error) => {

          console.error(
            "Contacts error:",
            error
          );

        }
      );


    return unsubscribe;

  }, [user]);


  /* =========================================
     REALTIME MESSAGE LISTENER
  ========================================= */

  useEffect(() => {

    setMessages([]);

    if (!activeChat?.uid) {
      return;
    }


    /*
     * IMPORTANT:
     * Both users get the same chat ID.
     */

    const chatId = [
      user.uid,
      activeChat.uid
    ]
      .sort()
      .join("_");


    console.log(
      "Listening to chat:",
      chatId
    );


    const unsubscribe =
      listenToMessages(
        chatId,
        (newMessages) => {

          setMessages(
            newMessages
          );

        }
      );


    return unsubscribe;

  }, [activeChat, user]);


  /* =========================================
     ADD CONTACT
  ========================================= */

  const addContact = async (person) => {

    if (!person?.uid) {
      return;
    }


    try {

      const exists =
        contacts.some(
          (contact) =>
            contact.uid === person.uid
        );


      if (exists) {

        setSearchError(
          "Already in your contacts."
        );

        return;
      }


      await addDoc(
        collection(
          db,
          "users",
          user.uid,
          "contacts"
        ),
        {
          uid: person.uid,
          name: person.name || "",
          email: person.email || "",
          photoURL:
            person.photoURL || "",
          addedAt:
            serverTimestamp()
        }
      );


      setSearch("");
      setSearchResults([]);
      setSearchError("");


    } catch (error) {

      console.error(
        "Add contact error:",
        error
      );

      setSearchError(
        "Could not add contact."
      );

    }

  };


  /* =========================================
     SEND MESSAGE
  ========================================= */

  const handleSendMessage = async () => {

    if (!message.trim()) {
      return;
    }

    if (!activeChat?.uid) {
      return;
    }

    if (sending) {
      return;
    }


    /*
     * SAME CHAT ID FOR BOTH USERS
     */

    const chatId = [
      user.uid,
      activeChat.uid
    ]
      .sort()
      .join("_");


    try {

      setSending(true);


      await sendChatMessage(
        chatId,
        user.uid,
        message
      );


      setMessage("");


    } catch (error) {

      console.error(
        "Send message error:",
        error
      );

    } finally {

      setSending(false);

    }

  };


  /* =========================================
     LOGOUT
  ========================================= */

  const logout = async () => {

    await signOut(auth);

  };


  /* =========================================
     UI
  ========================================= */

  return (

    <div className="app">


      {/* =====================================
          SIDEBAR
      ====================================== */}

      <aside className="sidebar">


        {/* BRAND */}

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


        {/* SEARCH */}

        <div className="search-box">

          <Search size={18} />

          <input
            type="email"
            placeholder="Search by email..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          {searching && (

            <Loader2
              size={17}
              className="spin"
            />

          )}

        </div>


        {/* SEARCH RESULTS */}

        {search.trim() && (

          <div className="search-results">

            {searchError &&
              !searching && (

                <div className="search-empty">

                  {searchError}

                </div>

              )}


            {searchResults.map(
              (person) => (

                <div
                  className="user-result"
                  key={person.uid}
                >

                  <div className="avatar">

                    {person.name
                      ?.charAt(0)
                      ?.toUpperCase() ||
                      "U"}

                  </div>


                  <div className="user-result-info">

                    <strong>
                      {person.name ||
                        "User"}
                    </strong>

                    <span>
                      {person.email}
                    </span>

                  </div>


                  <button
                    className="add-contact-btn"
                    onClick={() =>
                      addContact(person)
                    }
                  >

                    <UserPlus
                      size={18}
                    />

                  </button>

                </div>

              )
            )}

          </div>

        )}


        {/* CONTACT TITLE */}

        <div className="section-title">

          <span>
            Contacts
          </span>

          <button className="icon-btn">

            <Plus size={18} />

          </button>

        </div>


        {/* CONTACTS */}

        <div className="chat-list">


          {contacts.length === 0 ? (

            <div className="empty-contacts">

              <Users size={25} />

              <p>
                No contacts yet
              </p>

              <span>
                Search for people above
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

                    <div className="chat-top">

                      <strong>
                        {contact.name}
                      </strong>

                    </div>


                    <div className="chat-bottom">

                      <p>
                        {contact.email}
                      </p>

                    </div>

                  </div>

                </button>

              )
            )

          )}

        </div>


        {/* BOTTOM MENU */}

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

            <Settings
              size={20}
            />

            <span>
              Settings
            </span>

          </button>


          <button
            onClick={logout}
          >

            <LogOut size={20} />

            <span>
              Logout
            </span>

          </button>

        </div>


      </aside>


      {/* =====================================
          CHAT AREA
      ====================================== */}

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
              Search for a user and add
              them to your contacts.
            </p>

          </div>

        ) : (

          <>


            {/* CHAT HEADER */}

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
                    {activeChat.email}
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

                  <MoreVertical
                    size={20}
                  />

                </button>

              </div>

            </header>


            {/* MESSAGES */}

            <section className="messages">


              <div className="date-divider">

                <span>
                  Today
                </span>

              </div>


              {messages.length === 0 ? (

                <div className="no-messages">

                  <p>
                    No messages yet.
                  </p>

                  <span>
                    Send a message to start
                    the conversation.
                  </span>

                </div>

              ) : (

                messages.map(
                  (item) => {

                    const isMine =
                      item.senderId ===
                      user.uid;


                    return (

                      <div
                        key={item.id}
                        className={`message ${
                          isMine
                            ? "sent"
                            : "received"
                        }`}
                      >

                        <p>
                          {item.text}
                        </p>


                        <div className="message-meta">

                          <span>

                            {item.createdAt
                              ?.toDate
                              ? item.createdAt
                                  .toDate()
                                  .toLocaleTimeString(
                                    [],
                                    {
                                      hour:
                                        "2-digit",
                                      minute:
                                        "2-digit"
                                    }
                                  )
                              : "Now"}

                          </span>


                          {isMine && (

                            <CheckCheck
                              size={15}
                            />

                          )}

                        </div>

                      </div>

                    );

                  }
                )

              )}

            </section>


            {/* MESSAGE INPUT */}

            <div className="message-area">


              <button
                className="icon-btn"
              >

                <Paperclip
                  size={21}
                />

              </button>


              <button
                className="icon-btn"
              >

                <Smile
                  size={21}
                />

              </button>


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

                    handleSendMessage();

                  }

                }}
                placeholder="Write a message..."
                disabled={sending}
              />


              {message.trim() ? (

                <button
                  className="send-btn"
                  onClick={
                    handleSendMessage
                  }
                  disabled={sending}
                >

                  {sending ? (

                    <Loader2
                      size={20}
                      className="spin"
                    />

                  ) : (

                    <Send size={20} />

                  )}

                </button>

              ) : (

                <button
                  className="send-btn"
                >

                  <Mic size={20} />

                </button>

              )}


            </div>


          </>

        )}

      </main>

    </div>

  );

}


/* =========================================
   ROOT APP
========================================= */

function App() {

  const [user, setUser] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [showRegister, setShowRegister] =
    useState(false);


  useEffect(() => {

    const unsubscribe =
      onAuthStateChanged(
        auth,
        (currentUser) => {

          setUser(
            currentUser
          );

          setLoading(false);

        }
      );


    return unsubscribe;

  }, []);


  /* LOADING */

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


  /* AUTH */

  if (!user) {

    if (showRegister) {

      return (

        <Register
          onLogin={() =>
            setShowRegister(
              false
            )
          }
        />

      );

    }


    return (

      <Login
        onRegister={() =>
          setShowRegister(
            true
          )
        }
      />

    );

  }


  return (
    <ChatApp user={user} />
  );

}


export default App;
