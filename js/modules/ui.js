// Fichier : js/modules/ui.js
// Ce module gère la mise à jour de l'interface utilisateur (UI).

import { player, currentMonster } from "../core/state.js";
import { questsData } from '../questsData.js';
// Fonctions manquantes, à importer une fois les fichiers correspondants disponibles.
// import { getAbilityById } from "./skills.js";
// import { useItem } from "./inventory.js";
// import { startBattle, flee } from "./battle.js";

/**
 * Met à jour l'interface de combat.
 */
export function updateBattleUI() {
    const battleInterface = document.getElementById('battle-interface');
    if (!battleInterface) return;

    // Mise à jour de l'UI du joueur
    document.getElementById('player-name').textContent = player.name;
    document.getElementById('player-hp').textContent = player.hp;
    document.getElementById('player-max-hp').textContent = player.maxHp;
    document.getElementById('player-hp-bar').style.width = `${(player.hp / player.maxHp) * 100}%`;
    document.getElementById('player-mana').textContent = player.mana;
    document.getElementById('player-max-mana').textContent = player.maxMana;
    document.getElementById('player-mana-bar').style.width = `${(player.mana / player.maxMana) * 100}%`;
    document.getElementById('player-weapon-display').textContent = player.equipment.weapon ? player.equipment.weapon.name : 'Aucune';
    document.getElementById('player-armor-display').textContent = player.equipment.armor ? player.equipment.armor.name : 'Aucune';

    // Mise à jour de l'UI du monstre
    if (currentMonster) {
        document.getElementById('monster-name').textContent = currentMonster.name;
        document.getElementById('monster-hp').textContent = currentMonster.hp;
        document.getElementById('monster-max-hp').textContent = currentMonster.maxHp;
        document.getElementById('monster-hp-bar').style.width = `${(currentMonster.hp / currentMonster.maxHp) * 100}%`;
        document.getElementById('monster-attack-display').textContent = currentMonster.attackDamage;
        document.getElementById('monster-defense-display').textContent = currentMonster.defense;
    }
}

/**
 * Met à jour l'interface de la page des statistiques.
 * @param {object} tempPlayer L'objet joueur temporaire avec les stats modifiables.
 */
export function updateStatsUI(tempPlayer) {
    if (!tempPlayer) return;

    const stats = tempPlayer.stats;
    const statPoints = tempPlayer.statPoints;

    document.getElementById('stat-points-display').textContent = statPoints;

    document.getElementById('strength-display').textContent = stats.strength;
    document.getElementById('intelligence-display').textContent = stats.intelligence;
    document.getElementById('speed-display').textContent = stats.speed;
    document.getElementById('dexterity-display').textContent = stats.dexterity;

    // Mise à jour des stats dérivées
    document.getElementById('max-hp-display').textContent = tempPlayer.maxHp;
    document.getElementById('max-mana-display').textContent = tempPlayer.maxMana;
    document.getElementById('attack-damage-display').textContent = tempPlayer.attackDamage;
    document.getElementById('defense-display').textContent = tempPlayer.defense;
}

/**
 * Met à jour l'interface de la page d'accueil ou de la page de profil du joueur.
 * Cette fonction est ajoutée pour afficher les statistiques du joueur global.
 */
export function updatePlayerProfileUI() {
    if (!player) return;

    // Mise à jour des informations de base du personnage sur le profil
    document.getElementById('player-name-display').textContent = player.name;
    document.getElementById('player-class-display').textContent = player.playerClass;
    document.getElementById('player-level-display').textContent = player.level;
    document.getElementById('player-hp').textContent = `${player.hp}/${player.maxHp}`;
    document.getElementById('player-mana').textContent = `${player.mana}/${player.maxMana}`;
    document.getElementById('player-gold').textContent = player.gold;
    document.getElementById('player-xp').textContent = player.xp;

    // Mise à jour des statistiques de base
    document.getElementById('player-strength').textContent = player.stats.strength;
    document.getElementById('player-intelligence').textContent = player.stats.intelligence;
    document.getElementById('player-speed').textContent = player.stats.speed;
    document.getElementById('player-dexterity').textContent = player.stats.dexterity;

    // Mise à jour des stats dérivées
    document.getElementById('player-attack').textContent = player.attackDamage;
    document.getElementById('player-defense').textContent = player.defense;
}

/**
 * Met à jour l'interface des quêtes du joueur.
 * @param {object} player L'objet joueur.
 */
export function updateQuestsUI(player) {
    if (!player || !player.quests) return;

    const questsContainer = document.getElementById('quests-container');
    if (!questsContainer) return;

    // Vider le conteneur pour éviter les doublons
    questsContainer.innerHTML = '';

    // Afficher la quête en cours
    if (player.quests.current && player.quests.current.questId) {
        const questDetails = questsData[player.quests.current.questId];
        if (questDetails) {
            const currentQuestElement = document.createElement('div');
            currentQuestElement.className = 'quest-item current-quest';
            currentQuestElement.innerHTML = `
                <h4>Quête en cours : ${questDetails.title}</h4>
                <p>Objectif : ${questDetails.description}</p>
                <p>Progression : ${player.quests.current.currentProgress}/${questDetails.objective.required}</p>
            `;
            questsContainer.appendChild(currentQuestElement);
        }
    } else {
        questsContainer.innerHTML = '<p>Pas de quête en cours.</p>';
    }

    // Afficher les quêtes terminées (si nécessaire)
    const completedQuestsCount = Object.keys(player.quests.completed).length;
    if (completedQuestsCount > 0) {
        const completedQuestsElement = document.createElement('div');
        completedQuestsElement.className = 'completed-quests-summary';
        completedQuestsElement.innerHTML = `
            <p>Quêtes terminées : ${completedQuestsCount}</p>
        `;
        questsContainer.appendChild(completedQuestsElement);
    }
}

/**
 * Met à jour l'interface de la carte du monde avec les informations du joueur.
 * @param {object} player L'objet joueur.
 */
export function updateWorldMapUI(player) {
    if (!player) return;

    // Mettre à jour les éléments de l'UI de la carte du monde
    const playerGoldElement = document.getElementById('world-map-player-gold');
    if (playerGoldElement) {
        playerGoldElement.textContent = player.gold;
    }

    const playerLevelElement = document.getElementById('world-map-player-level');
    if (playerLevelElement) {
        playerLevelElement.textContent = player.level;
    }

    const playerXpElement = document.getElementById('world-map-player-xp');
    if (playerXpElement) {
        playerXpElement.textContent = player.xp;
    }

    const playerHpElement = document.getElementById('world-map-player-hp');
    if (playerHpElement) {
        playerHpElement.textContent = `${player.hp}/${player.maxHp}`;
    }

    const playerManaElement = document.getElementById('world-map-player-mana');
    if (playerManaElement) {
        playerManaElement.textContent = `${player.mana}/${player.maxMana}`;
    }

    const playerWeaponElement = document.getElementById('world-map-player-weapon');
    if (playerWeaponElement && player.equipment.weapon) {
        playerWeaponElement.textContent = player.equipment.weapon.name;
    }
}

/**
 * Met à jour l'interface du journal de bord du joueur.
 * @param {object} player L'objet joueur.
 */
export function updateJournalDisplay(player) {
    if (!player || !player.journal) return;

    const journalContainer = document.getElementById('journal-container');
    if (!journalContainer) return;

    journalContainer.innerHTML = '';

    player.journal.forEach(entry => {
        const entryElement = document.createElement('div');
        entryElement.className = 'journal-entry';

        const date = new Date(entry.timestamp).toLocaleString('fr-FR', {
            year: 'numeric', month: 'numeric', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });

        entryElement.innerHTML = `
            <p class="journal-message">${entry.message}</p>
            <span class="journal-timestamp">${date}</span>
        `;
        journalContainer.appendChild(entryElement);
    });
}