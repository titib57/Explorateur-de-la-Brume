import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

// Votre configuration Firebase (à remplacer !)
const firebaseConfig = {
    apiKey: "VOTRE_CLE_API_ICI",
    authDomain: "VOTRE_DOMAINE.firebaseapp.com",
    projectId: "VOTRE_PROJET",
    storageBucket: "VOTRE_STOCKAGE.appspot.com",
    messagingSenderId: "VOTRE_ID_SENDER",
    appId: "VOTRE_ID_APP"
};

// Initialisation de Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Récupération des éléments du DOM
const signupForm = document.getElementById('signupForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const messageDiv = document.getElementById('message');

// Événement de soumission du formulaire
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Empêche le rechargement de la page

    const email = emailInput.value;
    const password = passwordInput.value;

    // Afficher un message de chargement
    messageDiv.textContent = "Création du compte en cours...";
    messageDiv.className = "message loading";

    try {
        // Appeler la fonction de création de compte de Firebase
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Message de succès
        messageDiv.textContent = "Compte créé avec succès ! Redirection...";
        messageDiv.className = "message success";

        // Redirection après un court délai
        setTimeout(() => {
            window.location.href = "world_map.html"; // Redirigez vers votre page de carte
        }, 1500);

    } catch (error) {
        console.error("Erreur de création de compte :", error.code, error.message);
        let errorMessage = "Erreur de création de compte. Veuillez réessayer.";

        // Traduction des codes d'erreur de Firebase
        switch (error.code) {
            case 'auth/email-already-in-use':
                errorMessage = "Cette adresse e-mail est déjà utilisée.";
                break;
            case 'auth/weak-password':
                errorMessage = "Le mot de passe est trop faible (minimum 6 caractères).";
                break;
            case 'auth/invalid-email':
                errorMessage = "Le format de l'e-mail est invalide.";
                break;
            default:
                errorMessage = "Une erreur est survenue lors de la création du compte.";
        }

        // Afficher l'erreur
        messageDiv.textContent = errorMessage;
        messageDiv.className = "message error";
    }
});