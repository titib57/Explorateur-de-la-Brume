// Fichier : js/battle_on_map.js

// Les variables globales (player, currentMonster, etc.) sont déjà définies dans game.js
// La fonction calculateElementalDamage est maintenant dans elements.js
// La fonction updateQuestObjective est maintenant dans quests.js

const monsterElementDisplay = document.getElementById('monster-element-display');
const playerElementDisplay = document.getElementById('player-element-display');

function initializeCombat() {
    updateBattleUI();
    document.getElementById('normal-attack-button').onclick = playerAttack;
    document.getElementById('flee-button').onclick = flee;
}

function updateBattleUI() {
    // Logique de mise à jour de l'interface du combat
    document.getElementById('player-name').textContent = player.name;
    document.getElementById('player-hp').textContent = player.hp;
    document.getElementById('player-max-hp').textContent = player.maxHp;
    document.getElementById('player-hp-bar').style.width = `${(player.hp / player.maxHp) * 100}%`;
    document.getElementById('player-mana').textContent = player.mana;
    document.getElementById('player-max-mana').textContent = player.maxMana;
    document.getElementById('player-mana-bar').style.width = `${(player.mana / player.maxMana) * 100}%`;
    
    document.getElementById('monster-name').textContent = currentMonster.name;
    document.getElementById('monster-hp').textContent = currentMonster.hp;
    document.getElementById('monster-max-hp').textContent = currentMonster.maxHp;
    document.getElementById('monster-hp-bar').style.width = `${(currentMonster.hp / currentMonster.maxHp) * 100}%`;

    // Afficher les éléments
    playerElementDisplay.textContent = `Élément: ${elements[player.element].name}`;
    playerElementDisplay.className = `element-${player.element}`;

    monsterElementDisplay.textContent = `Élément: ${elements[currentMonster.element].name}`;
    monsterElementDisplay.className = `element-${currentMonster.element}`;

    updateAbilitiesUI(); // Assurez-vous que cette fonction est toujours disponible
    updateConsumablesUI();
}

function playerAttack() {
    const attackDamage = player.attackDamage;
    const playerElement = player.equipment.weapon?.element || player.element;

    const { damage, message } = calculateElementalDamage(player, currentMonster, attackDamage, playerElement);
    
    currentMonster.hp -= damage;
    
    addToCombatLog(`Vous attaquez ${currentMonster.name} pour ${damage} dégâts.`, 'log-player');
    if (message) {
        showNotification(message, 'info');
    }
    
    if (currentMonster.hp <= 0) {
        endCombat('victoire');
    } else {
        monsterAttack();
    }
    updateBattleUI();
}

function monsterAttack() {
    // Le monstre n'a pas d'arme, son attaque a l'élément du monstre lui-même
    const monsterDamageResult = calculateElementalDamage(currentMonster, player, currentMonster.attack, currentMonster.element);
    const monsterDamage = monsterDamageResult.damage;
    
    player.hp -= monsterDamage;
    
    addToCombatLog(`${currentMonster.name} vous attaque pour ${monsterDamage} dégâts.`, 'log-monster');
    if (monsterDamageResult.message) {
        showNotification(monsterDamageResult.message, 'info');
    }

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
        addToCombatLog("Vous avez été vaincu ! La fuite est votre seule option !", 'log-error');
        player.hp = player.maxHp;
        saveCharacter(player);
        setTimeout(() => {
            document.getElementById('battle-interface').style.display = 'none';
            updateWorldMapUI();
        }, 3000);
    }
}

function flee() {
    showNotification("Vous fuyez le combat ! La fuite est votre seule option !", 'info');
    setTimeout(() => {
        document.getElementById('battle-interface').style.display = 'none';
        updateWorldMapUI();
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
        combatLog.scrollTop = combatLog.scrollHeight; // Scroll vers le bas
    }
}