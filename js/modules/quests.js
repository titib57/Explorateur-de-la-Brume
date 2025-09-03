/**
 * @fileoverview Module de gestion de la logique des quêtes du jeu.
 * Gère l'acceptation, la mise à jour de la progression et la complétion des quêtes.
 */

// Importations des données et des modules nécessaires
import { questsData } from '../core/questsData.js';
import { giveRewards } from './rewards.js'; // Supposons un nouveau module de récompenses
import { shelterManager } from './shelterManager.js';

// =========================================================================
// GESTION DES QUÊTES
// =========================================================================

/**
 * Accepte une quête et la rend active pour le personnage.
 * @param {Object} characterData - Les données complètes du personnage.
 * @param {string} questId - L'ID de la quête à accepter.
 * @returns {Object|null} Les données du personnage mises à jour ou null si la quête ne peut être acceptée.
 */
export function acceptQuest(characterData, questId) {
    const questDefinition = questsData[questId];

    // Vérifie si la quête existe et s'il n'y a pas déjà de quête en cours
    if (!questDefinition) {
        console.error(`Erreur: La quête avec l'ID '${questId}' n'existe pas.`);
        return null;
    }
    if (characterData.quests.current) {
        console.warn(`Le personnage a déjà une quête en cours : '${characterData.quests.current.title}'.`);
        return null;
    }

    // Initialise la quête pour le personnage
    characterData.quests.current = {
        questId: questId,
        currentProgress: 0,
        ...questDefinition // Ajoute les propriétés de la définition de quête
    };
    console.log(`Quête '${questDefinition.title}' acceptée.`);
    return characterData;
}

/**
 * Met à jour la progression d'une quête en cours.
 * Cette fonction est le point d'entrée pour toutes les actions de progression.
 * @param {Object} characterData - Les données du personnage.
 * @param {string} objectiveType - Le type de l'objectif (ex: 'validate_current_location').
 * @param {any} [payload] - Des données additionnelles nécessaires (ex: la position du joueur).
 * @returns {Object|null} Les données du personnage mises à jour ou null en cas d'échec.
 */
export function updateQuestProgress(characterData, objectiveType, payload) {
    if (!characterData || !characterData.quests.current) {
        console.warn("Pas de quête en cours.");
        return null;
    }

    const currentQuest = characterData.quests.current;
    const questDefinition = questsData[currentQuest.questId];
    const objective = questDefinition.objective;

    if (objective.type !== objectiveType) {
        // L'action ne correspond pas à l'objectif en cours, on ne fait rien
        return null;
    }

    // Gère la logique spécifique à chaque type d'objectif
    switch (objective.action) {
        case "define_shelter":
            const success = shelterManager.defineShelter(payload); // 'payload' est la position du joueur
            if (success) {
                currentQuest.currentProgress = 1;
                console.log("Objectif 'définir l'abri' accompli.");
            } else {
                console.warn("Impossible de définir l'abri. L'objectif pourrait être déjà terminé ou la position est invalide.");
            }
            break;
        
        default:
            // Logique par défaut pour les quêtes de type 'récolter', 'vaincre', etc.
            // On incrémente la progression si la cible correspond
            if (objective.target && objective.target === payload.target) {
                currentQuest.currentProgress = (currentQuest.currentProgress || 0) + 1;
                console.log(`Progression de la quête '${questDefinition.title}' : ${currentQuest.currentProgress}/${objective.required}`);
            }
            break;
    }

    // Vérifie si la quête est terminée
    if (currentQuest.currentProgress >= objective.required) {
        return completeQuest(characterData);
    }
    
    return characterData;
}

/**
 * Gère la complétion d'une quête et le passage à la suivante.
 * @param {Object} characterData - Les données du personnage.
 * @returns {Object} Les données du personnage mises à jour.
 */
function completeQuest(characterData) {
    const currentQuest = characterData.quests.current;
    const questDefinition = questsData[currentQuest.questId];

    console.log(`Quête terminée : '${questDefinition.title}' !`);

    // 1. Donne les récompenses
    giveRewards(characterData, questDefinition.rewards);

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
        characterData.quests.current = null; // Aucune quête en cours
    }

    return characterData;
}