// Fichier : js/modules/skills.js

import { player, saveCharacter, loadCharacter } from '../core/state.js';
import { abilitiesData, skillTreeData } from '../core/gameData.js';
import { showNotification } from '../core/notifications.js';
import { recalculateDerivedStats } from './character.js';

document.addEventListener('DOMContentLoaded', () => {
    if (!loadCharacter()) {
        return;
    }
    updateSkillTreeUI();
});

export function checkPrerequisites(skillId, playerClass) {
    const skill = skillTreeData[playerClass]?.skills[skillId];
    if (!skill || !skill.prerequisites || skill.prerequisites.length === 0) {
        return true;
    }
    return skill.prerequisites.every(prereq => player.unlockedSkills.includes(prereq));
}

export function unlockSkill(skillId) {
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

export function updateSkillTreeUI() {
    const skillTreeContainer = document.getElementById('skill-tree-container');
    const skillPointsDisplay = document.getElementById('skill-points');
    
    if (!skillTreeContainer || !skillPointsDisplay) return;
    
    skillPointsDisplay.textContent = player.skillPoints;
    skillTreeContainer.innerHTML = '';
    
    const playerClassTree = skillTreeData[player.class];
    if (!playerClassTree) {
        skillTreeContainer.textContent = 'Arbre de compétences non disponible pour cette classe.';
        return;
    }

    for (const skillId in playerClassTree.skills) {
        const skill = playerClassTree.skills[skillId];
        const isUnlocked = player.unlockedSkills.includes(skillId);
        const isAvailable = checkPrerequisites(skillId, player.class) && player.skillPoints >= skill.cost;

        const node = document.createElement('div');
        node.className = 'skill-node';
        node.classList.add(isUnlocked ? 'unlocked' : (isAvailable ? 'available' : 'locked'));

        node.innerHTML = `
            <img src="${skill.iconPath}" alt="${skill.name}">
            <p>${skill.name}</p>
            <div class="tooltip">
                <h4>${skill.name}</h4>
                <p>Niveau: ${skill.level}</p>
                <p>Coût: ${skill.cost} points</p>
                <p>Effet: ${skill.description}</p>
                ${skill.prerequisites.length > 0 ? `<p>Prérequis: ${skill.prerequisites.join(', ')}</p>` : ''}
            </div>
        `;

        if (!isUnlocked && isAvailable) {
            node.addEventListener('click', () => {
                unlockSkill(skillId);
            });
        }
        skillTreeContainer.appendChild(node);
    }
}

export function getAbilityById(abilityId) {
    // Vérifier les compétences de l'arbre de classe
    const classTree = skillTreeData[player.class];
    if (classTree && classTree.skills[abilityId]) {
        return classTree.skills[abilityId];
    }
    
    // Vérifier les compétences des classes de base
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