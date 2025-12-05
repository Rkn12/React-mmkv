// Inisialisasi Firebase App
import { getApps, initializeApp } from "firebase/app";

// Firebase Authentication instance
import { getAuth } from "firebase/auth";

// Firestore Database instance
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC7I65UIh01fmGDVnTYB3b5jUpsvj9QV_U",
  authDomain: "mmkp-d6532.firebaseapp.com",
  projectId: "mmkp-d6532",
  storageBucket: "mmkp-d6532.firebasestorage.app",
  messagingSenderId: "695008172586",
  appId: "1:695008172586:web:442474f29e93af709c8153",
  measurementId: "G-T061S5P021"
};
// Init firebase (hindari duplicate-app saat HMR/hot reload)
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

// Export auth & database untuk dipakai aplikasi
// Export auth & database untuk dipakai aplikasi (memory persistence)
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
