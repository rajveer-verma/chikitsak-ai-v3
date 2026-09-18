// Firebase configuration for Chikitsak AI
// Using Firebase free Spark plan (no credit card required)
// Project: chikitsak-ai
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCP5b84ojhQv9hzX6iVn3mwKpgMEefzjtw",
  authDomain: "chikitsak-ai.firebaseapp.com",
  projectId: "chikitsak-ai",
  storageBucket: "chikitsak-ai.firebasestorage.app",
  messagingSenderId: "786120379774",
  appId: "1:786120379774:web:06901994a6a479ad38f72f"
};

// IMPORTANT: Replace the values above with your own Firebase project config.
// See README_FIREBASE_SETUP.md for setup instructions.

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
