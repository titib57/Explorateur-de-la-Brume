import { checkCharacter } from './core/utils.js';
import { showNotification } from './core/notifications.js';
import { generateDungeon } from './modules/dungeon.js';
import { pointsOfInterest, dungeonTypes } from './core/gameData.js';

document.addEventListener('DOMContentLoaded', () => {
    if (!checkCharacter()) {
        return;
    }

    const map = L.map('map');
    let playerMarker;
    let selectedDungeon = null; // Stocke l'objet donjon sélectionné, pas seulement le marqueur
    const mapElement = document.getElementById('map');
    const fullscreenBtn = document.getElementById('toggle-fullscreen-btn');
    const startBattleBtn = document.getElementById('start-battle-btn');
    const classTreeBtn = document.getElementById('class-tree-btn');

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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

    // Fonction pour charger et afficher tous les donjons sur la carte
    function loadDungeons() {
        for (const poiId in pointsOfInterest) {
            const poi = pointsOfInterest[poiId];
            if (poi.dungeonType && dungeonTypes[poi.dungeonType]) {
                const dungeonMarker = L.marker([poi.location.lat, poi.location.lng]).addTo(map);
                dungeonMarker.bindTooltip(poi.name, { permanent: true, direction: "top" });
                
                dungeonMarker.on('click', () => {
                    // Stocke l'objet complet du donjon, pas seulement le marqueur
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

    // Fonction pour mettre à jour la position du joueur et les boutons d'action
    function updatePlayerLocation(position) {
        const { latitude, longitude } = position.coords;
        const playerLatLng = L.latLng(latitude, longitude);

        if (!playerMarker) {
            playerMarker = L.marker(playerLatLng).addTo(map);
            playerMarker.bindTooltip("Vous êtes ici", { permanent: true, direction: "top" });
            map.setView(playerLatLng, 15);
            loadDungeons(); // Charge les donjons une fois la carte centrée
        } else {
            playerMarker.setLatLng(playerLatLng);
            map.panTo(playerLatLng);
        }
        
        // Appelle la fonction de mise à jour des boutons après chaque changement de position
        updateActionButtons();
    }
    
    // Fonction pour activer/désactiver le bouton "Entrer dans le donjon"
    function updateActionButtons() {
        if (!selectedDungeon || !playerMarker) {
            startBattleBtn.style.display = 'none';
            return;
        }

        const playerLatLng = playerMarker.getLatLng();
        const dungeonLatLng = L.latLng(selectedDungeon.location.lat, selectedDungeon.location.lng);
        const distance = playerLatLng.distanceTo(dungeonLatLng);
        
        if (distance <= 100) {
            startBattleBtn.style.display = 'block';
            startBattleBtn.textContent = `Entrer dans ${selectedDungeon.name}`;
        } else {
            startBattleBtn.style.display = 'none';
            showNotification(`Approchez-vous de ${selectedDungeon.name} pour y entrer.`, 'warning');
            selectedDungeon = null; // Réinitialise la sélection si le joueur s'éloigne
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

        startBattleBtn.addEventListener('click', () => {
            if (selectedDungeon) {
                // Passage de l'objet de localisation correct à generateDungeon
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