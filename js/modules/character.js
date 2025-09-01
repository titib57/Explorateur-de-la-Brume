// Fichier : js/modules/character.js
// Ce module gère la logique d'interaction avec l'état du personnage.
// La gestion de l'état elle-même est centralisée dans le module core/state.js.

/**
 * Initialise le personnage avec la quête de départ.
 */
export function initializeCharacter(player) {
    if (player) {
        // Initialise la quête de départ si le joueur n'en a pas déjà une
        if (!player.quests || !player.quests.current) {
            player.quests = {
                current: 'lieu_sur',
            };
            savePlayer(player);
        }
    }
}

// Déclaration des variables globales fournies par l'environnement
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Importations des modules Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, deleteDoc, onSnapshot, collection } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { savePlayer, player } from '../core/state.js';

let db, auth, userId;
let unsubscribeFromCharacterListener;

// --- Définition de la classe Player ---
// Ceci simule la classe Player qui serait dans le module 'state.js'
class Player {
    constructor(data) {
        this.name = data.name;
        this.class = data.class;
        this.age = data.age;
        this.height = data.height;
        this.weight = data.weight;
        this.xp = data.xp || 0;
        this.level = data.level || 1;
        this.quests = data.quests || {};
    }

// Ajout de la méthode addXp directement dans la classe
    addXp(amount) {
        this.xp += amount;
        // La logique pour la montée de niveau serait ici
        console.log(`XP ajoutée : ${amount}. Total XP : ${this.xp}`);
    }
}

// --- Fonctions Firestore pour la gestion de l'état ---
async function savePlayer(playerData) {
    if (!userId) {
        showNotification("Erreur : Utilisateur non authentifié.", 'error');
        return;
    }
    try {
        const charRef = doc(db, 'artifacts', appId, 'users', userId, 'characters', userId);
        await setDoc(charRef, playerData, { merge: true });
        showNotification("Personnage sauvegardé !", 'success');
        // Met à jour la variable globale `player` après la sauvegarde
        player = new Player(playerData);
    } catch (error) {
        console.error("Erreur lors de la sauvegarde du personnage : ", error);
        showNotification("Erreur lors de la sauvegarde.", 'error');
    }
}

// --- Fonctions utilitaires du module character.js ---
function giveXP(amount) {
    if (!player) return;
    player.addXp(amount);
    savePlayer(player);
}

function initializeCharacter(player) {
    if (player) {
        if (!player.quests || !player.quests.current) {
            player.quests = {
                current: 'lieu_sur',
            };
            savePlayer(player);
        }
    }
}

// --- Éléments du DOM ---
const loadingMessage = document.getElementById('loading-message');
const formTitle = document.getElementById('form-title');
const actionButtons = document.getElementById('action-buttons');
const characterForm = document.getElementById('character-form');
const deleteBtn = document.getElementById('delete-char-btn');
const charNameInput = document.getElementById('char-name');
const charAgeInput = document.getElementById('char-age');
const charHeightInput = document.getElementById('char-height');
const charWeightInput = document.getElementById('char-weight');
const charClassSelect = document.getElementById('char-class');
const popupOverlay = document.getElementById('popup-overlay');
const popupContent = document.getElementById('popup-content');
const confirmDeleteBtn = document.getElementById('confirm-delete');
const cancelDeleteBtn = document.getElementById('cancel-delete');
const userIdDisplay = document.getElementById('user-id-display');

// --- Fonctions utilitaires pour l'UI ---
function showNotification(message, type) {
    const container = document.getElementById('notification-container');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    container.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('notification-show');
    }, 10);

    setTimeout(() => {
        notification.classList.remove('notification-show');
        notification.addEventListener('transitionend', () => {
            notification.remove();
        });
    }, 3000);
}

function showUI(element) {
    element.style.display = 'flex';
}

function hideUI(element) {
    element.style.display = 'none';
}

function showPopup() {
    showUI(popupOverlay);
    setTimeout(() => {
        // Ajoute les classes de transition ici si vous les remettez
        popupContent.style.opacity = '1';
        popupContent.style.transform = 'scale(1)';
    }, 10);
}

function hidePopup() {
    popupContent.style.opacity = '0';
    popupContent.style.transform = 'scale(0.95)';
    setTimeout(() => {
        hideUI(popupOverlay);
    }, 300);
}

// --- Mise à jour de l'UI en fonction de l'état du personnage ---
function updateUI(character) {
    if (character) {
        // Si un personnage existe
        formTitle.textContent = "Votre personnage";
        hideUI(characterForm);
        showUI(actionButtons);
        // Pré-remplir le formulaire (bien qu'il soit caché)
        charNameInput.value = character.name;
        charAgeInput.value = character.age;
        charHeightInput.value = character.height;
        charWeightInput.value = character.weight;
        charClassSelect.value = character.class;
        charNameInput.disabled = true;

    } else {
        // Si aucun personnage n'existe
        formTitle.textContent = "Création de personnage";
        hideUI(actionButtons);
        showUI(characterForm);
        charNameInput.disabled = false;
    }
    hideUI(loadingMessage);
}

// --- Gestion des événements et Initialisation ---
window.onload = function() {
    // Initialisation de Firebase
    try {
        const app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
    } catch (error) {
        console.error("Erreur lors de l'initialisation de Firebase : ", error);
        showNotification("Erreur de connexion aux serveurs de jeu.", 'error');
        return;
    }
    
    showUI(loadingMessage);

    // Écouteur de l'état d'authentification pour gérer l'initialisation
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            userId = user.uid;
            userIdDisplay.textContent = userId;
            const characterRef = doc(db, 'artifacts', appId, 'users', userId, 'characters', userId);
            
            // Écouteur en temps réel pour le document du personnage
            if (unsubscribeFromCharacterListener) {
                unsubscribeFromCharacterListener();
            }
            unsubscribeFromCharacterListener = onSnapshot(characterRef, (docSnapshot) => {
                const characterData = docSnapshot.exists() ? docSnapshot.data() : null;
                if (characterData) {
                    player = new Player(characterData);
                    initializeCharacter(player); // Appel à la fonction du module character.js
                } else {
                    player = null;
                }
                updateUI(characterData);
            }, (error) => {
                console.error("Erreur lors de l'écoute du personnage : ", error);
                showNotification("Erreur de synchronisation des données.", 'error');
                updateUI(null);
            });

        } else {
            // Si pas d'utilisateur, on essaie de s'authentifier
            try {
                if (initialAuthToken) {
                    await signInWithCustomToken(auth, initialAuthToken);
                } else {
                    await signInAnonymously(auth);
                }
            } catch (error) {
                console.error("Erreur d'authentification : ", error);
                showNotification("Erreur de connexion. Veuillez réessayer.", 'error');
                updateUI(null);
            }
        }
    });

    // Écouteur pour la soumission du formulaire
    characterForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = charNameInput.value.trim();
        if (!name) {
            showNotification("Veuillez donner un nom à votre personnage.", 'error');
            return;
        }

        const newCharacterData = {
            name: name,
            age: parseInt(charAgeInput.value),
            height: parseInt(charHeightInput.value),
            weight: parseInt(charWeightInput.value),
            class: charClassSelect.value,
            xp: 0,
            level: 1,
            quests: { current: 'lieu_sur' },
            createdAt: new Date().toISOString(),
            lastPlayed: new Date().toISOString()
        };

        savePlayer(newCharacterData);
    });

    // Écouteur pour le bouton de suppression
    deleteBtn.addEventListener('click', () => {
        showPopup();
    });

    confirmDeleteBtn.addEventListener('click', () => {
        deleteCharacter();
        hidePopup();
    });

    cancelDeleteBtn.addEventListener('click', () => {
        hidePopup();
    });
};

async function deleteCharacter() {
    if (!userId) {
        showNotification("Erreur : Utilisateur non authentifié.", 'error');
        return;
    }
    try {
        const charRef = doc(db, 'artifacts', appId, 'users', userId, 'characters', userId);
        await deleteDoc(charRef);
        showNotification("Personnage supprimé avec succès !", 'success');
        // Réinitialiser le formulaire et l'UI
        characterForm.reset();
        charNameInput.disabled = false;
        updateUI(null);
        player = null; // Réinitialiser le joueur
    } catch (error) {
        console.error("Erreur lors de la suppression du personnage : ", error);
        showNotification("Erreur lors de la suppression.", 'error');
    }
}
