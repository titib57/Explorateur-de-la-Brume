// Fichier: js/characterEntry.js
// Ce script agit comme le point d'entrée pour la page de création de personnage.

import { createNewCharacter, startAuthListener, deleteCharacter } from '../core/authManager.js';
import { showCreationUI } from './ui.js';

// Récupère un élément du DOM par son ID.
const getElement = id => document.getElementById(id);
const characterForm = getElement('character-form');
const charNameInput = getElement('char-name');
const charClassSelect = getElement('char-class');
const deleteBtn = getElement('delete-btn-creation-page');

/**
 * Gère la soumission du formulaire de création de personnage.
 * @param {Event} e L'événement de soumission.
 */
async function handleFormSubmit(e) {
    e.preventDefault();
    const name = charNameInput.value;
    const charClass = charClassSelect.value;
    
    // Appelle la fonction de création de personnage du module authManager
    await createNewCharacter(name, charClass);
}

/**
 * Attache les écouteurs d'événements à la page.
 */
function setupEventListeners() {
    if (characterForm) {
        characterForm.addEventListener('submit', handleFormSubmit);
    }
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
            if (confirm("Êtes-vous sûr de vouloir supprimer votre personnage ? Cette action est irréversible.")) {
                deleteCharacter();
            }
        });
    }
}

// Lancement de la logique de la page au chargement
document.addEventListener('DOMContentLoaded', () => {
    // Démarre l'écouteur d'authentification et lui indique que nous sommes sur la page "character".
    startAuthListener('character');
    // Attache les écouteurs d'événements aux boutons.
    setupEventListeners();
});