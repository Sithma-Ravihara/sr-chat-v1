import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";
import { UserPlus, Mail, Lock, User, Loader2 } from "lucide-react";

function Register({ onLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const register = async (e) => {
    e.preventDefault();

    setError("");

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      const result = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      await updateProfile(result.user, {
        displayName: name.trim()
      });

      await setDoc(doc(db, "users", result.user.uid), {
        uid: result.user.uid,
        name: name.trim(),
        email: email.trim(),
        photoURL: "",
        status: "online",
        createdAt: serverTimestamp()
      });

    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email.");
      } else if (err.code === "auth/weak-password") {
        setError("Password is too weak.");
      } else {
        setError("Registration failed. Please try again.");
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
          <h1>Create account</h1>
          <p>Join SRChat and start messaging.</p>
        </div>

        <form onSubmit={register}>

          <label>
            <span>Name</span>

            <div className="auth-input">
              <User size={18} />

              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </div>
          </label>

          <label>
            <span>Email</span>

            <div className="auth-input">
              <Mail size={18} />

              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
          </label>

          <label>
            <span>Password</span>

            <div className="auth-input">
              <Lock size={18} />

              <input
                type="password"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
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
                <Loader2 className="spin" size={18} />
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
          <button type="button" onClick={onLogin}>
            Sign in
          </button>
        </p>

      </div>

    </div>
  );
}

export default Register;
