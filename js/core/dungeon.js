// Fichier : js/core/dungeon.js

import { pointsOfInterest, dungeonTypes, monstersData, bossesData, poiQuests } from './gameData.js';
import { showNotification, currentDungeon, player, saveCharacter } from './state.js';
import { showNotification } from './notifications.js';

/**
 * Calcule la distance entre deux points géographiques (formule simplifiée).
 */
function calculateDistance(loc1, loc2) {
    const dx = loc1.x - loc2.x;
    const dy = loc1.y - loc2.y;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Génère un donjon dynamique et une quête en fonction du lieu réel le plus proche.
 * @param {object} playerLocation La position actuelle du joueur { x, y }.
 */
export function generateDungeon(playerLocation) {
    let closestPOI = null;
    let minDistance = Infinity;

    for (const poiId in pointsOfInterest) {
        const poi = pointsOfInterest[poiId];
        const distance = calculateDistance(playerLocation, poi.location);
        if (distance < minDistance) {
            minDistance = distance;
            closestPOI = poi;
        }
    }

    if (!closestPOI) {
        showNotification("Aucun lieu remarquable à proximité !", 'error');
        return false;
    }

    const dungeonType = dungeonTypes[closestPOI.dungeonType];

    // Sélectionne un monstre au hasard du pool de monstres du lieu
    const randomMonsterId = closestPOI.monsterPool[Math.floor(Math.random() * closestPOI.monsterPool.length)];
    const monsterData = monstersData[randomMonsterId];
    
    // Crée un objet donjon plus détaillé
    const newDungeon = {
        name: `Le donjon de ${closestPOI.name}`,
        location: closestPOI.location,
        difficulty: closestPOI.difficulty,
        type: closestPOI.dungeonType,
        description: dungeonType.description,
        monsters: [{
            name: monsterData.name,
            hp: monsterData.hp,
            damage: monsterData.damage
        }],
        boss: {
            name: bossesData[dungeonType.boss].name,
            hp: bossesData[dungeonType.boss].hp,
            damage: bossesData[dungeonType.boss].damage
        },
        rewards: dungeonType.rewards
    };

    localStorage.setItem('currentDungeon', JSON.stringify(newDungeon));
    showNotification(`Vous entrez dans ${newDungeon.name}! ${newDungeon.description}`, 'info');

    // Mettre à jour l'état du donjon actuel
    currentDungeon = newDungeon;

    // Gérer la quête dynamique
    const newQuestId = closestPOI.questId;
    const newQuest = poiQuests[newQuestId];
    
    // Vérifier si la quête existe et n'a pas déjà été acceptée
    if (newQuest && (!player.quests || !player.quests[newQuestId])) {
        // Initialiser l'objet de quêtes si nécessaire
        if (!player.quests) {
            player.quests = {};
        }
        player.quests[newQuestId] = { ...newQuest };
        showNotification(`Nouvelle quête débloquée : ${newQuest.name}`, 'success');
        saveCharacter(player);
    }

    return true;
}