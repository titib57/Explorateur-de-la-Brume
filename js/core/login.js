// Fichier : js/core/login.js
// Ce script gère l'authentification des utilisateurs avec Firebase.

// Importation des modules Firebase nécessaires depuis leurs URL CDN.
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// Configuration de l'application Firebase (à masquer en production).
const firebaseConfig = {
    apiKey: "AIzaSyBQDq4lQfoYfDr2abVAuAxC7UPez2wPnX4",
    authDomain: "rpg---explorateur-de-la-brume.firebaseapp.com",
    projectId: "rpg---explorateur-de-la-brume",
    storageBucket: "rpg---explorateur-de-la-brume.firebasestorage.app",
    messagingSenderId: "855919886618",
    appId: "1:855919886618:web:933180441fa6f29dd26ca3",
    measurementId: "G-139GQZWKTC"
};

// Exécution du code une fois que le DOM est complètement chargé.
document.addEventListener('DOMContentLoaded', () => {
    // Déclaration des variables pour les éléments du DOM au niveau global de l'écouteur.
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const messageDiv = document.getElementById('message');

    // Vérification de la présence de tous les éléments nécessaires.
    if (!loginForm || !emailInput || !passwordInput || !messageDiv) {
        console.error("Erreur : Un ou plusieurs éléments du DOM sont introuvables. Vérifiez les 'id' dans votre HTML.");
        if (messageDiv) {
            messageDiv.textContent = "Erreur de chargement. Veuillez recharger la page.";
        }
        return; // Arrêt de l'exécution du script.
    }

    // Initialisation de Firebase après la vérification de la configuration.
    let app, auth, db;
    if (Object.keys(firebaseConfig).length > 0) {
        try {
            app = initializeApp(firebaseConfig);
            auth = getAuth(app);
            db = getFirestore(app);
            console.log("Firebase initialisé avec succès !");
        } catch (error) {
            console.error("Erreur lors de l'initialisation de Firebase :", error);
            messageDiv.textContent = "Erreur de configuration Firebase. Veuillez vérifier vos clés API.";
            return; // Arrêt de l'exécution en cas d'erreur.
        }
    } else {
        messageDiv.textContent = "La configuration Firebase est manquante ou incomplète.";
        return;
    }

    // Écouteur d'événement pour la soumission du formulaire.
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Empêche le rechargement de la page.

        // Vérification de la disponibilité du service d'authentification.
        if (!auth) {
            messageDiv.textContent = "Service d'authentification non disponible.";
            return;
        }

        const email = emailInput.value;
        const password = passwordInput.value;

        // Affichage d'un message de chargement.
        messageDiv.textContent = "Connexion en cours...";
        messageDiv.className = "text-sm font-medium text-center text-blue-400";

        try {
            // Tentative de connexion avec l'e-mail et le mot de passe.
            await signInWithEmailAndPassword(auth, email, password);

            // Message de succès et redirection.
            messageDiv.textContent = `Connexion réussie ! Redirection...`;
            messageDiv.className = "text-sm font-medium text-center text-green-400";
            
            // Redirection vers la page de gestion des personnages après un délai.
            setTimeout(() => {
                window.location.href = "gestion_personnage.html";
            }, 1500);

        } catch (error) {
            console.error("Erreur de connexion :", error.code, error.message);
            let errorMessage = "Erreur de connexion. Veuillez réessayer.";

            // Traduction des codes d'erreur de Firebase.
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
            
            // Affichage de l'erreur.
            messageDiv.textContent = errorMessage;
            messageDiv.className = "text-sm font-medium text-center text-red-400";
        }
    });
});