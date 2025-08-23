import { checkCharacter } from './core/utils.js';
import { showNotification } from './core/notifications.js';
import { generateDungeon } from './modules/dungeon.js';
import { pointsOfInterest, dungeonTypes } from './core/gameData.js';
import { player } from './core/state.js';

// Fonction pour calculer la distance entre deux points géographiques (simplifié pour la démo)
function calculateDistance(loc1, loc2) {
    const dx = loc1.lat - loc2.lat;
    const dy = loc1.lng - loc2.lng;
    // Approximation en mètres pour une meilleure logique de jeu
    return Math.sqrt(dx * dx + dy * dy) * 111320;
}

document.addEventListener('DOMContentLoaded', () => {
    // Étape 1: Vérifie si un personnage existe, sinon redirige
    if (!checkCharacter()) {
        return;
    }

    // Étape 2: Initialisation des variables et des éléments de la carte
    // AJOUT DE setView() POUR QUE LA CARTE S'AFFICHE PAR DÉFAUT
    const map = L.map('map').setView([48.8566, 2.3522], 6);
    let playerMarker;
    let selectedDungeon = null;
    const mapElement = document.getElementById('map');
    const fullscreenBtn = document.getElementById('toggle-fullscreen-btn');
    const startBattleBtn = document.getElementById('start-battle-btn');
    const classTreeBtn = document.getElementById('class-tree-btn');

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
    function loadDungeons() {
        for (const poiId in pointsOfInterest) {
            const poi = pointsOfInterest[poiId];
            if (poi.dungeonType && dungeonTypes[poi.dungeonType]) {
                const dungeonMarker = L.marker([poi.location.lat, poi.location.lng]).addTo(map);
                dungeonMarker.bindTooltip(poi.name, { permanent: true, direction: "top" });

                dungeonMarker.on('click', () => {
                    selectedDungeon = {
                        id: poiId,
                        ...poi,
                        marker: dungeonMarker
                    };
                    showNotification(`Donjon sélectionné : ${poi.name}. Approchez-vous pour y entrer.`, 'info');
                    updateActionButtons();
                });
            }
        }
    }

    // Étape 6: Mise à jour de la position du joueur et des boutons d'action
    function updatePlayerLocation(position) {
        const { latitude, longitude } = position.coords;
        const playerLatLng = L.LatLng(latitude, longitude);

        if (!playerMarker) {
            playerMarker = L.marker(playerLatLng).addTo(map);
            playerMarker.bindTooltip("Vous êtes ici", { permanent: true, direction: "top" });
            map.setView(playerLatLng, 15);
            loadDungeons();
        } else {
            playerMarker.setLatLng(playerLatLng);
            map.panTo(playerLatLng);
        }

        updateActionButtons();
    }

    // Étape 7: Gestion de l'affichage des boutons d'action
    function updateActionButtons() {
        if (!selectedDungeon || !playerMarker) {
            startBattleBtn.style.display = 'none';
        } else {
            const playerLatLng = playerMarker.getLatLng();
            const dungeonLatLng = L.LatLng(selectedDungeon.location.lat, selectedDungeon.location.lng);
            const distance = calculateDistance(playerLatLng, dungeonLatLng);

            if (distance <= 100) {
                startBattleBtn.style.display = 'block';
                startBattleBtn.textContent = `Entrer dans ${selectedDungeon.name}`;
            } else {
                startBattleBtn.style.display = 'none';
                showNotification(`Approchez-vous de ${selectedDungeon.name} pour y entrer.`, 'warning');
                selectedDungeon = null;
            }
        }

        if (player && player.level >= 5 && player.class === 'explorateur') {
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
            }, {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0,
            }
        );

        startBattleBtn.addEventListener('click', () => {
            if (selectedDungeon) {
                generateDungeon({ x: selectedDungeon.location.lng, y: selectedDungeon.location.lat });
                window.location.href = 'battle.html';
            } else {
                showNotification("Veuillez sélectionner un donjon pour y entrer.", 'warning');
            }
        });
    } else {
        showNotification("Votre navigateur ne supporte pas la géolocalisation.", 'warning');
    }
});