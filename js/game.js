// Fichier : js/game.js

// Variables globales du jeu
let player;
let currentMonster;
let currentDungeon;

// --- Système de Notifications ---
const notificationContainer = document.getElementById('notification-container');

/**
 * Affiche une notification non bloquante à l'écran.
 * @param {string} message Le texte de la notification.
 * @param {string} type Le type de notification ('success', 'info', 'warning', 'error').
 */
function showNotification(message, type = 'info') {
    if (!notificationContainer) return;
    const notification = document.createElement('div');
    notification.classList.add('notification', type);
    notification.textContent = message;
    notificationContainer.appendChild(notification);
    
    // Supprime la notification après 5 secondes
    setTimeout(() => {
        notification.remove();
    }, 5000);
}


// --- Gestion du Personnage et de la Sauvegarde ---

/**
 * Sauvegarde l'objet du joueur dans le localStorage.
 * @param {object} playerObject L'objet du joueur à sauvegarder.
 */
function saveCharacter(playerObject) {
    localStorage.setItem('playerCharacter', JSON.stringify(playerObject));
    console.log("Personnage sauvegardé !");
}

/**
 * Charge l'objet du joueur depuis le localStorage.
 * @returns {object|null} L'objet du joueur si trouvé, sinon null.
 */
function loadCharacter() {
    const characterData = localStorage.getItem('playerCharacter');
    if (!characterData) {
        return null;
    }
    player = JSON.parse(characterData);
    console.log("Personnage chargé :", player);
    return player;
}

/**
 * Recalcule les statistiques dérivées du joueur (HP max, Mana max, etc.).
 * @param {object} playerObject L'objet du joueur à mettre à jour.
 */
function recalculateDerivedStats(playerObject) {
    playerObject.maxHp = 10 + (playerObject.stats.strength * 5);
    playerObject.maxMana = 5 + (playerObject.stats.intelligence * 3);
    playerObject.attackDamage = 5 + (playerObject.stats.strength * 2);
    playerObject.defense = playerObject.stats.strength;
    playerObject.critChance = 5 + playerObject.stats.dexterity * 0.5;
    playerObject.critDamage = 1.5 + playerObject.stats.dexterity * 0.05;

    // Ajouter les bonus d'équipement
    if (playerObject.equipment.weapon) {
        const weapon = itemsData.weapons[playerObject.equipment.weapon.id];
        if (weapon && weapon.attack) {
            playerObject.attackDamage += weapon.attack;
        }
    }
    if (playerObject.equipment.armor) {
        const armor = itemsData.armors[playerObject.equipment.armor.id];
        if (armor && armor.defense) {
            playerObject.defense += armor.defense;
        }
    }

    // Réajuster les HP/Mana actuels pour ne pas dépasser le maximum
    playerObject.hp = Math.min(playerObject.hp, playerObject.maxHp);
    playerObject.mana = Math.min(playerObject.mana, playerObject.maxMana);
}

/**
 * Vérifie si le joueur monte de niveau.
 */
function checkLevelUp() {
    if (player.xp >= player.xpToNextLevel) {
        player.level++;
        player.xp -= player.xpToNextLevel;
        player.xpToNextLevel = Math.round(player.xpToNextLevel * 1.5);
        player.statPoints += 2;
        player.skillPoints += 1;
        
        recalculateDerivedStats(player);
        player.hp = player.maxHp;
        player.mana = player.maxMana;

        showNotification(`Félicitations ! Vous avez atteint le niveau ${player.level} !`, 'success');

        // Mettre à jour les quêtes de type 'reach_level'
        updateQuestObjective('reach_level', player.level);
    }
}

/**
 * Trouve un objet par son ID, en cherchant dans toutes les catégories.
 * @param {string} itemId L'ID de l'objet à trouver.
 * @returns {object|null} L'objet si trouvé, sinon null.
 */
function getItemById(itemId) {
    for (const category in itemsData) {
        if (itemsData[category][itemId]) {
            return itemsData[category][itemId];
        }
    }
    return null;
}

/**
 * Trouve une compétence par son ID.
 * @param {string} skillId L'ID de la compétence à trouver.
 * @returns {object|null} La compétence si trouvée, sinon null.
 */
function getSkillById(skillId) {
    for (const classId in abilitiesData) {
        const ability = abilitiesData[classId].find(a => a.id === skillId);
        if (ability) {
            return ability;
        }
    }
    return null;
}

/**
 * Commence une bataille en chargeant un monstre du donjon.
 */
function startBattle() {
    const dungeonId = localStorage.getItem('currentDungeonId');
    if (!dungeonId) {
        showNotification("Aucun donjon à explorer !", 'error');
        return;
    }
    
    const dungeon = dungeonsData[dungeonId];
    if (!dungeon) {
        showNotification("Ce donjon n'existe pas !", 'error');
        return;
    }

    const monsters = dungeon.monsters;
    const randomChance = Math.random();
    let selectedMonsterId = null;
    let cumulativeChance = 0;

    for (let i = 0; i < monsters.length; i++) {
        cumulativeChance += monsters[i].chance;
        if (randomChance <= cumulativeChance) {
            selectedMonsterId = monsters[i].id;
            break;
        }
    }
    
    currentMonster = { ...monstersData[selectedMonsterId] };
    recalculateDerivedStats(player); // S'assurer que les stats du joueur sont à jour
    
    // Rendre l'interface de combat visible
    document.getElementById('battle-interface').style.display = 'block';
    
    // Initialisation du combat via le script de combat
    initializeCombat();
}