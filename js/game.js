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
    player = JSON.parse(characterData);
    // Assurer que les propriétés de base existent
    if (!player.unlockedSkills) {
        player.unlockedSkills = ['fist_attack'];
    }
    if (!player.equipment) {
        player.equipment = { weapon: null, armor: null };
    }
    if (!player.quests) {
        player.quests = { ...questsData };
    }
    if (!player.element) {
        player.element = 'neutre';
    }
    return true;
}

/**
 * Calcule les statistiques dérivées du personnage (PV max, mana max, dégâts, etc.).
 */
function recalculateDerivedStats() {
    const baseStats = player.stats;
    let totalStrength = baseStats.strength + (player.equipment.weapon ? player.equipment.weapon.stats.strength || 0 : 0) + (player.equipment.armor ? player.equipment.armor.stats.strength || 0 : 0);
    let totalIntelligence = baseStats.intelligence + (player.equipment.weapon ? player.equipment.weapon.stats.intelligence || 0 : 0) + (player.equipment.armor ? player.equipment.armor.stats.intelligence || 0 : 0);
    let totalSpeed = baseStats.speed + (player.equipment.weapon ? player.equipment.weapon.stats.speed || 0 : 0) + (player.equipment.armor ? player.equipment.armor.stats.speed || 0 : 0);
    let totalDexterity = baseStats.dexterity + (player.equipment.weapon ? player.equipment.weapon.stats.dexterity || 0 : 0) + (player.equipment.armor ? player.equipment.armor.stats.dexterity || 0 : 0);

    // Appliquer les effets de compétences passives
    player.unlockedSkills.forEach(skillId => {
        const skill = getSkillById(skillId);
        if (skill && skill.type === 'passive' && skill.effect) {
            totalStrength += skill.effect.strength || 0;
            totalIntelligence += skill.effect.intelligence || 0;
            totalSpeed += skill.effect.speed || 0;
            totalDexterity += skill.effect.dexterity || 0;
        }
    });

    player.maxHp = 100 + (totalStrength * 10);
    player.maxMana = 50 + (totalIntelligence * 5);
    player.attackDamage = 5 + (totalStrength * 2);
    player.defense = 2 + (totalDexterity * 1.5);
    player.critChance = 5 + (totalDexterity * 0.5); // 0.5% de chance de critique par point de Dextérité
    player.critDamage = 1.5; // Multiplicateur de dégâts critiques de base

    // Mettre à jour l'élément du joueur en fonction de l'arme
    if (player.equipment.weapon && player.equipment.weapon.element && player.equipment.weapon.element !== 'neutre') {
        player.element = player.equipment.weapon.element;
    } else {
        player.element = 'neutre';
    }

}

/**
 * Réinitialise les statistiques du personnage à leur valeur de base.
 */
function resetCharacterStats() {
    // Implémentez la réinitialisation si nécessaire
}


/**
 * Gagne de l'expérience et gère les montées de niveau.
 * @param {number} amount La quantité d'XP à ajouter.
 */
function giveXP(amount) {
    player.xp += amount;
    showNotification(`Vous avez gagné ${amount} points d'expérience !`, 'info');
    while (player.xp >= player.xpToNextLevel) {
        player.xp -= player.xpToNextLevel;
        player.level++;
        player.xpToNextLevel = Math.floor(player.xpToNextLevel * 1.5);
        player.statPoints += 3;
        player.skillPoints += 1;
        recalculateDerivedStats();
        player.hp = player.maxHp; // Soin complet à la montée de niveau
        player.mana = player.maxMana;
        showNotification(`Vous êtes monté au niveau ${player.level} !`, 'success');
    }
    saveCharacter(player);
}

/**
 * Gère l'obtention d'un objet.
 * @param {string} itemId L'ID de l'objet.
 */
function obtainItem(itemId) {
    const item = itemsData.weapons[itemId] || itemsData.armors[itemId] || itemsData.consumables[itemId];
    if (item) {
        player.inventory.push(item);
        showNotification(`Vous avez trouvé un(e) ${item.name} !`, 'success');
        saveCharacter(player);
    }
}

/**
 * Trouve une compétence par son ID, en cherchant d'abord dans les arbres de compétences,
 * puis dans les données de compétences de base.
 */
function getSkillById(skillId) {
    // Vérifier les compétences de l'arbre de classe
    const classTree = skillTreeData[player.class];
    if (classTree && classTree.skills[skillId]) {
        return classTree.skills[skillId];
    }
    
    // Vérifier les compétences des classes de base (guerrier, mage, voleur)
    for (const classId in abilitiesData) {
        const ability = abilitiesData[classId].find(a => a.id === skillId);
        if (ability) {
            return ability;
        }
    }
    
    return null;
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
        updateWorldMapUI();
    }, 3000);
}