import { firestore, auth } from "../lib/firebase";
import { useDocument } from "react-firebase-hooks/firestore";
import {
  doc,
  DocumentData,
  DocumentReference,
  increment,
  writeBatch,
} from "firebase/firestore";

interface HeartProps {
  postRef: DocumentReference<DocumentData>;
}
// Allows user to heart or like a post
export default function Heart({ postRef }: HeartProps) {
  // Listen to heart document for currently logged in user
  const heartRef = doc(
    firestore,
    postRef.path,
    "hearts",
    auth.currentUser?.uid ?? ""
  );
  const [heartDoc] = useDocument(heartRef);
  // Create a user-to-post relationship
  const addHeart = async () => {
    const uid = auth.currentUser?.uid ?? "";

    // Use batch b/c we're updating two diff documents at the same time and we want them both to fail if an operation does not work
    const batch = writeBatch(firestore);
    batch.update(postRef, { heartCount: increment(1) });
    batch.set(heartRef, { uid });

    await batch.commit();
  };

  // Remove a user-to-post relationship
  const removeHeart = async () => {
    const batch = writeBatch(firestore);

    batch.update(postRef, { heartCount: increment(-1) });
    batch.delete(heartRef);

    await batch.commit();
  };

  return heartDoc?.exists() ? (
    <button onClick={removeHeart}>💔 Unheart</button>
  ) : (
    <button onClick={addHeart}>💗 Heart</button>
  );
}
