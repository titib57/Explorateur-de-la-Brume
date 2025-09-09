// Fichier : js/gestion_personnage.js
// Ce fichier est le point d'entrée pour la page de gestion du personnage.

import { startAuthListener, deleteCharacter, handleSignOut } from './authManager.js';
import { updateUIBasedOnPage } from '../modules/ui.js';
import { player } from './state.js';

// Récupération des éléments du DOM
const getElement = id => document.getElementById(id);
const playBtn = getElement('play-btn');
const deleteBtn = getElement('delete-btn');
const logoutLink = getElement('logout-link');

/**
 * Gère le clic sur le bouton "Jouer".
 */
function handlePlayClick() {
    if (player && player.name) {
        window.location.href = "world_map.html";
    } else {
        console.error("Impossible de démarrer, le personnage n'est pas chargé.");
    }
}

/**
 * Attache les écouteurs d'événements aux boutons.
 */
function setupEventListeners() {
    if (playBtn) {
        playBtn.addEventListener('click', handlePlayClick);
    }
    
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
            if (confirm("Êtes-vous sûr de vouloir supprimer votre personnage ? Cette action est irréversible.")) {
                deleteCharacter();
            }
        });
    }

    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            handleSignOut();
        });
    }
}

// Lancer la logique de la page au chargement
document.addEventListener('DOMContentLoaded', () => {
    // Démarre l'écouteur d'authentification.
    // Il appellera updateUIBasedOnPage(player) une fois le personnage chargé.
    startAuthListener();
    
    // Met en place les écouteurs d'événements
    setupEventListeners();
});