// Fichier : js/quests.js
document.addEventListener('DOMContentLoaded', () => {
    if (!checkCharacter()) {
        return;
    }

function updateQuestsUI() {
    const questList = document.getElementById('quest-list');
    questList.innerHTML = '';

   if (Object.keys(player.quests).length === 0) {
    player.quests['premiers_pas'] = { ...questsData.premiers_pas };
    saveCharacter(player);
}

    for (const questId in player.quests) {
        const quest = player.quests[questId];
        const questElement = document.createElement('div');
        questElement.classList.add('quest-item');

        const status = quest.completed ? 'Terminée' : `En cours (${quest.objective.current}/${quest.objective.required})`;
        const rewardBtn = quest.completed && !quest.rewardClaimed ?
                          `<button onclick="claimQuestReward('${questId}')">Récupérer la récompense</button>` : '';

        questElement.innerHTML = `
            <h3>${quest.name}</h3>
            <p>${quest.description}</p>
            <p>Statut: ${status}</p>
            ${rewardBtn}
        `;
        questList.appendChild(questElement);
    }
}

function claimQuestReward(questId) {
    const quest = player.quests[questId];
    if (quest && quest.completed && !quest.rewardClaimed) {
        if (quest.reward.xp) {
            giveXP(quest.reward.xp);
        }
        if (quest.reward.gold) {
            player.gold += quest.reward.gold;
        }
        if (quest.reward.item) {
            const item = itemsData.weapons[quest.reward.item] || itemsData.armors[quest.reward.item] || itemsData.consumables[quest.reward.item];
            if (item) {
                player.inventory.push(item);
            }
        }
        if (quest.reward.skill) {
            // Correction ici pour accéder au bon objet
            const skill = skillTreeData[quest.reward.skill.classTree]?.skills[quest.reward.skill.skillId];
            if (skill) {
                player.unlockedSkills.push(skill.id);
            }
        }
        
        quest.rewardClaimed = true;
if (quest.nextQuestId && questsData[quest.nextQuestId]) {
    player.quests[quest.nextQuestId] = { ...questsData[quest.nextQuestId] };
    showNotification(`Nouvelle quête débloquée : ${questsData[quest.nextQuestId].name} !`, 'info');
}
        saveCharacter(player);
        showNotification(`Récompense de quête reçue !`, 'success');
        updateQuestsUI();
    }
}
// Fichier : js/quests.js

// ... (votre code existant, y compris la fonction getDistance)

/**
 * Commence une quête de donjon, si elle n'est pas déjà dans le journal du joueur.
 * @param {string} dungeonId L'ID du donjon.
 * @param {object} dungeonLocation La position du donjon {lat, lng}.
 */
function startDungeonQuest(dungeonId, dungeonLocation) {
    // Déterminer quel modèle de quête utiliser
    const dungeonData = dungeonsData[dungeonId];
    if (!dungeonData) {
        console.error(`Donjon non trouvé avec l'ID : ${dungeonId}`);
        showNotification("Erreur lors du démarrage de la quête de donjon.", 'error');
        return;
    }

    const questTemplateId = dungeonData.questTemplateId || `${dungeonId}`;
    const questTemplate = questsData[questTemplateId];
    
    if (!questTemplate) {
        console.error(`Modèle de quête non trouvé avec l'ID : ${questTemplateId}`);
        showNotification("Erreur lors du démarrage de la quête de donjon.", 'error');
        return;
    }

    const questId = `${dungeonId}_quest`;
    if (!player.quests[questId]) {
        // Créer une nouvelle quête basée sur le modèle
        const newQuest = JSON.parse(JSON.stringify(questTemplate)); // Clone profond
        newQuest.name = newQuest.name.replace('Quête de donjon', dungeonData.name);
        newQuest.location = dungeonLocation;
        newQuest.objective.target = dungeonData.monster.name;

        player.quests[questId] = newQuest;
        saveCharacter(player);
        showNotification(`Nouvelle quête de donjon débloquée : ${newQuest.name}!`, 'info');
    } else {
        showNotification(`Vous avez déjà la quête "${player.quests[questId].name}".`, 'info');
    }
}

/**
 * Met à jour le progrès d'un objectif de quête.
 * @param {string} type Le type d'objectif (ex: 'kill_monster').
 * @param {string} target L'identifiant de la cible (ex: l'id d'un monstre).
 */
function updateQuestObjective(type, target) {
    const playerPosition = playerMarker.getLatLng();
    const playerLocation = { lat: playerPosition.lat, lng: playerPosition.lng };

    for (const questId in player.quests) {
        const quest = player.quests[questId];
        
        // Vérifier si la quête est en cours, que l'objectif correspond et qu'elle a une localisation.
        if (!quest.completed && quest.objective.type === type && quest.objective.target === target && quest.location) {
            
            const distanceToObjective = getDistance(playerLocation, quest.location);
            
            // Si le joueur est à moins de 100 mètres de la quête, elle est active.
            if (distanceToObjective <= 100) {
                quest.objective.current++;
                if (quest.objective.current >= quest.objective.required) {
                    quest.completed = true;
                    showNotification(`Quête terminée : ${quest.name} !`, 'success');
                }
                saveCharacter(player);
                updateQuestsUI();
                return;
            } else {
                showNotification(`Vous devez être à proximité de la zone de la quête pour la valider.`, 'warning');
            }
        }
    }
}