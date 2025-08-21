// Fonctions pour la gestion de l'arbre de compétences
function checkPrerequisites(skillId, playerClass) {
    const skill = skillTreeData[playerClass]?.skills[skillId];
    if (!skill || !skill.prerequisites || skill.prerequisites.length === 0) {
        return true;
    }
    return skill.prerequisites.every(prereq => player.unlockedSkills.includes(prereq));
}

function unlockSkill(skillId) {
    const skill = skillTreeData[player.class]?.skills[skillId];
    if (skill && player.skillPoints >= skill.cost && checkPrerequisites(skillId, player.class) && !player.unlockedSkills.includes(skillId)) {
        player.skillPoints -= skill.cost;
        player.unlockedSkills.push(skillId);
        recalculateDerivedStats(); 
        saveCharacter(player);
        updateSkillTreeUI();
        showNotification(`Compétence "${skill.name}" débloquée !`, 'success');
    } else {
        showNotification('Impossible de débloquer cette compétence.', 'error');
    }
}

function updateSkillTreeUI() {
    const skillTreeContainer = document.getElementById('skill-tree-container');
    if (!skillTreeContainer) return;
    skillTreeContainer.innerHTML = '';
    
    document.getElementById('skill-points').textContent = player.skillPoints;

    const currentClassTree = skillTreeData[player.class];
    if (!currentClassTree) {
        const message = document.createElement('p');
        message.textContent = "Aucun arbre de compétences disponible pour votre classe.";
        message.style.color = "var(--text-color-accent)";
        message.style.textAlign = "center";
        skillTreeContainer.appendChild(message);
        return;
    }

    const skills = currentClassTree.skills;
    for (const skillId in skills) {
        const skillData = skills[skillId];
        const isUnlocked = player.unlockedSkills.includes(skillId);
        const hasPrereqs = checkPrerequisites(skillId, player.class);
        const isAvailable = hasPrereqs && !isUnlocked && player.skillPoints >= skillData.cost;

        const node = document.createElement('div');
        node.className = 'skill-node';

        if (isUnlocked) {
            node.classList.add('unlocked');
            node.innerHTML = `<img src="assets/skills/${skillId}.png" alt="${skillData.name}"><p>${skillData.name}</p>`;
        } else if (isAvailable) {
            node.classList.add('available');
            node.innerHTML = `<img src="assets/skills/${skillId}.png" alt="${skillData.name}"><p>${skillData.name} <br> (Coût: ${skillData.cost})</p>`;
            node.addEventListener('click', () => {
                unlockSkill(skillId);
            });
        } else {
            node.classList.add('locked');
            node.innerHTML = `<img src="assets/skills/${skillId}.png" alt="${skillData.name}"><p>${skillData.name}</p>`;
        }

        if (skillData.prerequisites && skillData.prerequisites.length > 0) {
            skillData.prerequisites.forEach(prereqId => {
                const prereqNode = document.getElementById(prereqId);
                if (prereqNode) {
                }
            });
        }

        skillTreeContainer.appendChild(node);
    }
}

function getAbilityData(abilityId) {
    const playerClassTree = skillTreeData[player.class];
    if (playerClassTree && playerClassTree.skills[abilityId]) {
        return playerClassTree.skills[abilityId];
    }

    const commonAbility = skillsData[abilityId];
    if (commonAbility) {
        return commonAbility;
    }

    if (abilitiesData[player.class]) {
        const classAbility = abilitiesData[player.class].find(a => a.id === abilityId);
        if (classAbility) {
            return classAbility;
        }
    }
    
    const baseAbility = abilitiesData.explorateur.find(a => a.id === abilityId);
    if (baseAbility) {
        return baseAbility;
    }
    
    return null;
}

function updateAbilitiesUI() {
    const abilitiesList = document.getElementById('abilities-list');
    if (!abilitiesList) return;
    abilitiesList.innerHTML = '';
    
    if (abilitiesData[player.class]) {
        abilitiesData[player.class].forEach(ability => {
            const button = document.createElement('button');
            button.className = 'btn-ability';
            button.textContent = `${ability.name} (${ability.cost} Mana)`;
            button.onclick = () => useAbility(ability.id);
            abilitiesList.appendChild(button);
        });
    }

    player.unlockedSkills.forEach(skillId => {
        const skill = skillTreeData[player.class]?.skills[skillId] || skillsData[skillId];
        if (skill && (skill.type === 'ability' || skill.damage || skill.heal)) {
            const button = document.createElement('button');
            button.className = 'btn-ability';
            button.textContent = `${skill.name} (${skill.manaCost} Mana)`;
            button.onclick = () => useAbility(skill.id);
            abilitiesList.appendChild(button);
        }
    });
}