// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getFirestore } from "firebase/firestore";
//Import the Auth packages
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC-X1h3Wd9WymZ_WzjUMX3hHk-rT3-fgJI",
  authDomain: "aspirant-connect.firebaseapp.com",
  projectId: "aspirant-connect",
  storageBucket: "aspirant-connect.firebasestorage.app",
  messagingSenderId: "194056946198",
  appId: "1:194056946198:web:f050f5ee650cb10c2deb37"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
// 2. Export the Auth variables so our Login page can use them
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();