// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAJMf6KM8b9WdPFm3NHl7D58rWaf34Tesc",
  authDomain: "bartalaap-chat.firebaseapp.com",
  databaseURL: "https://bartalaap-chat-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "bartalaap-chat",
  storageBucket: "bartalaap-chat.appspot.com",
  messagingSenderId: "1011541359863",
  appId: "1:1011541359863:web:a6eba333a1051456e2e7f2",
  measurementId: "G-RHLWD9QE0R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const firestore = getFirestore(app);

export { auth, firestore, analytics };
