// Fichier : js/map.js

document.addEventListener('DOMContentLoaded', () => {
    if (!checkCharacter()) {
        return;
    }

    const map = L.map('map');
    let playerMarker;
    let dungeons = [];
    let selectedDungeon = null;
    const mapElement = document.getElementById('map');
    const fullscreenBtn = document.getElementById('toggle-fullscreen-btn');
    const startBattleBtn = document.getElementById('start-battle-btn');

    const dungeonsData = {
        'forest': {
            name: 'Donjon de la Forêt',
            monster: { name: 'Goblinoïde des bois', hp: 50, attack: 15, defense: 5, xpReward: 50, goldReward: 30, element: 'terre' },
            type: 'forest'
        },
        'mountain': {
            name: 'Grotte de la Montagne',
            monster: { name: 'Ogre des cavernes', hp: 80, attack: 25, defense: 10, xpReward: 80, goldReward: 50, element: 'terre' },
            type: 'cave'
        },
        'swamp': {
            name: 'Marais putride',
            monster: { name: 'Créature du marais', hp: 60, attack: 20, defense: 8, xpReward: 60, goldReward: 40, element: 'poison' },
            type: 'swamp'
        },
        'ruins': {
            name: 'Anciennes ruines',
            monster: { name: 'Garde de pierre', hp: 90, attack: 20, defense: 15, xpReward: 90, goldReward: 60, element: 'terre' },
            type: 'ruins'
        }
    };
    
    function generateRandomPoint(center, radius) {
        const y0 = center.lat;
        const x0 = center.lng;
        const rd = radius / 111300;
    
        const u = Math.random();
        const v = Math.random();
        const w = rd * Math.sqrt(u);
        const t = 2 * Math.PI * v;
        const x = w * Math.cos(t);
        const y = w * Math.sin(t);
    
        return { lat: y + y0, lng: x + x0 };
    }

    function generateDynamicDungeons(lat, lng, radius) {
        const dungeons = [];
        const numDungeons = Math.floor(Math.random() * 6) + 3;
        const types = Object.keys(dungeonsData);

        for (let i = 0; i < numDungeons; i++) {
            const randomType = types[Math.floor(Math.random() * types.length)];
            const dungeonInfo = dungeonsData[randomType];
            const dungeonLocation = generateRandomPoint({ lat, lng }, radius);

            dungeons.push({
                id: `dynamic_${randomType}_${i}`,
                name: dungeonInfo.name,
                location: dungeonLocation,
                monster: { ...dungeonInfo.monster },
                type: randomType,
                marker: null
            });
        }
        return dungeons;
    }

    function fetchDungeonsFromOverpass(lat, lng) {
        const radius = 10000;
        const dynamicDungeons = generateDynamicDungeons(lat, lng, radius);
        
        const staticDungeons = [
            {
                id: 'forest_dungeon',
                name: 'Donjon de la Forêt',
                location: { lat: 48.9082, lng: 6.1774 },
                monster: { name: 'Goblinoïde des bois', hp: 50, attack: 15, defense: 5, xpReward: 50, goldReward: 30, element: 'terre' },
                type: 'forest'
            },
            {
                id: 'mountain_cave',
                name: 'Grotte de la Montagne',
                location: { lat: 48.8876, lng: 6.2259 },
                monster: { name: 'Ogre des cavernes', hp: 80, attack: 25, defense: 10, xpReward: 80, goldReward: 50, element: 'terre' },
                type: 'cave'
            }
        ];
        
        return [...staticDungeons, ...dynamicDungeons];
    }
    
    const tutorialDungeon = {
        id: 'static_Tutoriel',
        name: 'Donjon du Tutoriel',
        location: null,
        monster: { name: 'Mannequin', hp: 10, attack: 0, defense: 0, xpReward: 5, goldReward: 2, element: 'neutre' },
        marker: null
    };

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors'
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
        }, 10);
    }

    fullscreenBtn.addEventListener('click', toggleFullscreen);

    function addDungeonMarker(dungeon) {
        if (dungeon.marker) {
            map.removeLayer(dungeon.marker);
        }

        const dungeonIcon = L.icon({
            iconUrl: dungeon.type === 'forest' ? 'img/icons/dungeon_forest.png' : 'img/icons/dungeon_cave.png',
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32]
        });

        dungeon.marker = L.marker([dungeon.location.lat, dungeon.location.lng], { icon: dungeonIcon }).addTo(map)
            .bindPopup(`<b>${dungeon.name}</b><br>${dungeon.monster.name}`);
    }

    function checkProximity(playerLatLng) {
        let dungeonInRange = null;
        dungeons.forEach(dungeon => {
            const dungeonLatLng = L.latLng(dungeon.location.lat, dungeon.location.lng);
            const distance = playerLatLng.distanceTo(dungeonLatLng);

            if (distance <= 50) {
                dungeonInRange = dungeon;
            }
        });

        if (dungeonInRange) {
            if (dungeonInRange !== selectedDungeon) {
                selectedDungeon = dungeonInRange;
                showNotification(`Vous êtes assez proche pour entrer dans ${selectedDungeon.name} !`, 'info');
                startBattleBtn.style.display = 'block';
            }
        } else {
            if (selectedDungeon) {
                startBattleBtn.style.display = 'none';
                showNotification(`Approchez-vous de ${selectedDungeon.name} pour y entrer.`, 'warning');
                selectedDungeon = null;
            }
        }
    }

    function updatePlayerLocation(position) {
        const { latitude, longitude } = position.coords;
        const latLng = L.latLng(latitude, longitude);

        if (!playerMarker) {
            playerMarker = L.circleMarker(latLng, { color: 'blue', fillColor: 'blue', fillOpacity: 0.5, radius: 8 }).addTo(map);
            map.setView(latLng, 15);
        } else {
            playerMarker.setLatLng(latLng);
        }

        dungeons.forEach(d => {
            if (d.marker) {
                map.removeLayer(d.marker);
            }
        });
        dungeons = [];

        tutorialDungeon.location = { lat: latitude, lng: longitude + 0.001 };
        addDungeonMarker(tutorialDungeon);
        dungeons.push(tutorialDungeon);

        const fetchedDungeons = fetchDungeonsFromOverpass(latitude, longitude);
        fetchedDungeons.forEach(dungeon => {
            const dungeonLatLng = L.latLng(dungeon.location.lat, dungeon.location.lng);
            if (map.getBounds().contains(dungeonLatLng)) {
                addDungeonMarker(dungeon);
            }
        });
        dungeons.push(...fetchedDungeons);

        checkProximity(latLng);
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
            if (selectedDungeon) {
                const questId = dungeonQuestsData[selectedDungeon.id];
                if (questId) {
                    addQuest(questId);
                    window.location.href = 'quests.html';
                } else {
                    localStorage.setItem('currentDungeon', JSON.stringify(selectedDungeon));
                    window.location.href = 'battle.html';
                }
            }
        });

    } else {
        showNotification("Votre navigateur ne supporte pas la géolocalisation.", 'warning');
    }
});