// Fichier : js/modules/ui.js
// Ce module gère la mise à jour de l'interface utilisateur (UI) non spécifique à la carte.

import { player } from "../core/state.js";
import { questsData } from '../core/questsData.js';
import { showNotification } from "../core/notifications.js";

// Récupération des éléments du DOM
const getElement = id => document.getElementById(id);

// =========================================================================
// FONCTIONS DE GESTION DE L'AFFICHAGE
// =========================================================================

/**
 * Met à jour l'affichage des informations de quête.
 * @param {object} character Les données du personnage.
 */
export function renderQuestDisplay(character) {
    if (!character) return;
    const activeQuestsList = getElement('active-quests-list');
    const completedQuestsList = getElement('completed-quests-list');

    // Nettoyer les listes avant de les remplir
    if (activeQuestsList) activeQuestsList.innerHTML = '';
    if (completedQuestsList) completedQuestsList.innerHTML = '';

    // Rendre la quête active
    if (character.quests.current) {
        const questData = questsData[character.quests.current.questId];
        if (questData) {
            const li = document.createElement('li');
            li.innerHTML = `
                <h4>${questData.title}</h4>
                <p>${questData.description}</p>
                <p>Progression : ${character.quests.current.currentProgress || 0} / ${questData.objective.required}</p>
            `;
            if (activeQuestsList) activeQuestsList.appendChild(li);
        }
    } else {
        const li = document.createElement('li');
        li.textContent = "Aucune quête active pour le moment.";
        if (activeQuestsList) activeQuestsList.appendChild(li);
    }
    
    // Rendre les quêtes terminées
    if (character.quests.completed) {
        for (const questId in character.quests.completed) {
            const questData = questsData[questId];
            if (questData) {
                const li = document.createElement('li');
                li.innerHTML = `<h4>${questData.title}</h4><p>${questData.description}</p><p>✅ Terminée</p>`;
                if (completedQuestsList) completedQuestsList.appendChild(li);
            }
        }
    }
}

/**
 * Met à jour l'affichage complet du personnage sur la page de gestion.
 * @param {object} character Les données du personnage.
 */
export function renderCharacter(character) {
    if (!character) return;
    const loadingMessageContainer = getElement('loading-message-container');
    const mainContent = getElement('main-content');
    
    if (loadingMessageContainer) loadingMessageContainer.classList.add('hidden');
    if (mainContent) mainContent.classList.remove('hidden');

    // Mettre à jour les informations du personnage
    const playerName = getElement('player-name');
    if (playerName) playerName.textContent = character.name;
    const playerClass = getElement('player-class');
    if (playerClass) playerClass.textContent = character.playerClass;
    const playerLevel = getElement('player-level');
    if (playerLevel) playerLevel.textContent = character.level;
    const playerGold = getElement('player-gold');
    if (playerGold) playerGold.textContent = character.gold;
    const playerStatPoints = getElement('player-stat-points');
    if (playerStatPoints) playerStatPoints.textContent = character.statPoints;

    const hpBar = getElement('hp-bar');
    if (hpBar) hpBar.style.width = `${(character.hp / character.maxHp) * 100}%`;
    const manaBar = getElement('mana-bar');
    if (manaBar) manaBar.style.width = `${(character.mana / character.maxMana) * 100}%`;

    const currentHp = getElement('current-hp');
    if (currentHp) currentHp.textContent = character.hp;
    const maxHp = getElement('max-hp');
    if (maxHp) maxHp.textContent = character.maxHp;

    const currentMana = getElement('current-mana');
    if (currentMana) currentMana.textContent = character.mana;
    const maxMana = getElement('max-mana');
    if (maxMana) maxMana.textContent = character.maxMana;

    // Afficher les boutons de jeu et de suppression
    const playBtn = getElement('play-btn');
    const deleteBtn = getElement('delete-btn');
    if (playBtn) playBtn.classList.remove('hidden');
    if (deleteBtn) deleteBtn.classList.remove('hidden');
}

/**
 * Affiche l'interface de création de personnage.
 */
export function showCreationUI() {
    const loadingMessageContainer = getElement('loading-message-container');
    const noCharacterSection = getElement('no-character-section');
    const characterExistsSection = getElement('character-exists-section');

    if (loadingMessageContainer) loadingMessageContainer.classList.add('hidden');
    if (noCharacterSection) noCharacterSection.classList.remove('hidden');
    // S'assurer que la section "personnage existant" est bien cachée
    if (characterExistsSection) characterExistsSection.classList.add('hidden');
}

/**
 * Affiche le message de "pas de personnage".
 */
export function showNoCharacterView() {
    const loadingMessageContainer = getElement('loading-message-container');
    const noCharacterSection = getElement('no-character-section');
    const characterExistsSection = getElement('character-exists-section');

    if (loadingMessageContainer) loadingMessageContainer.classList.add('hidden');
    if (noCharacterSection) noCharacterSection.classList.remove('hidden');
    if (characterExistsSection) characterExistsSection.classList.add('hidden');
}

/**
 * Affiche l'interface pour un personnage existant (sur la page de création).
 * La section "Créer un personnage" est cachée, et la section "Personnage existant" est affichée.
 * @param {object} character Les données du personnage existant.
 */
export function showCharacterExistsView(character) {
    const loadingMessageContainer = getElement('loading-message-container');
    const noCharacterSection = getElement('no-character-section');
    const characterExistsSection = getElement('character-exists-section');
    const existingCharacterDisplay = getElement('existing-character-display');

    if (loadingMessageContainer) loadingMessageContainer.classList.add('hidden');
    if (noCharacterSection) noCharacterSection.classList.add('hidden');
    if (characterExistsSection) characterExistsSection.classList.remove('hidden');

    if (existingCharacterDisplay && character) {
        existingCharacterDisplay.innerHTML = `<div class="character-card">
            <h3>${character.name}</h3>
            <p>Niveau : ${character.level}</p>
            <p>Points de vie : ${character.hp}</p>
            <p>Points de magie : ${character.mana}</p>
        </div>`;
    }
}

/**
 * Met à jour le journal de bord.
 * @param {object} character Les données du personnage.
 */
export function updateJournalDisplay(character) {
    if (!character) return;
    const journalContainer = getElement('journal-container');
    if (journalContainer) {
        journalContainer.innerHTML = '';
        character.journal.forEach(entry => {
            const entryElement = document.createElement('div');
            entryElement.className = 'journal-entry';
            const date = new Date(entry.timestamp).toLocaleString('fr-FR', {
                year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit'
            });
            entryElement.innerHTML = `<p class="journal-message">${entry.message}</p><span class="journal-timestamp">${date}</span>`;
            journalContainer.appendChild(entryElement);
        });
    }
}

/**
 * Met à jour l'affichage de la page des quêtes.
 * @param {object} character Les données du personnage.
 */
export function renderQuestsPage(character) {
    const questsPageContainer = getElement('quests-page-container');
    if (!questsPageContainer) return;
    questsPageContainer.innerHTML = '';
    renderQuestDisplay(character);
}

// =========================================================================
// NOUVELLES FONCTIONS DE RENDU
// =========================================================================

/**
 * Met à jour l'affichage des statistiques détaillées du personnage.
 * @param {object} character Les données du personnage.
 */
export function updateStatsDisplay(character) {
    if (!character || !character.stats) return;
    const statsDisplay = getElement('stats-display');
    if (!statsDisplay) return;

    statsDisplay.innerHTML = `
        <div class="stat-item">
            <span class="stat-label">Force:</span>
            <span class="stat-value">${character.stats.strength}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Dextérité:</span>
            <span class="stat-value">${character.stats.dexterity}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Intelligence:</span>
            <span class="stat-value">${character.stats.intelligence}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Vitalité:</span>
            <span class="stat-value">${character.stats.vitality}</span>
        </div>
    `;
}

/**
 * Met à jour l'affichage de l'inventaire du personnage.
 * @param {object} character Les données du personnage.
 */
export function updateInventoryDisplay(character) {
    if (!character || !character.inventory) return;
    const inventoryGrid = getElement('inventory-items-grid');
    if (!inventoryGrid) return;

    inventoryGrid.innerHTML = ''; // Effacer l'inventaire actuel

    character.inventory.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'item-slot';
        itemElement.innerHTML = `
            <img src="${item.icon}" alt="${item.name}">
            <span class="item-name">${item.name}</span>
            <span class="item-quantity">${item.quantity}</span>
        `;
        // Ajouter un écouteur d'événement pour l'équiper (logique à implémenter)
        itemElement.addEventListener('click', () => {
            console.log(`Vous avez cliqué sur l'objet: ${item.name}`);
        });
        inventoryGrid.appendChild(itemElement);
    });
}

/**
 * Met à jour l'affichage de l'équipement du personnage.
 * @param {object} character Les données du personnage.
 */
export function updateEquipmentDisplay(character) {
    if (!character || !character.equipment) return;
    const equipmentDisplay = getElement('equipement-display');
    if (!equipmentDisplay) return;

    equipmentDisplay.innerHTML = `
        <div class="equipment-slot">Arme: ${character.equipment.weapon ? character.equipment.weapon.name : 'Aucun'}</div>
        <div class="equipment-slot">Armure: ${character.equipment.armor ? character.equipment.armor.name : 'Aucun'}</div>
        <div class="equipment-slot">Casque: ${character.equipment.helmet ? character.equipment.helmet.name : 'Aucun'}</div>
    `;
}

// =========================================================================
// FONCTION CENTRALE DE MISE À JOUR
// =========================================================================

/**
 * Fonction centrale pour mettre à jour l'UI en fonction de la page et de l'état du personnage.
 * @param {object} character Les données du personnage.
 */
export function updateUIBasedOnPage(character) {
    const currentPage = window.location.pathname.split('/').pop();
    switch (currentPage) {
        case 'gestion_personnage.html':
            if (character) renderCharacter(character);
            else {
                window.location.href = "character.html";
            }
            break;
        case 'quests.html':
            if (character) renderQuestsPage(character);
            break;
        case 'character.html':
            if (character) showCharacterExistsView(character);
            else showCreationUI();
            break;
        default:
            console.warn("Mise à jour de l'UI non définie pour cette page.");
    }
};