// Fichier : js/map.js
// Ce code est censé être intégré au code existant du fichier world_map.js

async function startDungeon(dungeonId) {
    const dungeon = dungeonsData[dungeonId];
    if (!dungeon) {
        showNotification("Ce donjon n'existe pas.", 'error');
        return;
    }

    showNotification(`Vous entrez dans le donjon : ${dungeon.name}`, 'info');

    // Lance le mini-jeu et attend le résultat de la promesse
    const minigameResult = await playMinigame(dungeon.minigame);

    if (minigameResult) {
        showNotification("Vous avez réussi le mini-jeu ! Vous pouvez continuer vers la bataille finale.", 'success');
        // Si le mini-jeu est réussi, lance la bataille de boss.
        localStorage.setItem('currentDungeon', JSON.stringify({ ...dungeon, monster: monstersData[dungeon.boss] }));
        setTimeout(() => {
            window.location.href = 'battle.html';
        }, 1000);
    } else {
        showNotification("Vous avez échoué au mini-jeu.", 'warning');
        // La fonction `handleMinigameResult` dans dungeon_minigames.js gère déjà les conséquences de l'échec (ex: combat)
        // Pas besoin de code supplémentaire ici.
    }
}

// Assurez-vous d'appeler cette fonction sur le bouton approprié
document.getElementById('start-battle-btn').addEventListener('click', () => {
    if (nearbyDungeon) {
        startDungeon(nearbyDungeon.id);
    }
});