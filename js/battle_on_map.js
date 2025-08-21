// Fichier : js/battle_on_map.js

// Les variables globales (player, currentMonster, etc.) sont déjà définies dans game.js

function initializeCombat() {
    updateBattleUI();
    document.getElementById('normal-attack-button').onclick = playerAttack;
    document.getElementById('flee-button').onclick = flee;
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

// Nouvelle fonction pour calculer les dégâts élémentaires en fonction des types
function calculateElementalDamage(playerAttackType, monsterType, playerResistance) {
    if (playerAttackType === 'normal') {
        return 1;
    }
    
    let multiplier = 1;
    const playerAttackInfo = typeEffectiveness[playerAttackType];

    if (playerAttackInfo) {
        if (playerAttackInfo.strongAgainst.includes(monsterType)) {
            addToCombatLog("C'est super efficace !", 'log-success');
            multiplier = 1.5;
        } else if (playerAttackInfo.weakAgainst.includes(monsterType)) {
            addToCombatLog("Ce n'est pas très efficace...", 'log-warning');
            multiplier = 0.5;
        }
    }

    // Application de la résistance du joueur
    if (playerResistance === playerAttackType) {
        addToCombatLog("Votre talisman réduit les dégâts !", 'log-info');
        multiplier *= 0.5; // Réduit de moitié les dégâts si le joueur est résistant
    }

    return multiplier;
}

function playerAttack() {
    // Le joueur ne peut pas attaquer s'il a 0 mana et que son attaque en coûte
    const attackId = 'fist_attack'; // L'attaque de base est toujours 'fist_attack'
    const attackInfo = getAbilityById(attackId);
    
    if (player.mana < attackInfo.manaCost) {
        showNotification("Pas assez de mana pour lancer cette attaque !", 'error');
        return;
    }
    player.mana -= attackInfo.manaCost;

    let totalDamage = player.attackDamage;

    // Ajout du bonus de dégâts pour l'attaque
    if (attackInfo.damage) {
        totalDamage += attackInfo.damage;
    }

    // Calcul des dégâts élémentaires
    const elementalMultiplier = calculateElementalDamage(attackInfo.type, currentMonster.type, player.elementalResistance);
    const finalDamage = Math.max(0, totalDamage * elementalMultiplier - currentMonster.defense);

    currentMonster.hp -= finalDamage;
    addToCombatLog(`Vous infligez ${Math.round(finalDamage)} points de dégâts à ${currentMonster.name}.`, 'log-player-attack');
    
    if (currentMonster.hp <= 0) {
        endCombat('victoire');
    } else {
        monsterTurn();
    }
    updateBattleUI();
}

function useAbility(abilityId) {
    const ability = getAbilityById(abilityId);

    if (player.mana < ability.manaCost) {
        showNotification("Pas assez de mana pour lancer cette capacité !", 'error');
        return;
    }
    player.mana -= ability.manaCost;

    let totalDamage = player.attackDamage;
    if (ability.damage) {
        totalDamage += ability.damage;
    }
    
    const elementalMultiplier = calculateElementalDamage(ability.elementalType, currentMonster.type, player.elementalResistance);
    const finalDamage = Math.max(0, totalDamage * elementalMultiplier - currentMonster.defense);

    currentMonster.hp -= finalDamage;
    addToCombatLog(`Vous utilisez ${ability.name} et infligez ${Math.round(finalDamage)} points de dégâts à ${currentMonster.name}.`, 'log-player-attack');

    if (currentMonster.hp <= 0) {
        endCombat('victoire');
    } else {
        monsterTurn();
    }
    updateBattleUI();
}

function monsterTurn() {
    const damageDealt = Math.max(0, currentMonster.attack - player.defense);
    player.hp -= damageDealt;

    addToCombatLog(`${currentMonster.name} vous inflige ${Math.round(damageDealt)} points de dégâts.`, 'log-monster-attack');
    
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