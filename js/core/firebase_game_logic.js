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

// Ajout de l'écouteur d'événement pour le bouton de déconnexion
if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
}

/**
 * Initialise l'application Firebase et gère l'état d'authentification.
 * @returns {Promise<void>}
 */
export async function initFirebase() {
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
                console.log("Utilisateur authentifié :", currentUserId);
                // On cache la section de connexion, puis on gère l'affichage du personnage.
                hideAllSections();
                await handleUserLoggedIn();
                logoutBtn.classList.remove('hidden'); // Affiche le bouton de déconnexion
            } else {
                // État 2 : Utilisateur non connecté.
                console.log("Utilisateur non connecté.");
                hideAllSections();
                loginSection.classList.remove('hidden'); // Affiche la section de connexion
                logoutBtn.classList.add('hidden'); // Cache le bouton de déconnexion
            }
        });
    } catch (error) {
        console.error("Erreur d'initialisation de l'application Firebase :", error);
        // Gérer l'erreur d'initialisation, peut-être avec un message d'erreur.
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
            characterSection.classList.remove('hidden');
            displayCharacter(characterData);
        } else {
            // État 4 : L'utilisateur n'a pas de personnage.
            noCharacterSection.classList.remove('hidden');
        }
    } catch (error) {
        console.error("Erreur lors de la gestion de l'état utilisateur :", error);
        // Gérer l'erreur de chargement (ex: afficher un message d'erreur).
    }
}

/**
 * Affiche les détails du personnage dans la section dédiée.
 * @param {object} characterData - Les données du personnage à afficher.
 */
function displayCharacter(characterData) {
    characterDisplay.innerHTML = `
        <div class="character-card p-4 border rounded-lg shadow-md">
            <h3 class="text-xl font-bold">${characterData.character_name}</h3>
            <p><strong>Niveau :</strong> ${characterData.level}</p>
            <p><strong>Classe :</strong> ${characterData.class}</p>
            <div class="mt-2">
                <strong>Statistiques :</strong>
                <ul>
                    <li>Force : ${characterData.stats.strength}</li>
                    <li>Dextérité : ${characterData.stats.dexterity}</li>
                    <li>Intelligence : ${characterData.stats.intelligence}</li>
                </ul>
            </div>
            </div>
    `;
}

/**
 * Cache toutes les sections principales de la page.
 */
function hideAllSections() {
    loginSection.classList.add('hidden');
    noCharacterSection.classList.add('hidden');
    characterSection.classList.add('hidden');
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
        // Afficher un message d'erreur si la déconnexion échoue.
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