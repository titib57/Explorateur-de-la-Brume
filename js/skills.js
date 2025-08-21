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
        showNotification(`Compétence \"${skill.name}\" débloquée !`, 'success');
    } else {
        showNotification('Impossible de débloquer cette compétence.', 'error');
    }
}

function updateSkillTreeUI() {
    const skillTreeContainer = document.getElementById('skill-tree-container');
    const skillPointsDisplay = document.getElementById('skill-points');
    const skillTreeLines = document.getElementById('skill-tree-lines');
    
    if (!skillTreeContainer || !skillPointsDisplay || !skillTreeLines) return;
    
    skillTreeContainer.innerHTML = `<div id="skill-tree-lines"></div>`;
    skillPointsDisplay.textContent = player.skillPoints;

    const currentClassTree = skillTreeData[player.class];
    if (!currentClassTree) {
        const message = document.createElement('p');
        message.textContent = "Aucun arbre de compétences disponible pour votre classe.";
        message.style.color = "var(--accent-color-red)";
        message.style.textAlign = "center";
        skillTreeContainer.appendChild(message);
        return;
    }

    const skillNodes = {};
    const skillTreeLinesContainer = document.getElementById('skill-tree-lines');

    for (const skillId in currentClassTree.skills) {
        const skill = currentClassTree.skills[skillId];
        const skillNode = document.createElement('div');
        skillNode.id = `skill-node-${skillId}`;
        skillNode.className = 'skill-node';
        
        if (player.unlockedSkills.includes(skillId)) {
            skillNode.classList.add('unlocked');
        } else if (checkPrerequisites(skillId, player.class) && player.skillPoints >= skill.cost) {
            skillNode.classList.add('available');
        } else {
            skillNode.classList.add('locked');
        }

        const iconPath = skill.iconPath || 'img/icons/default-skill.png';
        skillNode.innerHTML = `
            <img src="${iconPath}" alt="${skill.name} icon">
            <p>${skill.name}</p>
        `;
        
        // Ajouter un tooltip pour les informations de la compétence
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.innerHTML = `
            <p><b>${skill.name}</b></p>
            <p>Coût: ${skill.cost} points</p>
            <p>Type: ${skill.type}</p>
            <p>${skill.description}</p>
        `;
        skillNode.appendChild(tooltip);

        skillNodes[skillId] = skillNode;
        skillTreeContainer.appendChild(skillNode);

        if (!player.unlockedSkills.includes(skillId)) {
            skillNode.addEventListener('click', () => unlockSkill(skillId));
        }
    }
    
    // Dessiner les lignes de connexion après que tous les nœuds sont en place
    for (const skillId in currentClassTree.skills) {
        const skill = currentClassTree.skills[skillId];
        const currentSkillNode = skillNodes[skillId];

        if (skill.prerequisites) {
            skill.prerequisites.forEach(prereqId => {
                const prereqNode = skillNodes[prereqId];
                if (prereqNode && currentSkillNode) {
                    const line = document.createElement('div');
                    line.className = 'skill-line';
                    skillTreeLinesContainer.appendChild(line);
                    
                    setTimeout(() => {
                        const startRect = prereqNode.getBoundingClientRect();
                        const endRect = currentSkillNode.getBoundingClientRect();
                        
                        const startX = startRect.left + startRect.width / 2;
                        const startY = startRect.top + startRect.height / 2;
                        const endX = endRect.left + endRect.width / 2;
                        const endY = endRect.top + endRect.height / 2;
                        
                        const length = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
                        const angle = Math.atan2(endY - startY, endX - startX) * 180 / Math.PI;
                        
                        line.style.width = `${length}px`;
                        line.style.left = `${startX}px`;
                        line.style.top = `${startY}px`;
                        line.style.transform = `rotate(${angle}deg)`;
                    }, 0);
                }
            });
        }
    }
}

// Fonctions pour le combat (inchangées)
function useAbility(abilityId) {
    const ability = getAbilityById(abilityId);
    if (!ability) {
        showNotification("Cette compétence n'existe pas.", 'error');
        return;
    }
    if (player.mana < ability.cost) {
        showNotification("Pas assez de mana pour utiliser cette compétence.", 'warning');
        return;
    }
    
    player.mana -= ability.cost;
    saveCharacter(player);
    addToCombatLog(`Vous utilisez ${ability.name}.`);
    
    const damageResult = calculateElementalDamage(player, currentMonster, ability.damage, ability.element);
    currentMonster.hp -= damageResult.damage;
    
    addToCombatLog(damageResult.message, 'log-info');
    
    updateBattleUI();
    
    if (currentMonster.hp > 0) {
        setTimeout(monsterAttack, 2000);
    } else {
        setTimeout(endBattle, 2000);
    }
}
function getAbilityById(abilityId) {
    // Vérifier les compétences de l'arbre de classe
    const classTree = skillTreeData[player.class];
    if (classTree && classTree.skills[abilityId]) {
        return classTree.skills[abilityId];
    }
    
    // Vérifier les compétences des classes de base (guerrier, mage, voleur)
    for (const classId in abilitiesData) {
        const ability = abilitiesData[classId].find(a => a.id === abilityId);
        if (ability) {
            return ability;
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
    
    player.unlockedSkills.forEach(skillId => {
        const skill = getAbilityById(skillId);
        if (skill && (skill.type === 'ability' || skill.damage || skill.heal)) {
            const button = document.createElement('button');
            button.className = 'btn-ability';
            button.textContent = `${skill.name} (${skill.cost} Mana)`;
            button.onclick = () => useAbility(skill.id);
            abilitiesList.appendChild(button);
        }
    });
}