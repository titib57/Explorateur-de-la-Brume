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

// Exécuter tout le code après que le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {

    // Récupération des éléments du DOM
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const messageDiv = document.getElementById('message');

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
        e.preventDefault();

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
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            messageDiv.textContent = `Connexion réussie ! Redirection...`;
            messageDiv.className = "text-sm font-medium text-center text-green-400";
            
            setTimeout(() => {
                window.location.href = "gestion_personnage.html";
            }, 1500);

        } catch (error) {
            console.error("Erreur de connexion :", error.code, error.message);
            let errorMessage = "Erreur de connexion. Veuillez réessayer.";

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
            
            messageDiv.textContent = errorMessage;
            messageDiv.className = "text-sm font-medium text-center text-red-400";
        }
    });
});