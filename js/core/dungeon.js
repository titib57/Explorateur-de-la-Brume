/**
 * @fileoverview Module de gestion des donjons.
 * Gère la génération de donjons et leur interaction avec le joueur en utilisant Firestore.
 */

// Importations des données et des utilitaires nécessaires
import { pointsOfInterest, dungeonTypes, monstersData, bossesData } from './gameData.js';
import { questsData } from './questsData.js';
import { showNotification } from './notifications.js';

// Importations Firebase
import { doc, runTransaction } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
// Assurez-vous d'importer votre instance de base de données Firestore
import { db } from './firebase_config.js';

/**
 * Calcule la distance entre deux points géographiques en utilisant la formule de Haversine simplifiée.
 * @param {object} loc1 Le premier emplacement { lat, lng }.
 * @param {object} loc2 Le deuxième emplacement { lat, lng }.
 * @returns {number} La distance entre les deux points en mètres.
 */
function calculateDistance(loc1, loc2) {
    const R = 6371e3; // Rayon de la Terre en mètres
    const toRad = (deg) => deg * Math.PI / 180;

    const lat1 = toRad(loc1.lat);
    const lat2 = toRad(loc2.lat);
    const deltaLat = toRad(loc2.lat - loc1.lat);
    const deltaLon = toRad(loc2.lng - loc1.lng);

    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance en mètres
}

/**
 * Crée un objet de données de donjon avec des statistiques mises à l'échelle en fonction du niveau du joueur.
 * @param {object} poi - Le point d'intérêt.
 * @param {object} dungeonType - Le type de donjon.
 * @param {number} playerLevel - Le niveau du joueur.
 * @returns {object} Un objet de données de donjon prêt à être sauvegardé.
 */
function createDungeonData(poi, dungeonType, playerLevel) {
    const isTutorial = poi.isTutorial;
    const levelFactor = Math.max(0, playerLevel - 1);

    const monsterBase = monstersData[dungeonType.monsterPool[Math.floor(Math.random() * dungeonType.monsterPool.length)]];
    const bossBase = bossesData[dungeonType.bossPool[Math.floor(Math.random() * dungeonType.bossPool.length)]];

    // Les monstres de tutoriel n'ont pas d'échelle
    const monsterToScale = isTutorial ? monstersData['mannequin_dentrainement'] : monsterBase;
    const bossToScale = isTutorial ? bossesData['mannequin_dentrainement'] : bossBase;

    // Fonction utilitaire pour la mise à l'échelle des entités
    const scaleEntity = (entity) => ({
        ...entity,
        hp: entity.hp + (levelFactor * (isTutorial ? 0 : 5)),
        attack: entity.attack + (levelFactor * (isTutorial ? 0 : 2)),
        defense: entity.defense + (levelFactor * (isTutorial ? 0 : 1)),
        xpReward: entity.xpReward + (levelFactor * (isTutorial ? 0 : 10)),
        goldReward: entity.goldReward + (levelFactor * (isTutorial ? 0 : 5))
    });

    const scaledMonster = scaleEntity(monsterToScale);
    const scaledBoss = scaleEntity(bossToScale);
    
    return {
        id: poi.id,
        name: isTutorial ? poi.name : `Le donjon de ${poi.name}`,
        location: poi.location,
        difficulty: poi.difficulty,
        type: poi.dungeonType,
        description: dungeonType.description,
        monsters: [scaledMonster],
        boss: scaledBoss,
        isTutorial: isTutorial,
        rewards: dungeonType.rewards
    };
}

/**
 * Génère un donjon pour le joueur et met à jour son état sur Firestore.
 * Cette fonction utilise une transaction pour garantir la cohérence des données.
 * @param {string} characterId L'ID unique du personnage.
 * @param {object|string} locationInfo La position du joueur { lat, lng } ou la chaîne de caractères 'tutoriel'.
 * @returns {Promise<boolean>} Vrai si un donjon a été généré et sauvegardé, faux sinon.
 */
export async function generateDungeon(characterId, locationInfo) {
    const characterRef = doc(db, 'characters', characterId);

    try {
        await runTransaction(db, async (transaction) => {
            const characterDoc = await transaction.get(characterRef);
            if (!characterDoc.exists()) {
                throw new Error("Le document du personnage n'existe pas.");
            }
            const characterData = characterDoc.data();
            const playerLevel = characterData.stats?.level || 1;

            let closestPOI;
            const isTutorial = locationInfo === 'tutoriel';

            if (isTutorial) {
                closestPOI = pointsOfInterest['tutorial_dungeon_poi'];
            } else {
                const nonTutorialPOIs = Object.values(pointsOfInterest).filter(poi => !poi.isTutorial);
                if (nonTutorialPOIs.length === 0) {
                    throw new Error("Aucun lieu remarquable à proximité !");
                }
                
                // Trouve le POI le plus proche de manière plus efficace
                closestPOI = nonTutorialPOIs.reduce((closest, current) => {
                    const currentDistance = calculateDistance(locationInfo, current.location);
                    if (!closest || currentDistance < closest.distance) {
                        return { poi: current, distance: currentDistance };
                    }
                    return closest;
                }, null).poi;
            }

            const dungeonType = dungeonTypes[closestPOI.dungeonType];
            if (!dungeonType) {
                throw new Error(`Type de donjon non défini pour le POI : ${closestPOI.name}`);
            }
            
            const dungeonData = createDungeonData(closestPOI, dungeonType, playerLevel);

            const updates = {
                currentDungeon: dungeonData,
            };

            const newQuestId = closestPOI.questId;
            if (newQuestId) {
                const newQuest = questsData[newQuestId];
                const quests = characterData.quests || {};
                const completedQuests = quests.completed || {};
                
                if (newQuest && !quests.current && !completedQuests[newQuestId]) {
                    updates['quests.current'] = {
                        questId: newQuestId,
                        currentProgress: 0,
                        ...newQuest
                    };
                    showNotification(`Nouvelle quête acceptée : ${newQuest.name}`, 'quest');
                }
            }

            transaction.update(characterRef, updates);
            showNotification(`Vous entrez dans ${dungeonData.name}! ${dungeonData.description}`, 'info');
        });
        return true;
    } catch (e) {
        console.error("Échec de la génération du donjon :", e.message);
        showNotification(`Échec de la génération du donjon : ${e.message}`, 'error');
        return false;
    }
}