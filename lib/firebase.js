import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";
import { createUsername } from "./settings";

const firebaseConfig = {
  apiKey: "AIzaSyD6UYPpgBjOFoUUEtblxcyRsLvmh68nv80",
  authDomain: "recipes-5f381.firebaseapp.com",
  databaseURL: "https://recipes-5f381.firebaseio.com",
  projectId: "recipes-5f381",
  storageBucket: "recipes-5f381.appspot.com",
  messagingSenderId: "398621016307",
  appId: "1:398621016307:web:8dd7fe9d7a39957803f786",
  measurementId: "G-B1HTDQJ5H2",
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Auth exports
export const auth = firebase.auth();
export const googleAuthProvider = new firebase.auth.GoogleAuthProvider();
export const db = firebase.firestore();

// Firestore exports
export const firestore = firebase.firestore();
export const serverTimestamp = firebase.firestore.FieldValue.serverTimestamp;
export const fromMillis = firebase.firestore.Timestamp.fromMillis;
export const increment = firebase.firestore.FieldValue.increment;

// Storage exports
export const storage = firebase.storage();
export const STATE_CHANGED = firebase.storage.TaskEvent.STATE_CHANGED;

/// Helper functions

/**`
 * Gets a users/{uid} document with username
 * @param  {string} username
 */
export async function getUserWithUsername(username) {
  const usersRef = firestore.collection("users");
  const query = usersRef.where("username", "==", username).limit(1);
  const userDoc = (await query.get()).docs[0];
  return userDoc;
}

/**`
 * Converts a firestore document to JSON
 * @param  {DocumentSnapshot} doc
 */
export function postToJSON(doc) {
  const data = doc.data();
  return {
    ...data,
    // Gotcha! firestore timestamp NOT serializable to JSON. Must convert to milliseconds
    createdAt: data?.createdAt.toMillis() || 0,
    updatedAt: data?.updatedAt.toMillis() || 0,
  };
}

/**
 * Get a users details
 */
export async function getUser() {
  try {
    // Fetch user data
    const id = auth.currentUser.uid;
    const usersRef = firestore.collection("users");
    const query = usersRef.doc(id);
    const userDoc = await query.get();
    let userData = userDoc.data();

    // Fetch profile data
    const profilesRef = firestore.collection("profiles");
    const query2 = profilesRef.doc(id);
    const profileDoc = await query2.get();
    let profileData = profileDoc.data();

    return { ...userData, ...profileData };
  } catch (e) {
    console.error("Error getting user", e);
  }
}

/**
 * Update user
 */
export async function updateUser(userPayload, profilePayload, create) {
  try {
    // Update details
    const id = auth.currentUser.uid;
    const usersRef = firestore.collection("users");
    const query = usersRef.doc(id);
    create ? await query.set(userPayload) : await query.update(userPayload);

    // Update profile
    const profilesRef = firestore.collection("profiles");
    const queryProfile = profilesRef.doc(id);
    await queryProfile.set(profilePayload);

    // Delete old username
    const usernamesRef = firestore.collection("usernames");
    if (!create) {
      const queryUsername = usernamesRef.where("uid", "==", id).limit(1);
      const usernameDocId = (await queryUsername.get()).docs[0].id;
      await usernamesRef.doc(usernameDocId).delete();
    }

    // Add new username
    await usernamesRef.doc(userPayload.username).set({ uid: id });

    // Add new username
  } catch (e) {
    console.error("Error updating user", e);
  }
}

/**
 * Check if a user already exists in our database
 */
export async function checkIfUserExists(uid) {
  const res = await firestore.collection("users").doc(uid).get();
  return res.exists;
}

/**
 * Check if a username is already available
 */
export async function checkIfUsernameIsAvailable(username) {
  const ref = firestore.doc(`usernames/${username}`);
  const { exists } = await ref.get();
  console.log("Username is available: ", !exists);
  return !exists;
}

/**
 * Google sign in
 */
export async function signInWithGoogle() {
  const res = await auth.signInWithPopup(googleAuthProvider);
  console.log("Google res", res);

  // Check if user exists
  const uid = res.user.uid;

  // Check if the user exists
  const exists = await checkIfUserExists(uid);

  // If not, then create user and profile docs
  if (!exists) {
    // Fetch data from user object
    const displayName = res.user.displayName;
    const firstName = displayName.split(/ (.+)/)[0];
    const lastName = displayName.split(/ (.+)/)[1];

    // Ensure randomly generated username is available
    let usernameAvailable = false;
    let username;
    while (!usernameAvailable) {
      username = createUsername(firstName, lastName);
      usernameAvailable = await checkIfUsernameIsAvailable(username);
    }

    const userPayload = {
      username: username,
      email: res.user.email,
      signInMethod: "google",
    };

    const profilePayload = {
      bio: "",
      firstName: firstName,
      lastName: lastName,
      photoURL: res.user.photoURL,
      username: username,
    };

    // Update user with payloads
    await updateUser(userPayload, profilePayload, true);
  }
}

/**
 * Delete account
 */
export async function deleteAccount() {
  try {
    const id = auth.currentUser.uid;
    // Delete firestore documents
    // Delete users, profiles and usernames with current ID
    try {
      await firestore.collection("users").doc(id).delete();
    } catch (e) {
      console.warn("Error deleting users document");
    }

    try {
      await firestore.collection("profiles").doc(id).delete();
    } catch (e) {
      console.warn("Error deleting profiles document");
    }

    try {
      const usernamesRef = firestore.collection("usernames");
      const queryUsername = usernamesRef.where("uid", "==", id).limit(1);
      const usernameDocId = (await queryUsername.get()).docs[0].id;
      await usernamesRef.doc(usernameDocId).delete();
    } catch (e) {
      console.warn("Error deleting username document");
    }

    // Delete Firebase user
    await auth.currentUser.delete();
  } catch (e) {
    console.warn("Error deleting account", e);
  }
}

/**
 * Get different subscription plans
 */
export async function getSubscriptions() {
  try {
    let tiers = [];
    const res = await firestore.collection("plans").orderBy("order").get();
    for (const doc of res.docs) {
      tiers.push({ ...doc.data() });
    }
    return tiers;
  } catch (e) {
    console.warn("Error getting subscriptions", e);
  }
}

/**
 * Get different subscription plans
 */
export async function getProPlan() {
  try {
    let tiers = [];
    const res = await firestore
      .collection("plans")
      .where("name", "==", "Pro")
      .get();
    for (const doc of res.docs) {
      tiers.push({ ...doc.data() });
    }
    return tiers;
  } catch (e) {
    console.warn("Error getting subscriptions", e);
  }
}
