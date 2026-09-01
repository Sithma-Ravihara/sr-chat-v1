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
  limit
} from "firebase/firestore";

import { auth, db } from "./firebase";

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
  X
} from "lucide-react";


/* --------------------------------
   SEARCH USERS
-------------------------------- */

async function searchUsers(searchText, currentUserId) {

  const text = searchText.trim().toLowerCase();

  if (!text) {
    return [];
  }

  try {

    const usersRef = collection(db, "users");

    const usersQuery = query(
      usersRef,
      where("nameLower", ">=", text),
      where("nameLower", "<=", text + "\uf8ff"),
      limit(20)
    );

    const snapshot = await getDocs(usersQuery);

    return snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data()
      }))
      .filter(
        (user) => user.uid !== currentUserId
      );

  } catch (error) {

    console.error(
      "User search error:",
      error
    );

    return [];
  }
}


/* --------------------------------
   CHAT ID
-------------------------------- */

function createChatId(uid1, uid2) {

  return [uid1, uid2]
    .sort()
    .join("_");

}


/* --------------------------------
   CHAT APP
-------------------------------- */

function ChatApp({ user }) {

  const [contacts, setContacts] = useState([]);

  const [activeChat, setActiveChat] =
    useState(null);

  const [message, setMessage] =
    useState("");

  const [searchText, setSearchText] =
    useState("");

  const [searchResults, setSearchResults] =
    useState([]);

  const [searching, setSearching] =
    useState(false);


  /* --------------------------------
     SEARCH
  -------------------------------- */

  useEffect(() => {

    const timer = setTimeout(async () => {

      if (!searchText.trim()) {

        setSearchResults([]);
        return;

      }

      setSearching(true);

      const results =
        await searchUsers(
          searchText,
          user.uid
        );

      setSearchResults(results);

      setSearching(false);

    }, 400);

    return () => clearTimeout(timer);

  }, [searchText, user.uid]);


  /* --------------------------------
     ADD CONTACT
  -------------------------------- */

  const addContact = (contact) => {

    const alreadyExists =
      contacts.some(
        (item) =>
          item.uid === contact.uid
      );

    if (!alreadyExists) {

      setContacts((previous) => [
        ...previous,
        contact
      ]);

    }

    setActiveChat(contact);

    setSearchText("");

    setSearchResults([]);

  };


  /* --------------------------------
     SEND MESSAGE
  -------------------------------- */

  const sendMessage = async () => {

    if (!message.trim()) return;

    if (!activeChat) return;

    const chatId = createChatId(
      user.uid,
      activeChat.uid
    );

    console.log(
      "Sending message to:",
      chatId
    );

    setMessage("");

  };


  return (

    <div className="app">

      {/* =========================
          SIDEBAR
      ========================= */}

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
            type="text"
            placeholder="Search people..."
            value={searchText}
            onChange={(e) =>
              setSearchText(
                e.target.value
              )
            }
          />

          {searchText && (

            <button
              className="search-clear"
              onClick={() => {
                setSearchText("");
                setSearchResults([]);
              }}
            >
              <X size={16} />
            </button>

          )}

        </div>


        {/* SEARCH RESULTS */}

        {searchText && (

          <div className="search-results">

            {searching && (
              <div className="search-message">
                Searching...
              </div>
            )}

            {!searching &&
              searchResults.length === 0 && (

                <div className="search-message">
                  No users found
                </div>

              )}


            {searchResults.map(
              (person) => (

                <div
                  className="search-user"
                  key={person.id}
                >

                  <div className="avatar">

                    {person.name
                      ?.charAt(0)
                      ?.toUpperCase() ||
                      "U"}

                  </div>


                  <div className="search-user-info">

                    <strong>
                      {person.name}
                    </strong>

                    <span>
                      {person.email}
                    </span>

                  </div>


                  <button
                    className="add-user-btn"
                    onClick={() =>
                      addContact(person)
                    }
                  >

                    <UserPlus size={17} />

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

          <button
            className="icon-btn"
            onClick={() => {
              setSearchText("");
              document
                .querySelector(
                  ".search-box input"
                )
                ?.focus();
            }}
          >

            <Plus size={18} />

          </button>

        </div>


        {/* CONTACT LIST */}

        <div className="chat-list">

          {contacts.length === 0 ? (

            <div className="empty-contacts">

              <Users size={30} />

              <p>
                No contacts yet
              </p>

              <span>
                Search for people above
              </span>

            </div>

          ) : (

            contacts.map((contact) => (

              <button
                key={contact.uid}
                className={`chat-item ${
                  activeChat?.uid ===
                  contact.uid
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setActiveChat(contact)
                }
              >

                <div className="avatar">

                  {contact.name
                    ?.charAt(0)
                    ?.toUpperCase() ||
                    "U"}

                  <span className="online-dot" />

                </div>


                <div className="chat-info">

                  <div className="chat-top">

                    <strong>
                      {contact.name}
                    </strong>

                  </div>

                  <div className="chat-bottom">

                    <p>
                      Start a conversation
                    </p>

                  </div>

                </div>

              </button>

            ))

          )}

        </div>


        {/* BOTTOM NAV */}

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
          CHAT AREA
      ========================= */}

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
              Search for a user and
              start a conversation.
            </p>

          </div>

        ) : (

          <>

            {/* HEADER */}

            <header className="chat-header">

              <div className="chat-user">

                <div className="avatar large">

                  {activeChat.name
                    ?.charAt(0)
                    ?.toUpperCase() ||
                    "U"}

                  <span className="online-dot" />

                </div>

                <div>

                  <h2>
                    {activeChat.name}
                  </h2>

                  <span>
                    Online
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


              <div className="empty-messages">

                <MessageCircle
                  size={38}
                />

                <h3>
                  Start chatting
                </h3>

                <p>
                  Send a message to{" "}
                  {activeChat.name}
                </p>

              </div>

            </section>


            {/* MESSAGE INPUT */}

            <div className="message-area">

              <button className="icon-btn">

                <Paperclip
                  size={21}
                />

              </button>


              <button className="icon-btn">

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
                    e.key === "Enter"
                  ) {

                    sendMessage();

                  }

                }}
                placeholder="Write a message..."
              />


              {message.trim() ? (

                <button
                  className="send-btn"
                  onClick={
                    sendMessage
                  }
                >

                  <Send size={20} />

                </button>

              ) : (

                <button className="send-btn">

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


/* --------------------------------
   MAIN APP
-------------------------------- */

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
