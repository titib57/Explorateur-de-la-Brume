// Ce fichier contient toute la logique pour interagir avec Firebase Firestore.

// Importations des fonctions nécessaires depuis les librairies Firebase.
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Déclaration des variables globales.
let firebaseApp = null;
let firestoreDb = null;
let firebaseAuth = null;
let currentUserId = null;

// SÉLECTION DES ÉLÉMENTS DU DOM POUR LES GÉRER DANS LE CODE
const loginSection = document.getElementById("login-section");
const noCharacterSection = document.getElementById("no-character-section");
const characterSection = document.getElementById("character-section");
const characterDisplay = document.getElementById("character-display");
const logoutBtn = document.getElementById("logout-btn");
// Ajout de la sélection des éléments pour les nouvelles fonctions
const userIdDisplay = document.getElementById("user-id-display");
const notificationContainer = document.getElementById("notification-container");
const characterForm = document.getElementById('character-form');
const formTitle = document.getElementById('form-title');

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
    if (!characterDisplay) return;
    characterDisplay.innerHTML = `
        <div class="character-card p-4 border rounded-lg shadow-md">
            <h3 class="text-xl font-bold">${characterData.character_name || characterData.name}</h3>
            <p><strong>Niveau :</strong> ${characterData.level}</p>
            <p><strong>Classe :</strong> ${characterData.class}</p>
            <div class="mt-2">
                <strong>Statistiques :</strong>
                <ul>
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
        // onAuthStateChanged se déclenchera et gérera l'affichage de la section de connexion.
        console.log("Déconnexion réussie.");
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
    try {
        const characterData = await loadGameData();
        if (characterData) {
            // État 3 : L'utilisateur a un personnage.
            if (characterSection) characterSection.classList.remove('hidden');
            displayCharacter(characterData);
            populateForm(characterData);
        } else {
            // État 4 : L'utilisateur n'a pas de personnage.
            if (noCharacterSection) noCharacterSection.classList.remove('hidden');
            if (characterForm) characterForm.reset();
        }
    } catch (error) {
        console.error("Erreur lors de la gestion de l'état utilisateur :", error);
        showNotification("Erreur lors du chargement des données.", 'error');
    }
}

// MISE À JOUR DES FONCTIONS DE GESTION DES DONNÉES
// Suppression de la logique `appId` redondante, la collection `players` est plus simple
// car elle est sécurisée par les règles Firestore.

/**
 * Sauvegarde les données complètes du joueur.
 * @param {object} playerData L'objet contenant les données.
 * @returns {Promise<void>}
 */
export async function saveGameData(playerData) {
    if (!currentUserId) {
        throw new Error("Erreur de sauvegarde : l'utilisateur n'est pas authentifié.");
    }
    const docRef = doc(firestoreDb, `players/${currentUserId}`);
    await setDoc(docRef, playerData);
    console.log("Données du joueur sauvegardées avec succès.");
}

/**
 * Charge les données du joueur.
 * @returns {Promise<object|null>} L'objet des données du joueur ou null.
 */
export async function loadGameData() {
    if (!currentUserId) {
        throw new Error("Erreur de chargement : l'utilisateur n'est pas authentifié.");
    }
    const docRef = doc(firestoreDb, `players/${currentUserId}`);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
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
    const docRef = doc(firestoreDb, `players/${currentUserId}`);
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
    const docRef = doc(firestoreDb, `players/${currentUserId}`);
    await deleteDoc(docRef);
    console.log("Personnage supprimé avec succès.");
}


// Ajout des écouteurs d'événements et de la logique d'initialisation
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
        firebaseApp = initializeApp(firebaseConfig);
        firestoreDb = getFirestore(firebaseApp);
        firebaseAuth = getAuth(firebaseApp);

        // onAuthStateChanged est une écoute qui se déclenche à chaque changement d'état d'authentification (connexion, déconnexion).
        onAuthStateChanged(firebaseAuth, async (user) => {
            if (user) {
                // État 1 : Utilisateur connecté.
                currentUserId = user.uid;
                if (userIdDisplay) userIdDisplay.textContent = currentUserId;
                console.log("Utilisateur authentifié :", currentUserId);
                hideAllSections();
                await handleUserLoggedIn();
                if (logoutBtn) logoutBtn.classList.remove('hidden'); // Affiche le bouton de déconnexion
            } else {
                // État 2 : Utilisateur non connecté.
                console.log("Utilisateur non connecté.");
                hideAllSections();
                if (loginSection) loginSection.classList.remove('hidden'); // Affiche la section de connexion
                if (logoutBtn) logoutBtn.classList.add('hidden'); // Cache le bouton de déconnexion
            }
        });

        // Ajout de l'écouteur d'événement pour le bouton de déconnexion
        if (logoutBtn) {
            logoutBtn.addEventListener('click', handleLogout);
        }

        // Ajout de l'écouteur d'événement pour la création de personnage
        if (characterForm) {
            characterForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const playerData = {
                    name: document.getElementById('char-name').value,
                    age: parseInt(document.getElementById('char-age')?.value) || 20,
                    height: parseInt(document.getElementById('char-height')?.value) || 175,
                    weight: parseInt(document.getElementById('char-weight')?.value) || 70,
                    class: document.getElementById('char-class')?.value,
                    experience: 0,
                    level: 1,
                    gold: 100,
                    health: 100,
                    inventory: [],
                    stats: { strength: 10, dexterity: 10, intelligence: 10 } // Exemple de statistiques initiales
                };
                try {
                    await saveGameData(playerData);
                    showNotification("Personnage créé avec succès !", 'success');
                    displayCharacter(playerData);
                    hideAllSections();
                    if (characterSection) characterSection.classList.remove('hidden');
                } catch (e) {
                    console.error("Erreur de sauvegarde:", e);
                    showNotification("Erreur de sauvegarde.", 'error');
                }
            });
        }

    } catch (error) {
        console.error("Erreur d'initialisation de l'application Firebase :", error);
        showNotification("Erreur d'initialisation de l'application.", 'error');
    }
});