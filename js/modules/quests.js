// Fichier : js/quests.js

// Importation des dépendances nécessaires
import { initialQuest } from '../core/questsData.js';
import { showNotification } from '../core/notifications.js';

// =========================================================================
// LOGIQUE DE GESTION DES QUÊTES
// =========================================================================

/**
 * Met à jour la progression d'un objectif de quête pour le personnage donné.
 * @param {Object} characterData Les données complètes du personnage.
 * @param {string} objectiveType Le type de l'objectif (ex: 'vaincre_monstre').
 * @param {string} target La cible de l'objectif (ex: 'mannequin_dentrainement').
 * @param {number} amount Le montant à ajouter à la progression (par défaut: 1).
 * @returns {Promise<Object|null>} Un objet Promise contenant les données du personnage mises à jour, ou null en cas d'échec.
 */
export async function updateQuestObjective(characterData, objectiveType, target, amount = 1) {
    if (!characterData || !characterData.quests || !characterData.quests.current) {
        return characterData;
    }

    const currentQuestData = characterData.quests.current;
    if (!questsData[currentQuestData.questId]) {
        console.error(`Erreur: La quête '${currentQuestData.questId}' n'existe pas dans questsData.`);
        return characterData;
    }

    if (questsData[currentQuestData.questId].objective.type === objectiveType && questsData[currentQuestData.questId].objective.target === target) {
        let currentProgress = currentQuestData.currentProgress || 0;
        currentProgress += amount;

        const required = questsData[currentQuestData.questId].objective.required;
        showNotification(`Progression de la quête '${questsData[currentQuestData.questId].title}' : ${currentProgress}/${required}`, 'info');

        // Mise à jour de l'objet local
        characterData.quests.current.currentProgress = currentProgress;

        if (currentProgress >= required) {
            return await checkQuestCompletion(characterData);
        }
    }
    return characterData;
}

/**
 * Vérifie si la quête en cours est terminée et gère la complétion.
 * @param {Object} characterData Les données complètes du personnage.
 * @returns {Promise<Object>} Un objet Promise contenant les données du personnage mises à jour.
 */
export async function checkQuestCompletion(characterData) {
    if (!characterData || !characterData.quests || !characterData.quests.current) {
        return characterData;
    }

    const currentQuestId = characterData.quests.current.questId;
    const currentQuestData = questsData[currentQuestId];

    if (!currentQuestData) {
        console.error(`Erreur: La quête '${currentQuestId}' n'existe pas dans questsData.`);
        return characterData;
    }

    if (characterData.quests.current.currentProgress >= currentQuestData.objective.required) {
        showNotification(`Quête terminée : '${currentQuestData.title}' !`, 'success');
        
        // Ajout de la quête à la liste des quêtes terminées
        const completedQuests = { ...characterData.quests.completed, [currentQuestId]: { ...currentQuestData, status: 'completed' } };
        
        // Définir la prochaine quête si elle existe
        const nextQuestId = currentQuestData.nextQuestId;
        if (nextQuestId) {
            const nextQuestData = questsData[nextQuestId];
            characterData.quests.current = { ...nextQuestData, status: 'active', currentProgress: 0 };
            showNotification(`Nouvelle quête acceptée : '${nextQuestData.title}'`, 'info');
        } else {
            characterData.quests.current = null;
        }
        
        characterData.quests.completed = completedQuests;
    }
    return characterData;
}

/**
 * Permet d'accepter une nouvelle quête pour le personnage.
 * @param {Object} characterData Les données complètes du personnage.
 * @param {string} questId L'identifiant de la quête à accepter.
 * @returns {Promise<Object>} Un objet Promise contenant les données du personnage mises à jour.
 */
export async function acceptQuest(characterData, questId) {
    const questData = questsData[questId];
    if (!questData) {
        showNotification("Cette quête n'existe pas.", 'error');
        return characterData;
    }

    if (characterData.quests.current && characterData.quests.current.questId) {
        showNotification("Vous avez déjà une quête en cours. Terminez-la d'abord.", 'error');
        return characterData;
    }

    characterData.quests.current = { ...questData, status: 'active', currentProgress: 0 };
    showNotification(`Quête acceptée : '${questData.title}'`, 'success');
    return characterData;
}

/**
 * Met à jour l'interface utilisateur des quêtes avec les données du personnage.
 * @param {Object} characterData Les données complètes du personnage.
 */
export function updateQuestsUI(characterData) {
    if (!characterData || !characterData.quests) {
        return;
    }

    const activeList = document.getElementById('active-quests-list');
    const unstartedList = document.getElementById('unstarted-quests-list');
    const completedList = document.getElementById('completed-quests-list');
    
    if (activeList) activeList.innerHTML = '';
    if (unstartedList) unstartedList.innerHTML = '';
    if (completedList) completedList.innerHTML = '';

    const allQuests = Object.values(questsData);

    allQuests.forEach(questData => {
        const li = document.createElement('li');
        li.className = 'quest-item';

        const title = document.createElement('h4');
        title.textContent = questData.title;
        li.appendChild(title);

        const description = document.createElement('p');
        description.textContent = questData.description;
        li.appendChild(description);

        if (characterData.quests.current && characterData.quests.current.questId === questData.questId) {
            const progress = document.createElement('p');
            progress.textContent = `Progression : ${characterData.quests.current.currentProgress || 0} / ${questData.objective.required}`;
            li.appendChild(progress);
            if (activeList) activeList.appendChild(li);
        } 
        else if (characterData.quests.completed && characterData.quests.completed[questData.questId]) {
            li.classList.add('completed');
            const status = document.createElement('p');
            status.textContent = 'Terminée';
            status.className = 'quest-status completed';
            li.appendChild(status);
            if (completedList) completedList.appendChild(li);
        } 
        else {
            const acceptBtn = document.createElement('button');
            acceptBtn.textContent = "Accepter la quête";
            acceptBtn.className = 'btn-primary';
            
            // L'écouteur d'événement pour le bouton "Accepter" doit être géré dans le fichier principal,
            // car il a besoin de l'objet 'user' pour la sauvegarde dans Firestore.
            
            li.appendChild(acceptBtn);
            if (unstartedList) unstartedList.appendChild(li);
        }
    });
}

/**
 * Vérifie si la quête 'safe_place_quest' est la quête active du personnage.
 * @param {Object} characterData Les données complètes du personnage.
 * @returns {boolean} True si la quête est active, sinon False.
 */
export function isSetSafePlaceQuest(characterData) {
    if (!characterData || !characterData.quests || !characterData.quests.current) {
        return false;
    }
    return characterData.quests.current.questId === 'safe_place_quest';
}