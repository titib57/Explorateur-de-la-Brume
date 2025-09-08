// Fichier : js/core/gameEngine.js
// Ce module gère la logique de jeu (récompenses, quêtes, progression).

import { player, recalculateDerivedStats } from './state.js';
import { questsData } from './questsData.js';
import { itemsData } from './gameData.js';
import { showNotification } from './notifications.js';
import { saveCharacterData } from './authManager.js';
import { updateUIBasedOnPage } from '../modules/ui.js';

let gameInitialized = false;

/**
 * Initialise les composants du jeu après le chargement du personnage.
 */
export function initGame() {
    if (gameInitialized) return;
    gameInitialized = true;
    console.log("Jeu initialisé pour le joueur :", player.name);
}

/**
 * Applique les récompenses au joueur.
 * @param {object} rewards L'objet des récompenses (xp, gold, item).
 */
export function applyRewards(rewards) {
    if (!player) return;
    if (rewards.xp) {
        player.addXp(rewards.xp);
        player.addToJournal(`Vous gagnez ${rewards.xp} XP.`);
        if (player.xp >= player.xpToNextLevel) {
            player.levelUp();
            player.addToJournal(`Vous avez atteint le niveau ${player.level}.`);
            recalculateDerivedStats(player);
            showNotification(`Montée de niveau ! Vous êtes maintenant niveau ${player.level} !`, 'success');
            showNotification(`Vous avez reçu 3 points de statistique.`, 'info');
        }
    }
    if (rewards.gold) {
        player.gold += rewards.gold;
        player.addToJournal(`Vous avez trouvé ${rewards.gold} pièces d'or.`);
        showNotification(`Vous avez trouvé ${rewards.gold} pièces d'or.`, 'info');
    }
    if (rewards.items) {
        rewards.items.forEach(item => {
            const itemDetails = itemsData[item.itemId];
            if (itemDetails) {
                player.addItem({ ...itemDetails, quantity: item.quantity });
            }
        });
    }
    saveCharacterData(player);
    updateUIBasedOnPage(player);
}

/**
 * Gère les récompenses de quête.
 */
export function giveQuestReward(reward) {
    if (!player) return;
    applyRewards(reward);
}

/**
 * Met à jour l'état de la quête et vérifie si elle est terminée.
 * @param {string} questId L'ID de la quête.
 */
export function checkQuestCompletion(questId) {
    if (!player || !player.quests.current || player.quests.current.questId !== questId) return;

    const questDetails = questsData[questId];
    if (player.quests.current.currentProgress >= questDetails.objective.required) {
        player.completeQuest();
        player.addToJournal(`Quête terminée : "${questDetails.title}".`);
        giveQuestReward(questDetails.rewards);
        if (questDetails.nextQuest) {
            player.startQuest(questDetails.nextQuest);
            player.addToJournal(`Nouvelle quête commencée : "${questsData[questDetails.nextQuest].title}".`);
        }
    }
    saveCharacterData(player);
    updateUIBasedOnPage(player);
}

// Nouvelle fonction pour accepter une quête depuis l'UI
export function acceptQuest(questId) {
    if (!player) {
        showNotification("Vous devez avoir un personnage pour accepter une quête.", 'warning');
        return;
    }
    if (player.quests.current) {
        showNotification("Vous avez déjà une quête en cours. Terminez-la d'abord !", "warning");
        return;
    }
    player.startQuest(questId);
    player.addToJournal(`Quête "${questsData[questId].title}" acceptée !`);
    saveCharacterData(player);
    updateUIBasedOnPage(player);
    showNotification(`Quête "${questsData[questId].title}" acceptée !`, "success");
}

/**
 * Met à jour la progression d'une quête et vérifie si elle est terminée.
 * @param {string} objectiveAction Le type d'action.
 */
export function updateQuestProgress(objectiveAction) {
    if (!player || !player.quests.current) return;
    const currentQuestData = questsData[player.quests.current.questId];
    if (currentQuestData.objective.action === objectiveAction) {
        player.updateQuestProgress(1); // Met à jour la progression d'une unité
    }
    checkQuestCompletion(player.quests.current.questId);
}