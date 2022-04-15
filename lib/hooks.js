import { auth, firestore } from "../lib/firebase";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";

// Custom hook to read  auth record and user profile doc
export function useUserData() {
  const [user] = useAuthState(auth);
  const [username, setUsername] = useState(null);
  const [signInMethod, setSignInMethod] = useState(null);
  const [activePlans, setActivePlans] = useState([]);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    // turn off realtime subscription
    let unsubscribe;

    if (user) {
      const ref = firestore.collection("users").doc(user.uid);
      unsubscribe = ref.onSnapshot((doc) => {
        setUsername(doc.data()?.username);
        setSignInMethod(doc.data()?.signInMethod);
        setActivePlans(doc.data()?.activePlans);
        setStatus(doc.data()?.status);
      });
    } else {
      setUsername(null);
      setSignInMethod(null);
    }

    return unsubscribe;
  }, [user]);

  return { user, username, signInMethod, activePlans, status };
}
