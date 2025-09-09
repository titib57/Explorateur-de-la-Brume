// Fichier : js/gestion_personnage.js
// Ce script agit comme le point d'entrée pour la page de gestion du personnage.

import { startAuthListener, deleteCharacter, handleSignOut } from './authManager.js';
import { player } from './state.js';

/**
 * Récupère un élément du DOM par son ID.
 * @param {string} id L'ID de l'élément.
 * @returns {HTMLElement} L'élément du DOM.
 */
const getElement = id => document.getElementById(id);
const playBtn = getElement('play-btn');
const deleteBtn = getElement('delete-btn');
const logoutLink = getElement('logout-link');

/**
 * Gère le clic sur le bouton "Jouer".
 * Redirige le joueur vers la carte du monde si un personnage est chargé.
 */
function handlePlayClick() {
    if (player && player.name) {
        window.location.href = "world_map.html";
    } else {
        console.error("Impossible de démarrer, le personnage n'est pas chargé.");
    }
}

/**
 * Attache tous les écouteurs d'événements nécessaires aux boutons de la page.
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

// Lancer la logique de la page une fois le DOM chargé
document.addEventListener('DOMContentLoaded', () => {
    // Démarre l'écouteur d'authentification de Firebase.
    // Cette fonction gère la vérification de la connexion et le chargement des données.
    startAuthListener('gestion_personnage');
    
    // Attache les écouteurs d'événements aux boutons.
    setupEventListeners();
});