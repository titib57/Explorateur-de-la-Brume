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

// VARIABLES GLOBALES FOURNIES PAR L'ENVIRONNEMENT - NE PAS MODIFIER !
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : null;
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// SÉLECTION DES ÉLÉMENTS DU DOM POUR LES GÉRER DANS LE CODE
const loginSection = document.getElementById("login-section");
const noCharacterSection = document.getElementById("no-character-section");
const characterSection = document.getElementById("character-section");
const characterDisplay = document.getElementById("character-display");
const logoutBtn = document.getElementById("logout-btn");
const userIdDisplay = document.getElementById("user-id-display");
const notificationContainer = document.getElementById("notification-container");
const characterForm = document.getElementById('character-form');
const updateBtn = document.getElementById('update-btn');
const deleteBtn = document.getElementById('delete-btn');

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
            populateForm(characterData); // Pré-remplir le formulaire pour les mises à jour
            console.log("Données du personnage chargées en temps réel.");
        } else {
            // L'utilisateur n'a pas de personnage, afficher la section de création.
            if (noCharacterSection) noCharacterSection.classList.remove('hidden');
            if (characterForm) characterForm.reset();
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
async function saveGameData(playerData) {
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
async function updateGameData(dataToUpdate) {
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
async function deleteGameData() {
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
        if (!firebaseConfig) {
            throw new Error("La configuration Firebase est manquante. Assurez-vous d'avoir bien initialisé l'environnement.");
        }
        
        firebaseApp = initializeApp(firebaseConfig);
        firestoreDb = getFirestore(firebaseApp);
        firebaseAuth = getAuth(firebaseApp);

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
                    stats: { strength: 10, dexterity: 10, intelligence: 10 }
                };
                try {
                    await saveGameData(playerData);
                    showNotification("Personnage créé avec succès !", 'success');
                } catch (e) {
                    console.error("Erreur de sauvegarde:", e);
                    showNotification("Erreur de sauvegarde.", 'error');
                }
            });
        }
        
        // Ajout des écouteurs pour la mise à jour et la suppression
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
