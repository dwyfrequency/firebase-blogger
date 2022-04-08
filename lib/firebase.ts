// Import the functions from the Firebase SDK
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import {
  collection,
  DocumentSnapshot,
  getDocs,
  getFirestore,
  limit,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";

// App's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_APP_ID,
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);

export const googleAuthProvider = new GoogleAuthProvider();

/**`
 * Gets a users/{uid} document with username
 * @param  {string} username
 */
export async function getUserWithUsername(username: string) {
  const usersRef = collection(firestore, "users");
  const usersFilter = where("username", "==", username);
  const queryUsers = query(usersRef, usersFilter, limit(1));
  const userDocs = await getDocs(queryUsers);
  return userDocs.docs.at(0);
}

/** Converts a firestore document to JSON. */
export function postToJSON(doc: DocumentSnapshot) {
  const data = doc.data();
  return data
    ? {
        ...data,
        // Gotcha! firestore timestamp NOT serializable to JSON. Must convert to milliseconds
        createdAt: data?.createdAt.toMillis(),
        updatedAt: data?.updatedAt.toMillis(),
      }
    : null;
}

export const fromMillis = Timestamp.fromMillis;
