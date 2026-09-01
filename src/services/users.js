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

  if (!value) {
    return [];
  }

  const usersRef = collection(db, "users");

  // Search by email
  const emailQuery = query(
    usersRef,
    where("email", "==", value),
    limit(10)
  );

  // Search by name
  const nameQuery = query(
    usersRef,
    where("nameLower", "==", value),
    limit(10)
  );

  const [emailSnapshot, nameSnapshot] =
    await Promise.all([
      getDocs(emailQuery),
      getDocs(nameQuery)
    ]);

  const users = [];

  emailSnapshot.forEach((doc) => {
    users.push({
      id: doc.id,
      ...doc.data()
    });
  });

  nameSnapshot.forEach((doc) => {
    const data = {
      id: doc.id,
      ...doc.data()
    };

    // Duplicate නොවෙන්න
    if (!users.some((user) => user.uid === data.uid)) {
      users.push(data);
    }
  });

  return users
    .filter((user) => user.uid)
    .slice(0, 10);
}
