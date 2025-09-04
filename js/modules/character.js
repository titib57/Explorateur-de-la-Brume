// Ce module gère la logique d'interaction avec l'état du personnage.
// La gestion de l'état elle-même est centralisée dans le module core/state.js.

// Importations des modules de l'application
import { showNotification } from '../core/notifications.js';
import { auth, db } from '../core/firebase_config.js';
import { savePlayer, deleteCharacterData, userId, authPromise } from '../core/firebase_config.js';
import { player, loadCharacter, createCharacter, updateStats, updateStatsDisplay } from './core/state.js';

/**
 * Initialise le personnage avec la quête de départ.
 */
export function initializeCharacter(player) {
    if (player) {
        // Initialise la quête de départ si le joueur n'en a pas déjà une
        if (!player.quests || !player.quests.current) {
            player.quests = {
                current: 'start_quest_01',
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
        // Réinitialiser le formulaire
        characterForm.reset();
    }
    hideUI(loadingMessage);
}

// --- Gestion des événements et Initialisation ---
// Utilisation d'une fonction asynchrone pour attendre la résolution de l'authentification
(async () => {
    showUI(loadingMessage);

    // Attendre que l'authentification soit terminée
    await authPromise;

    if (!userId) {
        console.log("Utilisateur non connecté après l'authentification.");
        updateUI(null);
        return;
    }

    userIdDisplay.textContent = userId;

    // Écouteur en temps réel pour le document du personnage
    const { onSnapshot, doc } = await import("https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js");
    const characterRef = doc(db, "artifacts", "default-app-id", "users", user.uid, "characters", user.uid);

    onSnapshot(characterRef, (docSnapshot) => {
        const characterData = docSnapshot.exists() ? docSnapshot.data() : null;
        if (characterData) {
            initializeCharacter(characterData);
        } else {
            // Pas de personnage, on réinitialise l'état
        }
        updateUI(characterData);
    }, (error) => {
        console.error("Erreur lors de l'écoute du personnage : ", error);
        showNotification("Erreur de synchronisation des données.", 'error');
        updateUI(null);
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
            quests: {
                current: 'lieu_sur'
            },
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
        deleteCharacterData();
        hidePopup();
    });

    cancelDeleteBtn.addEventListener('click', () => {
        hidePopup();
    });
})();
