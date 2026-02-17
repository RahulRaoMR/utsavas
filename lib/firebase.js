// lib/firebase.js

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAdkJEdFuDaWg0qeumKo-bDtfX8FbAIky0",
  authDomain: "utsavas-4e921.firebaseapp.com",
  projectId: "utsavas-4e921",
  storageBucket: "utsavas-4e921.appspot.com",
  messagingSenderId: "PASTE_FROM_FIREBASE",
  appId: "PASTE_FROM_FIREBASE",
  databaseURL: "https://utsavas-4e921-default-rtdb.firebaseio.com",
};

// ✅ prevent multiple init (important for Next.js)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export default app;
