
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

// 🔑 Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyACNrzJgRGKmn8JsRuS_2b7RecPIfahTvQ",
    authDomain: "singup-aec8c.firebaseapp.com",
    databaseURL: "https://singup-aec8c-default-rtdb.firebaseio.com",
    projectId: "singup-aec8c",
    storageBucket: "singup-aec8c.appspot.com",
    messagingSenderId: "619246550282",
    appId: "1:619246550282:web:ab0bb54003d529ca820ef3",
    measurementId: "G-5KYVBVXQZP"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services
export const auth = getAuth(app);
export const db = getDatabase(app);
