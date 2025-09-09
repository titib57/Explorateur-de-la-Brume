// Fichier : js/game/character.js
// Définit la classe Character et ses méthodes.

import { questsData } from '../core/questsData.js';
import { itemsData } from '../data/items.js';
import { classBases } from '../data/characters.js';

export class Character {
    constructor(data) {
        this.name = data.name;
        this.playerClass = data.playerClass;
        this.level = data.level || 1;
        this.xp = data.xp || 0;
        this.xpToNextLevel = this.level * 100;
        this.gold = data.gold || 100;
        this.stats = data.stats || { strength: 1, intelligence: 1, speed: 1, dexterity: 1 };
        this.quests = data.quests || { current: null, completed: {} };
        this.inventory = data.inventory || {};
        this.equipment = data.equipment || {};
        this.abilities = data.abilities || [];
        this.hp = data.hp || 0;
        this.maxHp = data.maxHp || 0;
        this.mana = data.mana || 0;
        this.maxMana = data.maxMana || 0;
        this.statPoints = data.statPoints || 5;
        this.safePlaceLocation = data.safePlaceLocation || null;
        this.journal = data.journal || [];
        this.age = data.age;
        this.height = data.height;
        this.weight = data.weight;
    }

    addXp(amount) {
        this.xp += amount;
    }

    levelUp() {
        this.level++;
        this.xp -= this.xpToNextLevel;
        this.xpToNextLevel = this.level * 100;
        this.statPoints += 3;
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
        const newMaxHp = 100 + (this.stats.strength * 10);
        const newMaxMana = 50 + (this.stats.intelligence * 10);

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

        this.hp = Math.min(this.hp, this.maxHp);
        this.mana = Math.min(this.mana, this.maxMana);
    }
}

/**
 * Crée un nouvel objet de données de personnage avec des statistiques de base.
 * @param {object} formData Les données du formulaire de création de personnage.
 * @returns {object} Un nouvel objet de données de personnage.
 */
export function createNewCharacterData(formData) {
    const baseStats = classBases[formData.class] ? classBases[formData.class].stats : { strength: 1, intelligence: 1, speed: 1, dexterity: 1 };
    
    return {
        name: formData.name,
        age: parseInt(formData.age),
        height: parseInt(formData.height),
        weight: parseInt(formData.weight),
        playerClass: formData.class || "Adventurer",
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
        hp: 0,
        maxHp: 0,
        mana: 0,
        maxMana: 0,
        statPoints: 5,
        safePlaceLocation: null,
        journal: [],
        createdAt: new Date().toISOString(),
        lastPlayed: new Date().toISOString()
    };
}