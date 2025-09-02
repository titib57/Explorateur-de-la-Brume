// Fichier : js/core/dungeon.js

// Importations des données et des utilitaires nécessaires
import { pointsOfInterest, dungeonTypes, monstersData, bossesData } from './gameData.js';
import { questsData } from './quests.js';
import { showNotification } from './notifications.js';
import { currentDungeon, player, savePlayer } from './state.js';

/**
 * Calcule la distance entre deux points géographiques en utilisant la formule de Haversine simplifiée.
 * Cette fonction est utile pour déterminer le point d'intérêt le plus proche du joueur.
 * @param {object} loc1 Le premier emplacement { lat, lng }.
 * @param {object} loc2 Le deuxième emplacement { lat, lng }.
 * @returns {number} La distance entre les deux points en mètres.
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
 * @returns {boolean} Renvoie true si un donjon a été généré avec succès, sinon false.
 */
export function generateDungeon(locationInfo) {
    let dungeonToGenerate;
    let closestPOI = null;
    const isTutorial = locationInfo === 'tutoriel';

    if (isTutorial) {
        // Logique spécifique pour le donjon de tutoriel
        dungeonToGenerate = dungeonTypes['tutoriel'];
        closestPOI = pointsOfInterest['tutorial_dungeon_poi'];
    } else {
        // Logique pour les donjons dynamiques basés sur la géolocalisation
        let minDistance = Infinity;

        for (const poiId in pointsOfInterest) {
            const poi = pointsOfInterest[poiId];
            if (!poi.isTutorial) { // On s'assure de ne pas considérer le POI de tutoriel ici
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

    let dungeonData;

    if (isTutorial) {
        // Configuration du donjon de tutoriel
        const tutorialMonster = monstersData['mannequin_dentrainement'];
        const tutorialBoss = bossesData['mannequin_dentrainement'];
        
        dungeonData = {
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
    } else {
        // Configuration du donjon dynamique
        const monsterPool = dungeonToGenerate.monsterPool.map(id => monstersData[id]);
        const bossPool = dungeonToGenerate.bossPool.map(id => bossesData[id]);

        // Sélectionne un monstre et un boss au hasard du pool
        const selectedMonsterData = monsterPool[Math.floor(Math.random() * monsterPool.length)];
        const selectedBossData = bossPool[Math.floor(Math.random() * bossPool.length)];
        
        const playerLevel = player.level;
        // Le facteur de niveau est utilisé pour la mise à l'échelle des stats
        const levelFactor = playerLevel > 0 ? playerLevel - 1 : 0;

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

        dungeonData = {
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

        // Gérer la quête dynamique
        const newQuestId = closestPOI.questId;
        const newQuest = questsData[newQuestId];

        // On vérifie si la quête existe et si le joueur ne l'a pas déjà
        if (newQuest && (!player.quests || !player.quests[newQuestId])) {
            if (!player.quests) {
                player.quests = {};
            }
            player.quests[newQuestId] = { ...newQuest };
            showNotification(`Nouvelle quête acceptée : ${newQuest.name}`, 'quest');
            savePlayer(player); // Sauvegarde le joueur après avoir ajouté la quête
        }
    }

    // Mise à jour de l'état du jeu avec le nouveau donjon
    // Note : Modifier une variable globale (currentDungeon) peut rendre le débogage difficile.
    // Une meilleure pratique serait que cette fonction retourne le donjon et que l'appelant
    // (par exemple, la fonction principale du jeu) gère l'état.
    localStorage.setItem('currentDungeon', JSON.stringify(dungeonData));
    showNotification(`Vous entrez dans ${dungeonData.name}! ${dungeonData.description}`, 'info');
    currentDungeon = dungeonData;

    return true;
}
