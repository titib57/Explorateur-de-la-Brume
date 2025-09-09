// Fichier : js/pages/world_map.js
// Ce fichier est l'orchestrateur de la page world_map.html.

import { startAuthListener, handleSignOut } from '../core/authManager.js';
import { handleMapUIEvents, initMap, updateActionButtonsUI, updateDungeonDetailsUI } from '../worldMapEntry.js';
import { player } from '../core/state.js';

// Fonction d'initialisation de la page
document.addEventListener('DOMContentLoaded', () => {
    // Écouteur pour la déconnexion
    const logoutLink = document.getElementById('logout-link');
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            handleSignOut();
        });
    }

    // Lance l'écouteur d'authentification.
    // Il gérera le chargement du personnage et l'initialisation de la carte via
    // la fonction updateUIBasedOnPage qui se trouve dans ui.js.
    startAuthListener();

    // Initialise les événements de l'interface utilisateur de la carte.
    handleMapUIEvents();
});

// REMARQUE IMPORTANTE :
// Les fonctions `handleSetSafePlace` et `handleStartBattle` ont été déplacées
// dans le nouveau fichier `js/core/mapActions.js`.
// Ce fichier ne fait plus que l'orchestration principale de la page.