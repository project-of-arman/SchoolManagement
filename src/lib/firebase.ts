// Import the functions you need from the SDKs you need
import { initializeApp, getApps, type FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// IMPORTANT:
// It looks like you're having trouble with environment variables.
// For now, I've hardcoded these values with placeholders.
// You MUST replace them with your actual Firebase project credentials
// for the app to connect to your Firebase project.
// You can find these in your Firebase project settings.
const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", // <-- REPLACE WITH YOURS
  authDomain: "your-project-id.firebaseapp.com", // <-- REPLACE WITH YOURS
  projectId: "your-project-id", // <-- REPLACE WITH YOURS
  storageBucket: "your-project-id.appspot.com", // <-- REPLACE WITH YOURS
  messagingSenderId: "123456789012", // <-- REPLACE WITH YOURS
  appId: "1:123456789012:web:abcdef1234567890abcdef", // <-- REPLACE WITH YOURS
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
