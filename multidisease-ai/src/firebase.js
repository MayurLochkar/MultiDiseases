// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCemf9Yu820lKbGtWUSkn3O6ur7QSYnOFc",
  authDomain: "multidisease-8a688.firebaseapp.com",
  projectId: "multidisease-8a688",
  storageBucket: "multidisease-8a688.firebasestorage.app",
  messagingSenderId: "652885282490",
  appId: "1:652885282490:web:dd78ef5c25e7f99eb67c83",
  measurementId: "G-F9RNPZNX36"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Authentication and Provider (CRITICAL FOR LOGIN)
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();