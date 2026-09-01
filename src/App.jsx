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

import { searchUsers } from "./services/users";

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


/* ================================
   CHAT APP
================================ */

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

  const [message, setMessage] =
    useState("");


  /* ================================
     SEARCH USERS
  ================================= */

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
          "Search failed. Check Firebase."
        );

      } finally {

        setSearching(false);

      }

    }, 400);


    return () =>
      clearTimeout(timer);

  }, [search, user]);


  /* ================================
     LOAD CONTACTS
  ================================= */

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


  /* ================================
     ADD CONTACT
  ================================= */

  const addContact = async (person) => {

    if (!person?.uid) {
      return;
    }


    try {

      /*
       * Check if already added
       */

      const alreadyAdded =
        contacts.some(
          (contact) =>
            contact.uid === person.uid
        );


      if (alreadyAdded) {

        setSearchError(
          "Already in your contacts."
        );

        return;
      }


      /*
       * Create contact
       */

      await addDoc(
        collection(
          db,
          "users",
          user.uid,
          "contacts"
        ),
        {
          uid: person.uid,

          name:
            person.name || "",

          email:
            person.email || "",

          photoURL:
            person.photoURL || "",

          addedAt:
            serverTimestamp()
        }
      );


      /*
       * Clear search
       */

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


  /* ================================
     SEND MESSAGE
  ================================= */

  const sendMessage = () => {

    if (!message.trim()) {
      return;
    }

    if (!activeChat) {
      return;
    }


    /*
     * Realtime message system
     * will be connected next.
     */

    console.log(
      "Message:",
      message
    );

    console.log(
      "Receiver:",
      activeChat.uid
    );


    setMessage("");

  };


  /* ================================
     LOGOUT
  ================================= */

  const logout = async () => {

    try {

      await signOut(auth);

    } catch (error) {

      console.error(
        "Logout error:",
        error
      );

    }

  };


  return (

    <div className="app">


      {/* =================================
          SIDEBAR
      ================================== */}

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
                        "Unknown user"}
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
                    title="Add contact"
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


        {/* CONTACT LIST */}

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


        {/* SIDEBAR MENU */}

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


      {/* =================================
          CHAT AREA
      ================================== */}

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
              Search for a user by email
              and add them to your contacts.
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


              <div className="message received">

                <p>
                  Start a conversation 👋
                </p>

                <span>
                  Now
                </span>

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
                    e.key ===
                    "Enter"
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


/* =================================
   MAIN APP
================================= */

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


  /* LOGIN / REGISTER */

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


  /* CHAT APP */

  return (
    <ChatApp user={user} />
  );

}


export default App;
