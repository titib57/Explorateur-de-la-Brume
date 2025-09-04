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
 * @param {Object} characterData - Les données complètes du personnage.
 * @returns {boolean} Vrai si la quête est active et a l'ID "set_shelter", sinon faux.
 */
export function isSetSafePlaceQuest(characterData) {
    const currentQuest = characterData.quests.current;
    // Supposons que l'ID de la quête pour l'abri est "set_shelter"
    return currentQuest && currentQuest.questId === 'set_shelter';
}

/**
 * Accepte une quête et la rend active pour le personnage.
 * @param {Object} characterData - Les données complètes du personnage.
 * @param {string} questId - L'ID de la quête à accepter.
 * @returns {Object|null} Les données du personnage mises à jour ou null si la quête ne peut être acceptée.
 */
export function acceptQuest(characterData, questId) {
    const questDefinition = questsData[questId];

    if (!questDefinition) {
        console.error(`Erreur: La quête avec l'ID '${questId}' n'existe pas.`);
        return null;
    }
    if (characterData.quests.current) {
        console.warn(`Le personnage a déjà une quête en cours : '${characterData.quests.current.title}'.`);
        return null;
    }

    characterData.quests.current = {
        questId: questId,
        currentProgress: 0,
        ...questDefinition
    };
    console.log(`Quête '${questDefinition.title}' acceptée. ✅`);
    return characterData;
}

/**
 * Met à jour la progression d'une quête en cours.
 * Cette fonction est le point d'entrée pour toutes les actions de progression.
 * C'est une fonction asynchrone car elle utilise 'defineShelter' qui l'est.
 * @param {Object} characterData - Les données du personnage.
 * @param {string} objectiveAction - L'action de l'objectif (ex: 'define_shelter').
 * @param {any} [payload] - Des données additionnelles nécessaires (ex: la position du joueur).
 * @returns {Promise<Object|null>} Les données du personnage mises à jour ou null en cas d'échec.
 */
export async function updateQuestProgress(characterData, objectiveAction, payload) {
    if (!characterData || !characterData.quests.current) {
        console.warn("Pas de quête en cours.");
        return null;
    }

    const currentQuest = characterData.quests.current;
    const questDefinition = questsData[currentQuest.questId];
    if (!questDefinition || !questDefinition.objective) {
        console.error("Définition de quête ou objectif invalide.");
        return null;
    }
    const objective = questDefinition.objective;

    // Vérifie si l'action fournie correspond à l'objectif de la quête
    if (objective.action !== objectiveAction) {
        return null; // L'action ne correspond pas à l'objectif en cours, on ne fait rien.
    }

    let progressMade = false;

    switch (objective.action) {
        case "define_shelter":
            // Appel de la fonction asynchrone et attente du résultat
            const success = await defineShelter(payload); 
            if (success) {
                currentQuest.currentProgress = 1;
                console.log("Objectif 'définir l'abri' accompli. 🎉");
                progressMade = true;
            } else {
                console.warn("Impossible de définir l'abri. Il peut déjà exister.");
            }
            break;

        case "gather": // Exemple d'un autre type d'objectif
            if (objective.target && objective.target === payload.target) {
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
}

// =========================================================================
// FONCTIONS INTERNES (NON EXPORTÉES)
// =========================================================================

/**
 * Gère la complétion d'une quête.
 * C'est une fonction interne qui doit être appelée après une mise à jour réussie.
 * @param {Object} characterData - Les données du personnage.
 * @returns {Promise<Object>} Les données du personnage mises à jour.
 */
async function completeQuest(characterData) {
    const currentQuest = characterData.quests.current;
    const questDefinition = questsData[currentQuest.questId];

    console.log(`Quête terminée : '${questDefinition.title}' ! 🏆`);

    // 1. Donne les récompenses (rendu asynchrone si giveRewards l'est)
    await giveRewards(characterData, questDefinition.rewards);

    // 2. Déplace la quête vers la liste des quêtes terminées
    characterData.quests.completed[currentQuest.questId] = { ...currentQuest, status: 'completed' };
    
    // 3. Définir la prochaine quête si elle existe
    const nextQuestId = questDefinition.nextQuestId;
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
}