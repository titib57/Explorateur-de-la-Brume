// Fichier : js/ui/characterUI.js
// Gère toute la logique de l'interface utilisateur pour la page de gestion des personnages.

import { showNotification } from '../core/notifications.js';
import { createNewCharacterData } from '../game/character.js';
import { savePlayer, deleteCharacterData, userId, authPromise, player } from '../core/state.js';
import { getAuth } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

// --- Éléments du DOM ---
const getElement = id => document.getElementById(id);
const loadingMessage = getElement('loading-message');
const formTitle = getElement('form-title');
const actionButtons = getElement('action-buttons');
const characterForm = getElement('character-form');
const deleteBtn = getElement('delete-char-btn');
const charNameInput = getElement('char-name');
const charAgeInput = getElement('char-age');
const charHeightInput = getElement('char-height');
const charWeightInput = getElement('char-weight');
const charClassSelect = getElement('char-class');
const popupOverlay = getElement('popup-overlay');
const popupContent = getElement('popup-content');
const confirmDeleteBtn = getElement('confirm-delete');
const cancelDeleteBtn = getElement('cancel-delete');
const userIdDisplay = getElement('user-id-display');
const characterDisplay = getElement('character-display');

// Fonctions utilitaires pour l'UI
function showUI(element) {
    element.style.display = 'flex';
}

function hideUI(element) {
    element.style.display = 'none';
}

function showPopup() {
    showUI(popupOverlay);
    setTimeout(() => {
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

/**
 * Met à jour l'UI en fonction de l'état du personnage.
 * @param {object|null} character Les données du personnage ou null s'il n'existe pas.
 * @param {string} currentUserId L'ID de l'utilisateur connecté.
 */
export function updateCharacterUI(character, currentUserId) {
    if (currentUserId) {
        userIdDisplay.textContent = currentUserId;
    }
    
    if (character) {
        formTitle.textContent = "Votre personnage";
        hideUI(characterForm);
        showUI(actionButtons);
        showUI(characterDisplay);
        
        // Afficher les détails du personnage
        characterDisplay.innerHTML = `
            <h2>${character.name}</h2>
            <p>Classe : ${character.playerClass}</p>
            <p>Niveau : ${character.level}</p>
            <p>XP : ${character.xp} / ${character.xpToNextLevel}</p>
            <p>Or : ${character.gold}</p>
            <p>PV : ${character.hp} / ${character.maxHp}</p>
            <p>Mana : ${character.mana} / ${character.maxMana}</p>
            <p>Statistiques :</p>
            <ul>
                <li>Force : ${character.stats.strength}</li>
                <li>Intelligence : ${character.stats.intelligence}</li>
                <li>Vitesse : ${character.stats.speed}</li>
                <li>Dextérité : ${character.stats.dexterity}</li>
            </ul>
        `;
    } else {
        formTitle.textContent = "Création de personnage";
        hideUI(actionButtons);
        hideUI(characterDisplay);
        showUI(characterForm);
        characterForm.reset();
    }
    hideUI(loadingMessage);
}

/**
 * Attache les écouteurs d'événements à l'UI.
 */
export function setupCharacterPageEvents() {
    if (characterForm) {
        characterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = {
                name: charNameInput.value.trim(),
                age: charAgeInput.value,
                height: charHeightInput.value,
                weight: charWeightInput.value,
                class: charClassSelect.value,
            };

            if (!formData.name) {
                showNotification("Veuillez donner un nom à votre personnage.", 'error');
                return;
            }

            const newCharData = createNewCharacterData(formData);
            savePlayer(newCharData);
            showNotification("Personnage créé avec succès !", 'success');
        });
    }

    if (deleteBtn) {
        deleteBtn.addEventListener('click', showPopup);
    }

    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', async () => {
            const auth = getAuth();
            if (auth.currentUser) {
                await deleteCharacterData();
                hidePopup();
                showNotification("Votre personnage a été supprimé.", 'success');
            } else {
                showNotification("Aucun utilisateur connecté.", 'error');
                hidePopup();
            }
        });
    }

    if (cancelDeleteBtn) {
        cancelDeleteBtn.addEventListener('click', hidePopup);
    }
}

// Appel initial pour configurer l'état de l'interface utilisateur
authPromise.then(() => {
    setupCharacterPageEvents();
    updateCharacterUI(player, userId);
});