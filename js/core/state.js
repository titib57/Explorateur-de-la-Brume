// Fichier : js/core/state.js
// Ce module gère l'état global du jeu, y compris l'objet joueur, le donjon et les monstres.

import { itemsData } from './gameData.js';
import { showNotification } from './notifications.js';
import { initializeCharacter } from '../modules/character.js';

// Objets d'état globaux
export let player = null;
export let currentDungeon = null;
export let currentMonster = null;

/**
 * Définit le monstre actuellement en combat.
 * @param {object} monster L'objet monstre.
 */
export function setCurrentMonster(monster) {
    currentMonster = monster;
}

// Classe de base pour un personnage
class Character {
    constructor(name, playerClass, level, xp, gold, stats, quests, inventory, equipment, abilities, hp, maxHp, mana, maxMana, age, height, weight) {
        this.name = name;
        this.playerClass = playerClass;
        this.level = level || 1;
        this.xp = xp || 0;
        this.xpToNextLevel = this.level * 100;
        this.gold = gold || 3;
        this.stats = stats || { strength: 1, intelligence: 1, speed: 1, dexterity: 1 };
        this.quests = quests || {};
        this.inventory = inventory || {};
        this.equipment = equipment || {};
        this.abilities = abilities || [];
        this.hp = hp || 0;
        this.maxHp = maxHp || 0;
        this.mana = mana || 0;
        this.maxMana = maxMana || 0;
        this.age = age || null;
        this.height = height || null;
        this.weight = weight || null;
        this.statPoints = 0;
    }

    /**
     * Ajoute de l'expérience au joueur et gère les montées de niveau.
     * @param {number} amount La quantité d'XP à ajouter.
     */
    addXp(amount) {
        this.xp += amount;
        if (this.xp >= this.xpToNextLevel) {
            this.levelUp();
        }
    }

    /**
     * Gère la montée de niveau du personnage.
     */
    levelUp() {
        this.level++;
        this.xp -= this.xpToNextLevel;
        this.xpToNextLevel = this.level * 100;
        this.statPoints += 3;
        recalculateDerivedStats(this);
        showNotification(`Montée de niveau ! Vous êtes maintenant niveau ${this.level} !`, 'success');
        showNotification(`Vous avez reçu 3 points de statistique.`, 'info');
    }

    /**
     * Ajoute un objet à l'inventaire du joueur.
     * @param {object} item L'objet à ajouter.
     */
    addItem(item) {
        if (!this.inventory[item.id]) {
            this.inventory[item.id] = { ...item, quantity: 1 };
        } else {
            this.inventory[item.id].quantity++;
        }
        showNotification(`${item.name} a été ajouté à votre inventaire.`, 'info');
    }
}

/**
 * Crée un nouvel objet personnage.
 * @param {string} name Le nom du personnage.
 * @param {string} playerClass La classe du personnage.
 * @param {number} age L'âge du personnage.
 * @param {number} height La taille du personnage.
 * @param {number} weight Le poids du personnage.
 * @returns {Character} Le nouvel objet personnage.
 */
export function createCharacter(name, playerClass, age, height, weight) {
    const newPlayer = new Character(name, playerClass, 1, 0, 100, { strength: 1, intelligence: 1, speed: 1, dexterity: 1 }, {}, {}, {}, [], 0, 0, 0, 0, age, height, weight);
    newPlayer.statPoints = 5; // Points de départ
    recalculateDerivedStats(newPlayer);
    player = newPlayer;
    savePlayer(player);
    return player;
}

/**
 * Charge l'objet joueur depuis le localStorage.
 * @returns {object|null} L'objet joueur ou null si non trouvé.
 */
export function loadCharacter() {
    const savedPlayer = JSON.parse(localStorage.getItem('playerCharacter'));
    if (savedPlayer) {
        const char = new Character(
            savedPlayer.name, savedPlayer.playerClass, savedPlayer.level, savedPlayer.xp, savedPlayer.gold,
            savedPlayer.stats, savedPlayer.quests, savedPlayer.inventory, savedPlayer.equipment,
            savedPlayer.abilities, savedPlayer.hp, savedPlayer.maxHp, savedPlayer.mana, savedPlayer.maxMana,
            savedPlayer.age, savedPlayer.height, savedPlayer.weight
        );
        char.statPoints = savedPlayer.statPoints;
        char.xpToNextLevel = savedPlayer.xpToNextLevel;
        player = char;
        return player;
    }
    return null;
}

/**
 * Sauvegarde l'objet joueur dans le localStorage.
 * @param {object} p L'objet joueur à sauvegarder.
 */
export function savePlayer(p) {
    localStorage.setItem('playerCharacter', JSON.stringify(p));
}

/**
 * Recalcule les statistiques dérivées du joueur (PV, Mana, Dégâts, Défense).
 * @param {object} p L'objet joueur.
 */
export function recalculateDerivedStats(p) {
    // Calcul de la santé et du mana
    const newMaxHp = 100 + (p.stats.strength * 10);
    const newMaxMana = 50 + (p.stats.intelligence * 10);
    
    // Si la santé et le mana ont déjà été initialisés, on les ajuste proportionnellement
    if (p.maxHp > 0) {
        p.hp = Math.floor(p.hp * (newMaxHp / p.maxHp));
    } else {
        p.hp = newMaxHp;
    }
    if (p.maxMana > 0) {
        p.mana = Math.floor(p.mana * (newMaxMana / p.maxMana));
    } else {
        p.mana = newMaxMana;
    }
    
    p.maxHp = newMaxHp;
    p.maxMana = newMaxMana;

    // Calcul des dégâts et de la défense en fonction de l'équipement
    const weaponData = p.equipment.weapon ? itemsData[p.equipment.weapon.id] : null;
    const armorData = p.equipment.armor ? itemsData[p.equipment.armor.id] : null;

    if (weaponData) {
        p.attackDamage = (p.stats.strength * 0.8) + (weaponData.attackDamage || 0);
    } else {
        p.attackDamage = (p.stats.strength * 0.8);
    }

    if (armorData) {
        p.defense = (p.stats.strength * 0.5) + (armorData.defense || 0);
    } else {
        p.defense = (p.stats.strength * 0.5);
    }
    
    // Assurer que les PV et le Mana ne dépassent pas leur maximum
    p.hp = Math.min(p.hp, p.maxHp);
    p.mana = Math.min(p.mana, p.maxMana);
    
    return p;
}

/**
 * Met à jour l'affichage des statistiques du joueur.
 */
export function updateStatsDisplay() {
    if (!player) return;
    const hpElement = document.getElementById('player-hp');
    const manaElement = document.getElementById('player-mana');
    const goldElement = document.getElementById('player-gold');

    if (hpElement) hpElement.textContent = `${player.hp}/${player.maxHp}`;
    if (manaElement) manaElement.textContent = `${player.mana}/${player.maxMana}`;
    if (goldElement) goldElement.textContent = player.gold;
}

/**
 * Réinitialise le donjon en cours.
 */
export function resetDungeon() {
    localStorage.removeItem('currentDungeon');
    currentDungeon = null;
}

/**
 * Applique les récompenses au joueur.
 * @param {object} rewards L'objet des récompenses (xp, gold, item).
 */
export function applyRewards(rewards) {
    if (!player) return;
    if (rewards.xp) {
        player.addXp(rewards.xp);
    }
    if (rewards.gold) {
        player.gold += rewards.gold;
        showNotification(`Vous avez trouvé ${rewards.gold} pièces d'or.`, 'info');
    }
    if (rewards.item) {
        player.addItem(rewards.item);
    }
    savePlayer(player);
}

/**
 * Donne une récompense de quête au joueur.
 * @param {object} reward L'objet des récompenses de quête.
 */
export function giveQuestReward(reward) {
    if (!player) return;
    applyRewards(reward);
    savePlayer(player);
}

/**
 * Initialise l'état initial du donjon.
 * @param {object} dungeon Le donjon à initialiser.
 */
export function initDungeon(dungeon) {
    currentDungeon = dungeon;
    saveDungeon(currentDungeon);
}

/**
 * Sauvegarde l'état du donjon dans le localStorage.
 * @param {object} dungeon L'objet donjon à sauvegarder.
 */
export function saveDungeon(dungeon) {
    localStorage.setItem('currentDungeon', JSON.stringify(dungeon));
}
