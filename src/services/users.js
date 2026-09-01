import {
  collection,
  query,
  where,
  getDocs,
  limit
} from "firebase/firestore";

import { db } from "../firebase";

export async function searchUsers(email) {
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanEmail) {
    return [];
  }

  const q = query(
    collection(db, "users"),
    where("email", "==", cleanEmail),
    limit(10)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data()
  }));
}
