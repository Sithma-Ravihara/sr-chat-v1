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
  serverTimestamp
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
  Loader2
} from "lucide-react";


function ChatApp({ user }) {

  const [message, setMessage] = useState("");

  const [search, setSearch] = useState("");

  const [searchResults, setSearchResults] = useState([]);

  const [searching, setSearching] = useState(false);

  const [searchError, setSearchError] = useState("");

  const [activeChat, setActiveChat] = useState(null);

  const [contacts, setContacts] = useState([]);


  /*
   * SEARCH USERS BY EMAIL
   */

  useEffect(() => {

    const searchPeople = async () => {

      const email = search.trim().toLowerCase();

      setSearchError("");
      setSearchResults([]);

      if (!email) {
        return;
      }

      /*
       * Don't search yourself
       */

      if (email === user.email?.toLowerCase()) {

        setSearchError(
          "You cannot add yourself."
        );

        return;
      }


      try {

        setSearching(true);


        const q = query(
          collection(db, "users"),
          where("email", "==", email)
        );


        const snapshot =
          await getDocs(q);


        const users =
          snapshot.docs.map((item) => ({
            id: item.id,
            ...item.data()
          }));


        setSearchResults(users);


        if (users.length === 0) {

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
          "Search failed. Please try again."
        );

      } finally {

        setSearching(false);

      }

    };


    const timer =
      setTimeout(
        searchPeople,
        400
      );


    return () =>
      clearTimeout(timer);

  }, [search, user]);


  /*
   * ADD CONTACT
   */

  const addContact = async (person) => {

    try {

      await addDoc(
        collection(
          db,
          "users",
          user.uid,
          "contacts"
        ),
        {
          uid: person.uid,
          name: person.name,
          email: person.email,
          photoURL:
            person.photoURL || "",
          addedAt:
            serverTimestamp()
        }
      );


      setContacts((prev) => {

        const exists =
          prev.some(
            (item) =>
              item.uid === person.uid
          );

        if (exists) {
          return prev;
        }

        return [
          ...prev,
          person
        ];

      });


      setSearch("");
      setSearchResults([]);

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


  /*
   * SEND MESSAGE
   */

  const sendMessage = () => {

    if (!message.trim()) {
      return;
    }

    if (!activeChat) {
      return;
    }

    console.log(
      "Send message:",
      message,
      "to:",
      activeChat
    );

    setMessage("");

  };


  return (

    <div className="app">


      {/* SIDEBAR */}

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
              size={16}
              className="spin"
            />
          )}

        </div>


        {/* SEARCH RESULTS */}

        {search.trim() && (

          <div className="search-results">

            {searchError && !searching && (

              <div className="search-empty">
                {searchError}
              </div>

            )}


            {searchResults.map((person) => (

              <div
                className="user-result"
                key={person.uid}
              >

                <div className="avatar">

                  {person.name
                    ?.charAt(0)
                    ?.toUpperCase() || "U"}

                </div>


                <div className="user-result-info">

                  <strong>
                    {person.name}
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

            ))}

          </div>

        )}


        {/* CONTACTS */}

        <div className="section-title">

          <span>
            Contacts
          </span>

          <button className="icon-btn">

            <Plus size={18} />

          </button>

        </div>


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
                    ?.toUpperCase() || "U"}

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

            ))

          )}

        </div>


        {/* SIDEBAR BOTTOM */}

        <div className="sidebar-bottom">

          <button>

            <MessageCircle size={20} />

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


      {/* CHAT */}

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
              Search for someone by email
              and add them to your contacts.
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
                    ?.toUpperCase() || "U"}

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
                  setMessage(e.target.value)
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


/*
 * MAIN APP
 */

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
