/**
 * @fileoverview Module de gestion des donjons.
 * Gère la génération de donjons et leur interaction avec le joueur en utilisant Firestore.
 */

// Importations des données et des utilitaires nécessaires
import { pointsOfInterest, dungeonTypes, monstersData, bossesData } from './gameData.js';
import { questsData } from './questsData.js';
import { showNotification } from './notifications.js';

// Importations Firebase
import { doc, runTransaction } from "firebase/firestore";
// Assurez-vous d'importer votre instance de base de données Firestore
import { db } from '../core/firebaseConfig.js'; 

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
 * Génère un donjon pour le joueur et met à jour son état sur Firestore.
 * Cette fonction utilise une transaction pour garantir la cohérence des données du personnage.
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

            let dungeonToGenerate;
            let closestPOI = null;
            const isTutorial = locationInfo === 'tutoriel';

            if (isTutorial) {
                dungeonToGenerate = dungeonTypes['tutoriel'];
                closestPOI = pointsOfInterest['tutorial_dungeon_poi'];
            } else {
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
                    throw new Error("Aucun lieu remarquable à proximité !");
                }
                dungeonToGenerate = dungeonTypes[closestPOI.dungeonType];
            }

            if (!dungeonToGenerate) {
                throw new Error("Type de donjon non défini.");
            }

            const levelFactor = playerLevel > 0 ? playerLevel - 1 : 0;
            let dungeonData;

            if (isTutorial) {
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
                const monsterPool = dungeonToGenerate.monsterPool.map(id => monstersData[id]);
                const bossPool = dungeonToGenerate.bossPool.map(id => bossesData[id]);
                const selectedMonsterData = monsterPool[Math.floor(Math.random() * monsterPool.length)];
                const selectedBossData = bossPool[Math.floor(Math.random() * bossPool.length)];
                
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
            }

            // Gérer la quête dynamique et la sauvegarder
            const newQuestId = closestPOI.questId;
            const newQuest = questsData[newQuestId];
            const quests = characterData.quests || {};
            const completedQuests = quests.completed || {};
            
            // On vérifie si la quête existe et si elle n'est pas déjà en cours ou terminée
            if (newQuest && !quests.current && !completedQuests[newQuestId]) {
                const updatedQuests = {
                    ...quests,
                    current: {
                        questId: newQuestId,
                        currentProgress: 0,
                        ...newQuest
                    }
                };
                transaction.update(characterRef, { quests: updatedQuests });
                showNotification(`Nouvelle quête acceptée : ${newQuest.name}`, 'quest');
            }

            // Enregistrer le donjon dans l'état du personnage sur Firestore
            const updatedData = {
                'quests.currentDungeon': dungeonData,
            };
            transaction.update(characterRef, updatedData);

            showNotification(`Vous entrez dans ${dungeonData.name}! ${dungeonData.description}`, 'info');
        });
        return true;
    } catch (e) {
        console.error("Échec de la génération du donjon :", e.message);
        showNotification(e.message, 'error');
        return false;
    }
}