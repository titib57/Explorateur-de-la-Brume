// Fichier : js/core/firebase_config.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js"; // Importez getAuth
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js"; // Importez getFirestore

// Votre configuration Firebase
export const firebaseConfig = {
    apiKey: "AIzaSyBQDq4lQfoYfDr2abVAuAxC7UPez2wPnX4",
    authDomain: "rpg---explorateur-de-la-brume.firebaseapp.com",
    projectId: "rpg---explorateur-de-la-brume",
    storageBucket: "rpg---explorateur-de-la-brume.firebasestorage.app",
    messagingSenderId: "855919886618",
    appId: "1:855919886618:web:933180441fa6f29dd26ca3",
    measurementId: "G-139GQZWKTC"
};

// Initialisation de l'application Firebase
const app = initializeApp(firebaseConfig);

// Initialisation des services que vous utiliserez
const auth = getAuth(app); // Initialisez le service d'authentification
const db = getFirestore(app); // Initialisez le service Firestore

// Exportation de l'instance de l'application et des services
export { app, auth, db };