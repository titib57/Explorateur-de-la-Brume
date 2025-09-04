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
 * Vérifie si la quête "Établir un abri" est la quête active.
 * Utile pour l'affichage ou pour lier une action spécifique à cette quête.
 * @param {object} characterData - Les données complètes du personnage.
 * @returns {boolean} Vrai si la quête est active et a l'ID "set_shelter", sinon faux.
 */
export const isSetSafePlaceQuest = (characterData) => {
    const currentQuest = characterData?.quests?.current;
    // Supposons que l'ID de la quête pour l'abri est "set_shelter"
    return currentQuest?.questId === 'set_shelter';
};

/**
 * Accepte une quête et la rend active pour le personnage.
 * @param {object} characterData - Les données complètes du personnage.
 * @param {string} questId - L'ID de la quête à accepter.
 * @returns {object|null} Les données du personnage mises à jour ou null si la quête ne peut être acceptée.
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

    characterData.quests.current = {
        questId,
        currentProgress: 0,
        ...questDefinition
    };
    console.log(`Quête '${questDefinition.title}' acceptée. ✅`);
    return characterData;
};

/**
 * Met à jour la progression d'une quête en cours.
 * Cette fonction est le point d'entrée pour toutes les actions de progression.
 * @param {object} characterData - Les données du personnage.
 * @param {string} objectiveAction - L'action de l'objectif (ex: 'define_shelter').
 * @param {any} [payload] - Des données additionnelles nécessaires (ex: la position du joueur).
 * @returns {Promise<object|null>} Les données du personnage mises à jour ou null en cas d'échec.
 */
export const updateQuestProgress = async (characterData, objectiveAction, payload) => {
    if (!characterData?.quests?.current) {
        console.warn("Pas de quête en cours.");
        return null;
    }

    const currentQuest = characterData.quests.current;
    const questDefinition = questsData[currentQuest.questId];

    if (!questDefinition?.objective) {
        console.error("Définition de quête ou objectif invalide.");
        return null;
    }
    
    const { objective } = questDefinition;

    // Vérifie si l'action fournie correspond à l'objectif de la quête
    if (objective.action !== objectiveAction) {
        return null;
    }

    let progressMade = false;

    switch (objective.action) {
        case "define_shelter":
            const success = await defineShelter(payload);
            if (success) {
                currentQuest.currentProgress = 1;
                console.log("Objectif 'définir l'abri' accompli. 🎉");
                progressMade = true;
            } else {
                console.warn("Impossible de définir l'abri. Il peut déjà exister.");
            }
            break;

        case "gather":
            if (objective.target && objective.target === payload?.target) {
                currentQuest.currentProgress = (currentQuest.currentProgress || 0) + 1;
                console.log(`Progression de la quête '${questDefinition.title}' : ${currentQuest.currentProgress}/${objective.required}`);
                progressMade = true;
            }
            break;
            
        default:
            console.warn(`Type d'objectif inconnu : '${objective.action}'.`);
            return null;
    }

    // Après l'incrémentation, vérifie si la quête est terminée.
    if (progressMade && currentQuest.currentProgress >= objective.required) {
        return await completeQuest(characterData);
    }
    
    return characterData;
};

// =========================================================================
// FONCTIONS INTERNES (NON EXPORTÉES)
// =========================================================================

/**
 * Gère la complétion d'une quête.
 * @param {object} characterData - Les données du personnage.
 * @returns {Promise<object>} Les données du personnage mises à jour.
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