import { AuthError, signInWithPopup } from "firebase/auth";
import { UserContext } from "../lib/context";
import { auth, firestore, googleAuthProvider } from "../lib/firebase";

import {
  useEffect,
  useState,
  useCallback,
  useContext,
  FormEvent,
  ChangeEvent,
} from "react";
import { debounce } from "lodash";
import { doc, getDoc, writeBatch } from "firebase/firestore";

export default function EnterPage({}) {
  const { user, username } = useContext(UserContext);
  console.log({ user, username });

  // 1. user signed out <SignInButton />
  // 2. user signed in, but missing username <UsernameForm />
  // 3. user signed in, has username <SignOutButton />
  return (
    <main>
      {user ? (
        !username ? (
          <UsernameForm />
        ) : (
          <SignOutButton />
        )
      ) : (
        <SignInButton />
      )}
    </main>
  );
}

// Sign in with Google button
function SignInButton() {
  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleAuthProvider);
    } catch (error: unknown) {
      // TODO: type guard to add error handling https://firebase.google.com/docs/auth/web/google-signin
      // if (error is AuthError) {}
      // // Handle Errors here.
      // const errorCode = error.code;
      // const errorMessage = error.message;
      // // The email of the user's account used.
      // const email = error.email;
      // // The AuthCredential type that was used.
      // const credential = GoogleAuthProvider.credentialFromError(error);
      // // ...
      console.log("Big error in SignInButton");
    }
  };

  return (
    <button className="btn-google" onClick={signInWithGoogle}>
      <img src={"/google.png"} /> Sign in with Google
    </button>
  );
}

// Sign out button
function SignOutButton() {
  return <button onClick={() => auth.signOut()}>Sign Out</button>;
}

function UsernameForm() {
  const [formValue, setFormValue] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(false);

  const { user, username } = useContext(UserContext);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Create refs for both documents
    const userDoc = doc(firestore, `users/${user?.uid}`);
    const usernameDoc = doc(firestore, `usernames/${formValue}`);

    // Commit both docs together as a batch write.
    const batcher = writeBatch(firestore);
    batcher.set(userDoc, {
      username: formValue,
      photoURL: user?.photoURL,
      displayName: user?.displayName,
    });
    batcher.set(usernameDoc, { uid: user?.uid });

    await batcher.commit();
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    // Force form value typed in form to match correct format
    const val = e.target.value.toLowerCase();
    const re = /^(?=[a-zA-Z0-9._]{3,15}$)(?!.*[_.]{2})[^_.].*[^_.]$/;

    // Only set form value if length is < 3 OR it passes regex
    if (val.length < 3) {
      setFormValue(val);
      setLoading(false);
      setIsValid(false);
    }

    if (re.test(val)) {
      setFormValue(val);
      setLoading(true);
      setIsValid(false);
    }
  };

  useEffect(() => {
    checkUsername(formValue);
  }, [formValue]);

  // Hit the database for username match after each debounced change
  // useCallback is required for debounce to work
  const checkUsername = useCallback(
    debounce(async (username: string) => {
      if (username.length >= 3) {
        const usernameRef = doc(firestore, `usernames/${username}`);
        const docSnapshot = await getDoc(usernameRef);
        const exists = docSnapshot.exists();
        console.log("Firestore read executed!");
        setIsValid(!exists);
        setLoading(false);
      }
    }, 500),
    []
  );

  if (!username) {
    return (
      <section>
        <h3>Choose Username</h3>
        <form onSubmit={onSubmit}>
          <input
            name="username"
            placeholder="myname"
            value={formValue}
            onChange={onChange}
          />
          <UsernameMessage
            username={formValue}
            isValid={isValid}
            loading={loading}
          />
          <button type="submit" className="btn-green" disabled={!isValid}>
            Choose
          </button>

          <h3>Debug State</h3>
          <div>
            Username: {formValue}
            <br />
            Loading: {loading.toString()}
            <br />
            Username Valid: {isValid.toString()}
          </div>
        </form>
      </section>
    );
  }
  return null;
}

function UsernameMessage({
  username,
  isValid,
  loading,
}: UsernameMessageParams) {
  if (loading) {
    return <p>Checking...</p>;
  } else if (isValid) {
    return <p className="text-success">{username} is available!</p>;
  } else if (username && !isValid) {
    return <p className="text-danger">That username is taken!</p>;
  } else {
    return <p></p>;
  }
}

interface UsernameMessageParams {
  username: string;
  isValid: boolean;
  loading: boolean;
}
