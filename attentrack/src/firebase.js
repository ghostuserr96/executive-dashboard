import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// Replace these placeholders with your actual Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyBPOsx-_GfI1HS9OJGU0QqC_TaFSuvUgVY",
  authDomain: "attentrack-7d0f5.firebaseapp.com",
  databaseURL: "https://attentrack-7d0f5-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "attentrack-7d0f5",
  storageBucket: "attentrack-7d0f5.firebasestorage.app",
  messagingSenderId: "1012317009723",
  appId: "1:1012317009723:web:e20920f1671957b75b291e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
