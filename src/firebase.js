import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB2QeOEG8ZuLmJRcK5Kth0eHb8FIVuBNsE",
  authDomain: "sr-chat-v1.firebaseapp.com",
  projectId: "sr-chat-v1",
  storageBucket: "sr-chat-v1.firebasestorage.app",
  messagingSenderId: "260591776009",
  appId: "1:260591776009:web:98b3fe41c178b76813a3d8"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
