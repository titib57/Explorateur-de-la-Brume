// Fichier : js/game/character.js
// Définit la classe Character et ses méthodes.

import { questsData } from '../core/questsData.js';
import { itemsData } from '../data/items.js';
import { classBases } from '../data/characters.js';

export class Character {
    constructor(data) {
        // Initialisation de toutes les propriétés du personnage.
        this.name = data.name;
        this.playerClass = data.playerClass;
        this.age = data.age || 20;
        this.height = data.height || 175;
        this.weight = data.weight || 70;
        this.level = data.level || 1;
        this.xp = data.xp || 0;
        this.xpToNextLevel = data.xpToNextLevel || this.level * 100;
        this.gold = data.gold || 100;
        this.stats = data.stats || { strength: 1, intelligence: 1, speed: 1, dexterity: 1 };
        this.quests = data.quests || { current: null, completed: {} };
        this.inventory = data.inventory || {};
        this.equipment = data.equipment || {};
        this.abilities = data.abilities || [];
        // Points de vie et de mana
        this.maxHp = data.maxHp || 100 + (this.stats.strength * 10);
        this.hp = data.hp || this.maxHp;
        this.maxMana = data.maxMana || 50 + (this.stats.intelligence * 10);
        this.mana = data.mana || this.maxMana;
        
        this.statPoints = data.statPoints || 5;
        this.safePlaceLocation = data.safePlaceLocation || null;
        this.journal = data.journal || [];
        this.createdAt = data.createdAt || new Date().toISOString();
        this.lastPlayed = data.lastPlayed || new Date().toISOString();

        // Statistiques de combat calculées (mises à jour dans une méthode dédiée)
        this.attackDamage = 0;
        this.defense = 0;
        
        // Appeler la méthode de recalcul pour initialiser les stats dérivées
        this.recalculateDerivedStats();
    }

    // Méthodes inchangées
    addXp(amount) {
        this.xp += amount;
    }

    levelUp() {
        this.level++;
        this.xp -= this.xpToNextLevel;
        this.xpToNextLevel = this.level * 100;
        this.statPoints += 3;
        this.recalculateDerivedStats();
    }

    addItem(item) {
        if (!this.inventory[item.id]) {
            this.inventory[item.id] = { ...item, quantity: 1 };
        } else {
            this.inventory[item.id].quantity++;
        }
    }

    startQuest(questId) {
        const quest = questsData[questId];
        if (quest) {
            this.quests.current = { questId: questId, currentProgress: 0 };
        }
    }

    updateQuestProgress(questId, amount) {
        if (this.quests.current && this.quests.current.questId === questId) {
            this.quests.current.currentProgress += amount;
        }
    }

    completeQuest(questId) {
        const quest = questsData[questId];
        if (quest && this.quests.current && this.quests.current.questId === questId) {
            this.quests.completed[questId] = {
                completionDate: Date.now()
            };
            this.quests.current = null;
        }
    }

    addToJournal(message) {
        this.journal.unshift({
            timestamp: Date.now(),
            message: message
        });
        if (this.journal.length > 50) {
            this.journal.pop();
        }
    }

    recalculateDerivedStats() {
        // Recalcul des points de vie et de mana maximum
        const newMaxHp = 100 + (this.stats.strength * 10);
        const newMaxMana = 50 + (this.stats.intelligence * 10);

        // Ajustement des points de vie/mana actuels
        if (this.maxHp > 0) {
            this.hp = Math.floor(this.hp * (newMaxHp / this.maxHp));
        } else {
            this.hp = newMaxHp;
        }
        if (this.maxMana > 0) {
            this.mana = Math.floor(this.mana * (newMaxMana / this.maxMana));
        } else {
            this.mana = newMaxMana;
        }
        this.maxHp = newMaxHp;
        this.maxMana = newMaxMana;

        const weaponData = this.equipment.weapon ? itemsData[this.equipment.weapon.id] : null;
        const armorData = this.equipment.armor ? itemsData[this.equipment.armor.id] : null;

        this.attackDamage = (this.stats.strength * 0.8) + (weaponData ? weaponData.attackDamage || 0 : 0);
        this.defense = (this.stats.strength * 0.5) + (armorData ? armorData.defense || 0 : 0);

        // S'assurer que les valeurs actuelles ne dépassent pas les maximums
        this.hp = Math.min(this.hp, this.maxHp);
        this.mana = Math.min(this.mana, this.maxMana);
    }
}

/**
 * Crée un nouvel objet de données de personnage avec des statistiques de base.
 * @param {string} name Le nom du personnage.
 * @param {string} charClass La classe du personnage.
 * @param {number} age L'âge du personnage.
 * @param {number} height La taille du personnage en cm.
 * @param {number} weight Le poids du personnage en kg.
 * @returns {object} Un nouvel objet de données de personnage.
 */
export function createCharacterData(name, charClass, age, height, weight) {
    const baseStats = classBases[charClass] ? classBases[charClass].stats : { strength: 1, intelligence: 1, speed: 1, dexterity: 1 };
    
    const initialCharacter = {
        name,
        playerClass: charClass,
        age,
        height,
        weight,
        level: 1,
        xp: 0,
        xpToNextLevel: 100,
        gold: 100,
        stats: baseStats,
        quests: {
            current: 'initial_adventure_quest',
            completed: {}
        },
        inventory: {},
        equipment: {},
        abilities: [],
        statPoints: 5,
        safePlaceLocation: null,
        journal: [],
        createdAt: new Date().toISOString(),
        lastPlayed: new Date().toISOString()
    };

    // Calcul des HP et MP initiaux
    const initialMaxHp = 100 + (initialCharacter.stats.strength * 10);
    const initialMaxMana = 50 + (initialCharacter.stats.intelligence * 10);
    initialCharacter.maxHp = initialMaxHp;
    initialCharacter.hp = initialMaxHp; // Les HP sont à max au départ
    initialCharacter.maxMana = initialMaxMana;
    initialCharacter.mana = initialMaxMana; // Le mana est à max au départ

    return initialCharacter;
}