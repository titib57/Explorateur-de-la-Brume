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
    // Réinitialisation des stats de base pour éviter l'accumulation de bonus
    const baseStats = {
        strength: 1,
        intelligence: 1,
        speed: 1,
        dexterity: 1
    };
    
    // Créer un objet temporaire pour stocker les calculs
    let tempPlayer = {
        stats: { ...baseStats },
        passiveEffect: {},
        resistances: {}
    };

    // Appliquer les stats de base du joueur
    for (const stat in player.stats) {
        tempPlayer.stats[stat] += player.stats[stat];
    }
    
    // Liste des objets équipés pour faciliter la gestion des sets
    let equippedItems = [];
    if (player.equipment.weapon) equippedItems.push(player.equipment.weapon);
    if (player.equipment.armor) equippedItems.push(player.equipment.armor);

    // Dictionnaire pour compter les pièces de chaque set
    let setPiecesCount = {};

    // Appliquer les stats et effets passifs des objets équipés
    equippedItems.forEach(item => {
        if (item.stats) {
            for (const stat in item.stats) {
                tempPlayer.stats[stat] += item.stats[stat];
            }
        }
        if (item.passiveEffect) {
            for (const effect in item.passiveEffect) {
                tempPlayer.passiveEffect[effect] = (tempPlayer.passiveEffect[effect] || 0) + item.passiveEffect[effect];
            }
        }
        if (item.resistances) {
            for (const element in item.resistances) {
                tempPlayer.resistances[element] = (tempPlayer.resistances[element] || 0) + item.resistances[element];
            }
        }
        if (item.set) {
            setPiecesCount[item.set] = (setPiecesCount[item.set] || 0) + 1;
        }
    });

    // Appliquer les bonus de set si le joueur a toutes les pièces
    for (const setId in setPiecesCount) {
        const set = itemSets[setId];
        if (set && setPiecesCount[setId] === set.pieces.length) {
            if (set.bonus.stats) {
                for (const stat in set.bonus.stats) {
                    tempPlayer.stats[stat] += set.bonus.stats[stat];
                }
            }
            if (set.bonus.passiveEffect) {
                for (const effect in set.bonus.passiveEffect) {
                     tempPlayer.passiveEffect[effect] = (tempPlayer.passiveEffect[effect] || 0) + set.bonus.passiveEffect[effect];
                }
            }
            if (set.bonus.resistances) {
                 for (const element in set.bonus.resistances) {
                    tempPlayer.resistances[element] = (tempPlayer.resistances[element] || 0) + set.bonus.resistances[element];
                }
            }
        }
    }
    
    // Finalisation des calculs des statistiques
    player.maxHp = 100 + (tempPlayer.stats.strength * 10);
    player.maxMana = 50 + (tempPlayer.stats.intelligence * 5);
    player.attackDamage = 5 + (tempPlayer.stats.strength * 2);
    player.defense = 0 + (tempPlayer.stats.strength * 1.5);
    player.critChance = 0.05; // 5% de base
    player.evasionChance = 0;
    player.armorPenetration = 0;

    // Appliquer les bonus passifs finaux
    if (tempPlayer.passiveEffect.critChance) player.critChance += tempPlayer.passiveEffect.critChance;
    if (tempPlayer.passiveEffect.evasionChance) player.evasionChance += tempPlayer.passiveEffect.evasionChance;
    if (tempPlayer.passiveEffect.armorPenetration) player.armorPenetration += tempPlayer.passiveEffect.armorPenetration;

    // Mettre à jour les stats du joueur
    player.stats = tempPlayer.stats;
    player.resistances = tempPlayer.resistances;
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