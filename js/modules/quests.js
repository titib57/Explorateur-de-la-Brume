// Fichier : js/quests.js

// Importation des dépendances nécessaires pour la gestion des quêtes.
import { player, savePlayer, loadCharacter } from '../core/state.js';
import { questsData } from '../core/gameData.js';
import { showNotification } from '../core/notifications.js';

// =========================================================================
// LOGIQUE DE GESTION DES QUÊTES
// =========================================================================

/**
 * Met à jour la progression de l'objectif d'une quête active.
 * Cette fonction est appelée depuis d'autres modules de jeu (par exemple, après avoir vaincu un monstre).
 * @param {string} questName Le nom de la quête à mettre à jour.
 * @param {number} amount Le montant à ajouter à l'objectif (ex: 1 pour un monstre tué).
 */
export function updateQuestObjective(questName, amount = 1) {
    if (player.quests.current === questName) {
        // Incrémente la progression de la quête active du joueur.
        const currentProgress = player.quests.currentProgress || 0;
        player.quests.currentProgress = currentProgress + amount;

        // Récupère les données de la quête pour vérifier l'objectif.
        const questData = questsData[questName];
        if (!questData) {
            console.error(`Erreur: La quête '${questName}' n'existe pas dans questsData.`);
            return;
        }

        const required = questData.objective.required;
        
        // Affiche une notification de l'état de la progression.
        showNotification(`${questData.name} : ${player.quests.currentProgress} / ${required}`, 'info');

        // Vérifie si la quête est terminée.
        if (player.quests.currentProgress >= required) {
            showNotification(`Objectif de la quête "${questData.name}" terminé !`, 'success');
            
            // Marque la quête comme terminée.
            if (!player.quests.completed.includes(questName)) {
                player.quests.completed.push(questName);
                player.quests.current = null; // Retire la quête de la liste active.
                player.quests.currentProgress = 0; // Réinitialise la progression.
            }
        }
        
        // Sauvegarde l'état du joueur après la modification.
        savePlayer();
    }
    
    // Met à jour l'interface du journal des quêtes pour refléter les changements.
    updateQuestsUI();
}

/**
 * Gère l'acceptation d'une quête par le joueur.
 * @param {string} questId L'ID de la quête à accepter.
 */
function acceptQuest(questId) {
    // Vérifie si le joueur n'a pas déjà une quête active.
    if (player.quests.current) {
        showNotification("Vous ne pouvez avoir qu'une seule quête active à la fois.", "warning");
        return;
    }
    
    const questData = questsData[questId];
    if (!questData) {
        console.error(`Erreur: La quête avec l'ID '${questId}' est introuvable.`);
        return;
    }

    player.quests.current = questId;
    player.quests.currentProgress = 0;
    savePlayer();
    showNotification(`Quête "${questData.name}" acceptée !`, "info");
    updateQuestsUI();
}

/**
 * Met à jour l'affichage de toutes les listes de quêtes (non commencées, actives, terminées).
 * Cette fonction est appelée chaque fois que l'état des quêtes du joueur change.
 */
export function updateQuestsUI() {
    const unstartedList = document.getElementById('unstarted-quests-list');
    const activeList = document.getElementById('active-quests-list');
    const completedList = document.getElementById('completed-quests-list');
    const safePlaceBtn = document.getElementById('safe-place-btn');
    
    // Vérifie si les éléments UI existent avant de les manipuler pour éviter les erreurs.
    if (!unstartedList || !activeList || !completedList) {
        return;
    }

    // Vide les listes pour une reconstruction propre de l'UI.
    unstartedList.innerHTML = '';
    activeList.innerHTML = '';
    completedList.innerHTML = '';
    
    // Affiche ou masque le bouton "Aller au Lieu Sûr" en fonction de la progression du joueur.
    if (safePlaceBtn) {
        if (player.quests.completed.includes('lieu_sur')) {
            safePlaceBtn.style.display = 'block';
        } else {
            safePlaceBtn.style.display = 'none';
        }
    }

    // Boucle sur toutes les quêtes pour déterminer leur statut et les afficher correctement.
    for (const questId in questsData) {
        const questData = questsData[questId];
        const li = document.createElement('li');
        li.className = 'quest-item';

        const title = document.createElement('p');
        title.className = 'quest-title';
        title.textContent = questData.name;
        li.appendChild(title);

        const description = document.createElement('p');
        description.textContent = questData.description;
        li.appendChild(description);

        // Détermine si la quête est active, terminée ou non commencée.
        if (player.quests.current === questId) {
            const progress = document.createElement('p');
            progress.textContent = `Progression : ${player.quests.currentProgress || 0} / ${questData.objective.required}`;
            li.appendChild(progress);
            activeList.appendChild(li);
        } else if (player.quests.completed.includes(questId)) {
            li.classList.add('completed');
            completedList.appendChild(li);
        } else {
            // Ajoute un bouton "Accepter" pour les quêtes non commencées.
            const acceptBtn = document.createElement('button');
            acceptBtn.textContent = "Accepter la quête";
            acceptBtn.className = 'btn-primary';
            acceptBtn.addEventListener('click', () => acceptQuest(questId));
            li.appendChild(acceptBtn);
            unstartedList.appendChild(li);
        }
    }
}

// =========================================================================
// GESTION DE L'INITIALISATION
// =========================================================================

// Gère le chargement initial de la page et la mise à jour de l'UI des quêtes.
document.addEventListener('DOMContentLoaded', () => {
    loadCharacter();
    updateQuestsUI();
});
