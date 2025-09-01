// Fichier : js/core/login.js

// Importation des modules nécessaires de Firebase
import { onAuthStateChanged, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { auth, db, app } from "/firebase_config.js";

// Si l'utilisateur est déjà connecté, on le redirige immédiatement.
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Redirige vers la page principale une fois l'utilisateur connecté
        window.location.href = "gestion_personnage.html"; 
    }
});

// Récupération des éléments du DOM
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const messageDiv = document.getElementById('message');

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
});