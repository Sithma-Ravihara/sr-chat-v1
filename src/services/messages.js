import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from "firebase/firestore";

import { db } from "../firebase";


// Send message
export async function sendChatMessage(
  chatId,
  senderId,
  text
) {
  if (!text.trim()) return;

  await addDoc(
    collection(
      db,
      "chats",
      chatId,
      "messages"
    ),
    {
      senderId,
      text: text.trim(),
      createdAt: serverTimestamp()
    }
  );
}


// Listen for realtime messages
export function listenToMessages(
  chatId,
  callback
) {
  const messagesRef = collection(
    db,
    "chats",
    chatId,
    "messages"
  );

  const q = query(
    messagesRef,
    orderBy("createdAt", "asc")
  );

  return onSnapshot(
    q,
    (snapshot) => {

      const messages =
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));

      callback(messages);

    }
  );
}
