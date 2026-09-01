import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  updateProfile
} from "firebase/auth";

import {
  doc,
  setDoc,
  serverTimestamp
} from "firebase/firestore";

import { auth, db } from "../firebase";

import {
  UserPlus,
  Mail,
  Lock,
  User,
  Loader2
} from "lucide-react";

function Register({ onLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const register = async (e) => {
    e.preventDefault();

    setError("");

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName) {
      setError("Please enter your name.");
      return;
    }

    if (!cleanEmail) {
      setError("Please enter your email.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      // Create Firebase Authentication account
      const result =
        await createUserWithEmailAndPassword(
          auth,
          cleanEmail,
          password
        );

      // Update Firebase profile
      await updateProfile(result.user, {
        displayName: cleanName
      });

      // Create user document in Firestore
      await setDoc(
        doc(db, "users", result.user.uid),
        {
          uid: result.user.uid,

          name: cleanName,

          // Used for searching users
          nameLower: cleanName.toLowerCase(),

          email: cleanEmail,

          photoURL: "",

          status: "online",

          createdAt: serverTimestamp()
        }
      );

      // Firebase Auth automatically keeps
      // the user logged in after registration.

    } catch (err) {

      console.error("Registration error:", err);

      if (err.code === "auth/email-already-in-use") {

        setError(
          "This email is already registered."
        );

      } else if (err.code === "auth/invalid-email") {

        setError(
          "Please enter a valid email."
        );

      } else if (err.code === "auth/weak-password") {

        setError(
          "Password is too weak."
        );

      } else if (err.code === "auth/network-request-failed") {

        setError(
          "Network error. Please check your internet connection."
        );

      } else {

        setError(
          "Registration failed. Please try again."
        );
      }

    } finally {

      setLoading(false);

    }
  };

  return (
    <div className="auth-page">

      <div className="auth-card">

        {/* LOGO */}

        <div className="auth-logo">
          SR
        </div>

        {/* TITLE */}

        <div className="auth-heading">

          <h1>
            Create account
          </h1>

          <p>
            Join SRChat and start messaging.
          </p>

        </div>

        {/* FORM */}

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
                placeholder="Your name"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                autoComplete="name"
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
                  setEmail(e.target.value)
                }
                autoComplete="email"
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
                  setPassword(e.target.value)
                }
                autoComplete="new-password"
              />

            </div>

          </label>

          {/* ERROR */}

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          {/* SUBMIT */}

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

        {/* LOGIN */}

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
