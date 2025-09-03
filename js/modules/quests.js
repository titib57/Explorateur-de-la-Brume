// Fichier : js/quests.js

// Importation des dépendances nécessaires pour la gestion des quêtes.
import { player, savePlayer, loadCharacter, giveQuestReward, giveXP } from '../core/state.js';
import { initialQuest } from '../core/questsData.js';
import { showNotification } from '../core/notifications.js';

// =========================================================================
// LOGIQUE DE GESTION DES QUÊTES
// =========================================================================

/**
 * Met à jour la progression de l'objectif d'une quête active.
 * Cette fonction est appelée depuis d'autres modules de jeu (par exemple, après avoir vaincu un monstre).
 * @param {string} objectiveType Le type d'objectif de la quête à mettre à jour.
 * @param {string} target Le nom de la cible de l'objectif (ex: 'mannequin_dentrainement').
 * @param {number} amount Le montant à ajouter à l'objectif (ex: 1 pour un monstre tué).
 */
export function updateQuestObjective(objectiveType, target, amount = 1) {
    if (!player || !player.quests.current) {
        return;
    }

    const currentQuestData = questsData[player.quests.current];
    if (!currentQuestData) {
        console.error(`Erreur: La quête '${player.quests.current}' n'existe pas dans questsData.`);
        return;
    }

    // Vérifie si le type d'objectif et la cible correspondent
    if (currentQuestData.objective.type === objectiveType && currentQuestData.objective.target === target) {
        // Incrémente la progression de la quête active du joueur.
        const currentProgress = player.quests.currentProgress || 0;
        player.quests.currentProgress = currentProgress + amount;

        const required = currentQuestData.objective.required;
        
        // Affiche une notification de l'état de la progression.
        showNotification(`Progression de la quête '${currentQuestData.name}' : ${player.quests.currentProgress}/${required}`, 'info');

        // Sauvegarde l'état du joueur après la mise à jour de la progression.
        savePlayer(player);

        // Vérifie si la quête est terminée.
        if (player.quests.currentProgress >= required) {
            checkQuestCompletion();
        }
    }
}

/**
 * Vérifie si la quête en cours est terminée et gère la logique de complétion.
 */
function checkQuestCompletion() {
    if (!player || !player.quests.current) {
        return;
    }

    const currentQuestId = player.quests.current;
    const currentQuestData = questsData[currentQuestId];

    if (!currentQuestData) {
        console.error(`Erreur: La quête '${currentQuestId}' n'existe pas dans questsData.`);
        return;
    }

    if (player.quests.currentProgress >= currentQuestData.objective.required) {
        showNotification(`Quête terminée : '${currentQuestData.name}' !`, 'success');
        
        // Donne la récompense au joueur.
        giveQuestReward(currentQuestData.reward);
        
        // Ajoute la quête actuelle à la liste des quêtes terminées.
        player.quests.completed.push(currentQuestId);

        // Définit la prochaine quête comme quête active, si elle existe.
        if (currentQuestData.nextQuestId) {
            player.quests.current = currentQuestData.nextQuestId;
            player.quests.currentProgress = 0;
            showNotification(`Nouvelle quête acceptée : '${questsData[currentQuestData.nextQuestId].name}'`, 'info');
        } else {
            // S'il n'y a pas de prochaine quête, réinitialise la quête active.
            player.quests.current = null;
            player.quests.currentProgress = 0;
        }

        savePlayer(player);
        updateQuestsUI(); // Mettre à jour l'UI après la complétion
    }
}

/**
 * Permet au joueur d'accepter une quête.
 * @param {string} questId L'identifiant de la quête à accepter.
 */
export function acceptQuest(questId) {
    if (!player) {
        showNotification("Veuillez d'abord créer un personnage.", 'error');
        return;
    }

    const questData = questsData[questId];
    if (!questData) {
        showNotification("Cette quête n'existe pas.", 'error');
        return;
    }

    if (player.quests.current) {
        showNotification("Vous avez déjà une quête en cours. Terminez-la d'abord.", 'error');
        return;
    }

    // Réinitialise la quête précédente (si elle existe) et démarre la nouvelle.
    player.quests.current = questId;
    player.quests.currentProgress = 0;
    savePlayer(player);
    showNotification(`Quête acceptée : '${questData.name}'`, 'success');
    updateQuestsUI(); // Mettre à jour l'UI après l'acceptation
}

/**
 * Met à jour l'interface utilisateur des quêtes.
 */
export function updateQuestsUI() {
    if (!player) {
        // Redirige si le joueur n'existe pas, ou gère l'état initial.
        return;
    }

    const activeList = document.getElementById('active-quests-list');
    const unstartedList = document.getElementById('unstarted-quests-list');
    const completedList = document.getElementById('completed-quests-list');
    
    // Réinitialise les listes pour éviter les doublons.
    if (activeList) activeList.innerHTML = '';
    if (unstartedList) unstartedList.innerHTML = '';
    if (completedList) completedList.innerHTML = '';

    for (const questId in questsData) {
        const questData = questsData[questId];
        const li = document.createElement('li');
        li.className = 'quest-item';

        const title = document.createElement('h4');
        title.textContent = questData.name;
        li.appendChild(title);

        const description = document.createElement('p');
        description.textContent = questData.description;
        li.appendChild(description);

        if (player.quests.current === questId) {
            // Affiche la quête en cours.
            const progress = document.createElement('p');
            progress.textContent = `Progression : ${player.quests.currentProgress || 0} / ${questData.objective.required}`;
            li.appendChild(progress);
            if (activeList) activeList.appendChild(li);
        } else if (player.quests.completed.includes(questId)) {
            // Affiche les quêtes terminées.
            li.classList.add('completed');
            const status = document.createElement('p');
            status.textContent = 'Terminée';
            status.className = 'quest-status completed';
            li.appendChild(status);
            if (completedList) completedList.appendChild(li);
        } else {
            // Affiche les quêtes non commencées et le bouton "Accepter".
            const acceptBtn = document.createElement('button');
            acceptBtn.textContent = "Accepter la quête";
            acceptBtn.className = 'btn-primary';
            acceptBtn.addEventListener('click', () => acceptQuest(questId));
            li.appendChild(acceptBtn);
            if (unstartedList) unstartedList.appendChild(li);
        }
    }
}


 * Vérifie si la quête "lieu_sur" est actuellement la quête active du joueur.
 * @returns {boolean} Vrai si la quête est active, faux sinon.
 */
export function isSetSafePlaceQuest() {
    if (!player || !player.quests || !player.quests.current) {
        return false;
    }
    return player.quests.current === 'safe_place_quest';
}


// Gère le chargement initial de la page et la mise à jour de l'UI des quêtes.
document.addEventListener('DOMContentLoaded', () => {
    loadCharacter();
    updateQuestsUI();
});
