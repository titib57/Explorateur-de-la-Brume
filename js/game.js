// Fichier : js/game.js

// Variables globales du jeu
let player;
let currentMonster;
let currentDungeon;

// --- Système de Notifications ---
const notificationContainer = document.createElement('div');
notificationContainer.id = 'notification-container';
document.body.appendChild(notificationContainer);

/**
 * Affiche une notification non bloquante à l'écran.
 * @param {string} message Le texte de la notification.
 * @param {string} type Le type de notification ('success', 'info', 'warning', 'error').
 */
function showNotification(message, type = 'info') {
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
 * @returns {boolean} Vrai si le personnage a été chargé, faux sinon.
 */
function loadCharacter() {
    const characterData = localStorage.getItem('playerCharacter');
    if (!characterData) {
        return false;
    }
    
    try {
        player = JSON.parse(characterData);
        
        // Initialisation des propriétés par défaut si elles n'existent pas
        player.stats = player.stats || { strength: 1, intelligence: 1, speed: 1, dexterity: 1 };
        player.statPoints = player.statPoints || 0;
        player.skillPoints = player.skillPoints || 0;
        player.gold = player.gold || 0;
        player.xp = player.xp || 0;
        player.level = player.level || 1;
        player.unlockedSkills = player.unlockedSkills || ['fist_attack'];
        player.unlockedClasses = player.unlockedClasses || ['explorateur'];
        player.inventory = player.inventory || [];
        player.equipment = player.equipment || { weapon: null, armor: null };
        player.quests = player.quests || {};

        recalculateDerivedStats();
        
        // S'assurer que les HP/Mana actuels ne dépassent pas les maximums
        player.hp = Math.min(player.hp || player.maxHp, player.maxHp);
        player.mana = Math.min(player.mana || player.maxMana, player.maxMana);

        console.log("Personnage chargé :", player);
        return true;
    } catch (e) {
        console.error("Erreur lors du chargement du personnage :", e);
        return false;
    }
}


// --- Fonctions de progression et de statistiques ---

/**
 * Calcule les statistiques dérivées du joueur (HP, Mana, Dégâts, etc.)
 * en fonction de ses statistiques de base et de son équipement.
 */
function recalculateDerivedStats() {
    if (!player) return;
    
    player.maxHp = 100 + (player.stats.strength * 15);
    player.maxMana = 50 + (player.stats.intelligence * 10);
    player.attackDamage = 5 + (player.stats.strength * 2) + (player.stats.dexterity);
    player.defense = 5 + (player.stats.strength) + (player.stats.dexterity);
    
    // Ajout des bonus d'équipement
    if (player.equipment.weapon) {
        player.attackDamage += player.equipment.weapon.damage || 0;
    }
    if (player.equipment.armor) {
        player.defense += player.equipment.armor.defense || 0;
    }
}

/**
 * Gère l'attribution de l'expérience au joueur et la montée en niveau.
 * @param {number} amount L'expérience à ajouter.
 */
function giveXP(amount) {
    if (!player) return;
    player.xp += amount;
    
    // Boucle de montée en niveau
    while (player.xp >= player.xpToNextLevel) {
        player.xp -= player.xpToNextLevel;
        player.level++;
        player.statPoints += 5; // Points de stats par niveau
        player.skillPoints += 1; // Points de compétence par niveau
        player.xpToNextLevel = Math.floor(player.xpToNextLevel * 1.5);
        
        recalculateDerivedStats();
        player.hp = player.maxHp;
        player.mana = player.maxMana;
        
        showNotification(`Félicitations, vous êtes monté au niveau ${player.level} !`, 'success');
        console.log(`Nouveau niveau: ${player.level}, XP restante: ${player.xp}`);
    }
    saveCharacter(player);
}

/**
 * Ajuste les statistiques de base du personnage en fonction de sa morphologie.
 */
function applyPhysicalAttributes(character) {
    switch (character.morphology) {
        case 'musculeux':
            character.stats.strength += 2;
            character.stats.speed -= 1;
            break;
        case 'mince':
            character.stats.speed += 2;
            character.stats.strength -= 1;
            break;
        case 'potelé':
            character.stats.strength += 1;
            character.stats.dexterity -= 1;
            break;
        default: // 'normal'
            break;
    }
}

// --- Fonctions de Combat ---

/**
 * Commence une bataille en chargeant un monstre du donjon.
 */
function startBattle() {
    const dungeonData = localStorage.getItem('currentDungeon');
    if (!dungeonData) {
        showNotification("Aucun donjon à explorer !", 'error');
        return;
    }
    currentDungeon = JSON.parse(dungeonData);
    currentMonster = { ...currentDungeon.monster };
    console.log("Bataille commencée contre :", currentMonster);
    
    // Rendre l'interface de combat visible
    document.getElementById('battle-interface').style.display = 'block';
    
    // Initialisation du combat (cette fonction doit être dans le nouveau fichier battle_on_map.js)
    initializeCombat(); 
}

/**
 * Fonction de fuite du combat.
 */
function flee() {
    showNotification("Vous fuyez le combat !", 'info');
    setTimeout(() => {
        document.getElementById('battle-interface').style.display = 'none';
    }, 1500);
}