// Fichier : js/battle_on_map.js

// Les variables globales (player, currentMonster, etc.) sont déjà définies dans game.js

function initializeCombat() {
    updateBattleUI();
    document.getElementById('normal-attack-button').onclick = playerAttack;
    document.getElementById('flee-button').onclick = flee;
}

function updateBattleUI() {
    // Logique de mise à jour de l'interface du combat
    document.getElementById('player-name-combat').textContent = player.name;
    document.getElementById('player-hp-combat').textContent = player.hp;
    document.getElementById('player-max-hp-combat').textContent = player.maxHp;
    document.getElementById('player-hp-bar-combat').style.width = `${(player.hp / player.maxHp) * 100}%`;
    document.getElementById('player-mana-combat').textContent = player.mana;
    document.getElementById('player-max-mana-combat').textContent = player.maxMana;
    document.getElementById('player-mana-bar-combat').style.width = `${(player.mana / player.maxMana) * 100}%`;
    
    document.getElementById('monster-name').textContent = currentMonster.name;
    document.getElementById('monster-hp').textContent = currentMonster.hp;
    document.getElementById('monster-max-hp').textContent = currentMonster.maxHp;
    document.getElementById('monster-hp-bar').style.width = `${(currentMonster.hp / currentMonster.maxHp) * 100}%`;
    
    // Assurez-vous que le premier onglet est visible
    showTab(null, 'attack-tab');
}

function playerAttack() {
    const damage = player.attackDamage;
    currentMonster.hp -= damage;
    addToCombatLog(`Vous attaquez ${currentMonster.name} et lui infligez ${damage} points de dégâts.`, 'log-player');
    
    if (currentMonster.hp <= 0) {
        endCombat('victoire');
    } else {
        setTimeout(monsterAttack, 1000);
    }
    updateBattleUI();
}

function monsterAttack() {
    const damage = currentMonster.attackDamage - player.defense;
    player.hp -= Math.max(damage, 1);
    addToCombatLog(`${currentMonster.name} vous attaque et vous inflige ${Math.max(damage, 1)} points de dégâts.`, 'log-monster');
    
    if (player.hp <= 0) {
        endCombat('defaite');
    }
    updateBattleUI();
}

function endCombat(result) {
    if (result === 'victoire') {
        addToCombatLog(`Vous avez vaincu ${currentMonster.name} !`, 'log-success');
        giveXP(currentMonster.xpReward);
        player.gold += currentMonster.goldReward;
        
        // Mettez à jour les quêtes si nécessaire (exemple : tuer un monstre)
        updateQuestObjective('kill_monster', currentMonster.id);
        
        saveCharacter(player);
        setTimeout(() => {
            // Cacher l'interface de combat
            document.getElementById('battle-interface').style.display = 'none';
            // Mettre à jour les stats du joueur sur la carte
            updateWorldMapUI();
        }, 3000);
    } else { // défaite
        addToCombatLog("Vous avez été vaincu !", 'log-error');
        player.hp = player.maxHp;
        saveCharacter(player);
        setTimeout(() => {
            document.getElementById('battle-interface').style.display = 'none';
            updateWorldMapUI();
        }, 3000);
    }
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