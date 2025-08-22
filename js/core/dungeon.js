// Fichier : js/core/dungeon.js

import { pointsOfInterest, dungeonTypes, monstersData, bossesData, poiQuests } from './gameData.js';
import { showNotification } from './notifications.js';
import { currentDungeon, player, saveCharacter } from './state.js';

/**
 * Calcule la distance entre deux points géographiques (formule simplifiée).
 * @param {object} loc1 Le premier emplacement { x, y }.
 * @param {object} loc2 Le deuxième emplacement { x, y }.
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
        if (distance < distance) {
            minDistance = distance;
            closestPOI = poi;
        }
    }

    if (!closestPOI) {
        showNotification("Aucun lieu remarquable à proximité !", 'error');
        return false;
    }

    const dungeonType = dungeonTypes[closestPOI.dungeonType];
    if (!dungeonType) {
        showNotification("Type de donjon non défini.", 'error');
        return false;
    }

    // Sélectionne un monstre et un boss au hasard du pool de monstres et de boss du lieu
    const randomMonsterId = closestPOI.monsterPool[Math.floor(Math.random() * closestPOI.monsterPool.length)];
    const randomBossId = closestPOI.bossPool[Math.floor(Math.random() * closestPOI.bossPool.length)];
    
    const monsterData = monstersData[randomMonsterId];
    const bossData = bossesData[randomBossId];

    // Calcul des statistiques dynamiques en fonction du niveau du joueur
    const levelFactor = player.level;
    const baseMonsterHP = monsterData.hp;
    const baseMonsterDamage = monsterData.damage;
    const baseMonsterXP = monsterData.xpReward;
    const baseMonsterGold = monsterData.goldReward;

    const baseBossHP = bossData.hp;
    const baseBossDamage = bossData.damage;
    const baseBossXP = bossData.xpReward;
    const baseBossGold = bossData.goldReward;

    const scaledMonster = {
        name: monsterData.name,
        hp: baseMonsterHP + (levelFactor * 5),
        damage: baseMonsterDamage + (levelFactor * 2),
        xpReward: baseMonsterXP + (levelFactor * 10),
        goldReward: baseMonsterGold + (levelFactor * 5),
        element: monsterData.element
    };

    const scaledBoss = {
        name: bossData.name,
        hp: baseBossHP + (levelFactor * 15),
        damage: baseBossDamage + (levelFactor * 5),
        xpReward: baseBossXP + (levelFactor * 30),
        goldReward: baseBossGold + (levelFactor * 15),
        element: bossData.element
    };

    // Crée un objet donjon plus détaillé avec les statistiques ajustées
    const newDungeon = {
        id: closestPOI.id,
        name: `Le donjon de ${closestPOI.name}`,
        location: closestPOI.location,
        difficulty: closestPOI.difficulty,
        type: closestPOI.dungeonType,
        description: dungeonType.description,
        monsters: [scaledMonster],
        boss: scaledBoss,
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