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
    console.log("Personnage chargé :", player);
    return true;
}

// Fonction de base pour la création de personnage
// Cette fonction sera appelée depuis character_creation.html
function createCharacter(name, age, height, weight, morphology, baseClass) {
    const newCharacter = {
        name: name,
        age: age,
        height: height,
        weight: weight,
        morphology: morphology,
        baseClass: baseClass,
        class: 'explorateur',
        xp: 0,
        level: 1,
        xpToNextLevel: 100,
        statPoints: 5,
        skillPoints: 1,
        gold: 0,
        stats: {
            strength: 1,
            intelligence: 1,
            speed: 1,
            dexterity: 1
        },
        unlockedSkills: ['fist_attack'],
        unlockedClasses: ['explorateur'],
        inventory: [],
        equipment: {
            weapon: null,
            armor: null,
            talisman: null, // <-- Ajout de l'emplacement du talisman
        },
        elementalResistance: null, // <-- Ajout de la propriété de résistance
        quests: {}
    };

    const baseStats = classBases[baseClass].stats;
    Object.assign(newCharacter.stats, baseStats);
    applyPhysicalAttributes(newCharacter);
    recalculateDerivedStats(newCharacter);
    
    newCharacter.hp = newCharacter.maxHp;
    newCharacter.mana = newCharacter.maxMana;

    saveCharacter(newCharacter);
    player = newCharacter;
}

/**
 * Recalcule les statistiques dérivées du personnage (HP, Mana, Dégâts, etc.).
 * Cette fonction est appelée après un changement de stats, d'équipement ou de niveau.
 */
function recalculateDerivedStats() {
    if (!player) return;

    // Calcul des PV et Mana de base
    player.maxHp = 100 + (player.stats.strength * 10);
    player.maxMana = 50 + (player.stats.intelligence * 10);
    player.attackDamage = 5 + (player.stats.strength * 2);
    player.defense = 5 + (player.stats.strength + player.stats.dexterity);

    // Bonus d'équipement
    if (player.equipment.weapon) {
        player.attackDamage += player.equipment.weapon.attack || 0;
        player.stats.intelligence += player.equipment.weapon.intelligence || 0;
        player.stats.speed += player.equipment.weapon.speed || 0;
    }
    if (player.equipment.armor) {
        player.defense += player.equipment.armor.defense || 0;
        player.maxMana += player.equipment.armor.mana || 0;
    }

    // Effets des compétences passives
    player.unlockedSkills.forEach(skillId => {
        const skill = getAbilityById(skillId);
        if (skill && skill.type === 'passive' && skill.effect) {
            for (const stat in skill.effect) {
                if (player.stats.hasOwnProperty(stat)) {
                    player.stats[stat] += skill.effect[stat];
                }
            }
        }
    });

    // Bonus de résistance élémentaire de l'équipement
    if (player.equipment.talisman) {
        player.elementalResistance = player.equipment.talisman.resistance; // Prend en compte la résistance du talisman
    } else {
        player.elementalResistance = null; // Réinitialise si aucun talisman n'est équipé
    }
}


/**
 * Donne de l'expérience au joueur et vérifie s'il monte de niveau.
 * @param {number} xpAmount La quantité d'XP à ajouter.
 */
function giveXP(xpAmount) {
    if (!player) return;
    
    player.xp += xpAmount;
    showNotification(`Vous gagnez ${xpAmount} points d'expérience.`, 'info');
    
    while (player.xp >= player.xpToNextLevel) {
        player.xp -= player.xpToNextLevel;
        player.level++;
        player.statPoints += 2; // Gagne 2 points de stats par niveau
        player.skillPoints += 1; // Gagne 1 point de compétence par niveau
        player.xpToNextLevel = Math.floor(player.xpToNextLevel * 1.5);
        recalculateDerivedStats();
        player.hp = player.maxHp;
        player.mana = player.maxMana;
        showNotification(`Félicitations ! Vous êtes passé au niveau ${player.level} !`, 'success');
    }
    saveCharacter(player);
}

// Helper function pour récupérer les détails d'une compétence par son ID
function getAbilityById(abilityId) {
    const commonAbilities = abilitiesData.explorateur;
    const commonAbility = commonAbilities.find(a => a.id === abilityId);
    if (commonAbility) {
        return commonAbility;
    }

    if (abilitiesData[player.class]) {
        const classAbility = abilitiesData[player.class].find(a => a.id === abilityId);
        if (classAbility) {
            return classAbility;
        }
    }
    
    const baseAbility = abilitiesData.explorateur.find(a => a.id === abilityId);
    if (baseAbility) {
        return baseAbility;
    }
    
    return null;
}

/**
 * Applique des ajustements de statistiques de base en fonction de la morphologie du personnage.
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
        updateWorldMapUI();
    }, 2000);
}