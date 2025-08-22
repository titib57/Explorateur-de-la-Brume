// Fichier : js/quests.js

function updateQuestsUI() {
    const questList = document.getElementById('quest-list');
    if (!questList) return;
    
    questList.innerHTML = '';

    if (Object.keys(player.quests).length === 0) {
        addQuest('premiers_pas');
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

// Fonction pour ajouter une quête au journal du joueur
function addQuest(questId) {
    if (questsData[questId] && !player.quests[questId]) {
        player.quests[questId] = { ...questsData[questId] };
        saveCharacter(player);
        showNotification(`Nouvelle quête ajoutée: ${questsData[questId].name} !`, 'info');
        updateQuestsUI();
    }
}

function claimQuestReward(questId) {
    const quest = player.quests[questId];
    if (quest && quest.completed && !quest.rewardClaimed) {
        if (quest.reward.xp) {
            player.xp += quest.reward.xp;
            checkLevelUp();
        }
        if (quest.reward.gold) {
            player.gold += quest.reward.gold;
        }
        if (quest.reward.item) {
            const item = getItemById(quest.reward.item);
            if (item) {
                player.inventory.push(item.id);
            }
        }
        if (quest.reward.skill) {
            const skill = getSkillById(quest.reward.skill.skillId);
            if (skill) {
                player.unlockedSkills.push(skill.id);
            }
        }
        
        quest.rewardClaimed = true;
        
        if (quest.nextQuestId && questsData[quest.nextQuestId]) {
            addQuest(quest.nextQuestId);
        }
        
        saveCharacter(player);
        showNotification(`Récompense de quête reçue !`, 'success');
        updateQuestsUI();
    }
}

function updateQuestObjective(type, target) {
    for (const questId in player.quests) {
        const quest = player.quests[questId];
        if (!quest.completed && quest.objective.type === type) {
            if (Array.isArray(quest.objective.target)) {
                if (quest.objective.target.includes(target)) {
                    quest.objective.current++;
                }
            } else if (quest.objective.target === target) {
                quest.objective.current++;
            }
            
            if (quest.objective.current >= quest.objective.required) {
                quest.completed = true;
                showNotification(`Quête terminée : ${quest.name} !`, 'success');
            }
            saveCharacter(player);
            updateQuestsUI();
        }
    }
}