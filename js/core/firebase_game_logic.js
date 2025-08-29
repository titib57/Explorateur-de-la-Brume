// Ce fichier contient toute la logique pour interagir avec Firebase Firestore.

// Importations des fonctions nécessaires depuis les librairies Firebase.
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Déclaration des variables globales. Elles seront accessibles une fois l'initialisation terminée.
let firebaseApp = null;
let firestoreDb = null;
let firebaseAuth = null;
let currentUserId = null;

/**
 * Initialise l'application Firebase et gère l'authentification de l'utilisateur.
 * @returns {Promise<string>} L'ID de l'utilisateur actuel une fois l'initialisation terminée.
 */
export async function initFirebase() {
    try {
        const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
        firebaseApp = initializeApp(firebaseConfig);
        firestoreDb = getFirestore(firebaseApp);
        firebaseAuth = getAuth(firebaseApp);

        // Crée une promesse pour s'assurer que l'authentification est terminée avant de continuer.
        return new Promise((resolve, reject) => {
            onAuthStateChanged(firebaseAuth, async (user) => {
                if (user) {
                    currentUserId = user.uid;
                    console.log("Utilisateur authentifié :", currentUserId);
                    resolve(currentUserId);
                } else {
                    const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
                    try {
                        if (initialAuthToken) {
                            await signInWithCustomToken(firebaseAuth, initialAuthToken);
                        } else {
                            await signInAnonymously(firebaseAuth);
                        }
                    } catch (error) {
                        console.error("Erreur lors de l'authentification :", error);
                        reject(error);
                    }
                }
            });
        });
    } catch (error) {
        console.error("Erreur d'initialisation de l'application Firebase :", error);
        throw error;
    }
}

/**
 * Sauvegarde les données complètes du joueur dans Firestore.
 * Utilise setDoc pour écraser le document existant avec les nouvelles données.
 * @param {object} playerData L'objet contenant toutes les données à sauvegarder.
 * @returns {Promise<void>}
 */
export async function saveGameData(playerData) {
    if (!currentUserId) {
        console.error("Erreur de sauvegarde : l'utilisateur n'est pas authentifié.");
        throw new Error("Erreur de sauvegarde : l'utilisateur n'est pas authentifié.");
    }
    try {
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
        const docRef = doc(firestoreDb, `artifacts/${appId}/users/${currentUserId}/game_data/player_state`);
        await setDoc(docRef, playerData);
        console.log("Données du joueur sauvegardées avec succès.");
    } catch (e) {
        console.error("Erreur de sauvegarde : ", e);
        throw e;
    }
}

/**
 * Charge les données du joueur depuis Firestore.
 * @returns {Promise<object|null>} L'objet des données du joueur ou null si aucune sauvegarde n'est trouvée.
 */
export async function loadGameData() {
    if (!currentUserId) {
        console.error("Erreur de chargement : l'utilisateur n'est pas authentifié.");
        throw new Error("Erreur de chargement : l'utilisateur n'est pas authentifié.");
    }
    try {
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
        const docRef = doc(firestoreDb, `artifacts/${appId}/users/${currentUserId}/game_data/player_state`);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            console.log("Données du joueur chargées avec succès.");
            return docSnap.data();
        } else {
            console.log("Aucune sauvegarde trouvée.");
            return null;
        }
    } catch (e) {
        console.error("Erreur de chargement : ", e);
        throw e;
    }
}

/**
 * Met à jour partiellement les données du joueur dans Firestore.
 * Utilise updateDoc pour ne modifier que les champs spécifiés.
 * @param {object} dataToUpdate L'objet contenant les champs et leurs nouvelles valeurs.
 * @returns {Promise<void>}
 */
export async function updateGameData(dataToUpdate) {
    if (!currentUserId) {
        console.error("Erreur de mise à jour : l'utilisateur n'est pas authentifié.");
        throw new Error("Erreur de mise à jour : l'utilisateur n'est pas authentifié.");
    }
    try {
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
        const docRef = doc(firestoreDb, `artifacts/${appId}/users/${currentUserId}/game_data/player_state`);
        await updateDoc(docRef, dataToUpdate);
        console.log("Données du joueur mises à jour avec succès.");
    } catch (e) {
        console.error("Erreur de mise à jour : ", e);
        throw e;
    }
}

/**
 * Supprime le document du personnage dans Firestore.
 * @returns {Promise<void>}
 */
export async function deleteGameData() {
    if (!currentUserId) {
        console.error("Erreur de suppression : l'utilisateur n'est pas authentifié.");
        throw new Error("Erreur de suppression : l'utilisateur n'est pas authentifié.");
    }
    try {
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
        const docRef = doc(firestoreDb, `artifacts/${appId}/users/${currentUserId}/game_data/player_state`);
        await deleteDoc(docRef);
        console.log("Personnage supprimé avec succès.");
    } catch (e) {
        console.error("Erreur de suppression :", e);
        throw e;
    }
}
