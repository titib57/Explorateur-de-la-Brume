// Fichier : js/quests.js

// Données des quêtes
const questsData = {
    'premiers_pas': {
        name: "Premiers pas dans la brume",
        description: "Explorez un donjon et tuez le mannequin d'entraînement pour prouver votre courage.",
        objective: {
            type: 'kill_monster',
            target: 'Mannequin',
            current: 0,
            required: 1
        },
        reward: {
            xp: 20,
            gold: 10
        },
        nextQuestId: null
    },
    'chasse_au_goblinoide': {
        name: "Chasse au Goblinoïde",
        description: "Traquez et tuez le Goblinoïde des bois qui terrorise la forêt.",
        objective: {
            type: 'kill_monster',
            target: 'Goblinoïde des bois',
            current: 0,
            required: 1
        },
        reward: {
            xp: 50,
            gold: 30,
            item: 'epee_de_fer'
        },
        nextQuestId: null
    }
};

// Associe les donjons (par leur ID) aux quêtes
const dungeonQuestsData = {
    'static_Tutoriel': 'premiers_pas',
    'forest_dungeon': 'chasse_au_goblinoide'
};

document.addEventListener('DOMContentLoaded', () => {
    if (!checkCharacter()) {
        return;
    }

    updateQuestsUI();
});

// Fonction pour mettre à jour l'affichage des quêtes.
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

// Fonction pour réclamer la récompense d'une quête terminée
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

// Fonction pour mettre à jour les objectifs de quête du joueur
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