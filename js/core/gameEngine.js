// Fichier : js/core/gameEngine.js
// Ce module gère la logique de jeu (récompenses, quêtes, progression).

import { player, setPlayer, saveDungeon, resetDungeon, giveXP, recalculateDerivedStats } from './state.js';
import { questsData } from './questsData.js';
import { itemsData } from './gameData.js';
import { showNotification } from './notifications.js';
import { startNextWaveTimer } from '../modules/waveManager.js';
import { saveCharacterData } from './authManager.js';
import { updateJournalDisplay } from '../modules/ui.js';

let gameInitialized = false;

/**
 * Initialise les composants du jeu après le chargement du personnage.
 */
export function initGame() {
    if (gameInitialized) return;
    gameInitialized = true;

    console.log("Jeu initialisé pour le joueur :", player.name);

    startNextWaveTimer();
    // Ajoutez ici les listeners pour les boutons qui dépendent du joueur
    const upgradeShelterBtn = document.getElementById('upgradeShelterBtn');
    if (upgradeShelterBtn) {
        upgradeShelterBtn.addEventListener('click', async () => {
            if (!player) {
                showNotification("Le personnage n'est pas encore chargé.", "warning");
                return;
            }
            // Exemple d'appel à une fonction de logique de jeu
            // const success = await upgradeShelter('murs');
            // if (success) {
            //     console.log("Amélioration réussie !");
            // } else {
            //     console.log("Échec de l'amélioration.");
            // }
        });
    }

    if (player.journal.length === 0) {
        player.addToJournal(`Bienvenue, ${player.name} ! L'aventure commence.`);
        player.addItem(itemsData["lame_stase"]);
        player.addItem(itemsData["veste_survivant"]);
        player.addItem(itemsData["fragment_ataraxie"]);
        player.addItem(itemsData["mnemonique"]);
        player.startQuest("initial_adventure_quest");
        saveCharacterData(player);
    }
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
    updateJournalDisplay(player);
}

/**
 * Gère les récompenses de quête.
 */
export function giveQuestReward(reward) {
    if (!player) return;
    applyRewards(reward);
}

// Mettre à jour l'état de la quête et vérifier si elle est terminée
export function checkQuestCompletion(questId) {
    if (!player || !player.quests.current || player.quests.current.questId !== questId) return;

    const questDetails = questsData[questId];
    if (player.quests.current.currentProgress >= questDetails.objective.required) {
        player.completeQuest(questId);
        player.addToJournal(`Quête terminée : "${questDetails.title}".`);
        giveQuestReward(questDetails.rewards);
        if (questDetails.nextQuest) {
            player.startQuest(questDetails.nextQuest);
            player.addToJournal(`Nouvelle quête commencée : "${questsData[questDetails.nextQuest].title}".`);
        }
    }
    saveCharacterData(player);
}