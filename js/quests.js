// Fichier : js/quests.js

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

function updateQuestObjective(type, target) {
    for (const questId in player.quests) {
        const quest = player.quests[questId];
        if (!quest.completed && quest.objective.type === type && quest.objective.target === target) {
            quest.objective.current++;
            if (quest.objective.current >= quest.objective.required) {
                quest.completed = true;
                showNotification(`Quête terminée : ${quest.name} !`, 'success');
            }
            saveCharacter(player);
            updateQuestsUI();
            return;
        }
    }
}