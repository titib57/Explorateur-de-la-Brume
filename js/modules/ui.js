// Fichier : js/modules/ui.js
// Ce module gère la mise à jour de l'interface utilisateur (UI) non spécifique à la carte.

import { player } from "../core/state.js";
import { questsData } from '../core/questsData.js';
import { acceptQuest } from '../core/gameEngine.js';
import { createNewCharacter, deleteCharacter, handleSignOut } from '../core/authManager.js';
import { showNotification } from "../core/notifications.js";

// Récupération des éléments du DOM
const getElement = id => document.getElementById(id);

const noCharacterSection = getElement('no-character-section');
const characterSection = getElement('character-section');
const characterDisplay = getElement('character-display');
const loadingMessage = getElement('loading-message');
const playBtn = getElement('play-btn');
const deleteBtn = getElement('delete-btn');
const updateBtn = getElement('update-btn');
const statsDisplay = getElement('stats-display');
const questsDisplay = getElement('quests-display');
const inventoryDisplay = getElement('inventory-display');
const equipmentDisplay = getElement('equipment-display');
const characterInfoDisplay = getElement('character-info-display');
const characterForm = getElement('character-form');
const characterExistsSection = getElement('character-exists-section');
const existingCharacterDisplay = getElement('existing-character-display');
const deleteBtnOnCharacterPage = getElement('delete-btn-creation-page');
const logoutLink = getElement('logout-link');

// Variables pour le journal de bord
const hpValue = getElement('hp-value');
const goldValue = getElement('gold-value');
const levelValue = getElement('level-value');

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
    // ... (le reste de la fonction est inchangé)
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
    if (characterDisplay) {
        characterDisplay.innerHTML = `<h3>${character.name}</h3><p>Niveau : ${character.level}</p><p>Points de vie : ${character.hp}/${character.maxHp}</p><p>Points de magie : ${character.mana}/${character.maxMana}</p><p>Or : ${character.gold}</p>`;
    }
    if (statsDisplay && character.stats) {
        statsDisplay.innerHTML = `<p>Force : ${character.stats.strength}</p><p>Intelligence : ${character.stats.intelligence}</p><p>Vitesse : ${character.stats.speed}</p><p>Dextérité : ${character.stats.dexterity}</p>`;
    }
    renderQuestDisplay(character);
    if (equipmentDisplay && character.equipment) {
        equipmentDisplay.innerHTML = `<p>Arme : ${character.equipment.weapon ? character.equipment.weapon.name : 'Aucune'}</p><p>Armure : ${character.equipment.armor ? character.equipment.armor.name : 'Aucune'}</p>`;
    }
    const sectionsToDisplay = ['character-section', 'stats-section', 'quest-section', 'inventory-section', 'equipement-section'];
    sectionsToDisplay.forEach(id => {
        const section = getElement(id);
        if (section) section.classList.remove('hidden');
    });
    if (loadingMessage) loadingMessage.classList.add('hidden');
    if (playBtn) playBtn.classList.remove('hidden');
    if (deleteBtn) deleteBtn.classList.remove('hidden');
    if (updateBtn) updateBtn.classList.remove('hidden');
}

// ... (fonctions inchangées) ...
export function renderExistingCharacterOnCreationPage(character) {
    if (!existingCharacterDisplay) return;
    existingCharacterDisplay.innerHTML = `<div class="character-card"><h3>${character.name}</h3><p>Niveau : ${character.level}</p><p>Points de vie : ${character.hp}</p><p>Points de magie : ${character.mana}</p></div>`;
    if (loadingMessage) loadingMessage.classList.add('hidden');
}

export function showNoCharacterView() {
    if (characterSection) characterSection.classList.add('hidden');
    if (noCharacterSection) noCharacterSection.classList.remove('hidden');
    if (characterExistsSection) characterExistsSection.classList.add('hidden');
    if (characterForm) characterForm.classList.remove('hidden');
}

export function showCharacterExistsView(character) {
    if (noCharacterSection) noCharacterSection.classList.add('hidden');
    if (characterForm) characterForm.classList.add('hidden');
    if (characterExistsSection) characterExistsSection.classList.remove('hidden');
    renderExistingCharacterOnCreationPage(character);
}

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
    if (hpValue) hpValue.textContent = `${character.hp} / ${character.maxHp}`;
    if (goldValue) goldValue.textContent = character.gold;
    if (levelValue) levelValue.textContent = character.level;
}

export function renderQuestsPage(character) {
    const questsPageContainer = getElement('quests-page-container');
    if (!questsPageContainer) return;
    questsPageContainer.innerHTML = '';
    renderQuestDisplay(character);
}

// LIGNES SUPPRIMÉES : Toutes les fonctions spécifiques à la carte

// =========================================================================
// FONCTION CENTRALE DE MISE À JOUR (mise à jour)
// =========================================================================

export function updateUIBasedOnPage(character) {
    const currentPage = window.location.pathname.split('/').pop();
    switch (currentPage) {
        case 'gestion_personnage.html':
            if (character) renderCharacter(character);
            else window.location.href = "character.html";
            break;
        case 'quests.html':
            if (character) renderQuestsPage(character);
            break;
        case 'character.html':
            if (character) showCharacterExistsView(character);
            else showNoCharacterView();
            break;
        default:
            console.warn("Mise à jour de l'UI non définie pour cette page.");
    }
}

// =========================================================================
// GESTION DES ÉVÉNEMENTS
// =========================================================================

document.addEventListener('DOMContentLoaded', () => {
    if (characterForm) {
        characterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('char-name').value.trim();
            const charClass = document.getElementById('char-class').value;
            createNewCharacter(name, charClass);
        });
    }
    if (deleteBtnOnCharacterPage) {
        deleteBtnOnCharacterPage.addEventListener('click', deleteCharacter);
    }
    if (deleteBtn) {
        deleteBtn.addEventListener('click', deleteCharacter);
    }
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            handleSignOut();
        });
    }
    if (updateBtn) {
        updateBtn.addEventListener('click', () => { window.location.href = "character.html"; });
    }
    document.addEventListener('click', (event) => {
        if (event.target.classList.contains('accept-quest-btn')) {
            const questId = event.target.dataset.questId;
            acceptQuest(questId);
        }
    });

    // LIGNE SUPPRIMÉE : La gestion des événements de la carte est maintenant dans son propre module.
    // handleMapUIEvents();
});