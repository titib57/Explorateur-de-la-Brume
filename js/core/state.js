// Fichier : js/core/state.js
// Ce module gère l'état global du jeu et l'objet joueur.

import { itemsData } from '../data/items.js';
import { questsData } from './questsData.js';

// Objets d'état globaux
export let player = null;
export let currentDungeon = null;
export let currentMonster = null;

// Classe de base pour un personnage
export class Character {
    constructor(name, playerClass, level, xp, gold, stats, quests, inventory, equipment, abilities, hp, maxHp, mana, maxMana, safePlaceLocation, journal) {
        this.name = name;
        this.playerClass = playerClass;
        this.level = level || 1;
        this.xp = xp || 0;
        this.xpToNextLevel = this.level * 100;
        this.gold = gold || 3;
        this.stats = stats || { strength: 1, intelligence: 1, speed: 1, dexterity: 1 };
        this.quests = quests || { current: null, completed: {} };
        this.inventory = inventory || {};
        this.equipment = equipment || {};
        this.abilities = abilities || [];
        this.hp = hp || 0;
        this.maxHp = maxHp || 0;
        this.mana = mana || 0;
        this.maxMana = maxMana || 0;
        this.statPoints = 0;
        this.safePlaceLocation = safePlaceLocation || null;
        this.journal = journal || [];
    }

    // Méthodes pour manipuler l'état du personnage
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
}

// Fonction pour initialiser les données d'un nouveau personnage
export function createCharacterData(name, playerClass) {
    return {
        name: name,
        playerClass: playerClass || "Adventurer",
        level: 1,
        xp: 0,
        xpToNextLevel: 100,
        gold: 100,
        stats: { strength: 1, intelligence: 1, speed: 1, dexterity: 1 },
        quests: {
            current: null,
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
        journal: []
    };
}

// Recalcule les statistiques dérivées du joueur
export function recalculateDerivedStats(p) {
    const newMaxHp = 100 + (p.stats.strength * 10);
    const newMaxMana = 50 + (p.stats.intelligence * 10);

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

    const weaponData = p.equipment.weapon ? itemsData[p.equipment.weapon.id] : null;
    const armorData = p.equipment.armor ? itemsData[p.equipment.armor.id] : null;

    p.attackDamage = (p.stats.strength * 0.8) + (weaponData ? weaponData.attackDamage || 0 : 0);
    p.defense = (p.stats.strength * 0.5) + (armorData ? armorData.defense || 0 : 0);

    p.hp = Math.min(p.hp, p.maxHp);
    p.mana = Math.min(p.mana, p.maxMana);

    return p;
}

// Fonctions pour gérer le donjon
export function resetDungeon() {
    localStorage.removeItem('currentDungeon');
    currentDungeon = null;
}

export function saveDungeon(dungeon) {
    localStorage.setItem('currentDungeon', JSON.stringify(dungeon));
}

// Fonctions pour définir l'état
export function setPlayer(newPlayer) {
    player = newPlayer;
}

export function setCurrentMonster(newMonster) {
    currentMonster = newMonster;
}

export function setDungeon(dungeon) {
    currentDungeon = dungeon;
}