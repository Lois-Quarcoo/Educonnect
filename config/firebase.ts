import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCSOeS-MelLYRrRiMRjB6-V-Gt4oLNAt88",
  authDomain: "educonnect-5fbf8.firebaseapp.com",
  projectId: "educonnect-5fbf8",
  storageBucket: "educonnect-5fbf8.firebasestorage.app",
  messagingSenderId: "237530877928",
  appId: "1:237530877928:web:3bb749000f1b58bcddde5d",
  measurementId: "G-X0F11YPMM9"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);