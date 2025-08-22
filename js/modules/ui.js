// Fichier : js/modules/ui.js

import { showNotification } from "../core/notifications.js";
import { player, currentMonster } from "../core/state.js";
import { getAbilityById } from "./skills.js";
import { useItem } from "./inventory.js";
import { startBattle, flee } from "./battle.js";

export function updateBattleUI() {
    const battleInterface = document.getElementById('battle-interface');
    if (!battleInterface) return;

    // Player UI
    document.getElementById('player-name').textContent = player.name;
    document.getElementById('player-hp').textContent = player.hp;
    document.getElementById('player-max-hp').textContent = player.maxHp;
    document.getElementById('player-hp-bar').style.width = `${(player.hp / player.maxHp) * 100}%`;
    document.getElementById('player-mana').textContent = player.mana;
    document.getElementById('player-max-mana').textContent = player.maxMana;
    document.getElementById('player-mana-bar').style.width = `${(player.mana / player.maxMana) * 100}%`;
    document.getElementById('player-weapon-display').textContent = player.equipment.weapon ? player.equipment.weapon.name : 'Aucune';
    document.getElementById('player-armor-display').textContent = player.equipment.armor ? player.equipment.armor.name : 'Aucune';
    
    // Monster UI
    document.getElementById('monster-name').textContent = currentMonster.name;
    document.getElementById('monster-hp').textContent = currentMonster.hp;
    document.getElementById('monster-max-hp').textContent = currentMonster.maxHp;
    document.getElementById('monster-hp-bar').style.width = `${(currentMonster.hp / currentMonster.maxHp) * 100}%`;
    
    // Add event listeners for battle actions
    document.getElementById('normal-attack-button').onclick = playerAttack;
    document.getElementById('flee-button').onclick = flee;
}

export function updateAbilitiesUI() {
    const abilitiesList = document.getElementById('abilities-list');
    if (!abilitiesList) return;
    abilitiesList.innerHTML = '';
    
    player.unlockedSkills.forEach(skillId => {
        const skill = getAbilityById(skillId);
        if (skill && (skill.type === 'ability' || skill.damage || skill.heal)) {
            const button = document.createElement('button');
            button.className = 'btn-ability';
            button.textContent = `${skill.name} (${skill.cost} Mana)`;
            button.onclick = () => useAbility(skillId);
            abilitiesList.appendChild(button);
        }
    });
}

export function updateConsumablesUI() {
    const consumablesList = document.getElementById('consumables-list');
    if (!consumablesList) return;
    consumablesList.innerHTML = '';
    
    const consumables = player.inventory.filter(item => item.type === 'consumable');
    
    if (consumables.length === 0) {
        consumablesList.textContent = 'Aucun consommable.';
    } else {
        consumables.forEach(item => {
            const button = document.createElement('button');
            button.className = 'btn-item';
            button.textContent = item.name;
            button.onclick = () => useItem(item.id);
            consumablesList.appendChild(button);
        });
    }
}

export function updateStatsUI(currentPlayer, tempStats, tempStatPoints) {
    document.getElementById('char-name-display').textContent = currentPlayer.name;
    document.getElementById('char-class-display').textContent = currentPlayer.class;
    document.getElementById('char-level-display').textContent = currentPlayer.level;
    document.getElementById('char-age-display').textContent = currentPlayer.age;
    document.getElementById('char-height-display').textContent = currentPlayer.height;
    document.getElementById('char-weight-display').textContent = currentPlayer.weight;
    document.getElementById('char-xp-display').textContent = currentPlayer.xp;
    document.getElementById('char-xp-to-next-level-display').textContent = currentPlayer.xpToNextLevel;
    document.getElementById('char-gold-display').textContent = currentPlayer.gold;
    document.getElementById('stat-points-display').textContent = tempStatPoints;

    document.getElementById('strength-display').textContent = tempStats.strength;
    document.getElementById('intelligence-display').textContent = tempStats.intelligence;
    document.getElementById('speed-display').textContent = tempStats.speed;
    document.getElementById('dexterity-display').textContent = tempStats.dexterity;
}

export function updateWorldMapUI() {
    const startBattleBtn = document.getElementById('start-battle-btn');
    const classTreeBtn = document.getElementById('class-tree-btn');

    if (player.level >= 5 && player.class === 'explorateur') {
        classTreeBtn.style.display = 'block';
    } else {
        classTreeBtn.style.display = 'none';
    }

    if (startBattleBtn) {
        startBattleBtn.style.display = 'none';
    }
}