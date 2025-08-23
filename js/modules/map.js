import { checkCharacter } from './core/utils.js';
import { showNotification } from './core/notifications.js';
import { generateDungeon } from './core/dungeon.js';
import { pointsOfInterest, questsData } from './core/gameData.js';
import { player } from './core/state.js';

// Fonction pour calculer la distance entre deux points géographiques (formule de Haversine simplifiée)
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

document.addEventListener('DOMContentLoaded', () => {
    // Étape 1: Vérifie si un personnage existe, sinon redirige
    if (!checkCharacter()) {
        return;
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

    // Étape 2: Initialisation des variables et des éléments de la carte
    const map = L.map('map');
    let playerMarker;
    let selectedDungeon = null;
    const mapElement = document.getElementById('map');
    const fullscreenBtn = document.getElementById('toggle-fullscreen-btn');
    const startBattleBtn = document.getElementById('start-battle-btn');
    const classTreeBtn = document.getElementById('class-tree-btn');
    const tutorialQuestId = questsData['premiers_pas'].id;
    let dungeonMarkers = L.layerGroup().addTo(map);

    // Étape 3: Ajout de la couche de tuiles OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Étape 4: Gestion des événements de la carte
    window.addEventListener('resize', () => {
        map.invalidateSize();
    });

    fullscreenBtn.addEventListener('click', () => {
        if (!mapElement.classList.contains('fullscreen')) {
            mapElement.classList.add('fullscreen');
            fullscreenBtn.textContent = 'Quitter le plein écran';
        } else {
            mapElement.classList.remove('fullscreen');
            fullscreenBtn.textContent = 'Plein écran';
        }
        setTimeout(() => {
            map.invalidateSize();
        }, 300);
    });

    // Étape 5: Chargement et affichage des donjons sur la carte
    function loadDungeons(playerLatLng) {
        dungeonMarkers.clearLayers();
        const firstQuest = player.quests && player.quests[tutorialQuestId] ? player.quests[tutorialQuestId] : null;
        
        // Afficher le donjon du tutoriel si la quête n'est pas terminée
        if (player.playerClass === 'explorateur' && (!firstQuest || firstQuest.objective.current < firstQuest.objective.required)) {
            const tutorialPOI = pointsOfInterest['tutorial_dungeon_poi'];
            if (tutorialPOI) {
                const tutorialLatLng = L.latLng(tutorialPOI.location.lat, tutorialPOI.location.lng);
                const tutorialMarker = L.marker(tutorialLatLng, { icon: dungeonIcon }).addTo(dungeonMarkers);
                tutorialMarker.bindTooltip(tutorialPOI.name, { permanent: true, direction: "top" });

                tutorialMarker.on('click', () => {
                    selectedDungeon = {
                        name: tutorialPOI.name,
                        location: { lat: tutorialLatLng.lat, lng: tutorialLatLng.lng },
                        marker: tutorialMarker,
                        isTutorial: true,
                        id: tutorialPOI.id
                    };
                    showNotification(`Donjon sélectionné : ${tutorialPOI.name}. Approchez-vous pour y entrer.`, 'info');
                    updateActionButtons();
                });
                updateActionButtons(playerLatLng);
            }
        } else {
            // Logique pour charger les donjons dynamiques si la quête du tutoriel est terminée
            const searchRadius = 0.1;
            const overpassQuery = `
[out:json][timeout:25];
(
    node["historic"="castle"](${playerLatLng.lat - searchRadius},${playerLatLng.lng - searchRadius},${playerLatLng.lat + searchRadius},${playerLatLng.lng + searchRadius});
    way["historic"="castle"](${playerLatLng.lat - searchRadius},${playerLatLng.lng - searchRadius},${playerLatLng.lat + searchRadius},${playerLatLng.lng + searchRadius});
    node["historic"="ruins"](${playerLatLng.lat - searchRadius},${playerLatLng.lng - searchRadius},${playerLatLng.lat + searchRadius},${playerLatLng.lng + searchRadius});
    way["historic"="ruins"](${playerLatLng.lat - searchRadius},${playerLatLng.lng - searchRadius},${playerLatLng.lat + searchRadius},${playerLatLng.lng + searchRadius});
);
out body;
>;
out skel qt;
`;
            const apiUrl = "https://overpass-api.de/api/interpreter";

            fetch(apiUrl, {
                method: 'POST',
                body: overpassQuery
            })
            .then(response => response.json())
            .then(data => {
                data.elements.forEach(element => {
                    let dungeonLatLng;
                    let dungeonName;
                    if (element.type === 'node') {
                        dungeonLatLng = L.latLng(element.lat, element.lon);
                        dungeonName = element.tags.name || "Donjon";
                    } else if (element.type === 'way') {
                        const center = L.latLngBounds(element.bounds.minlat, element.bounds.minlon, element.bounds.maxlat, element.bounds.maxlon).getCenter();
                        dungeonLatLng = center;
                        dungeonName = element.tags.name || "Donjon";
                    }
                    if (dungeonLatLng) {
                        const dungeonMarker = L.marker(dungeonLatLng, { icon: dungeonIcon }).addTo(dungeonMarkers);
                        dungeonMarker.bindTooltip(dungeonName, { permanent: true, direction: "top" });
                        dungeonMarker.on('click', () => {
                            selectedDungeon = {
                                name: dungeonName,
                                location: { lat: dungeonLatLng.lat, lng: dungeonLatLng.lng },
                                marker: dungeonMarker,
                                isTutorial: false,
                                id: 'dynamic_dungeon_' + dungeonLatLng.lat.toString().replace('.', '') + dungeonLatLng.lng.toString().replace('.', '')
                            };
                            showNotification(`Donjon sélectionné : ${dungeonName}. Approchez-vous pour y entrer.`, 'info');
                            updateActionButtons();
                        });
                    }
                });
                showNotification(`Chargement de ${data.elements.length} donjons dynamiques.`, 'success');
                updateActionButtons(playerLatLng);
            })
            .catch(error => {
                console.error("Erreur lors de la récupération des données Overpass :", error);
                showNotification("Impossible de charger les donjons dynamiques.", 'error');
                updateActionButtons(playerLatLng);
            });
        }
    }

    // Étape 6: Mise à jour de la position du joueur et des boutons d'action
    function updatePlayerLocation(position) {
        const { latitude, longitude } = position.coords;
        const playerLatLng = L.latLng(latitude, longitude);

        if (!playerMarker) {
            playerMarker = L.marker(playerLatLng, { icon: playerIcon }).addTo(map);
            playerMarker.bindTooltip("Vous êtes ici", { permanent: true, direction: "top" });
            map.setView(playerLatLng, 15);
            loadDungeons(playerLatLng);
        } else {
            playerMarker.setLatLng(playerLatLng);
            map.panTo(playerLatLng);
        }

        updateActionButtons(playerLatLng);
    }

    // Étape 7: Gestion de l'affichage des boutons d'action
    function updateActionButtons(playerLatLng = playerMarker ? playerMarker.getLatLng() : null) {
        if (!playerLatLng) return;

        const firstQuest = player.quests && player.quests[tutorialQuestId] ? player.quests[tutorialQuestId] : null;
        const isTutorialActive = player.playerClass === 'explorateur' && (!firstQuest || firstQuest.objective.current < firstQuest.objective.required);
        
        startBattleBtn.style.display = 'none';

        if (isTutorialActive) {
            const tutorialPOI = pointsOfInterest['tutorial_dungeon_poi'];
            const distance = calculateDistance(playerLatLng, tutorialPOI.location);
            if (distance <= 50) { // 50 mètres
                startBattleBtn.style.display = 'block';
                startBattleBtn.textContent = `Entrer dans ${tutorialPOI.name}`;
                selectedDungeon = {
                    name: tutorialPOI.name,
                    location: tutorialPOI.location,
                    isTutorial: true,
                    id: tutorialPOI.id
                };
            }
        } else if (selectedDungeon) {
            const distance = calculateDistance(playerLatLng, selectedDungeon.location);
            if (distance <= 50) { // 50 mètres
                startBattleBtn.style.display = 'block';
                startBattleBtn.textContent = `Entrer dans ${selectedDungeon.name}`;
            } else {
                selectedDungeon = null;
                showNotification(`Approchez-vous d'un donjon pour y entrer.`, 'warning');
            }
        }
        
        // Affichage du bouton d'arbre de classes
        if (player && player.level >= 5 && player.playerClass === 'explorateur') {
            classTreeBtn.style.display = 'block';
        } else {
            classTreeBtn.style.display = 'none';
        }
    }

    // Étape 8: Démarrage de la géolocalisation
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(
            updatePlayerLocation,
            (error) => {
                console.error("Erreur de géolocalisation :", error);
                showNotification("Impossible d'obtenir votre position. La carte ne pourra pas fonctionner correctement.", 'error');
                const defaultLatLng = L.latLng(48.8566, 2.3522);
                if (!playerMarker) {
                    playerMarker = L.marker(defaultLatLng, { icon: playerIcon }).addTo(map);
                    playerMarker.bindTooltip("Position par défaut", { permanent: true, direction: "top" });
                    map.setView(defaultLatLng, 15);
                    loadDungeons(defaultLatLng);
                }
            }, {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0,
            }
        );

        startBattleBtn.addEventListener('click', () => {
            if (selectedDungeon) {
                generateDungeon(selectedDungeon.isTutorial ? 'tutoriel' : { lat: selectedDungeon.location.lat, lng: selectedDungeon.location.lng });
                window.location.href = 'battle.html';
            } else {
                showNotification("Veuillez sélectionner un donjon pour y entrer.", 'warning');
            }
        });
    } else {
        showNotification("Votre navigateur ne supporte pas la géolocalisation.", 'warning');
        const defaultLatLng = L.latLng(48.8566, 2.3522);
        playerMarker = L.marker(defaultLatLng, { icon: playerIcon }).addTo(map);
        playerMarker.bindTooltip("Position par défaut", { permanent: true, direction: "top" });
        map.setView(defaultLatLng, 15);
        loadDungeons(defaultLatLng);
    }
});