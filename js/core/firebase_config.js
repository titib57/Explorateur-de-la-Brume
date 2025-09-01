// js/core/firebase_config.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

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

// Exportation de l'instance de l'application Firebase pour qu'elle puisse être utilisée ailleurs
export { app };