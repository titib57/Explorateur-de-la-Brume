// Fichier : js/map.js

document.addEventListener('DOMContentLoaded', () => {
    if (!checkCharacter()) {
        return;
    }

    const map = L.map('map');
    let playerMarker;
    let dungeons = [];
    let selectedDungeon = null;
    const dungeonMarkers = {};
    const mapElement = document.getElementById('map');
    const fullscreenBtn = document.getElementById('toggle-fullscreen-btn');
    const startBattleBtn = document.getElementById('start-battle-btn');

    // Définir le donjon du tutoriel séparément
    const tutorialDungeon = {
        id: 'static_Tutoriel',
        name: 'Donjon du Tutoriel',
        location: null, // Sera mis à jour dynamiquement
        monster: { name: 'Mannequin', hp: 10, attack: 1, defense: 0, xpReward: 5, goldReward: 2, element: 'neutre' },
        marker: null
    };

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors'
    }).addTo(map);

    window.addEventListener('resize', () => {
        map.invalidateSize();
    });

    function generateDungeons(playerLocation) {
        // Effacer les donjons existants
        dungeons.forEach(d => {
            if (d.marker) {
                map.removeLayer(d.marker);
            }
        });
        dungeons = [];
        
        // Ajouter les donjons statiques
        for (const dungeonId in dungeonsData) {
            const dungeon = dungeonsData[dungeonId];
            const distance = getDistance(playerLocation, dungeon.location);
            if (distance <= 500) {
                const monsterData = monstersData[dungeon.monster];
                const marker = L.marker([dungeon.location.lat, dungeon.location.lng]).addTo(map);
                marker.bindPopup(`<b>${dungeon.name}</b><br>Monstre: ${monsterData.name}`);
                marker.dungeonId = dungeonId;
                dungeons.push({
                    id: dungeonId,
                    name: dungeon.name,
                    location: dungeon.location,
                    monster: monsterData,
                    marker: marker
                });
                dungeonMarkers[dungeonId] = marker;
            }
        }
    }

    function updatePlayerLocation(position) {
        const { latitude, longitude } = position.coords;
        const latLng = [latitude, longitude];
        
        if (!playerMarker) {
            map.setView(latLng, 13);
            playerMarker = L.marker(latLng).addTo(map).bindPopup('Votre position');
            generateDungeons({ lat: latitude, lng: longitude });
        } else {
            playerMarker.setLatLng(latLng);
        }

        updateMapUI();

        // Vérifier la proximité des donjons
        dungeons.forEach(dungeon => {
            const distance = getDistance({ lat: latitude, lng: longitude }, dungeon.location);
            if (distance <= 100) {
                startBattleBtn.style.display = 'block';
                selectedDungeon = dungeon;
                if (!dungeonMarkers[dungeon.id].getPopup().isOpen()) {
                    dungeonMarkers[dungeon.id].openPopup();
                }
            } else {
                if (selectedDungeon && selectedDungeon.id === dungeon.id) {
                    startBattleBtn.style.display = 'none';
                    selectedDungeon = null;
                }
            }
        });
    }

    // Fonction utilitaire pour calculer la distance
    function getDistance(pos1, pos2) {
        const R = 6371e3; // metres
        const lat1 = pos1.lat * Math.PI / 180;
        const lat2 = pos2.lat * Math.PI / 180;
        const deltaLat = (pos2.lat - pos1.lat) * Math.PI / 180;
        const deltaLng = (pos2.lng - pos1.lng) * Math.PI / 180;
        const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
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

        // Code pour le bouton de combat, maintenant dans le bon bloc
        document.getElementById('start-battle-btn').addEventListener('click', () => {
            if (selectedDungeon) {
                // Créez un nouvel objet sans la propriété 'marker' pour éviter l'erreur de référence circulaire
                const dungeonToSave = {
                    id: selectedDungeon.id,
                    name: selectedDungeon.name,
                    location: selectedDungeon.location,
                    monster: selectedDungeon.monster
                };
                localStorage.setItem('currentDungeon', JSON.stringify(dungeonToSave));
                
                // Appel de la nouvelle fonction pour ajouter la quête
                addQuestForDungeon(selectedDungeon.id);

                window.location.href = 'battle.html';
            }
        });

    } else {
        showNotification("Votre navigateur ne supporte pas la géolocalisation.", 'warning');
    }
});