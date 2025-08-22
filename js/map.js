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
    const classTreeBtn = document.getElementById('class-tree-btn');

    // Définir le donjon du tutoriel séparément
    const tutorialDungeon = {
        id: 'static_Tutoriel',
        name: 'Donjon du Tutoriel',
        type: 'tutorial',
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

    function updatePlayerLocation(position) {
        const { latitude, longitude } = position.coords;
        const playerLocation = [latitude, longitude];

        if (!playerMarker) {
            playerMarker = L.marker(playerLocation).addTo(map);
            map.setView(playerLocation, 16);
            generateDungeons(playerLocation);
        } else {
            playerMarker.setLatLng(playerLocation);
        }

        dungeons.forEach(dungeon => {
            const distance = map.distance(playerLocation, dungeon.location);
            if (distance < 50) { // 50 mètres de rayon d'interaction
                if (selectedDungeon !== dungeon) {
                    selectedDungeon = dungeon;
                    startBattleBtn.style.display = 'block';
                    showNotification(`Vous êtes proche de ${dungeon.name}!`, 'info');
                }
            } else if (selectedDungeon === dungeon) {
                startBattleBtn.style.display = 'none';
                showNotification(`Approchez-vous de ${selectedDungeon.name} pour y entrer.`, 'warning');
                selectedDungeon = null;
            }
        });

        // Mettre à jour la visibilité du bouton de quête de classe
        if (player.level >= 5 && player.class === 'explorateur') {
            classTreeBtn.style.display = 'block';
        } else {
            classTreeBtn.style.display = 'none';
        }
    }

    function generateDungeons(center) {
        for (const id in dungeonsData) {
            const dungeon = dungeonsData[id];
            const marker = L.marker(dungeon.location).addTo(map)
                .bindPopup(dungeon.name);
            dungeon.marker = marker;
            dungeons.push(dungeon);
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

        // Remplacement du gestionnaire d'événements pour le bouton "Entrer dans le donjon"
        document.getElementById('start-battle-btn').addEventListener('click', async () => {
            if (selectedDungeon) {
                // Vérifier si une quête est associée à ce donjon (non implémenté pour l'instant)
                const dungeonType = selectedDungeon.type;
                const hasMinigame = miniGamesData[dungeonType] !== undefined;

                if (hasMinigame) {
                    const success = await startDungeonMinigame(selectedDungeon);
                    if (!success) {
                        localStorage.setItem('currentDungeonId', selectedDungeon.id);
                        window.location.href = 'battle.html';
                    }
                } else {
                    localStorage.setItem('currentDungeonId', selectedDungeon.id);
                    window.location.href = 'battle.html';
                }
            }
        });
    } else {
        showNotification("Votre navigateur ne supporte pas la géolocalisation.", 'warning');
    }

    function updateWorldMapUI() {
        const xpBar = document.getElementById('xp-bar').querySelector('.progress-bar');
        const hpBar = document.getElementById('hp-bar').querySelector('.progress-bar');
        const manaBar = document.getElementById('mana-bar').querySelector('.progress-bar');

        document.getElementById('level-display').textContent = player.level;
        document.getElementById('xp-display').textContent = player.xp;
        document.getElementById('xp-to-next-level-display').textContent = player.xpToNextLevel;
        document.getElementById('hp-display').textContent = player.hp;
        document.getElementById('max-hp-display').textContent = player.maxHp;
        document.getElementById('mana-display').textContent = player.mana;
        document.getElementById('max-mana-display').textContent = player.maxMana;

        xpBar.style.width = `${(player.xp / player.xpToNextLevel) * 100}%`;
        hpBar.style.width = `${(player.hp / player.maxHp) * 100}%`;
        manaBar.style.width = `${(player.mana / player.maxMana) * 100}%`;
    }
});