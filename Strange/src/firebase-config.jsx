import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { initializeApp } from 'firebase/app';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCGSJXuIi1wfQvwpffhnfsm3Uya0HkCa4w", 
  authDomain: "stranger-831c4.firebaseapp.com",
  projectId: "stranger-831c4",
  storageBucket: "stranger-831c4.appspot.com",
  messagingSenderId: "935745628749",
  appId: "1:935745628749:web:c1b416217ef5d5e79f0a04",
  measurementId: "G-KF8N1YPQLH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Auth and Firestore services
const auth = getAuth(app);
const db = getFirestore(app);

// Export Firebase Auth and Firestore to be used in other parts of your app
export { auth, db };

// Optional: Firebase Firestore function to add a document
export const addUserData = async (userData) => {
  try {
    const docRef = await addDoc(collection(db, "users"), userData);
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};
