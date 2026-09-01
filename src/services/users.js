import {
  collection,
  query,
  where,
  getDocs,
  limit
} from "firebase/firestore";

import { db } from "../firebase";

export async function searchUsers(searchText) {
  const text = searchText.trim().toLowerCase();

  if (!text) return [];

  const usersRef = collection(db, "users");

  const q = query(
    usersRef,
    where("nameLower", ">=", text),
    where("nameLower", "<=", text + "\uf8ff"),
    limit(20)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data()
  }));
}
