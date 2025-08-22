// Fichier : js/modules/map.js

import { showNotification } from "../core/notifications.js";
import { generateDungeon } from "../core/dungeon.js";
import { checkCharacter } from "../core/utils.js";
import { player, currentDungeon } from "../core/state.js";
import { updateWorldMapUI } from "./ui.js";

document.addEventListener('DOMContentLoaded', () => {
    // Vérifier si un personnage existe
    if (!checkCharacter()) {
        return;
    }

    const map = L.map('map');
    let playerMarker;
    let dungeonMarker; // Un seul marqueur pour le donjon actuel
    const mapElement = document.getElementById('map');
    const fullscreenBtn = document.getElementById('toggle-fullscreen-btn');
    const startBattleBtn = document.getElementById('start-battle-btn');
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    window.addEventListener('resize', () => {
        map.invalidateSize();
    });

    function toggleFullscreen() {
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
    }

    fullscreenBtn.addEventListener('click', toggleFullscreen);

    function updatePlayerLocation(position) {
        const { latitude, longitude } = position.coords;
        const latLng = L.latLng(latitude, longitude);

        if (!playerMarker) {
            const playerIcon = L.divIcon({
                className: 'player-icon',
                html: '<div style="background-color: green; width: 10px; height: 10px; border-radius: 50%; border: 2px solid white; animation: pulse 1.5s infinite;"></div>',
                iconSize: [12, 12],
                iconAnchor: [6, 6]
            });
            playerMarker = L.marker(latLng, { icon: playerIcon }).addTo(map).bindPopup("Vous êtes ici").openPopup();
            map.setView(latLng, 13);
            
            // Appeler la génération de donjon et la quête initiale
            generateDungeon({ x: latitude, y: longitude });
        } else {
            playerMarker.setLatLng(latLng);
        }

        // Mettre à jour l'affichage du donjon
        renderDungeonOnMap();
        updateStartBattleButton();
    }

    function renderDungeonOnMap() {
        if (!currentDungeon) return;

        // Supprimer le marqueur précédent s'il existe
        if (dungeonMarker) {
            map.removeLayer(dungeonMarker);
        }

        dungeonMarker = L.marker([currentDungeon.location.x, currentDungeon.location.y]).addTo(map)
            .bindPopup(`<h3>${currentDungeon.name}</h3><p>${currentDungeon.description}</p>`);

        dungeonMarker.on('click', () => {
            updateStartBattleButton();
        });
    }

    function updateStartBattleButton() {
        if (!playerMarker || !currentDungeon) {
            startBattleBtn.style.display = 'none';
            return;
        }

        const playerLatLng = playerMarker.getLatLng();
        const dungeonLatLng = L.latLng(currentDungeon.location.x, currentDungeon.location.y);
        const distance = playerLatLng.distanceTo(dungeonLatLng);
        
        if (distance <= 100) {
            startBattleBtn.style.display = 'block';
            startBattleBtn.textContent = `Entrer dans ${currentDungeon.name}`;
            classTreeBtn.style.display = 'block'; // J'ai ajouté une ligne dans `ui.js` pour gérer ce bouton.
        } else {
            startBattleBtn.style.display = 'none';
            showNotification(`Approchez-vous de ${currentDungeon.name} pour y entrer.`, 'warning');
        }
    }

    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(
            updatePlayerLocation,
            (error) => {
                console.error("Erreur de géolocalisation :", error);
                showNotification("Impossible d'obtenir votre position. La carte ne pourra pas fonctionner correctement.", 'error');
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0,
            }
        );

        document.getElementById('start-battle-btn').addEventListener('click', () => {
            if (currentDungeon) {
                // Le donjon est déjà dans l'état global, on peut lancer le combat
                window.location.href = 'battle.html';
            }
        });

    } else {
        showNotification("Votre navigateur ne supporte pas la géolocalisation.", 'warning');
    }

    updateWorldMapUI();
});