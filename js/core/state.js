// Fichier : js/state.js

// Importez les données nécessaires depuis d'autres fichiers.
// Assurez-vous que ces fichiers existent et que les chemins sont corrects.
import { questsData, itemSets, abilitiesData, classBases, itemsData, skillTreeData } from './gameData.js';
import { showNotification } from './notifications.js';

// Déclarez les variables globales du jeu et exportez-les pour qu'elles soient accessibles.
export let player;
export let currentMonster;
export let currentDungeon;





// --- Gestion du Personnage et de la Sauvegarde ---

export function saveCharacter(playerObject) {
    localStorage.setItem('playerCharacter', JSON.stringify(playerObject));

}

/**
 * Charge l'objet du joueur depuis le localStorage.
 * @returns {boolean} Vrai si le personnage a été chargé, faux sinon.
 */
export function loadCharacter() {
    const characterData = localStorage.getItem('playerCharacter');
    if (!characterData) {
        return false;
    }
    player = JSON.parse(characterData);
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
 * Gère le passage de niveau.
 */
export function levelUp() {
    player.level++;
    player.xp = player.xp - player.xpToNextLevel;
    player.xpToNextLevel = Math.floor(player.xpToNextLevel * 1.5);
    player.statPoints += 3;
    player.skillPoints += 1;
    showNotification(`Félicitations ! Vous êtes passé au niveau ${player.level} !`, 'success');
    recalculateDerivedStats();
    player.hp = player.maxHp; 
    player.mana = player.maxMana;
}

/**
 * Gagne de l'expérience et gère les montées de niveau.
 * @param {number} amount La quantité d'XP à ajouter.
 */
export function giveXP(amount) {
    player.xp += amount;
    showNotification(`Vous avez gagné ${amount} points d'expérience !`, 'info');
    if (player.xp >= player.xpToNextLevel) {
        levelUp();
    }
    saveCharacter(player);
}

/**
 * Calcule les statistiques dérivées du personnage (PV max, mana max, dégâts, etc.).
 */
export function recalculateDerivedStats() {
    const baseStats = classBases[player.class].stats;
    let tempPlayer = {
        stats: { ...baseStats },
        passiveEffect: {},
        resistances: {}
    };

    let equippedItems = [];
    if (player.equipment.weapon) equippedItems.push(player.equipment.weapon);
    if (player.equipment.armor) equippedItems.push(player.equipment.armor);

    let setPiecesCount = {};

    equippedItems.forEach(item => {
        if (item.stats) {
            for (const stat in item.stats) {
                tempPlayer.stats[stat] = (tempPlayer.stats[stat] || 0) + item.stats[stat];
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
    
    player.maxHp = 100 + (tempPlayer.stats.strength * 10);
    player.maxMana = 50 + (tempPlayer.stats.intelligence * 5);
    player.attackDamage = 5 + (tempPlayer.stats.strength * 2);
    player.defense = 0 + (tempPlayer.stats.strength * 1.5);
    player.critChance = 0.05; 
    player.evasionChance = 0;
    player.armorPenetration = 0;

    if (tempPlayer.passiveEffect.critChance) player.critChance += tempPlayer.passiveEffect.critChance;
    if (tempPlayer.passiveEffect.evasionChance) player.evasionChance += tempPlayer.passiveEffect.evasionChance;
    if (tempPlayer.passiveEffect.armorPenetration) player.armorPenetration += tempPlayer.passiveEffect.armorPenetration;

    player.stats = tempPlayer.stats;
    player.resistances = tempPlayer.resistances;
}


// --- Fonctions d'inventaire ---

/**
 * Gère l'obtention d'un objet.
 * @param {string} itemId L'ID de l'objet.
 */
export function obtainItem(itemId) {
    const item = itemsData.weapons[itemId] || itemsData.armors[itemId] || itemsData.consumables[itemId];
    if (item) {
        player.inventory.push(item);
        showNotification(`Vous avez trouvé un(e) ${item.name} !`, 'success');
        saveCharacter(player);
    }
}

/**
 * Trouve une compétence par son ID.
 */
export function getSkillById(skillId) {
    const classTree = skillTreeData[player.class];
    if (classTree && classTree.skills[skillId]) {
        return classTree.skills[skillId];
    }
    
    for (const classId in abilitiesData) {
        const ability = abilitiesData[classId].find(a => a.id === skillId);
        if (ability) {
            return ability;
        }
    }
    
    return null;
}