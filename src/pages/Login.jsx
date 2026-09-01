import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import {
  Mail,
  Lock,
  LogIn,
  Loader2
} from "lucide-react";
import { auth } from "../firebase";

function Login({ onRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const login = async (e) => {
    e.preventDefault();

    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

    } catch (err) {
      if (
        err.code === "auth/invalid-credential" ||
        err.code === "auth/wrong-password" ||
        err.code === "auth/user-not-found"
      ) {
        setError("Incorrect email or password.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email.");
      } else {
        setError("Login failed. Please try again.");
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
          <h1>Welcome back</h1>
          <p>Sign in to continue to SRChat.</p>
        </div>

        <form onSubmit={login}>

          <label>
            <span>Email</span>

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

          <label>
            <span>Password</span>

            <div className="auth-input">
              <Lock size={18} />

              <input
                type="password"
                placeholder="Your password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                autoComplete="current-password"
              />
            </div>
          </label>

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2
                  size={18}
                  className="spin"
                />
                Signing in...
              </>
            ) : (
              <>
                <LogIn size={18} />
                Sign in
              </>
            )}
          </button>

        </form>

        <p className="auth-switch">
          Don't have an account?

          <button
            type="button"
            onClick={onRegister}
          >
            Create account
          </button>
        </p>

      </div>

    </div>
  );
}

export default Login;
