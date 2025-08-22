// Fichier : js/battle_on_map.js

let player, currentMonster;

document.addEventListener('DOMContentLoaded', () => {
    if (!checkCharacter()) {
        return;
    }
    player = loadCharacter();
});

function initializeCombat() {
    updateBattleUI();
    document.getElementById('normal-attack-button').onclick = () => playerAttack('basic');
    document.getElementById('abilities-button').onclick = () => showActions('abilities-tab', event);
    document.getElementById('inventory-button').onclick = () => showActions('consumables-tab', event);
    document.getElementById('flee-button').onclick = flee;
}

function updateBattleUI() {
    // Player
    document.getElementById('player-name').textContent = player.name;
    document.getElementById('player-hp').textContent = player.hp;
    document.getElementById('player-max-hp').textContent = player.maxHp;
    document.getElementById('player-hp-bar').style.width = `${(player.hp / player.maxHp) * 100}%`;
    document.getElementById('player-mana').textContent = player.mana;
    document.getElementById('player-max-mana').textContent = player.maxMana;
    document.getElementById('player-mana-bar').style.width = `${(player.mana / player.maxMana) * 100}%`;
    const playerElement = player.equipment.weapon && itemsData.weapons[player.equipment.weapon.id] ? itemsData.weapons[player.equipment.weapon.id].element : 'neutre';
    document.getElementById('player-element-display').textContent = `Élément: ${elements[playerElement].name}`;

    // Monster
    document.getElementById('monster-name').textContent = currentMonster.name;
    document.getElementById('monster-hp').textContent = currentMonster.hp;
    document.getElementById('monster-max-hp').textContent = currentMonster.hp;
    document.getElementById('monster-hp-bar').style.width = `${(currentMonster.hp / currentMonster.hp) * 100}%`;
    document.getElementById('monster-mana').textContent = currentMonster.mana;
    document.getElementById('monster-max-mana').textContent = currentMonster.mana;
    document.getElementById('monster-mana-bar').style.width = `${(currentMonster.mana / currentMonster.mana) * 100}%`;
    document.getElementById('monster-element-display').textContent = `Élément: ${elements[currentMonster.element].name}`;
}

function playerAttack(type, abilityId = null) {
    if (currentMonster.hp <= 0) return;

    let baseDamage = player.attackDamage;
    let attackElement = 'neutre';

    if (type === 'ability' && abilityId) {
        const ability = getSkillById(abilityId);
        if (!ability || player.mana < ability.cost) {
            showNotification("Mana insuffisant ou compétence invalide.", 'error');
            return;
        }
        player.mana -= ability.cost;
        baseDamage = ability.damage;
        attackElement = ability.element;
        addToCombatLog(`Vous utilisez ${ability.name}.`, 'log-info');
    } else {
        addToCombatLog("Vous lancez une attaque de base.", 'log-info');
    }

    const damageResult = calculateElementalDamage(player, currentMonster, baseDamage, attackElement);
    currentMonster.hp -= damageResult.damage;
    
    addToCombatLog(`Vous infligez ${damageResult.damage} dégâts au ${currentMonster.name}.`, 'log-damage');
    if (damageResult.message) {
        addToCombatLog(damageResult.message, damageResult.isCrit ? 'log-crit' : 'log-info');
    }

    updateBattleUI();
    saveCharacter(player);

    if (currentMonster.hp <= 0) {
        endBattle('win');
    } else {
        setTimeout(monsterAttack, 2000);
    }
}

function monsterAttack() {
    if (player.hp <= 0) return;

    const damageResult = calculateElementalDamage(currentMonster, player, currentMonster.attack, currentMonster.element);
    player.hp -= damageResult.damage;

    addToCombatLog(`${currentMonster.name} vous inflige ${damageResult.damage} dégâts.`, 'log-damage');
    if (damageResult.message) {
        addToCombatLog(damageResult.message, damageResult.isCrit ? 'log-crit' : 'log-info');
    }
    
    updateBattleUI();
    saveCharacter(player);

    if (player.hp <= 0) {
        endBattle('lose');
    }
}

function endBattle(result) {
    if (result === 'win') {
        addToCombatLog(`Vous avez vaincu le ${currentMonster.name}!`, 'log-success');
        
        player.xp += currentMonster.xpReward;
        player.gold += currentMonster.goldReward;
        
        checkLevelUp();
        
        updateQuestObjective('kill_monster', currentMonster.id);
        
        saveCharacter(player);
        setTimeout(() => {
            document.getElementById('battle-interface').style.display = 'none';
            window.location.href = 'world_map.html';
        }, 3000);
    } else { // défaite
        addToCombatLog("Vous avez été vaincu ! Vous vous réveillez à l'entrée du donjon.", 'log-error');
        player.hp = player.maxHp;
        saveCharacter(player);
        setTimeout(() => {
            document.getElementById('battle-interface').style.display = 'none';
            window.location.href = 'world_map.html';
        }, 3000);
    }
}

function flee() {
    showNotification("Vous fuyez le combat !", 'info');
    setTimeout(() => {
        document.getElementById('battle-interface').style.display = 'none';
        window.location.href = 'world_map.html';
    }, 3000);
}

// Fonction utilitaire pour le journal de combat
function addToCombatLog(message, className) {
    const combatLog = document.getElementById('combat-log');
    if (combatLog) {
        const entry = document.createElement('p');
        entry.textContent = message;
        entry.classList.add(className);
        combatLog.appendChild(entry);
        combatLog.scrollTop = combatLog.scrollHeight;
    }
}