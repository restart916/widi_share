import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
let firebaseConfig = {
  apiKey: "AIzaSyD_F_ESTDyLHvTOv1QrzUbiy6Gt0sQCS4k",
  authDomain: "widi-share.firebaseapp.com",
  projectId: "widi-share",
  storageBucket: "widi-share.appspot.com",
  messagingSenderId: "1051941909584",
  appId: "1:1051941909584:web:e1bb94be2b95f2465b8d55",
  measurementId: "G-MNCR6GZVDZ"
};
// Initialize Firebase

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const store = getStorage(app);

export { analytics, db, store };