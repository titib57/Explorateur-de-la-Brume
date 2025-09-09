// Fichier : js/modules/map.js
// Ce module gère l'initialisation et la logique de la carte.

import { showNotification } from '../core/notifications.js';
import { questsData } from '../core/questsData.js';
import { player } from '../core/state.js';
import { updateUIBasedOnPage } from './ui.js';
import { updateQuestProgress } from '../core/gameEngine.js';
// L'import de mapActions.js n'est plus nécessaire ici
// car le listener d'événement sera déplacé ailleurs.

// Définition des icônes personnalisées
const playerIcon = L.icon({
    iconUrl: 'assets/img/player_icon.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
});

const dungeonIcon = L.icon({
    iconUrl: 'assets/img/dungeon_icon.png',
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28]
});

let map;
let playerMarker;
let selectedDungeon = null;
let dungeonMarkers;
let lastKnownPosition = null;

// LIGNE SUPPRIMÉE : Le listener est déplacé vers le point d'entrée de la page (worldMapEntry.js).
// const startBattleButton = document.getElementById('start-battle-button');
// if (startBattleButton) {
//     startBattleButton.addEventListener('click', handleStartBattleClick);
// }

/**
 * Initialise la carte et la géolocalisation.
 * @param {object} characterData Les données du personnage.
 */
export function initMap(characterData) {
    if (map) {
        updatePlayerLocation(characterData, { coords: { latitude: playerMarker.getLatLng().lat, longitude: playerMarker.getLatLng().lng } });
        return;
    }

    map = L.map('map').setView([48.8566, 2.3522], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    map.invalidateSize();
    setTimeout(() => map.invalidateSize(), 100);

    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(
            (position) => updatePlayerLocation(characterData, position),
            (error) => {
                console.error("Erreur de géolocalisation:", error);
                showNotification("Impossible d'obtenir votre position. La carte ne pourra pas fonctionner correctement.", 'error');
                const defaultLatLng = L.latLng(48.8566, 2.3522);
                if (!playerMarker) {
                    playerMarker = L.marker(defaultLatLng, { icon: playerIcon }).addTo(map);
                    map.setView(defaultLatLng, 15);
                }
                loadDungeons(characterData, defaultLatLng);
            }, { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
    } else {
        showNotification("Votre navigateur ne supporte pas la géolocalisation.", 'warning');
        const defaultLatLng = L.latLng(48.8566, 2.3522);
        playerMarker = L.marker(defaultLatLng, { icon: playerIcon }).addTo(map);
        map.setView(defaultLatLng, 15);
        loadDungeons(characterData, defaultLatLng);
    }
}

/**
 * Centre la carte sur le marqueur du joueur.
 */
export function recenterMap() {
    if (playerMarker) {
        map.panTo(playerMarker.getLatLng());
    } else {
        showNotification("Votre position n'est pas encore connue.", "warning");
    }
}

/**
 * Met à jour la position du joueur sur la carte.
 * @param {object} characterData L'objet joueur.
 * @param {object} position L'objet de position de géolocalisation.
 */
function updatePlayerLocation(characterData, position) {
    const { latitude, longitude } = position.coords;
    const playerLatLng = L.latLng(latitude, longitude);

    if (!playerMarker) {
        playerMarker = L.marker(playerLatLng, { icon: playerIcon }).addTo(map);
        map.setView(playerLatLng, 15);
        loadDungeons(characterData, playerLatLng);
        lastKnownPosition = playerLatLng;
    } else {
        playerMarker.setLatLng(playerLatLng);
        if (lastKnownPosition && calculateDistance(lastKnownPosition, playerLatLng) > 50) {
            loadDungeons(characterData, playerLatLng);
            lastKnownPosition = playerLatLng;
        }
    }
    updateUIBasedOnPage(characterData);
}

/**
 * Calcule la distance entre deux points géographiques.
 */
function calculateDistance(loc1, loc2) {
    const R = 6371e3;
    const lat1 = loc1.lat * Math.PI / 180;
    const lat2 = loc2.lat * Math.PI / 180;
    const deltaLat = (loc2.lat - loc1.lat) * Math.PI / 180;
    const deltaLon = (loc2.lng - loc1.lng) * Math.PI / 180;

    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        Math.cos(lat1) * Math.cos(lat2) *
        Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

/**
 * Charge et affiche les donjons sur la carte.
 */
function loadDungeons(playerData, playerLatLng) {
    if (!playerData) return;
    if (!dungeonMarkers) {
        dungeonMarkers = L.layerGroup().addTo(map);
    }
    dungeonMarkers.clearLayers();
    selectedDungeon = null;

    if (playerData.quests.current && playerData.quests.current.questId === 'initial_adventure_quest' && !playerData.safePlaceLocation) {
        showNotification("Définissez un lieu sûr pour continuer la quête !", "info");
    }
    
    // Le reste du code de chargement des donjons (API Overpass)
    // ...

    // Affiche le donjon du tutoriel si le lieu sûr est défini
    if (playerData.safePlaceLocation) {
        const tutorialDungeon = {
            id: 'tutorial_dungeon_poi',
            name: 'Donjon du Tutoriel',
            location: playerData.safePlaceLocation,
            isTutorial: true,
            dungeonType: 'underground_cave',
        };
        const tutorialMarker = L.marker(tutorialDungeon.location, { icon: dungeonIcon }).addTo(dungeonMarkers);
        tutorialMarker.bindTooltip(tutorialDungeon.name, { permanent: true, direction: "top" });
        tutorialMarker.on('click', () => {
            selectedDungeon = tutorialDungeon;
            updateUIBasedOnPage(playerData);
            showNotification(`Donjon sélectionné : ${tutorialDungeon.name}. Approchez-vous pour y entrer.`, 'info');
        });
    }

    updateUIBasedOnPage(playerData);
}

/**
 * Met à jour le donjon sélectionné.
 * @param {object} dungeon Le donjon sélectionné.
 */
export function setSelectedDungeon(dungeon) {
    selectedDungeon = dungeon;
}

/**
 * Retourne le donjon actuellement sélectionné.
 * @returns {object|null} Le donjon sélectionné.
 */
export function getSelectedDungeon() {
    return selectedDungeon;
}

/**
 * Obtient la position actuelle du marqueur du joueur.
 * @returns {object|null} La position du marqueur du joueur.
 */
export function getPlayerMarkerPosition() {
    return playerMarker ? playerMarker.getLatLng() : null;
}

/**
 * Vérifie si le joueur est à portée d'un donjon.
 * @param {object} playerLatLng La position du joueur.
 * @returns {boolean} Vrai si le joueur est à portée.
 */
export function isPlayerInDungeonRange(playerLatLng) {
    if (selectedDungeon) {
        const distance = calculateDistance(playerLatLng, selectedDungeon.location);
        return distance <= 50;
    }
    return false;
}