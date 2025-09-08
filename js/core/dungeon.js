// Fichier : js/core/dungeon.js
// Ce module gère la logique de la génération de donjons et leur persistance.

// Importations des données et des utilitaires nécessaires
import { pointsOfInterest, questsData } from './questsData.js'; // Assurez-vous d'avoir ce point d'entrée pour les données
import { showNotification } from './notifications.js';
import { createDungeonData } from './dungeonGenerator.js';
import { calculateDistance } from '../utils/geoUtils.js';

// Importations Firebase
import { doc, runTransaction } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { db } from './firebase_config.js';

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