document.addEventListener('DOMContentLoaded', () => {
    if (!loadCharacter()) {
        showNotification("Vous devez d'abord créer un personnage.", 'warning');
        window.location.href = 'character_creation.html';
        return;
    }

    const map = L.map('map');
    let playerMarker;
    let dungeons = [];
    let nearbyDungeon = null;
    let selectedDungeon = null; // Nouvelle variable pour le donjon sélectionné
    const mapElement = document.getElementById('map');
    const fullscreenBtn = document.getElementById('toggle-fullscreen-btn');
    const startBattleBtn = document.getElementById('start-battle-btn');


    // Définir le donjon du tutoriel séparément
    const tutorialDungeon = {
        id: 'static_Tutoriel',
        name: 'Donjon du Tutoriel',
        location: null, // Sera mis à jour dynamiquement
        monster: { name: 'Mannequin', hp: 10, attack: 0, defense: 0, xp: 5, gold: 2 },
        marker: null
    };

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

    // Fonction pour obtenir un point aléatoire dans un rayon donné
    function getRandomPoint(lat, lng, radius) {
        const y0 = lat;
        const x0 = lng;
        // Conversion de mètres en degrés
        const rd = radius / 111300;

        const u = Math.random();
        const v = Math.random();
        const w = rd * Math.sqrt(u);
        const t = 2 * Math.PI * v;
        const x = w * Math.cos(t);
        const y = w * Math.sin(t);

        return {
            lat: y + y0,
            lng: x + x0
        };
    }

    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371e3;
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }

    const staticDungeons = [
        { id: 'static_monument_eiffel_tower', name: 'Donjon de la Tour Eiffel', location: { lat: 48.8584, lng: 2.2945 }, monster: { name: 'Gardien de fer', hp: 250, attack: 60, defense: 40, xp: 300, gold: 150 } },
        { id: 'static_chateau_mont_saint_michel', name: 'Donjon du Mont-Saint-Michel', location: { lat: 48.6361, lng: -1.5111 }, monster: { name: 'Chevalier fantôme', hp: 200, attack: 50, defense: 30, xp: 250, gold: 120 } },
        { id: 'static_chateau_versailles_castle', name: 'Donjon du Château de Versailles', location: { lat: 48.8041, lng: 2.1204 }, monster: { name: 'Roi maudit', hp: 180, attack: 45, defense: 35, xp: 220, gold: 110 } },
        { id: 'static_ruins_verdon_gorges', name: 'Donjon des Gorges du Verdon', location: { lat: 43.7458, lng: 6.3147 }, monster: { name: 'Wyvern du Verdon', hp: 150, attack: 40, defense: 25, xp: 180, gold: 90 } },
        { id: 'static_ruins_dune_du_pilat', name: 'Donjon de la Dune du Pilat', location: { lat: 44.588, lng: -1.216 }, monster: { name: 'Ver des sables géant', hp: 120, attack: 30, defense: 20, xp: 150, gold: 75 } },
        { id: 'static_ruins_etretat_cliffs', name: 'Donjon des Falaises d\'Étretat', location: { lat: 49.7073, lng: 0.2014 }, monster: { name: 'Gargouille de craie', hp: 100, attack: 25, defense: 15, xp: 120, gold: 60 } },
        { id: 'static_monument_arc_de_triomphe', name: 'Donjon de l\'Arc de Triomphe', location: { lat: 48.8738, lng: 2.2950 }, monster: { name: 'Garde impérial', hp: 180, attack: 40, defense: 30, xp: 200, gold: 100 } },
        { id: 'static_cathedrale_notre_dame', name: 'Donjon de Notre-Dame', location: { lat: 48.8529, lng: 2.3499 }, monster: { name: 'Fantôme des gargouilles', hp: 220, attack: 55, defense: 35, xp: 280, gold: 130 } }
    ];

    function updatePlayerLocation(position) {
        const { latitude, longitude } = position.coords;
        const latLng = L.latLng(latitude, longitude);

        // Calculer la nouvelle position aléatoire pour le donjon
        const randomPos = getRandomPoint(latitude, longitude, 10);
        
        // Mettre à jour la position du donjon du tutoriel
        tutorialDungeon.location = { lat: randomPos.lat, lng: randomPos.lng };

        if (!playerMarker) {
            const playerIcon = L.divIcon({
                className: 'player-icon',
                html: '<div style="background-color: green; width: 10px; height: 10px; border-radius: 50%; border: 2px solid white; animation: pulse 1.5s infinite;"></div>',
                iconSize: [12, 12],
                iconAnchor: [6, 6]
            });
            playerMarker = L.marker(latLng, { icon: playerIcon }).addTo(map)
                .bindPopup("Vous êtes ici").openPopup();
            
            // Créer le marqueur du donjon du tutoriel à sa nouvelle position aléatoire
            tutorialDungeon.marker = L.marker(L.latLng(randomPos.lat, randomPos.lng)).addTo(map);
            tutorialDungeon.marker.bindPopup(`<h3>${tutorialDungeon.name}</h3>`).openPopup();
            
            // Écouteur de clic pour le donjon du tutoriel
            tutorialDungeon.marker.on('click', () => {
                selectedDungeon = tutorialDungeon;
                updateDungeonMarkers(playerMarker.getLatLng());
            });
            
            map.setView(latLng, 13);
            fetchDungeonsFromOverpass(latitude, longitude);
        } else {
            playerMarker.setLatLng(latLng);
            
            // Mettre à jour la position du marqueur du donjon du tutoriel
            tutorialDungeon.marker.setLatLng(L.latLng(randomPos.lat, randomPos.lng));
        }
        updateDungeonMarkers(latLng);
    }
    
    function drawDungeonsOnMap() {
        map.eachLayer(layer => {
            if (layer instanceof L.Marker && layer !== playerMarker && layer !== tutorialDungeon.marker) {
                map.removeLayer(layer);
            }
        });
        
        const playerLatLng = playerMarker ? playerMarker.getLatLng() : null;

        dungeons.forEach(dungeon => {
            if (dungeon.id === tutorialDungeon.id) return;
            
            const distance = playerLatLng ? calculateDistance(playerLatLng.lat, playerLatLng.lng, dungeon.location.lat, dungeon.location.lng) : null;
            const distanceFormatted = distance !== null ? `${distance.toFixed(0)} m` : 'Calcul de la distance...';
            
            dungeon.marker = L.marker([dungeon.location.lat, dungeon.location.lng]).addTo(map)
                .bindPopup(`
                    <h3>${dungeon.name}</h3>
                    <p>Monstre: ${dungeon.monster.name}</p>
                    <p>Distance: ${distanceFormatted}</p>
                `);
            
            // Ajout de l'écouteur de clic pour les donjons dynamiques
            dungeon.marker.on('click', () => {
                selectedDungeon = dungeon;
                updateDungeonMarkers(playerMarker.getLatLng());
            });
        });
    }

    function fetchDungeonsFromOverpass(lat, lng) {
        const overpassQuery = `
            [out:json];
            (
              node["historic"="castle"](around:100, ${lat}, ${lng});
              node["historic"="ruins"](around:100, ${lat}, ${lng});
              node["historic"="fort"](around:100, ${lat}, ${lng});
              node["historic"="archaeological_site"](around:100, ${lat}, ${lng});
              node["historic"="monument"](around:100, ${lat}, ${lng});
              node["historic"="chateau"](around:100, ${lat}, ${lng});
              node["historic"="tour"](around:100, ${lat}, ${lng});
              node["historic"="cimetiere"](around:100, ${lat}, ${lng});
              node["historic"="eglise"](around:100, ${lat}, ${lng});
              node["historic"="cathedrale"](around:100, ${lat}, ${lng});
              node["historic"="memorial"](around:100, ${lat}, ${lng});
              node["historic"="stele"](around:100, ${lat}, ${lng});
              node["historic"="statue"](around:100, ${lat}, ${lng});
            );
            out body;
            >;
            out skel qt;
        `;

        fetch('https://overpass-api.de/api/interpreter', {
            method: 'POST',
            body: overpassQuery
        })
        .then(response => response.json())
        .then(data => {
            addDungeons(data);
        })
        .catch(error => {
            console.error('Erreur de l\'API Overpass :', error);
            showNotification('Erreur de chargement des donjons dynamiques.', 'error');
        });
    }

    function addDungeons(data) {
        const dynamicDungeons = data.elements.map(element => {
            const dungeonName = element.tags.name || 'Donjon mystérieux';
            return {
                id: `osm_${element.tags.historic}_${element.id}`,
                name: `Donjon de ${dungeonName}`,
                location: { lat: element.lat, lng: element.lon },
                monster: {
                    name: `Garde de ${dungeonName}`,
                    hp: 100,
                    attack: 20,
                    defense: 10,
                    xp: 50,
                    gold: 25
                }
            };
        });
        
        // Ajouter le donjon du tutoriel au début de la liste
        dungeons = [tutorialDungeon, ...staticDungeons, ...dynamicDungeons];
        drawDungeonsOnMap();
        if (playerMarker) {
             updateDungeonMarkers(playerMarker.getLatLng());
        }
    }

    function updateDungeonMarkers(playerLatLng) {
        if (!dungeons || !playerLatLng) return;
        
        dungeons.forEach(dungeon => {
            const distance = calculateDistance(playerLatLng.lat, playerLatLng.lng, dungeon.location.lat, dungeon.location.lng);
            const distanceFormatted = (distance > 1000) ? `${(distance / 1000).toFixed(2)} km` : `${distance.toFixed(0)} m`;

            if (dungeon.marker) {
                dungeon.marker.getPopup().setContent(`
                    <h3>${dungeon.name}</h3>
                    <p>Monstre: ${dungeon.monster.name}</p>
                    <p>Distance: ${distanceFormatted}</p>
                `);
            }
        });
        
        // Trouver le donjon le plus proche (pour l'affichage initial)
        nearbyDungeon = dungeons.find(dungeon => {
            const distance = calculateDistance(playerLatLng.lat, playerLatLng.lng, dungeon.location.lat, dungeon.location.lng);
            return distance <= 100;
        });

        // Logique de mise à jour du bouton
        if (selectedDungeon) {
            const distanceToSelected = calculateDistance(playerLatLng.lat, playerLatLng.lng, selectedDungeon.location.lat, selectedDungeon.location.lng);
            if (distanceToSelected <= 100) {
                startBattleBtn.style.display = 'block';
                startBattleBtn.textContent = `Entrer dans ${selectedDungeon.name}`;
            } else {
                startBattleBtn.style.display = 'none';
                showNotification(`Approchez-vous de ${selectedDungeon.name} pour y entrer.`, 'warning');
                selectedDungeon = null; // Réinitialise la sélection si le joueur est trop loin
            }
        } else if (nearbyDungeon) {
             // S'il y a un donjon à proximité mais aucun n'est sélectionné,
             // on le sélectionne automatiquement et on affiche le bouton.
            selectedDungeon = nearbyDungeon;
            startBattleBtn.style.display = 'block';
            startBattleBtn.textContent = `Entrer dans ${nearbyDungeon.name}`;
        } else {
            startBattleBtn.style.display = 'none';
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
            // Le bouton utilise maintenant la variable selectedDungeon
            if (selectedDungeon) {
                localStorage.setItem('currentDungeon', JSON.stringify(selectedDungeon));
                window.location.href = 'battle.html';
            } else {
                showNotification("Veuillez d'abord vous approcher d'un donjon ou le sélectionner sur la carte.", 'warning');
            }
        });

    } else {
        showNotification("Votre navigateur ne supporte pas la géolocalisation.", 'warning');
    }
});