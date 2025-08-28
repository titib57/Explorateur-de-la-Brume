
        // Importation des modules nécessaires de Firebase
        import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
        import { getAuth, signInWithEmailAndPassword, signInWithCustomToken } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
        import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

        // Récupération des variables globales de l'environnement Canvas
        const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
        const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : '';

        // Récupération des éléments du DOM
        const loginForm = document.getElementById('loginForm');
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const messageDiv = document.getElementById('message');

        // Initialisation de Firebase
        let auth;
        let db;
        let app;

        // Vérifier si la configuration est présente avant d'initialiser l'application
        if (Object.keys(firebaseConfig).length > 0) {
            try {
                app = initializeApp(firebaseConfig);
                auth = getAuth(app);
                db = getFirestore(app); // Initialisation de Firestore
                
                // S'authentifier avec le token initial pour que les autres services fonctionnent
                if (initialAuthToken) {
                    signInWithCustomToken(auth, initialAuthToken).catch((error) => {
                        console.error("Erreur d'authentification initiale :", error);
                    });
                }

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
                
                // Redirection vers la carte du monde ou une autre page après un court délai
                setTimeout(() => {
                    window.location.href = "character_creation.html";
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