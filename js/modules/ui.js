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
    const unstartedQuestsList = getElement('unstarted-quests-list');
    const completedQuestsList = getElement('completed-quests-list');

    if (activeQuestsList) activeQuestsList.innerHTML = '';
    if (unstartedQuestsList) unstartedQuestsList.innerHTML = '';
    if (completedQuestsList) completedQuestsList.innerHTML = '';

    if (character.quests.current) {
        const questData = questsData[character.quests.current.questId];
        if (questData) {
            const li = document.createElement('li');
            li.innerHTML = `<h4>${questData.title}</h4><p>${questData.description}</p><p>Progression : ${character.quests.current.currentProgress || 0} / ${questData.objective.required}</p>`;
            if (activeQuestsList) activeQuestsList.appendChild(li);
        }
    } else {
        const li = document.createElement('li');
        li.textContent = "Aucune quête active pour le moment.";
        if (activeQuestsList) activeQuestsList.appendChild(li);
    }
    for (const questId in questsData) {
        const isCompleted = character.quests.completed && character.quests.completed[questId];
        const isActive = character.quests.current && character.quests.current.questId === questId;

        if (!isCompleted && !isActive) {
            const questData = questsData[questId];
            const li = document.createElement('li');
            li.innerHTML = `<h4>${questData.title}</h4><p>${questData.description}</p><button class="accept-quest-btn" data-quest-id="${questId}">Accepter</button>`;
            if (unstartedQuestsList) unstartedQuestsList.appendChild(li);
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

    const characterExistsSection = getElement('character-exists-section');
    const noCharacterSection = getElement('no-character-section');
    
    if (characterExistsSection) characterExistsSection.classList.remove('hidden');
    if (noCharacterSection) noCharacterSection.classList.add('hidden');
}

/**
 * Affiche l'interface de création de personnage.
 */
export function showCreationUI() {
    const loadingMessageContainer = getElement('loading-message-container');
    const noCharacterSection = getElement('no-character-section');

    if (loadingMessageContainer) loadingMessageContainer.classList.add('hidden');
    if (noCharacterSection) noCharacterSection.classList.remove('hidden');
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
 * @param {object} character Les données du personnage existant.
 */
export function showCharacterExistsView(character) {
    const loadingMessageContainer = getElement('loading-message-container');
    const noCharacterSection = getElement('no-character-section');
    const characterExistsSection = getElement('character-exists-section');

    if (loadingMessageContainer) loadingMessageContainer.classList.add('hidden');
    if (noCharacterSection) noCharacterSection.classList.add('hidden');
    if (characterExistsSection) characterExistsSection.classList.remove('hidden');

    const existingCharacterDisplay = getElement('existing-character-display');
    if (existingCharacterDisplay) {
        existingCharacterDisplay.innerHTML = `<div class="character-card"><h3>${character.name}</h3><p>Niveau : ${character.level}</p><p>Points de vie : ${character.hp}</p><p>Points de magie : ${character.mana}</p></div>`;
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
                // Si l'utilisateur est sur la page de gestion mais sans personnage,
                // on le redirige vers la page de création.
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
}

// =========================================================================
// Exports publics
// =========================================================================

export {
    renderCharacter,
    showNoCharacterView,
    showCharacterExistsView,
    showCreationUI,
    updateJournalDisplay,
    renderQuestsPage,
};