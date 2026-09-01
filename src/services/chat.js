import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from "firebase/firestore";

import { db } from "../firebase";

export function listenToMessages(chatId, callback) {
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

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));

    callback(messages);
  });
}

export async function sendMessage(
  chatId,
  senderId,
  text
) {
  if (!text.trim()) return;

  const messagesRef = collection(
    db,
    "chats",
    chatId,
    "messages"
  );

  await addDoc(messagesRef, {
    senderId,
    text: text.trim(),
    createdAt: serverTimestamp()
  });
}
