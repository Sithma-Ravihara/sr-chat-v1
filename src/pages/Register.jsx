import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  updateProfile
} from "firebase/auth";

import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from "firebase/firestore";

import { auth, db } from "../firebase";

import {
  UserPlus,
  Mail,
  Lock,
  User,
  AtSign,
  Loader2
} from "lucide-react";


function Register({ onLogin }) {

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  const register = async (e) => {

    e.preventDefault();
    setError("");

    const cleanName = name.trim();
    const cleanUsername =
      username.trim().toLowerCase().replace(/^@/, "");
    const cleanEmail =
      email.trim().toLowerCase();


    if (!cleanName) {
      setError("Please enter your name.");
      return;
    }


    if (!/^[a-zA-Z0-9_]{3,20}$/.test(cleanUsername)) {
      setError(
        "Username must be 3-20 characters: letters, numbers or _"
      );
      return;
    }


    if (!cleanEmail) {
      setError("Please enter your email.");
      return;
    }


    if (password.length < 6) {
      setError(
        "Password must contain at least 6 characters."
      );
      return;
    }


    try {

      setLoading(true);


      /* CHECK USERNAME */

      const usernameRef = doc(
        db,
        "usernames",
        cleanUsername
      );

      const usernameSnap =
        await getDoc(usernameRef);


      if (usernameSnap.exists()) {

        setError(
          "This username is already taken."
        );

        setLoading(false);
        return;
      }


      /* CREATE AUTH ACCOUNT */

      const result =
        await createUserWithEmailAndPassword(
          auth,
          cleanEmail,
          password
        );


      /* UPDATE PROFILE */

      await updateProfile(
        result.user,
        {
          displayName: cleanName
        }
      );


      /* CREATE USER PROFILE */

      await setDoc(
        doc(
          db,
          "users",
          result.user.uid
        ),
        {
          uid: result.user.uid,
          name: cleanName,
          nameLower: cleanName.toLowerCase(),

          username: cleanUsername,
          usernameLower: cleanUsername,

          email: cleanEmail,

          photoURL: "",

          status: "online",

          createdAt: serverTimestamp()
        }
      );


      /* RESERVE USERNAME */

      await setDoc(
        usernameRef,
        {
          uid: result.user.uid,
          username: cleanUsername,
          createdAt: serverTimestamp()
        }
      );


    } catch (err) {

      console.error(
        "Registration error:",
        err
      );


      if (
        err.code ===
        "auth/email-already-in-use"
      ) {

        setError(
          "This email is already registered."
        );

      } else if (
        err.code ===
        "auth/invalid-email"
      ) {

        setError(
          "Please enter a valid email."
        );

      } else if (
        err.code ===
        "auth/weak-password"
      ) {

        setError(
          "Password is too weak."
        );

      } else if (
        err.code ===
        "permission-denied"
      ) {

        setError(
          "Firestore permission denied. Check Firestore Rules."
        );

      } else {

        setError(
          err.message ||
          "Registration failed."
        );

      }

    } finally {

      setLoading(false);

    }

  };


  return (

    <div className="auth-page">

      <div className="auth-card">

        <div className="auth-logo">
          SR
        </div>


        <div className="auth-heading">

          <h1>
            Create account
          </h1>

          <p>
            Create your SRChat username.
          </p>

        </div>


        <form onSubmit={register}>


          {/* NAME */}

          <label>

            <span>
              Name
            </span>

            <div className="auth-input">

              <User size={18} />

              <input
                type="text"
                placeholder="Sithma Ravihara"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
              />

            </div>

          </label>


          {/* USERNAME */}

          <label>

            <span>
              Username
            </span>

            <div className="auth-input">

              <AtSign size={18} />

              <input
                type="text"
                placeholder="sithma"
                value={username}
                onChange={(e) =>
                  setUsername(
                    e.target.value
                  )
                }
              />

            </div>

          </label>


          {/* EMAIL */}

          <label>

            <span>
              Email
            </span>

            <div className="auth-input">

              <Mail size={18} />

              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) =>
                  setEmail(
                    e.target.value
                  )
                }
              />

            </div>

          </label>


          {/* PASSWORD */}

          <label>

            <span>
              Password
            </span>

            <div className="auth-input">

              <Lock size={18} />

              <input
                type="password"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
              />

            </div>

          </label>


          {error && (

            <div className="auth-error">
              {error}
            </div>

          )}


          <button
            className="auth-submit"
            type="submit"
            disabled={loading}
          >

            {loading ? (

              <>
                <Loader2
                  className="spin"
                  size={18}
                />

                Creating...
              </>

            ) : (

              <>
                <UserPlus size={18} />

                Create account
              </>

            )}

          </button>


        </form>


        <p className="auth-switch">

          Already have an account?

          <button
            type="button"
            onClick={onLogin}
          >
            Sign in
          </button>

        </p>

      </div>

    </div>

  );

}


export default Register;
