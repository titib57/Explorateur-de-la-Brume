// Fichier : js/modules/battle.js

import { player, currentMonster, currentDungeon, savePlayer, loadCharacter } from '../core/state.js';
import { giveXP } from '../core/state.js';
import { updateQuestProgress } from './quests.js';
import { updateQuestsUI, updateBattleUI, updateWorldMapUI } from './ui.js';
import { calculateElementalDamage } from './elements.js';
import { addToCombatLog } from '../utils/utils.js';
import { showNotification } from '../core/notifications.js';

document.addEventListener('DOMContentLoaded', () => {
    if (!loadCharacter()) {
        return;
    }
    initializeCombat();
});

function initializeCombat() {
    updateBattleUI();
    document.getElementById('normal-attack-button').onclick = playerAttack;
    document.getElementById('flee-button').onclick = flee;
}

export function startBattle() {
    const dungeonData = localStorage.getItem('currentDungeon');
    if (!dungeonData) {
        showNotification("Aucun donjon à explorer !", 'error');
        return;
    }
    Object.assign(currentDungeon, JSON.parse(dungeonData));
    Object.assign(currentMonster, { ...currentDungeon.monster });

    document.getElementById('battle-interface').style.display = 'block';
    
    updateBattleUI();
    showNotification(`Vous entrez dans le donjon et affrontez ${currentMonster.name} !`, 'info');
}

export function playerAttack() {
    // Calcul des dégâts et de l'élément d'attaque
    const attackElement = player.equipment.weapon ? player.equipment.weapon.element : 'neutre';
    const baseDamage = player.attackDamage;
    const { damage, message } = calculateElementalDamage(player, currentMonster, baseDamage, attackElement);

    currentMonster.hp -= damage;
    addToCombatLog(`Vous attaquez le ${currentMonster.name} pour ${damage} PV.`, 'log-player-attack');
    if (message) {
        addToCombatLog(message, 'log-info');
    }

    updateBattleUI();

    if (currentMonster.hp <= 0) {
        endBattle('victoire');
    } else {
        setTimeout(monsterAttack, 2000);
    }
}

function monsterAttack() {
    const damage = Math.max(0, currentMonster.attack - player.defense);
    player.hp -= damage;
    addToCombatLog(`Le ${currentMonster.name} vous attaque pour ${damage} PV.`, 'log-monster-attack');
    updateBattleUI();

    if (player.hp <= 0) {
        endBattle('defaite');
    }
}

function endBattle(result) {
    if (result === 'victoire') {
        addToCombatLog(`Vous avez vaincu le ${currentMonster.name} !`, 'log-success');
        giveXP(currentMonster.xpReward);
        player.gold += currentMonster.goldReward;

        updateQuestObjective('kill_monster', currentMonster.id);
        
        savePlayer(player);
        setTimeout(() => {
            document.getElementById('battle-interface').style.display = 'none';
            updateWorldMapUI();
        }, 3000);
    } else {
        addToCombatLog("Vous avez été vaincu ! La fuite est votre seule option !", 'log-error');
        player.hp = player.maxHp;
        savePlayer(player);
        setTimeout(() => {
            document.getElementById('battle-interface').style.display = 'none';
            updateWorldMapUI();
        }, 3000);
    }
}

export function flee() {
    showNotification("Vous fuyez le combat ! La fuite est votre seule option !", 'info');
    setTimeout(() => {
        document.getElementById('battle-interface').style.display = 'none';
        updateWorldMapUI();
    }, 3000);
}