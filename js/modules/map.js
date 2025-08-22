// Fichier : js/map.js
import { checkCharacter } from './core/utils.js';
import { showNotification } from './core/notifications.js';
import { generateDungeon } from './modules/dungeon.js';
import { pointsOfInterest, dungeonTypes } from './core/gameData.js'; // Assurez-vous d'importer les données

document.addEventListener('DOMContentLoaded', () => {
    if (!checkCharacter()) {
        return;
    }

    const map = L.map('map').setView([48.8566, 2.3522], 13);
    let playerMarker;
    let selectedDungeonMarker = null;

    const mapElement = document.getElementById('map');
    const fullscreenBtn = document.getElementById('toggle-fullscreen-btn');
    const startBattleBtn = document.getElementById('start-battle-btn');

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors'
    }).addTo(map);

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

    function createMarker(location, name, type) {
        const marker = L.marker([location.lat, location.lng], {
            title: name
        });
        marker.addTo(map);

        marker.on('click', () => {
            if (selectedDungeonMarker) {
                selectedDungeonMarker.setOpacity(0.5);
            }
            selectedDungeonMarker = marker;
            selectedDungeonMarker.setOpacity(1.0);
            startBattleBtn.style.display = 'block';
            startBattleBtn.textContent = `Entrer dans ${name}`;
        });

        return marker;
    }

    function addDungeonMarkers() {
        for (const poiId in pointsOfInterest) {
            const poi = pointsOfInterest[poiId];
            if (poi.dungeonType && dungeonTypes[poi.dungeonType]) {
                const dungeonName = poi.name;
                createMarker(poi.location, dungeonName, poi.dungeonType);
            }
        }
    }

    function updatePlayerLocation(position) {
        const { latitude, longitude } = position.coords;
        const playerLatLng = L.latLng(latitude, longitude);

        if (!playerMarker) {
            playerMarker = L.marker(playerLatLng).addTo(map).bindPopup("Votre position actuelle").openPopup();
            map.setView(playerLatLng, 13);
        } else {
            playerMarker.setLatLng(playerLatLng).setPopupContent("Votre position actuelle").openPopup();
            map.panTo(playerLatLng);
        }
    }

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
        addDungeonMarkers();
    } else {
        showNotification("Votre navigateur ne supporte pas la géolocalisation.", 'warning');
    }

    startBattleBtn.addEventListener('click', () => {
        if (selectedDungeonMarker) {
            const selectedPOI = pointsOfInterest[selectedDungeonMarker.options.title];
            generateDungeon({ x: selectedPOI.location.lat, y: selectedPOI.location.lng });
            window.location.href = 'battle.html';
        } else {
            showNotification("Veuillez sélectionner un donjon pour y entrer.", 'warning');
        }
    });
});