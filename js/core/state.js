// Fichier : js/core/state.js

import { itemsData } from './gameData.js';

export let player = null;
export let currentDungeon = null;

// Classe de base pour un personnage
class Character {
    constructor(name, playerClass, level, xp, gold, stats, quests, inventory, equipment, abilities, hp, maxHp, mana, maxMana) {
        this.name = name;
        this.playerClass = playerClass;
        this.level = level || 1;
        this.xp = xp || 0;
        this.gold = gold || 0;
        this.stats = stats || { strength: 1, intelligence: 1, speed: 1, dexterity: 1 };
        this.quests = quests || {};
        this.inventory = inventory || {};
        this.equipment = equipment || {};
        this.abilities = abilities || [];
        this.hp = hp || 100 + (this.level - 1) * 10;
        this.maxHp = maxHp || 100 + (this.level - 1) * 10;
        this.mana = mana || 50 + (this.level - 1) * 5;
        this.maxMana = maxMana || 50 + (this.level - 1) * 5;
    }

    addXp(amount) {
        this.xp += amount;
        while (this.xp >= this.level * 100) {
            this.xp -= this.level * 100;
            this.levelUp();
        }
    }

    levelUp() {
        this.level++;
        this.stats.strength += 1;
        this.stats.intelligence += 1;
        this.stats.speed += 1;
        this.stats.dexterity += 1;
        this.maxHp += 10;
        this.hp = this.maxHp;
        this.maxMana += 5;
        this.mana = this.maxMana;
        saveCharacter();
    }

    addGold(amount) {
        this.gold += amount;
        saveCharacter();
    }

    addItemToInventory(itemId, quantity = 1) {
        if (!this.inventory[itemId]) {
            this.inventory[itemId] = 0;
        }
        this.inventory[itemId] += quantity;
        saveCharacter();
    }

    getStat(statName) {
        return this.stats[statName] + (this.equipment.weapon ? this.equipment.weapon.stats[statName] || 0 : 0) + (this.equipment.armor ? this.equipment.armor.stats[statName] || 0 : 0);
    }

    getWeaponDamage() {
        if (this.equipment.weapon) {
            return this.equipment.weapon.damage;
        }
        return 5;
    }
}

/**
 * Charge les données du personnage depuis le stockage local.
 */
export function loadCharacter() {
    try {
        const savedData = JSON.parse(localStorage.getItem('playerCharacter'));
        if (savedData) {
            player = new Character(
                savedData.name,
                savedData.playerClass,
                savedData.level,
                savedData.xp,
                savedData.gold,
                savedData.stats,
                savedData.quests,
                savedData.inventory,
                savedData.equipment,
                savedData.abilities,
                savedData.hp,
                savedData.maxHp,
                savedData.mana,
                savedData.maxMana
            );
            console.log("Personnage chargé :", player);
            updateStatsDisplay();
            return true;
        }
    } catch (error) {
        console.error("Erreur lors du chargement du personnage:", error);
    }
    return false;
}

/**
 * Sauvegarde les données du personnage dans le stockage local.
 * Nous créons une copie sans les méthodes pour éviter les erreurs de sérialisation.
 */
export function saveCharacter() {
    if (player) {
        try {
            const dataToSave = {
                name: player.name,
                playerClass: player.playerClass,
                level: player.level,
                xp: player.xp,
                gold: player.gold,
                stats: player.stats,
                quests: player.quests,
                inventory: player.inventory,
                equipment: player.equipment,
                abilities: player.abilities,
                hp: player.hp,
                maxHp: player.maxHp,
                mana: player.mana,
                maxMana: player.maxMana
            };
            localStorage.setItem('playerCharacter', JSON.stringify(dataToSave));
            console.log("Personnage sauvegardé.");
            updateStatsDisplay();
        } catch (error) {
            console.error("Erreur lors de la sauvegarde du personnage:", error);
        }
    }
}

// Fonction pour mettre à jour l'affichage des statistiques
export function updateStatsDisplay() {
    if (!player) return;
    const hpElement = document.getElementById('player-hp');
    const manaElement = document.getElementById('player-mana');
    const goldElement = document.getElementById('player-gold');

    if (hpElement) hpElement.textContent = `${player.hp}/${player.maxHp}`;
    if (manaElement) manaElement.textContent = `${player.mana}/${player.maxMana}`;
    if (goldElement) goldElement.textContent = player.gold;
}

// Réinitialise le donjon en cours
export function resetDungeon() {
    localStorage.removeItem('currentDungeon');
    currentDungeon = null;
}

// Applique les récompenses d'une quête au joueur
export function applyRewards(rewards) {
    if (!player) return;
    if (rewards.xp) {
        player.addXp(rewards.xp);
    }
    if (rewards.gold) {
        player.addGold(rewards.gold);
    }
    if (rewards.item) {
        player.addItemToInventory(rewards.item, 1);
    }
    saveCharacter();
}

// Crée et initialise un nouveau personnage
export function createCharacter(name, playerClass) {
    player = new Character(name, playerClass);
    saveCharacter();
}

// Chargement initial du personnage
loadCharacter();