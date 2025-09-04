// Fichier : js/modules/map.js


import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { showNotification } from '../core/notifications.js';
import { generateDungeon } from '../core/dungeon.js';
import { savePlayer, loadCharacter } from '../core/state.js';
import { isSetSafePlaceQuest, updateQuestProgress } from './quests.js';
import { auth } from '../core/firebase_config.js';

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

// Variables globales pour la carte et les éléments du jeu
let map;
let playerMarker;
let selectedDungeon = null;
let dungeonMarkers;
let lastKnownPosition = null;
let player = null; // Initialisation à null
let mapElement;

// Éléments du DOM
let fullscreenBtn;
let startBattleBtn;
let recenterBtn;
let setSafePlaceBtn;
let dungeonDetails;
let dungeonNameDisplay;
let dungeonDescriptionDisplay;
let dungeonDifficultyDisplay;

/**
 * Initialise la carte du monde et la logique de géolocalisation.
 * Cette fonction est appelée une fois que les données du joueur sont chargées.
 * @param {object} player - L'objet joueur.
 */
async function initMap(player) {
    if (map) return;

    // Initialisation des éléments du DOM
    mapElement = document.getElementById('map');
    fullscreenBtn = document.getElementById('toggle-fullscreen-btn');
    startBattleBtn = document.getElementById('start-battle-btn');
    recenterBtn = document.getElementById('recenter-btn');
    setSafePlaceBtn = document.getElementById('set-safe-place-btn');
    dungeonDetails = document.getElementById('dungeon-details');
    dungeonNameDisplay = document.getElementById('dungeon-name');
    dungeonDescriptionDisplay = document.getElementById('dungeon-description');
    dungeonDifficultyDisplay = document.getElementById('dungeon-difficulty');

    // Création de la carte et ajout de la couche de tuiles OpenStreetMap
    map = L.map('map').setView([48.8566, 2.3522], 13); // Position par défaut pour Paris

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Force la carte à se redimensionner
    map.invalidateSize();
    setTimeout(() => map.invalidateSize(), 100);

    // Gestion des événements de la carte et des boutons
    window.addEventListener('resize', () => map.invalidateSize());

    if (fullscreenBtn && mapElement) {
        fullscreenBtn.addEventListener('click', () => {
            mapElement.classList.toggle('fullscreen');
            if (map) {
                map.invalidateSize();
            }
            fullscreenBtn.textContent = mapElement.classList.contains('fullscreen') ? 'Quitter le plein écran' : 'Plein écran';
        });
    }

    if (recenterBtn) {
        recenterBtn.addEventListener('click', () => {
            if (playerMarker) {
                map.panTo(playerMarker.getLatLng());
            } else {
                showNotification("Votre position n'est pas encore connue.", "warning");
            }
        });
    }

    if (startBattleBtn) {
        startBattleBtn.addEventListener('click', () => {
            if (selectedDungeon) {
                generateDungeon(selectedDungeon.isTutorial ? 'tutoriel' : { lat: selectedDungeon.location.lat, lng: selectedDungeon.location.lng });
                window.location.href = 'battle.html';
            } else {
                showNotification("Veuillez sélectionner un donjon pour y entrer.", 'warning');
            }
        });
    }

    // Démarrage de la géolocalisation
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(
            (position) => {
                updatePlayerLocation(player, position);
            },
            (error) => {
                console.error("Erreur de géolocalisation :", error);
                showNotification("Impossible d'obtenir votre position. La carte ne pourra pas fonctionner correctement.", 'error');
                const defaultLatLng = L.latLng(48.8566, 2.3522);
                if (!playerMarker) {
                    playerMarker = L.marker(defaultLatLng, { icon: playerIcon }).addTo(map);
                    playerMarker.bindTooltip("Position par défaut", { permanent: true, direction: "top" });
                    map.setView(defaultLatLng, 15);
                    loadDungeons(player, defaultLatLng);
                }
            }, {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0,
            }
        );
    } else {
        showNotification("Votre navigateur ne supporte pas la géolocalisation.", 'warning');
        const defaultLatLng = L.latLng(48.8566, 2.3522);
        playerMarker = L.marker(defaultLatLng, { icon: playerIcon }).addTo(map);
        playerMarker.bindTooltip("Position par défaut", { permanent: true, direction: "top" });
        map.setView(defaultLatLng, 15);
        loadDungeons(player, defaultLatLng);
    }
}

/**
 * Met à jour la quête actuelle du joueur.
 */
function updateQuest(player, newQuestId) {
    if (!player) return;
    player.quests.current = newQuestId;
    savePlayer(player);
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
 * Met à jour les informations du donjon sélectionné.
 */
function updateDungeonDetails(dungeon) {
    selectedDungeon = dungeon;
    dungeonNameDisplay.textContent = dungeon.name;
    dungeonDescriptionDisplay.textContent = dungeon.isTutorial ?
        'Un lieu sûr pour apprendre les bases du combat. Vainquez le mannequin d\'entraînement !' :
        'Un donjon généré dynamiquement. Préparez-vous au combat !';
    dungeonDifficultyDisplay.textContent = dungeon.difficulty || '1';
    dungeonDetails.style.display = 'block';
}

/**
 * Charge et affiche les donjons sur la carte.
 */
async function loadDungeons(player, playerLatLng) {
    if (!player) return;
    if (!dungeonMarkers) {
        dungeonMarkers = L.layerGroup().addTo(map);
    }
    dungeonMarkers.clearLayers();
    selectedDungeon = null;
    dungeonDetails.style.display = 'none';

    if (player.safePlaceLocation) {
        const tutorialDungeon = {
            id: 'tutorial_dungeon_poi',
            name: 'Donjon du Tutoriel',
            location: player.safePlaceLocation,
            dungeonType: 'tutoriel',
            difficulty: 0,
            questId: 'lieu_sur',
            isTutorial: true,
        };
        const tutorialLatLng = L.latLng(tutorialDungeon.location.lat, tutorialDungeon.location.lng);
        const tutorialMarker = L.marker(tutorialLatLng, { icon: dungeonIcon }).addTo(dungeonMarkers);
        tutorialMarker.bindTooltip(tutorialDungeon.name, { permanent: true, direction: "top" });

        tutorialMarker.on('click', () => {
            updateDungeonDetails(tutorialDungeon);
            showNotification(`Donjon sélectionné : ${tutorialDungeon.name}. Approchez-vous pour y entrer.`, 'info');
            updateActionButtons(player, playerLatLng);
        });
    }

    if (!isSetSafePlaceQuest && player.safePlaceLocation) {
        const searchRadius = 0.2;
        const overpassQuery = `
[out:json][timeout:25];
(
    node["building"="castle"](${playerLatLng.lat - searchRadius},${playerLatLng.lng - searchRadius},${playerLatLng.lat + searchRadius},${playerLatLng.lng + searchRadius});
    way["building"="castle"](${playerLatLng.lat - searchRadius},${playerLatLng.lng - searchRadius},${playerLatLng.lat + searchRadius},${playerLatLng.lng + searchRadius});
    node["historic"="ruins"](${playerLatLng.lat - searchRadius},${playerLatLng.lng - searchRadius},${playerLatLng.lat + searchRadius},${playerLatLng.lng + searchRadius});
    way["historic"="ruins"](${playerLatLng.lat - searchRadius},${playerLatLng.lng - searchRadius},${playerLatLng.lat + searchRadius},${playerLatLng.lng + searchRadius});
    node["landuse"="cemetery"](${playerLatLng.lat - searchRadius},${playerLatLng.lng - searchRadius},${playerLatLng.lat + searchRadius},${playerLatLng.lng + searchRadius});
    way["landuse"="cemetery"](${playerLatLng.lat - searchRadius},${playerLatLng.lng - searchRadius},${playerLatLng.lat + searchRadius},${playerLatLng.lng + searchRadius});
    node["historic"="monument"](${playerLatLng.lat - searchRadius},${playerLatLng.lng - searchRadius},${playerLatLng.lat + searchRadius},${playerLatLng.lng + searchRadius});
    way["historic"="monument"](${playerLatLng.lat - searchRadius},${playerLatLng.lng - searchRadius},${playerLatLng.lat + searchRadius},${playerLatLng.lng + searchRadius});
    node["tower:type"="bell_tower"](${playerLatLng.lat - searchRadius},${playerLatLng.lng - searchRadius},${playerLatLng.lat + searchRadius},${playerLatLng.lng + searchRadius});
    way["tower:type"="bell_tower"](${playerLatLng.lat - searchRadius},${playerLatLng.lng - searchRadius},${playerLatLng.lat + searchRadius},${playerLatLng.lng + searchRadius});
);
out body;
>;
out skel qt;
`;
        const apiUrl = "https://overpass-api.de/api/interpreter";

        try {
            const response = await fetch(apiUrl, { method: 'POST', body: overpassQuery });
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            const data = await response.json();

            const wayNodes = new Set();
            const ways = data.elements.filter(el => el.type === 'way');
            const nodes = data.elements.filter(el => el.type === 'node');

            ways.forEach(way => {
                if (way.nodes) {
                    way.nodes.forEach(nodeId => wayNodes.add(nodeId));
                }
            });

            const displayedIds = new Set();

            ways.forEach(element => {
                if (element.bounds && !displayedIds.has(element.id)) {
                    const center = L.latLngBounds(element.bounds.minlat, element.bounds.minlon, element.bounds.maxlat, element.bounds.maxlon).getCenter();
                    const dungeonName = element.tags?.name || "Donjon";
                    displayedIds.add(element.id);

                    const dungeon = {
                        name: dungeonName,
                        location: { lat: center.lat, lng: center.lng },
                        isTutorial: false,
                        id: 'dynamic_dungeon_' + element.id
                    };
                    const dungeonMarker = L.marker(center, { icon: dungeonIcon }).addTo(dungeonMarkers);
                    dungeonMarker.bindTooltip(dungeonName, { permanent: true, direction: "top" });
                    dungeonMarker.on('click', () => {
                        updateDungeonDetails(dungeon);
                        showNotification(`Donjon sélectionné : ${dungeonName}. Approchez-vous pour y entrer.`, 'info');
                        updateActionButtons(player, playerLatLng);
                    });
                }
            });

            nodes.forEach(element => {
                if (!wayNodes.has(element.id) && !displayedIds.has(element.id)) {
                    const dungeonLatLng = L.latLng(element.lat, element.lon);
                    const dungeonName = element.tags?.name || "Donjon";
                    displayedIds.add(element.id);

                    const dungeon = {
                        name: dungeonName,
                        location: { lat: dungeonLatLng.lat, lng: dungeonLatLng.lng },
                        isTutorial: false,
                        id: 'dynamic_dungeon_' + element.id
                    };
                    const dungeonMarker = L.marker(dungeonLatLng, { icon: dungeonIcon }).addTo(dungeonMarkers);
                    dungeonMarker.bindTooltip(dungeonName, { permanent: true, direction: "top" });
                    dungeonMarker.on('click', () => {
                        updateDungeonDetails(dungeon);
                        showNotification(`Donjon sélectionné : ${dungeonName}. Approchez-vous pour y entrer.`, 'info');
                        updateActionButtons(player, playerLatLng);
                    });
                }
            });
            showNotification(`Chargement de ${displayedIds.size} donjons dynamiques.`, 'success');
        } catch (error) {
            console.error("Erreur lors de la récupération des données Overpass :", error);
            showNotification("Impossible de charger les donjons dynamiques.", 'error');
        }
    }
    updateActionButtons(player, playerLatLng);
}

/**
 * Met à jour la position du joueur sur la carte.
 * @param {object} player - L'objet joueur.
 * @param {object} position - L'objet de position de géolocalisation.
 */
function updatePlayerLocation(player, position) {
    if (!player) return;
    const { latitude, longitude } = position.coords;
    const playerLatLng = L.latLng(latitude, longitude);

    if (!playerMarker) {
        playerMarker = L.marker(playerLatLng, { icon: playerIcon }).addTo(map);
        playerMarker.bindTooltip("Vous êtes ici", { permanent: true, direction: "top" });
        map.setView(playerLatLng, 15);
        loadDungeons(player, playerLatLng);
        lastKnownPosition = playerLatLng;
    } else {
        playerMarker.setLatLng(playerLatLng);
        if (lastKnownPosition && calculateDistance(lastKnownPosition, playerLatLng) > 50) {
            loadDungeons(player, playerLatLng);
            lastKnownPosition = playerLatLng;
        }
    }
    updateActionButtons(player, playerLatLng);
}

/**
 * Gère l'affichage des boutons d'action.
 * @param {object} player - L'objet joueur.
 * @param {object} playerLatLng - La position actuelle du joueur.
 */
function updateActionButtons(player, playerLatLng) {
    if (!player) return;
    if (selectedDungeon && playerLatLng) {
        const distance = calculateDistance(playerLatLng, selectedDungeon.location);
        if (distance <= 50) {
            startBattleBtn.style.display = 'block';
            startBattleBtn.textContent = `Entrer dans ${selectedDungeon.name}`;
            return;
        }
    }
    startBattleBtn.style.display = 'none';
}

// Point d'entrée de l'application : l'écouteur d'authentification
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const characterData = await loadCharacter(user);
        if (characterData) {
            player = characterData;
            console.log("Données du personnage chargées ! Initialisation de la carte...");
            initMap(player);
        } else {
            console.error("Impossible de charger les données du personnage. Redirection vers la création de personnage.");
            window.location.href = "character_creation.html";
        }
    } else {
        console.log("Utilisateur non connecté. Redirection...");
        window.location.href = "login.html";
    }
});