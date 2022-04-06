 import { auth, firestore } from '../lib/firebase';
import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import {doc, onSnapshot} from 'firebase/firestore';

// Custom hook to read auth record and user profile doc
export function useUserData() {
	const [user] = useAuthState(auth);
	const [username, setUsername] = useState(null);

	useEffect(() => {
		// turn off realtime subscriptions
		let unsubscribe;
		if (user) {
			try {
				const docRef = doc(firestore, "users", user.uid);
				unsubscribe = onSnapshot(docRef, (doc) => {
					console.log("Current data: ", doc.data());
					setUsername(doc.data()?.username);
				});
			} catch (e) {
				console.error("Error getting document: ", e);
			}
			return unsubscribe;
		} else {
			setUsername(null);
		}
	}, [user]);

	return {user, username};
}
