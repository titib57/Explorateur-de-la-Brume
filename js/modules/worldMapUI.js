// Fichier : js/modules/worldMapUI.js
// Ce module gère la mise à jour de l'interface utilisateur spécifique à la carte.

import { isPlayerInDungeonRange, getSelectedDungeon, getPlayerMarkerPosition, recenterMap } from './map.js';
import { handleSetSafePlaceClick, handleStartBattleClick } from '../core/mapActions.js';

// Récupération des éléments du DOM spécifiques à la carte
const getElement = id => document.getElementById(id);

const dungeonDetails = getElement('dungeon-details');
const dungeonNameDisplay = getElement('dungeon-name');
const dungeonDescriptionDisplay = getElement('dungeon-description');
const dungeonDifficultyDisplay = getElement('dungeon-difficulty');
const startBattleBtn = getElement('start-battle-btn');
const setSafePlaceBtn = getElement('set-safe-place-btn');
const toggleFullscreenBtn = getElement('toggle-fullscreen-btn');
const recenterBtn = getElement('recenter-btn');
const mapElement = getElement('map');

/**
 * Met à jour l'affichage des détails du donjon sélectionné.
 * @param {object|null} dungeon Les données du donjon.
 */
export function updateDungeonDetailsUI(dungeon) {
    if (dungeon) {
        dungeonNameDisplay.textContent = dungeon.name;
        dungeonDescriptionDisplay.textContent = dungeon.isTutorial ?
            'Un lieu sûr pour apprendre les bases du combat.' :
            'Un donjon généré dynamiquement. Préparez-vous au combat !';
        dungeonDifficultyDisplay.textContent = dungeon.difficulty || '1';
        dungeonDetails.style.display = 'block';
    } else {
        dungeonDetails.style.display = 'none';
    }
}

/**
 * Met à jour l'état des boutons d'action sur la carte du monde.
 * @param {object} character Les données du personnage.
 */
export function updateActionButtonsUI(character) {
    if (!character) return;
    
    const selectedDungeon = getSelectedDungeon();
    const playerPosition = getPlayerMarkerPosition();

    // Gestion du bouton "Définir le lieu sûr"
    const isDefineShelterQuest = character.quests.current && character.quests.current.questId === 'initial_adventure_quest' && !character.safePlaceLocation;
    if (isDefineShelterQuest) {
        if (setSafePlaceBtn) setSafePlaceBtn.classList.remove('hidden');
    } else {
        if (setSafePlaceBtn) setSafePlaceBtn.classList.add('hidden');
    }

    // Gestion du bouton "Entrer dans le donjon"
    if (selectedDungeon && playerPosition && isPlayerInDungeonRange(playerPosition)) {
        if (startBattleBtn) {
            startBattleBtn.style.display = 'block';
            startBattleBtn.textContent = `Entrer dans ${selectedDungeon.name}`;
        }
    } else {
        if (startBattleBtn) startBattleBtn.style.display = 'none';
    }
}

/**
 * Gère les événements de l'UI pour la page de la carte.
 */
export function handleMapUIEvents() {
    if (toggleFullscreenBtn) {
        toggleFullscreenBtn.addEventListener('click', () => {
            mapElement.classList.toggle('fullscreen');
            toggleFullscreenBtn.textContent = mapElement.classList.contains('fullscreen') ? 'Quitter le plein écran' : 'Plein écran';
            if (mapElement) {
                mapElement.requestFullscreen();
            }
        });
    }

    if (recenterBtn) {
        recenterBtn.addEventListener('click', recenterMap);
    }
    
    if (startBattleBtn) {
        startBattleBtn.addEventListener('click', handleStartBattleClick);
    }
    
    if (setSafePlaceBtn) {
        setSafePlaceBtn.addEventListener('click', handleSetSafePlaceClick);
    }
}