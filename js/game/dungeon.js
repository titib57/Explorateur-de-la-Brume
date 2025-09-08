// Fichier : js/game/dungeon.js
// Ce module gère la logique de la génération de donjons et leur persistance.

// Importations des données et des utilitaires nécessaires
import { questsData } from '../data/questsData.js';
import { dungeonTypes, pointsOfInterest } from '../data/gameData.js';
import { showNotification } from '../core/notifications.js';
import { createDungeonData } from './dungeonGenerator.js';
import { calculateDistance } from '../utils/geoUtils.js';

// Importations de l'état central
import { getDB, getUserId } from '../core/state.js';
import { doc, runTransaction } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

/**
 * Génère un donjon pour le joueur et met à jour son état sur Firestore.
 * @param {object|string} locationInfo La position du joueur { lat, lng } ou la chaîne de caractères 'tutoriel'.
 * @returns {Promise<boolean>} Vrai si un donjon a été généré et sauvegardé, faux sinon.
 */
export async function generateDungeon(locationInfo) {
    const userId = getUserId();
    const db = getDB();

    if (!userId) {
        showNotification("Impossible de générer un donjon : utilisateur non connecté.", 'error');
        return false;
    }

    const characterRef = doc(db, "artifacts", "default-app-id", "users", userId, "characters", userId);

    try {
        await runTransaction(db, async (transaction) => {
            const characterDoc = await transaction.get(characterRef);
            if (!characterDoc.exists()) {
                throw new Error("Le document du personnage n'existe pas.");
            }
            const characterData = characterDoc.data();
            const playerLevel = characterData.level || 1;

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
                
                // N'ajoute la quête que si le joueur n'en a pas déjà une active
                // et n'a pas déjà terminé celle-ci.
                if (newQuest && !quests.current && !completedQuests[newQuestId]) {
                    updates['quests.current'] = {
                        questId: newQuestId,
                        currentProgress: 0,
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