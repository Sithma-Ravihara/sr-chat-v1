import {
  collection,
  query,
  where,
  getDocs,
  limit
} from "firebase/firestore";

import { db } from "../firebase";

export async function searchUsers(searchText) {
  const value = searchText.trim().toLowerCase();

  if (!value) return [];

  const q = query(
    collection(db, "users"),
    where("email", "==", value),
    limit(10)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs
    .map((doc) => ({
      id: doc.id,
      ...doc.data()
    }))
    .filter((user) => user.uid !== undefined);
}
