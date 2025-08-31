// Ce fichier contient toute la logique pour interagir avec Firebase Firestore.

// Importations des fonctions nécessaires depuis les librairies Firebase.
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, deleteDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { firebaseConfig,  } from "/js/core/login.js"
// Déclaration des variables globales.
let firebaseApp = null;
let firestoreDb = null;
let firebaseAuth = null;
let currentUserId = null;
let unsubscribeFromCharacter = null; // Pour désabonner le listener en temps réel

// SÉLECTION DES ÉLÉMENTS DU DOM POUR LES GÉRER DANS LE CODE
const noCharacterSection = document.getElementById("no-character-section");
const characterSection = document.getElementById("character-section");
const characterDisplay = document.getElementById("character-display");
const notificationContainer = document.getElementById("notification-container");

// Ajout des sélecteurs pour les nouveaux boutons
const playBtn = document.getElementById('play-btn');
const updateBtn = document.getElementById('update-btn');
const deleteBtn = document.getElementById('delete-btn');

/**
 * Affiche une notification à l'utilisateur.
 * @param {string} message - Le message à afficher.
 * @param {string} type - Le type de notification ('success' ou 'error').
 */
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
    if (noCharacterSection) noCharacterSection.classList.add('hidden');
    if (characterSection) characterSection.classList.add('hidden');
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
            const characterData = docSnap.data();
            if (characterSection) characterSection.classList.remove('hidden');
            displayCharacter(characterData);
            
            if (playBtn) playBtn.classList.remove('hidden');
            if (deleteBtn) deleteBtn.classList.remove('hidden');
            if (updateBtn) updateBtn.classList.remove('hidden');

            console.log("Données du personnage chargées en temps réel.");
        } else {
            if (noCharacterSection) noCharacterSection.classList.remove('hidden');
            
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
 * Met à jour partiellement les données du joueur.
 * @param {object} dataToUpdate - L'objet contenant les champs et leurs nouvelles valeurs.
 * @returns {Promise<void>}
 */
async function updateGameData(dataToUpdate) {
    if (!currentUserId) {
        showNotification("Erreur de mise à jour : l'utilisateur n'est pas authentifié.", 'error');
        return;
    }
    const docRef = doc(firestoreDb, `artifacts/${appId}/users/${currentUserId}/players/character-doc`);
    try {
        await updateDoc(docRef, dataToUpdate);
        showNotification("Données du joueur mises à jour avec succès !", 'success');
        console.log("Données du joueur mises à jour avec succès.");
    } catch (e) {
        console.error("Erreur de mise à jour:", e);
        showNotification("Erreur de mise à jour.", 'error');
    }
}

/**
 * Supprime le document du personnage.
 * @returns {Promise<void>}
 */
async function deleteGameData() {
    if (!currentUserId) {
        showNotification("Erreur de suppression : l'utilisateur n'est pas authentifié.", 'error');
        return;
    }
    const docRef = doc(firestoreDb, `artifacts/${appId}/users/${currentUserId}/players/character-doc`);
    try {
        await deleteDoc(docRef);
        showNotification("Personnage supprimé avec succès !", 'success');
        console.log("Personnage supprimé avec succès.");
    } catch (e) {
        console.error("Erreur de suppression:", e);
        showNotification("Erreur de suppression.", 'error');
    }
}

// Ajout des écouteurs d'événements et de la logique d'initialisation
document.addEventListener('DOMContentLoaded', async () => {
    try {
        if (!firebaseConfig) {
            throw new Error("La configuration Firebase est manquante.");
        }

        firebaseApp = initializeApp(firebaseConfig);
        firestoreDb = getFirestore(firebaseApp);
        firebaseAuth = getAuth(firebaseApp);

        if (firebaseAuth) {
            onAuthStateChanged(firebaseAuth, async (user) => {
                if (user) {
                    currentUserId = user.uid;
                    await handleUserLoggedIn();
                } else {
                    currentUserId = null;
                    if (noCharacterSection) noCharacterSection.classList.remove('hidden');
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
        
        // Ajout des écouteurs d'événements pour les boutons de gestion de personnage
        if (updateBtn) {
            updateBtn.addEventListener('click', async () => {
                const newName = prompt("Nouveau nom pour votre personnage ?");
                if (newName) {
                    await updateGameData({ name: newName });
                }
            });
        }

        if (deleteBtn) {
            deleteBtn.addEventListener('click', async () => {
                // Utiliser une fonction de confirmation personnalisée si possible pour éviter les popups bloquants
                const isConfirmed = confirm("Êtes-vous sûr de vouloir supprimer votre personnage ?");
                if (isConfirmed) {
                    await deleteGameData();
                }
            });
        }
    } catch (error) {
        console.error("Erreur d'initialisation de l'application Firebase :", error);
        showNotification("Erreur d'initialisation de l'application. Veuillez vérifier la console.", 'error');
    }
});
