// Fichier : js/core/login.js

// Importation des modules nécessaires de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// Récupération des variables globales de l'environnement Canvas
export const firebaseConfig = {
    apiKey: "AIzaSyBQDq4lQfoYfDr2abVAuAxC7UPez2wPnX4",
    authDomain: "rpg---explorateur-de-la-brume.firebaseapp.com",
    projectId: "rpg---explorateur-de-la-brume",
    storageBucket: "rpg---explorateur-de-la-brume.firebasestorage.app",
    messagingSenderId: "855919886618",
    appId: "1:855919886618:web:933180441fa6f29dd26ca3",
    measurementId: "G-139GQZWKTC"
};

// Récupération des éléments du DOM
document.addEventListener('DOMContentLoaded', () => {
    // Tout le code qui manipule les éléments HTML doit être ici
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const messageDiv = document.getElementById('message');
});

// Initialisation de Firebase
let auth;
let app;
let db;

// Vérifier si la configuration est présente avant d'initialiser l'application
if (Object.keys(firebaseConfig).length > 0) {
    try {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app); // Initialisation de Firestore

    } catch (error) {
        console.error("Erreur lors de l'initialisation de Firebase :", error);
        messageDiv.textContent = "Erreur de configuration Firebase. Veuillez vérifier vos clés API.";
    }
} else {
    messageDiv.textContent = "La configuration Firebase est manquante ou incomplète.";
}

// Écouteur d'événement pour la soumission du formulaire
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Empêche le rechargement de la page

    if (!auth) {
        messageDiv.textContent = "Service d'authentification non disponible.";
        return;
    }

    const email = emailInput.value;
    const password = passwordInput.value;

    // Affichage d'un message de chargement
    messageDiv.textContent = "Connexion en cours...";
    messageDiv.className = "text-sm font-medium text-center text-blue-400";

    try {
        // Tentative de connexion avec l'e-mail et le mot de passe
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Affichage d'un message de succès et redirection
        messageDiv.textContent = `Connexion réussie ! Redirection...`;
        messageDiv.className = "text-sm font-medium text-center text-green-400";
        
        // Redirection vers la page de personnage ou une autre page après un court délai
        setTimeout(() => {
            window.location.href = "gestion_personnage.html";
        }, 1500);

    } catch (error) {
        console.error("Erreur de connexion :", error.code, error.message);
        let errorMessage = "Erreur de connexion. Veuillez réessayer.";

        // Traduction des codes d'erreur de Firebase pour un message plus clair
        switch (error.code) {
            case 'auth/user-not-found':
                errorMessage = "Aucun utilisateur trouvé avec cette adresse e-mail.";
                break;
            case 'auth/wrong-password':
                errorMessage = "Mot de passe incorrect.";
                break;
            case 'auth/invalid-email':
                errorMessage = "Le format de l'adresse e-mail est invalide.";
                break;
            case 'auth/too-many-requests':
                errorMessage = "Trop de tentatives de connexion échouées. Veuillez réessayer plus tard.";
                break;
            default:
                errorMessage = "Erreur de connexion. Veuillez vérifier votre e-mail et votre mot de passe.";
                break;
        }
        
        // Affichage de l'erreur
        messageDiv.textContent = errorMessage;
        messageDiv.className = "text-sm font-medium text-center text-red-400";
    }
});