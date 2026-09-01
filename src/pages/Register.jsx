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


function generateSRId() {

  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  let id = "SR-";

  for (let i = 0; i < 6; i++) {

    id +=
      chars[
        Math.floor(
          Math.random() * chars.length
        )
      ];

  }

  return id;
}


function Register({ onLogin }) {

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  const register = async (e) => {

    e.preventDefault();

    setError("");


    const cleanName =
      name.trim();

    const cleanEmail =
      email.trim().toLowerCase();


    if (!cleanName) {

      setError(
        "Please enter your name."
      );

      return;
    }


    if (!cleanEmail) {

      setError(
        "Please enter your email."
      );

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


      /* Create Firebase account */

      const result =
        await createUserWithEmailAndPassword(
          auth,
          cleanEmail,
          password
        );


      /* Generate SR ID */

      const srId =
        generateSRId();


      /* Set display name */

      await updateProfile(
        result.user,
        {
          displayName:
            cleanName
        }
      );


      /* Save user */

      await setDoc(
        doc(
          db,
          "users",
          result.user.uid
        ),
        {
          uid:
            result.user.uid,

          name:
            cleanName,

          email:
            cleanEmail,

          srId:
            srId,

          photoURL:
            "",

          status:
            "online",

          createdAt:
            serverTimestamp()
        }
      );


      console.log(
        "SR ID:",
        srId
      );


    } catch (err) {

      console.error(
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
          "Invalid email address."
        );

      } else if (
        err.code ===
        "auth/weak-password"
      ) {

        setError(
          "Password must contain at least 6 characters."
        );

      } else if (
        err.code ===
        "permission-denied"
      ) {

        setError(
          "Firestore permission denied."
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
            Create your SRChat account.
          </p>

        </div>


        <form
          onSubmit={
            register
          }
        >


          {/* NAME */}

          <label>

            <span>
              Name
            </span>

            <div className="auth-input">

              <User
                size={18}
              />

              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) =>
                  setName(
                    e.target.value
                  )
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

              <Mail
                size={18}
              />

              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) =>
                  setEmail(
                    e.target.value
                  )
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

              <Lock
                size={18}
              />

              <input
                type="password"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
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


          {/* BUTTON */}

          <button
            className="auth-submit"
            type="submit"
            disabled={loading}
          >

            {loading ? (

              <>
                <Loader2
                  size={18}
                  className="spin"
                />

                Creating...

              </>

            ) : (

              <>
                <UserPlus
                  size={18}
                />

                Create account

              </>

            )}

          </button>


        </form>


        <p className="auth-switch">

          Already have an account?

          <button
            type="button"
            onClick={
              onLogin
            }
          >
            Sign in
          </button>

        </p>


      </div>

    </div>

  );

}


export default Register;
