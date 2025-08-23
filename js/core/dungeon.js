// Fichier : js/core/dungeon.js

import { pointsOfInterest, dungeonTypes, monstersData, bossesData, questsData } from './gameData.js';
import { showNotification } from './notifications.js';
import { currentDungeon, player, saveCharacter } from './state.js';

/**
 * Calcule la distance entre deux points géographiques (formule de Haversine simplifiée).
 * @param {object} loc1 Le premier emplacement { lat, lng }.
 * @param {object} loc2 Le deuxième emplacement { lat, lng }.
 */
function calculateDistance(loc1, loc2) {
    const R = 6371e3; // Rayon de la Terre en mètres
    const lat1 = loc1.lat * Math.PI / 180;
    const lat2 = loc2.lat * Math.PI / 180;
    const deltaLat = (loc2.lat - loc1.lat) * Math.PI / 180;
    const deltaLon = (loc2.lng - loc1.lng) * Math.PI / 180;

    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance en mètres
}


/**
 * Génère un donjon pour le joueur, soit un donjon de tutoriel, soit un donjon dynamique basé sur la position.
 * @param {object|string} locationInfo L'objet de position du joueur { lat, lng } ou la chaîne de caractères 'tutoriel'.
 */
export function generateDungeon(locationInfo) {
    let dungeonToGenerate;
    let closestPOI = null;
    let isTutorial = false;

    if (locationInfo === 'tutoriel') {
        dungeonToGenerate = dungeonTypes['tutoriel'];
        closestPOI = pointsOfInterest['tutorial_dungeon_poi'];
        isTutorial = true;
    } else {
        // Logique pour les donjons dynamiques basés sur la géolocalisation
        let minDistance = Infinity;

        for (const poiId in pointsOfInterest) {
            const poi = pointsOfInterest[poiId];
            if (!poi.isTutorial) {
                const distance = calculateDistance(locationInfo, poi.location);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestPOI = poi;
                }
            }
        }
        
        if (!closestPOI) {
            showNotification("Aucun lieu remarquable à proximité !", 'error');
            return false;
        }

        dungeonToGenerate = dungeonTypes[closestPOI.dungeonType];
    }

    if (!dungeonToGenerate) {
        showNotification("Type de donjon non défini.", 'error');
        return false;
    }

    // Récupérer le pool de monstres et de boss
    const monsterPool = dungeonToGenerate.monsterPool.map(id => monstersData[id]);
    const bossPool = dungeonToGenerate.bossPool.map(id => bossesData[id]);

    // Sélectionne un monstre et un boss au hasard du pool
    const selectedMonsterData = monsterPool[Math.floor(Math.random() * monsterPool.length)];
    const selectedBossData = bossPool[Math.floor(Math.random() * bossPool.length)];
    
    // Si c'est le donjon de tutoriel, on s'assure que le monstre et le boss sont le mannequin
    if (isTutorial) {
        const tutorialMonster = monstersData['mannequin_dentrainement'];
        const tutorialBoss = bossesData['mannequin_dentrainement'];

        const newDungeon = {
            id: closestPOI.id,
            name: closestPOI.name,
            location: closestPOI.location,
            difficulty: closestPOI.difficulty,
            type: closestPOI.dungeonType,
            description: dungeonToGenerate.description,
            monsters: [tutorialMonster],
            boss: tutorialBoss,
            isTutorial: true,
            rewards: dungeonToGenerate.rewards
        };
        
        localStorage.setItem('currentDungeon', JSON.stringify(newDungeon));
        showNotification(`Vous entrez dans le Donjon de Tutoriel ! ${newDungeon.description}`, 'info');
        currentDungeon = newDungeon;
        return true;
    }

    const playerLevel = player.level;
    const levelFactor = playerLevel - 1;

    // Mise à l'échelle des monstres et du boss en fonction du niveau du joueur
    const scaledMonster = {
        ...selectedMonsterData,
        hp: selectedMonsterData.hp + (levelFactor * 5),
        attack: selectedMonsterData.attack + (levelFactor * 2),
        defense: selectedMonsterData.defense + (levelFactor * 1),
        xpReward: selectedMonsterData.xpReward + (levelFactor * 10),
        goldReward: selectedMonsterData.goldReward + (levelFactor * 5)
    };

    const scaledBoss = {
        ...selectedBossData,
        hp: selectedBossData.hp + (levelFactor * 15),
        attack: selectedBossData.attack + (levelFactor * 5),
        defense: selectedBossData.defense + (levelFactor * 3),
        xpReward: selectedBossData.xpReward + (levelFactor * 30),
        goldReward: selectedBossData.goldReward + (levelFactor * 15)
    };

    const newDungeon = {
        id: closestPOI.id,
        name: `Le donjon de ${closestPOI.name}`,
        location: closestPOI.location,
        difficulty: closestPOI.difficulty,
        type: closestPOI.dungeonType,
        description: dungeonToGenerate.description,
        monsters: [scaledMonster],
        boss: scaledBoss,
        rewards: dungeonToGenerate.rewards
    };

    localStorage.setItem('currentDungeon', JSON.stringify(newDungeon));
    showNotification(`Vous entrez dans ${newDungeon.name}! ${newDungeon.description}`, 'info');
    currentDungeon = newDungeon;
    
    // Gérer la quête dynamique
    const newQuestId = closestPOI.questId;
    const newQuest = questsData[newQuestId];

    if (newQuest && (!player.quests || !player.quests[newQuestId])) {
        if (!player.quests) {
            player.quests = {};
        }
        player.quests[newQuestId] = { ...newQuest };
        showNotification(`Nouvelle quête acceptée : ${newQuest.name}`, 'quest');
        saveCharacter();
    }
    return true;
}