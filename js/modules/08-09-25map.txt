import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { showNotification } from '../core/notifications.js';
import { generateDungeon } from '../core/dungeon.js';
import { savePlayer, userId } from '../core/state.js';
import { isSetSafePlaceQuest, updateQuestProgress } from './quests.js';
import { auth, db } from '../core/firebase_config.js';
import { doc, onSnapshot } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


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
let player; // Déclaration de la variable player ici

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
 * @param {object} characterData - L'objet joueur.
 */
async function initMap(characterData) {
    if (map) return;

    // Mise à jour de la variable globale player
    player = characterData;

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

    // Gestion du bouton "Lieu sûr"
    if (setSafePlaceBtn) {
        setSafePlaceBtn.addEventListener('click', async () => {
            // Vérifiez si le marqueur du joueur existe avant d'accéder à ses propriétés
            if (playerMarker) {
                // 1. Mettre à jour l'objet player local
                player.safePlaceLocation = {
                    lat: playerMarker.getLatLng().lat,
                    lng: playerMarker.getLatLng().lng
                };

                try {
                    // 2. Appeler la fonction de sauvegarde de l'abri
                    await savePlayer(player);
                    
                    // 3. Mettre à jour la progression de la quête après la sauvegarde
                    // Utilisez l'ID du joueur pour la mise à jour de la quête
                    await updateQuestProgress(player, userId, 'define_shelter');

                    // 4. Mettre à jour l'UI après la sauvegarde réussie
                    setSafePlaceBtn.style.display = 'none';
                    showNotification("Votre lieu sûr a été défini et sauvegardé !", "success");
                    loadDungeons(player, playerMarker.getLatLng());
                } catch (error) {
                    console.error("Erreur lors de la sauvegarde du lieu sûr :", error);
                    showNotification("Erreur lors de la sauvegarde du lieu sûr. Veuillez réessayer.", "error");
                }
            } else {
                // Si le marqueur n'existe pas, informez l'utilisateur
                showNotification("Veuillez attendre que votre position soit détectée pour définir le lieu sûr.", "warning");
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

    // Affiche le bouton si la quête "Lieu sûr" est active et que le lieu n'a pas été défini
    if (isSetSafePlaceQuest(player) && !player.safePlaceLocation) {
        setSafePlaceBtn.style.display = 'block';
        showNotification("Définissez un lieu sûr pour continuer la quête !", "info");
    } else {
        setSafePlaceBtn.style.display = 'none';
    }


    if (player.safePlaceLocation) {
        const tutorialDungeon = {
            id: 'tutorial_dungeon_poi',
            name: 'Donjon du Tutoriel',
            location: player.safePlaceLocation,
            dungeonType: 'tutoriel',
            difficulty: 0,
            questId: 'initial_adventure_quest',
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

    // Le reste du code de chargement des donjons
    if (!isSetSafePlaceQuest(player) && player.safePlaceLocation) {
        const searchRadiusInMeters = 500; // Rayon de recherche en mètres
        const overpassQuery = `
[out:json][timeout:25];
(
    // Lieux historiques
    node["historic"="castle"](around:${searchRadiusInMeters}, ${playerLatLng.lat}, ${playerLatLng.lng});
    way["historic"="castle"](around:${searchRadiusInMeters}, ${playerLatLng.lat}, ${playerLatLng.lng});
    node["historic"="ruins"](around:${searchRadiusInMeters}, ${playerLatLng.lat}, ${playerLatLng.lng});
    way["historic"="ruins"](around:${searchRadiusInMeters}, ${playerLatLng.lat}, ${playerLatLng.lng});
    node["historic"="monument"](around:${searchRadiusInMeters}, ${playerLatLng.lat}, ${playerLatLng.lng});
    way["historic"="monument"](around:${searchRadiusInMeters}, ${playerLatLng.lat}, ${playerLatLng.lng});
    node["historic"="wayside_shrine"](around:${searchRadiusInMeters}, ${playerLatLng.lat}, ${playerLatLng.lng});
    way["historic"="wayside_shrine"](around:${searchRadiusInMeters}, ${playerLatLng.lat}, ${playerLatLng.lng});

    // Lieux de culte
    node["building"="church"](around:${searchRadiusInMeters}, ${playerLatLng.lat}, ${playerLatLng.lng});
    way["building"="church"](around:${searchRadiusInMeters}, ${playerLatLng.lat}, ${playerLatLng.lng});
    node["amenity"="place_of_worship"](around:${searchRadiusInMeters}, ${playerLatLng.lat}, ${playerLatLng.lng});
    way["amenity"="place_of_worship"](around:${searchRadiusInMeters}, ${playerLatLng.lat}, ${playerLatLng.lng});

    // Autres structures
    node["landuse"="cemetery"](around:${searchRadiusInMeters}, ${playerLatLng.lat}, ${playerLatLng.lng});
    way["landuse"="cemetery"](around:${searchRadiusInMeters}, ${playerLatLng.lat}, ${playerLatLng.lng});
    node["tower:type"="bell_tower"](around:${searchRadiusInMeters}, ${playerLatLng.lat}, ${playerLatLng.lng});
    way["tower:type"="bell_tower"](around:${searchRadiusInMeters}, ${playerLatLng.lat}, ${playerLatLng.lng});
    node["building"="tower"](around:${searchRadiusInMeters}, ${playerLatLng.lat}, ${playerLatLng.lng});
    way["building"="tower"](around:${searchRadiusInMeters}, ${playerLatLng.lat}, ${playerLatLng.lng});
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

    // Masque le bouton de lieu sûr si la quête n'est pas active ou si le lieu est déjà défini
    if (isSetSafePlaceQuest(player) && !player.safePlaceLocation) {
        setSafePlaceBtn.style.display = 'block';
    } else {
        setSafePlaceBtn.style.display = 'none';
    }

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
onAuthStateChanged(auth, (user) => {
    if (user) {
        const characterId = user.uid;
        const characterRef = doc(db, "artifacts", "default-app-id", "users", characterId, "characters", characterId);

        onSnapshot(characterRef, (docSnapshot) => {
            const characterData = docSnapshot.exists() ? docSnapshot.data() : null;
            if (characterData) {
                initMap(characterData);
                // Si la carte est déjà initialisée, mettez à jour la position du joueur
                // et les boutons d'action pour refléter les nouvelles données
                if (playerMarker) {
                    updatePlayerLocation(characterData, { coords: { latitude: playerMarker.getLatLng().lat, longitude: playerMarker.getLatLng().lng } });
                }
            } else {
                console.error("Aucun document de personnage trouvé. Redirection vers la création de personnage.");
                window.location.href = "character.html";
            }
        }, (error) => {
            console.error("Erreur lors de l'écoute du personnage : ", error);
            showNotification("Erreur de synchronisation des données.", 'error');
        });
    } else {
        console.log("Utilisateur non connecté. Redirection...");
        window.location.href = "login.html";
    }
});