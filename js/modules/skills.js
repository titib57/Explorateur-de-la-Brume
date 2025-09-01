// Fichier : js/modules/skills.js
// Ce module gère la logique de l'arbre de compétences, y compris le déverrouillage
// des compétences, la vérification des prérequis et la mise à jour de l'interface utilisateur.

import { player, savePlayer, loadCharacter } from '../core/state.js';
import { abilitiesData, skillTreeData } from '../core/gameData.js';
import { showNotification } from '../core/notifications.js';
import { recalculateDerivedStats } from './character.js';

// Attendre que le DOM soit complètement chargé avant d'initialiser l'interface utilisateur.
document.addEventListener('DOMContentLoaded', () => {
    // Si le personnage n'est pas chargé, nous ne pouvons pas mettre à jour l'arbre.
    if (!loadCharacter()) {
        return;
    }
    updateSkillTreeUI();
});

/**
 * Vérifie si le joueur a débloqué les prérequis pour une compétence donnée.
 * @param {string} skillId - L'identifiant de la compétence à vérifier.
 * @param {string} playerClass - La classe du joueur.
 * @returns {boolean} - Vrai si tous les prérequis sont satisfaits ou s'il n'y en a pas.
 */
export function checkPrerequisites(skillId, playerClass) {
    const skill = skillTreeData[playerClass]?.skills[skillId];
    // Si la compétence n'existe pas, ou si elle n'a pas de prérequis, retourner vrai.
    if (!skill || !skill.prerequisites || skill.prerequisites.length === 0) {
        return true;
    }
    // Vérifier si chaque prérequis est inclus dans la liste des compétences débloquées par le joueur.
    return skill.prerequisites.every(prereq => player.unlockedSkills.includes(prereq));
}

/**
 * Tente de débloquer une compétence pour le joueur.
 * @param {string} skillId - L'identifiant de la compétence à débloquer.
 */
export function unlockSkill(skillId) {
    const skill = skillTreeData[player.class]?.skills[skillId];

    // Vérifier toutes les conditions de déverrouillage avant de procéder :
    // 1. La compétence existe-t-elle ?
    // 2. Le joueur a-t-il assez de points ?
    // 3. Les prérequis sont-ils remplis ?
    // 4. La compétence n'est-elle pas déjà débloquée ?
    if (
        skill &&
        player.skillPoints >= skill.cost &&
        checkPrerequisites(skillId, player.class) &&
        !player.unlockedSkills.includes(skillId)
    ) {
        player.skillPoints -= skill.cost;
        player.unlockedSkills.push(skillId);
        recalculateDerivedStats(); 
        savePlayer(player);
        updateSkillTreeUI();
        showNotification(`Compétence "${skill.name}" débloquée !`, 'success');
    } else {
        showNotification('Impossible de débloquer cette compétence. Vérifiez les points, les prérequis ou si elle est déjà débloquée.', 'error');
    }
}

/**
 * Met à jour l'interface utilisateur de l'arbre de compétences.
 * Cette version est optimisée pour modifier les nœuds existants au lieu de les reconstruire.
 */
export function updateSkillTreeUI() {
    const skillTreeContainer = document.getElementById('skill-tree-container');
    const skillPointsDisplay = document.getElementById('skill-points');

    if (!skillTreeContainer || !skillPointsDisplay) {
        console.error("Les éléments d'interface utilisateur de l'arbre de compétences ne sont pas trouvés.");
        return;
    }

    // Mettre à jour l'affichage des points de compétence.
    skillPointsDisplay.textContent = player.skillPoints;

    const playerClassTree = skillTreeData[player.class];
    if (!playerClassTree) {
        skillTreeContainer.textContent = 'Arbre de compétences non disponible pour cette classe.';
        return;
    }

    // Construire l'arbre si c'est la première fois.
    if (skillTreeContainer.innerHTML.trim() === '') {
        for (const skillId in playerClassTree.skills) {
            createSkillNode(skillId, playerClassTree.skills[skillId], skillTreeContainer);
        }
    }

    // Mettre à jour les classes de chaque nœud existant.
    for (const skillId in playerClassTree.skills) {
        const skill = playerClassTree.skills[skillId];
        const node = skillTreeContainer.querySelector(`.skill-node[data-skill-id="${skillId}"]`);
        if (node) {
            updateSkillNode(node, skillId, skill);
        }
    }
}

/**
 * Crée et ajoute un seul nœud de compétence au conteneur.
 * @param {string} skillId - L'identifiant de la compétence.
 * @param {object} skill - Les données de la compétence.
 * @param {HTMLElement} container - Le conteneur de l'arbre de compétences.
 */
function createSkillNode(skillId, skill, container) {
    const node = document.createElement('div');
    node.className = 'skill-node';
    node.setAttribute('data-skill-id', skillId);

    node.innerHTML = `
        <img src="${skill.iconPath}" alt="${skill.name}">
        <p>${skill.name}</p>
        <div class="tooltip">
            <h4>${skill.name}</h4>
            <p>Niveau: ${skill.level}</p>
            <p>Coût: ${skill.cost} points</p>
            <p>Effet: ${skill.description}</p>
            ${skill.prerequisites.length > 0 ? `<p>Prérequis: ${skill.prerequisites.map(id => skillTreeData[player.class].skills[id]?.name || id).join(', ')}</p>` : ''}
        </div>
    `;

    updateSkillNode(node, skillId, skill);
    container.appendChild(node);
}

/**
 * Met à jour les classes et les écouteurs d'événements pour un nœud de compétence existant.
 * @param {HTMLElement} node - L'élément DOM du nœud de compétence.
 * @param {string} skillId - L'identifiant de la compétence.
 * @param {object} skill - Les données de la compétence.
 */
function updateSkillNode(node, skillId, skill) {
    const isUnlocked = player.unlockedSkills.includes(skillId);
    const hasPrereqs = checkPrerequisites(skillId, player.class);
    const canAfford = player.skillPoints >= skill.cost;
    const isAvailable = hasPrereqs && canAfford;

    // Supprimer les anciennes classes d'état pour éviter les conflits.
    node.classList.remove('unlocked', 'available', 'locked');

    // Ajouter la nouvelle classe d'état.
    if (isUnlocked) {
        node.classList.add('unlocked');
    } else if (isAvailable) {
        node.classList.add('available');
    } else {
        node.classList.add('locked');
    }

    // Supprimer l'ancien écouteur d'événement pour éviter les duplications.
    const oldNode = node.cloneNode(true);
    node.parentNode.replaceChild(oldNode, node);

    // Ajouter un nouvel écouteur si la compétence est débloquable.
    if (!isUnlocked && isAvailable) {
        oldNode.addEventListener('click', () => {
            unlockSkill(skillId);
        });
    }
}

/**
 * Recherche une compétence par son identifiant dans toutes les sources de données possibles.
 * @param {string} abilityId - L'identifiant de la compétence ou de l'aptitude.
 * @returns {object|null} - Les données de la compétence trouvée ou null.
 */
export function getAbilityById(abilityId) {
    // 1. Vérifier si c'est une compétence de l'arbre de classe.
    const classTreeSkill = skillTreeData[player.class]?.skills[abilityId];
    if (classTreeSkill) {
        return classTreeSkill;
    }
    
    // 2. Vérifier si c'est une compétence de base pour n'importe quelle classe.
    for (const classId in abilitiesData) {
        const ability = abilitiesData[classId].find(a => a.id === abilityId);
        if (ability) {
            return ability;
        }
    }
    
    return null;
}
