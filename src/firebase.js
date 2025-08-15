import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDLoCQ4Dv9x3CyOFIzWNRcf4Jwa8NXO6Qs",
  authDomain: "network-web-portal.firebaseapp.com",
  projectId: "network-web-portal",
  storageBucket: "network-web-portal.firebasestorage.app",
  messagingSenderId: "417466197326",
  appId: "1:417466197326:web:d7f02465e7404bc8f6aa1f",
  measurementId: "G-CMM3SNJCNZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services for use in your app
export const auth = getAuth(app);
export const db = getFirestore(app);
