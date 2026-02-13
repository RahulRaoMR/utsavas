import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyANuSCz80_mpYX_7zB6fBPXp84q2l3zwsk",
  authDomain: "utsavas-4e921.firebaseapp.com",
  projectId: "utsavas-4e921",
  storageBucket: "utsavas-4e921.appspot.com",
  messagingSenderId: "859642619266",
  appId: "1:859642619266:web:b902b013d0672566c8db9b",
  databaseURL: "https://utsavas-4e921-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getDatabase(app);
