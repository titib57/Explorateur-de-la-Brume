// Fichier : js/worldMapEntry.js
// Ce module est le point d'entrée pour la page de la carte du monde.

import { initMap } from "./map.js";
import { updateUIBasedOnPage, updateJournalDisplay } from "./ui.js";
import { updateDungeonDetailsUI, updateActionButtonsUI, handleMapUIEvents } from "./worldMapUI.js";
import { player } from "../core/state.js";

// Fonction d'initialisation de la page de la carte
document.addEventListener('DOMContentLoaded', () => {
    // Appelle la fonction de la nouvelle UI pour les événements de la carte
    handleMapUIEvents();
});

// Fonction centrale pour l'UI de la carte, appelée par le `gameEngine`
export function updateMapUI(character) {
    if (character) {
        initMap(character);
        updateJournalDisplay(character);
        updateActionButtonsUI(character);
        updateDungeonDetailsUI(getSelectedDungeon());
    } else {
        window.location.href = 'character.html';
    }
}