/**
 * @fileoverview Module de gestion de la logique des quêtes du jeu.
 * Gère l'acceptation, la mise à jour de la progression et la complétion des quêtes.
 */

// Importations des données et des modules nécessaires
import { questsData } from '../core/questsData.js';
import { giveRewards } from './rewards.js';
import { defineShelter } from './shelterManager.js';

// =========================================================================
// FONCTIONS PUBLIQUES (EXPORTÉES)
// =========================================================================

/**
 * @typedef {object} CharacterData
 * @property {object} quests
 * @property {object|null} quests.current
 * @property {string} quests.current.questId
 * @property {number} quests.current.currentProgress
 * @property {object} quests.completed
 */

 */
/**
 * Vérifie si la quête pour définir un lieu sûr est active.
 * @param {object} player - L'objet du joueur.
 * @returns {boolean} - Vrai si la quête est active.
 */
export function isSetSafePlaceQuest(player) {
    if (!player || !player.quests) return false;
    const currentQuest = player.quests.current;
    return currentQuest && currentQuest.id === 'lieu_sur' && currentQuest.progress < 1;
}

/**
 * Accepte une quête et la rend active pour le personnage.
 * @param {CharacterData} characterData - Les données complètes du personnage.
 * @param {string} questId - L'ID de la quête à accepter.
 * @returns {CharacterData|null} Les données du personnage mises à jour ou null si la quête ne peut être acceptée.
 */
export const acceptQuest = (characterData, questId) => {
    const questDefinition = questsData[questId];

    if (!questDefinition) {
        console.error(`Erreur: La quête avec l'ID '${questId}' n'existe pas.`);
        return null;
    }
    if (characterData?.quests?.current) {
        console.warn(`Le personnage a déjà une quête en cours : '${characterData.quests.current.title}'.`);
        return null;
    }

    const newQuest = {
        questId,
        currentProgress: 0,
        ...questDefinition
    };

    characterData.quests.current = newQuest;
    console.log(`Quête '${newQuest.title}' acceptée. ✅`);
    return characterData;
};

/**
 * Met à jour la progression d'une quête en cours.
 * @param {CharacterData} characterData - Les données du personnage.
 * @param {string} objectiveAction - L'action de l'objectif (ex: 'define_shelter').
 * @param {any} [payload] - Des données additionnelles.
 * @returns {Promise<CharacterData|null>} Les données du personnage mises à jour ou null en cas d'échec.
 */
export const updateQuestProgress = async (characterData, objectiveAction, payload) => {
    if (!characterData?.quests?.current) {
        console.warn("Pas de quête en cours.");
        return null;
    }

    const { current: currentQuest } = characterData.quests;
    const questDefinition = questsData[currentQuest.questId];

    if (!questDefinition?.objective || questDefinition.objective.action !== objectiveAction) {
        return null;
    }
    
    const { objective } = questDefinition;
    let progressUpdated = false;

    // Utilise une logique de progression pour chaque type d'objectif
    const progressHandlers = {
        "define_shelter": async () => {
            const success = await defineShelter(payload);
            if (success) {
                currentQuest.currentProgress = 1;
                console.log("Objectif 'définir l'abri' accompli. 🎉");
                return true;
            }
            console.warn("Impossible de définir l'abri.");
            return false;
        },
        "gather": () => {
            if (objective.target === payload?.target) {
                currentQuest.currentProgress = (currentQuest.currentProgress || 0) + 1;
                console.log(`Progression de la quête '${questDefinition.title}' : ${currentQuest.currentProgress}/${objective.required}`);
                return true;
            }
            return false;
        }
    };

    if (progressHandlers[objective.action]) {
        progressUpdated = await progressHandlers[objective.action]();
    } else {
        console.warn(`Type d'objectif inconnu : '${objective.action}'.`);
        return null;
    }

    if (progressUpdated && currentQuest.currentProgress >= objective.required) {
        return await completeQuest(characterData);
    }
    
    return characterData;
};

// =========================================================================
// FONCTIONS INTERNES (NON EXPORTÉES)
// =========================================================================

/**
 * Gère la complétion d'une quête.
 * @param {CharacterData} characterData - Les données du personnage.
 * @returns {Promise<CharacterData>} Les données du personnage mises à jour.
 */
const completeQuest = async (characterData) => {
    const currentQuest = characterData.quests.current;
    const questDefinition = questsData[currentQuest.questId];

    console.log(`Quête terminée : '${questDefinition.title}' ! 🏆`);

    await giveRewards(characterData, questDefinition.rewards);

    characterData.quests.completed[currentQuest.questId] = { ...currentQuest, status: 'completed' };
    
    const { nextQuestId } = questDefinition;
    if (nextQuestId) {
        const nextQuestDefinition = questsData[nextQuestId];
        characterData.quests.current = {
            questId: nextQuestId,
            currentProgress: 0,
            ...nextQuestDefinition
        };
        console.log(`Nouvelle quête acceptée : '${nextQuestDefinition.title}'`);
    } else {
        characterData.quests.current = null;
        console.log("Toutes les quêtes de la série sont terminées. 🥳");
    }

    return characterData;
};