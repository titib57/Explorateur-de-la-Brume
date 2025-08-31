// Ce fichier contient toute la logique pour interagir avec Firebase Firestore.

// Importations des fonctions nécessaires depuis les librairies Firebase.
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, deleteDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Déclaration des variables globales.
let firebaseApp = null;
let firestoreDb = null;
let firebaseAuth = null;
let currentUserId = null;
let unsubscribeFromCharacter = null; // Pour désabonner le listener en temps réel

// **CONFIGURATION FIREBASE**
// Remplacez ces valeurs par celles de votre projet.
const appId = "votre_app_id_complet"; // Exemple : "1:1234567890:web:abcdefghijklmn"
const firebaseConfig = {
    apiKey: "AIzaSyBQDq4lQfoYfDr2abVAuAxC7UPez2wPnX4",
    authDomain: "rpg---explorateur-de-la-brume.firebaseapp.com",
    projectId: "rpg---explorateur-de-la-brume",
    storageBucket: "rpg---explorateur-de-la-brume.firebasestorage.app",
    messagingSenderId: "855919886618",
    appId: "1:855919886618:web:933180441fa6f29dd26ca3",
    measurementId: "G-139GQZWKTC"
};
const initialAuthToken = null; // Laissez-le à null pour une authentification anonyme.

// SÉLECTION DES ÉLÉMENTS DU DOM POUR LES GÉRER DANS LE CODE
const loginSection = document.getElementById("login-section");
const noCharacterSection = document.getElementById("no-character-section");
const characterSection = document.getElementById("character-section");
const characterDisplay = document.getElementById("character-display");
const logoutBtn = document.getElementById("logout-btn");
const userIdDisplay = document.getElementById("user-id-display");
const notificationContainer = document.getElementById("notification-container");

// Ajout des sélecteurs pour les nouveaux boutons
const playBtn = document.getElementById('play-btn');
const updateBtn = document.getElementById('update-btn');
const deleteBtn = document.getElementById('delete-btn');
// Suppression des sélecteurs de formulaire car le formulaire a été déplacé vers une autre page

// Fonctions de l'interface utilisateur
function showNotification(message, type) {
    if (!notificationContainer) return;
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notificationContainer.appendChild(notification);
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Cette fonction n'est plus pertinente pour cette page, mais elle est conservée pour d'autres pages.
function populateForm(playerData) {
    if (playerData) {
        if (document.getElementById('char-name')) document.getElementById('char-name').value = playerData.name || '';
        if (document.getElementById('char-age')) document.getElementById('char-age').value = playerData.age || 20;
        if (document.getElementById('char-height')) document.getElementById('char-height').value = playerData.height || 175;
        if (document.getElementById('char-weight')) document.getElementById('char-weight').value = playerData.weight || 70;
        if (document.getElementById('char-class')) document.getElementById('char-class').value = playerData.class || 'explorateur';
    }
}

/**
 * Affiche les détails du personnage dans la section dédiée.
 * @param {object} characterData - Les données du personnage à afficher.
 */
function displayCharacter(characterData) {
    if (!characterDisplay || !characterData) return;
    characterDisplay.innerHTML = `
        <div class="character-card p-4 border rounded-lg shadow-md">
            <h3 class="text-xl font-bold">${characterData.name}</h3>
            <div class="grid grid-cols-2 mt-2 gap-2 text-sm text-gray-700">
                <p><strong class="font-medium">Niveau :</strong> ${characterData.level}</p>
                <p><strong class="font-medium">Classe :</strong> ${characterData.class}</p>
                <p><strong class="font-medium">Âge :</strong> ${characterData.age} ans</p>
                <p><strong class="font-medium">Santé :</strong> ${characterData.health}</p>
            </div>
            <div class="mt-4">
                <strong class="text-gray-800">Statistiques :</strong>
                <ul class="mt-1 text-sm text-gray-600 space-y-1">
                    <li>Force : ${characterData.stats?.strength || 0}</li>
                    <li>Dextérité : ${characterData.stats?.dexterity || 0}</li>
                    <li>Intelligence : ${characterData.stats?.intelligence || 0}</li>
                </ul>
            </div>
        </div>
    `;
}

/**
 * Cache toutes les sections principales de la page.
 */
function hideAllSections() {
    if (loginSection) loginSection.classList.add('hidden');
    if (noCharacterSection) noCharacterSection.classList.add('hidden');
    if (characterSection) characterSection.classList.add('hidden');
}

/**
 * Gère la déconnexion de l'utilisateur.
 */
async function handleLogout() {
    try {
        await signOut(firebaseAuth);
        console.log("Déconnexion réussie.");
        if (unsubscribeFromCharacter) {
            unsubscribeFromCharacter();
            unsubscribeFromCharacter = null;
        }
    } catch (error) {
        console.error("Erreur lors de la déconnexion :", error);
        showNotification("Erreur lors de la déconnexion.", 'error');
    }
}

/**
 * Gère la logique lorsque l'utilisateur est connecté.
 * Vérifie l'existence d'un personnage et affiche la section appropriée.
 */
async function handleUserLoggedIn() {
    // Utiliser onSnapshot pour écouter les données en temps réel.
    const characterDocRef = doc(firestoreDb, `artifacts/${appId}/users/${currentUserId}/players/character-doc`);

    // Si un listener existe déjà, le désabonner pour éviter les doublons.
    if (unsubscribeFromCharacter) {
        unsubscribeFromCharacter();
    }

    unsubscribeFromCharacter = onSnapshot(characterDocRef, (docSnap) => {
        hideAllSections();
        if (docSnap.exists()) {
            // L'utilisateur a un personnage, afficher la section du personnage.
            const characterData = docSnap.data();
            if (characterSection) characterSection.classList.remove('hidden');
            displayCharacter(characterData);
            
            // Rendre les boutons "jouer" et "supprimer" visibles
            if (playBtn) playBtn.classList.remove('hidden');
            if (deleteBtn) deleteBtn.classList.remove('hidden');
            if (updateBtn) updateBtn.classList.remove('hidden');

            console.log("Données du personnage chargées en temps réel.");
        } else {
            // L'utilisateur n'a pas de personnage, afficher la section de création.
            if (noCharacterSection) noCharacterSection.classList.remove('hidden');
            
            // Masquer les boutons "jouer", "supprimer" et "mettre à jour" si aucun personnage n'existe
            if (playBtn) playBtn.classList.add('hidden');
            if (deleteBtn) deleteBtn.classList.add('hidden');
            if (updateBtn) updateBtn.classList.add('hidden');
            
            console.log("Aucun personnage trouvé. Redirection vers la création.");
        }
    }, (error) => {
        console.error("Erreur lors de l'écoute des données :", error);
        showNotification("Erreur lors du chargement des données.", 'error');
    });
}


/**
 * Sauvegarde les données complètes du joueur.
 * @param {object} playerData L'objet contenant les données.
 * @returns {Promise<void>}
 */
export async function saveGameData(playerData) {
    if (!currentUserId) {
        throw new Error("Erreur de sauvegarde : l'utilisateur n'est pas authentifié.");
    }
    // Le chemin du document est maintenant spécifique à l'utilisateur et à l'application
    const docRef = doc(firestoreDb, `artifacts/${appId}/users/${currentUserId}/players/character-doc`);
    await setDoc(docRef, playerData);
    console.log("Données du joueur sauvegardées avec succès.");
}

/**
 * Met à jour partiellement les données du joueur.
 * @param {object} dataToUpdate L'objet contenant les champs et leurs nouvelles valeurs.
 * @returns {Promise<void>}
 */
export async function updateGameData(dataToUpdate) {
    if (!currentUserId) {
        throw new Error("Erreur de mise à jour : l'utilisateur n'est pas authentifié.");
    }
    const docRef = doc(firestoreDb, `artifacts/${appId}/users/${currentUserId}/players/character-doc`);
    await updateDoc(docRef, dataToUpdate);
    console.log("Données du joueur mises à jour avec succès.");
}

/**
 * Supprime le document du personnage.
 * @returns {Promise<void>}
 */
export async function deleteGameData() {
    if (!currentUserId) {
        throw new Error("Erreur de suppression : l'utilisateur n'est pas authentifié.");
    }
    const docRef = doc(firestoreDb, `artifacts/${appId}/users/${currentUserId}/players/character-doc`);
    await deleteDoc(docRef);
    console.log("Personnage supprimé avec succès.");
}

// Ajout des écouteurs d'événements et de la logique d'initialisation
document.addEventListener('DOMContentLoaded', async () => {
    try {
        firebaseApp = initializeApp(firebaseConfig);
        firestoreDb = getFirestore(firebaseApp);
        firebaseAuth = getAuth(firebaseApp);

        // Vérifie que l'objet d'authentification est valide avant d'attacher le listener.
        // Cela permet de prévenir une erreur si le service d'authentification ne s'initialise pas correctement.
        if (firebaseAuth) {
            // onAuthStateChanged est une écoute qui se déclenche à chaque changement d'état d'authentification (connexion, déconnexion).
            onAuthStateChanged(firebaseAuth, async (user) => {
                hideAllSections();
                if (user) {
                    // État 1 : Utilisateur connecté.
                    currentUserId = user.uid;
                    if (userIdDisplay) {
                        userIdDisplay.textContent = currentUserId;
                        document.getElementById('user-info').classList.remove('hidden');
                    }
                    console.log("Utilisateur authentifié :", currentUserId);
                    await handleUserLoggedIn();
                    if (logoutBtn) logoutBtn.classList.remove('hidden');
                } else {
                    // État 2 : Utilisateur non connecté.
                    console.log("Utilisateur non connecté.");
                    currentUserId = null;
                    if (loginSection) loginSection.classList.remove('hidden');
                    if (logoutBtn) logoutBtn.classList.add('hidden');
                    if (userIdDisplay) document.getElementById('user-info').classList.add('hidden');
                }
            });
        } else {
            console.error("Firebase Auth n'a pas pu être initialisé.");
            showNotification("Erreur d'authentification. L'application ne peut pas démarrer.", 'error');
        }

        // Tente de se connecter avec le jeton fourni par l'environnement
        if (initialAuthToken) {
            await signInWithCustomToken(firebaseAuth, initialAuthToken);
        } else {
            await signInAnonymously(firebaseAuth);
        }

        // Ajout de l'écouteur d'événement pour le bouton de déconnexion
        if (logoutBtn) {
            logoutBtn.addEventListener('click', handleLogout);
        }
        
        // Ajout des écouteurs d'événements pour les boutons de gestion de personnage
        if (updateBtn) {
            updateBtn.addEventListener('click', async () => {
                const newName = prompt("Nouveau nom pour votre personnage ?");
                if (newName) {
                    try {
                        await updateGameData({ name: newName });
                        showNotification("Nom du personnage mis à jour !", 'success');
                    } catch(e) {
                        console.error("Erreur de mise à jour:", e);
                        showNotification("Erreur de mise à jour.", 'error');
                    }
                }
            });
        }

        if (deleteBtn) {
            deleteBtn.addEventListener('click', async () => {
                if (window.confirm("Êtes-vous sûr de vouloir supprimer votre personnage ?")) {
                    try {
                        await deleteGameData();
                        showNotification("Personnage supprimé avec succès !", 'success');
                    } catch(e) {
                        console.error("Erreur de suppression:", e);
                        showNotification("Erreur de suppression.", 'error');
                    }
                }
            });
        }
    } catch (error) {
        console.error("Erreur d'initialisation de l'application Firebase :", error);
        showNotification("Erreur d'initialisation de l'application. Veuillez vérifier la console.", 'error');
    }
});