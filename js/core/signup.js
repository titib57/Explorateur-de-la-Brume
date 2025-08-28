  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyBQDq4lQfoYfDr2abVAuAxC7UPez2wPnX4",
    authDomain: "rpg---explorateur-de-la-brume.firebaseapp.com",
    projectId: "rpg---explorateur-de-la-brume",
    storageBucket: "rpg---explorateur-de-la-brume.firebasestorage.app",
    messagingSenderId: "855919886618",
    appId: "1:855919886618:web:933180441fa6f29dd26ca3",
    measurementId: "G-139GQZWKTC"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);


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
            window.location.href = "stats.html"; // Redirigez vers votre page de carte
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