// js/core/firebase_config.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";

// Votre configuration Firebase
const firebaseConfig = {
    apiKey: "VOTRE_API_KEY",
    authDomain: "VOTRE_AUTH_DOMAIN",
    projectId: "VOTRE_PROJECT_ID",
    storageBucket: "VOTRE_STORAGE_BUCKET",
    messagingSenderId: "VOTRE_MESSAGING_SENDER_ID",
    appId: "VOTRE_APP_ID"
};

// Initialisation de l'application Firebase
const app = initializeApp(firebaseConfig);

// Exportation de l'instance de l'application Firebase pour qu'elle puisse être utilisée ailleurs
export { app };