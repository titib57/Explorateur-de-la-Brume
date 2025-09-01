// Fichier : js/core/gestion_personnage.js

import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { app } from "js/core/firebase_config.js";

const auth = getAuth(app);
const db = getFirestore(app);

// Si l'utilisateur n'est pas connecté, on le redirige vers la page de connexion
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "login.html"; // Redirection si l'utilisateur n'est pas connecté
    } else {
        console.log("Utilisateur connecté :", user.uid);
        // Ici, vous ajouterez la logique pour récupérer et afficher les informations du personnage de l'utilisateur.
        try {
            const docRef = doc(db, "personnages", user.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                console.log("Données du personnage :", docSnap.data());
                // Mettez à jour le DOM avec les données du personnage
                // Par exemple: document.getElementById('nom-personnage').textContent = docSnap.data().nom;
            } else {
                console.log("Aucun personnage trouvé pour cet utilisateur !");
                // Gérer le cas où l'utilisateur n'a pas encore de personnage.
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des données du personnage :", error);
        }
    }
});

// Gérer la déconnexion de l'utilisateur
const logoutButton = document.getElementById('logout-button');
if (logoutButton) {
    logoutButton.addEventListener('click', () => {
        signOut(auth).then(() => {
            // Déconnexion réussie, redirection vers la page de connexion
            window.location.href = "login.html";
        }).catch((error) => {
            console.error("Erreur de déconnexion :", error);
        });
    });
}