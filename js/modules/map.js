// Fichier : js/modules/map.js

import { showNotification } from '../core/notifications.js';
import { generateDungeon } from '../core/dungeon.js';
import { savePlayer, loadCharacter } from '../core/state.js';
import { initializeCharacter } from './character.js';

/**
 * Met à jour la quête actuelle du joueur.
 * @param {object} player - L'objet joueur.
 * @param {string} newQuestId - L'ID de la nouvelle quête.
 */
function updateQuest(player, newQuestId) {
    player.quests.current = newQuestId;
    savePlayer(player);
}

/**
 * Calcule la distance entre deux points géographiques en utilisant la formule de Haversine simplifiée.
 * @param {object} loc1 - Premier point avec lat et lng.
 * @param {object} loc2 - Deuxième point avec lat et lng.
 * @returns {number} La distance en mètres.
 */
function calculateDistance(loc1, loc2) {
    const R = 6371e3; // Rayon de la Terre en mètres
    const lat1 = loc1.lat * Math.PI / 180;
    const lat2 = loc2.lat * Math.PI / 180;
    const deltaLat = (loc2.lat - loc1.lat) * Math.PI / 180;
    const deltaLon = (loc2.lng - loc1.lng) * Math.PI / 180;

    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance en mètres
}

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
let mapElement;

// Éléments du DOM (déclarés au niveau global pour une meilleure lisibilité)
let fullscreenBtn;
let startBattleBtn;
let classTreeBtn;
let recenterBtn;
let setSafePlaceBtn;
let dungeonDetails;
let dungeonNameDisplay;
let dungeonDescriptionDisplay;
let dungeonDifficultyDisplay;

/**
 * Met à jour les informations du donjon sélectionné dans l'interface utilisateur.
 * @param {object} dungeon - L'objet donjon sélectionné.
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
 * Charge et affiche les donjons sur la carte en fonction de la position du joueur.
 * Gère les donjons du tutoriel et les donjons dynamiques via l'API Overpass.
 * @param {object} player - L'objet joueur.
 * @param {object} playerLatLng - La position actuelle du joueur.
 */
async function loadDungeons(player, playerLatLng) {
    if (!dungeonMarkers) {
        dungeonMarkers = L.layerGroup().addTo(map);
    }
    dungeonMarkers.clearLayers();
    selectedDungeon = null;
    dungeonDetails.style.display = 'none';

    // Affiche le donjon du tutoriel si le lieu sécurisé est défini
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

    // Si la quête du tutoriel est terminée, charge les donjons dynamiques
    const currentQuest = questsData[player.quests.current];
    const isSetSafePlaceQuest = currentQuest && currentQuest.objective.type === 'set_safe_place';
    
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

            // Ajoute les donjons basés sur des "ways" (chemins/ruines étendues)
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

            // Ajoute les donjons basés sur des "nodes" (points précis)
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
    const { latitude, longitude } = position.coords;
    const playerLatLng = L.latLng(latitude, longitude);

    if (!playerMarker) {
        // Initialise la carte et le marqueur du joueur si c'est la première fois
        playerMarker = L.marker(playerLatLng, { icon: playerIcon }).addTo(map);
        playerMarker.bindTooltip("Vous êtes ici", { permanent: true, direction: "top" });
        map.setView(playerLatLng, 15);
        loadDungeons(player, playerLatLng);
        lastKnownPosition = playerLatLng;
    } else {
        // Met à jour la position du marqueur existant
        playerMarker.setLatLng(playerLatLng);
        // Recharge les donjons si le joueur a parcouru plus de 50 mètres
        if (lastKnownPosition && calculateDistance(lastKnownPosition, playerLatLng) > 50) {
            loadDungeons(player, playerLatLng);
            lastKnownPosition = playerLatLng;
        }
    }
    updateActionButtons(player, playerLatLng);
}

/**
 * Gère l'affichage des boutons d'action en fonction de la position du joueur et du donjon sélectionné.
 * @param {object} player - L'objet joueur.
 * @param {object} playerLatLng - La position actuelle du joueur.
 */
function updateActionButtons(player, playerLatLng) {
    // Gère le bouton de bataille/d'entrée de donjon
    if (selectedDungeon && playerLatLng) {
        const distance = calculateDistance(playerLatLng, selectedDungeon.location);
        if (distance <= 50) { // 50 mètres
            startBattleBtn.style.display = 'block';
            startBattleBtn.textContent = `Entrer dans ${selectedDungeon.name}`;
            return;
        }
    }
    startBattleBtn.style.display = 'none';
}

/**
 * Fonction d'initialisation principale de la carte.
 */
function initMap() {
    // Étape 1: Chargez le personnage sauvegardé au début de la page
    const player = loadCharacter();
    if (!player) {
        showNotification("Aucun personnage trouvé. Veuillez en créer un d'abord.", 'error');
        // Redirige l'utilisateur vers la page de création si aucun personnage n'existe
        setTimeout(() => {
            window.location.href = 'character_creation.html';
        }, 3000);
        return;
    }

    // Étape 2: Initialisation des variables et des éléments de la carte
    map = L.map('map');
    mapElement = document.getElementById('map');
    fullscreenBtn = document.getElementById('toggle-fullscreen-btn');
    startBattleBtn = document.getElementById('start-battle-btn');
    classTreeBtn = document.getElementById('class-tree-btn');
    recenterBtn = document.getElementById('recenter-btn');
    setSafePlaceBtn = document.getElementById('set-safe-place-btn');
    dungeonDetails = document.getElementById('dungeon-details');
    dungeonNameDisplay = document.getElementById('dungeon-name');
    dungeonDescriptionDisplay = document.getElementById('dungeon-description');
    dungeonDifficultyDisplay = document.getElementById('dungeon-difficulty');
    
    // Vérifie si la quête "lieu_sur" est la quête actuelle du joueur
    const isLieuSurQuest = player.quests.current === 'lieu_sur';
    setSafePlaceBtn.style.display = isLieuSurQuest ? 'block' : 'none';

    // Étape 3: Ajout de la couche de tuiles OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // --- Ajoutez cette ligne pour forcer la carte à se redimensionner ---
    map.invalidateSize();

    // Si la carte ne s'affiche toujours pas, utilisez un court délai
    setTimeout(function() {
      map.invalidateSize();
    }, 100);

    // Étape 4: Gestion des événements de la carte
    window.addEventListener('resize', () => map.invalidateSize());

    if (fullscreenBtn && mapElement) {
        fullscreenBtn.addEventListener('click', () => {
            // Bascule la classe 'fullscreen' sur l'élément de la carte
            mapElement.classList.toggle('fullscreen');
            if (map) {
                map.invalidateSize();
            }
            // Met à jour le texte du bouton
            if (mapElement.classList.contains('fullscreen')) {
                fullscreenBtn.textContent = 'Quitter le plein écran';
            } else {
                fullscreenBtn.textContent = 'Plein écran';
            }
        });
    }

    recenterBtn.addEventListener('click', () => {
        if (playerMarker) {
            map.panTo(playerMarker.getLatLng());
        } else {
            showNotification("Votre position n'est pas encore connue.", "warning");
        }
    });

    setSafePlaceBtn.addEventListener('click', () => {
        if (playerMarker) {
            player.safePlaceLocation = {
                lat: playerMarker.getLatLng().lat,
                lng: playerMarker.getLatLng().lng
            };
            player.quests.current = questsData[player.quests.current].nextQuestId;
            savePlayer(player);
            location.reload();
        } else {
            showNotification("Votre position n'est pas encore disponible. Veuillez patienter.", 'warning');
        }
    });

    startBattleBtn.addEventListener('click', () => {
        if (selectedDungeon) {
            generateDungeon(selectedDungeon.isTutorial ? 'tutoriel' : { lat: selectedDungeon.location.lat, lng: selectedDungeon.location.lng });
            window.location.href = 'battle.html';
        } else {
            showNotification("Veuillez sélectionner un donjon pour y entrer.", 'warning');
        }
    });

    // Étape 5: Démarrage de la géolocalisation
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(
            (position) => updatePlayerLocation(player, position),
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

// Démarrage de l'initialisation du jeu une fois le DOM chargé
document.addEventListener('DOMContentLoaded', initMap);