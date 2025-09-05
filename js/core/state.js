// Fichier : js/core/state.js
// Ce module gère l'état global du jeu, y compris l'objet joueur, le donjon, les monstres et l'abris.

import { itemsData } from './gameData.js';
import { showNotification } from './notifications.js';
import { questsData } from './questsData.js';
import { auth, db } from './firebase_config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { doc, setDoc, deleteDoc, getDoc } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { upgradeShelter } from '../modules/shelterManager.js';
import { startNextWaveTimer } from '../modules/waveManager.js';


// Global variables provided by the Canvas environment
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Objets d'état globaux
export let player = null;
export let currentDungeon = null;
export let currentMonster = null;
export let userId = null;

let authPromiseResolved = false;
let authPromise = new Promise(resolve => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
            userId = user.uid;
        } else {
            userId = null;
        }
        if (!authPromiseResolved) {
            resolve();
            authPromiseResolved = true;
            unsubscribe();
        }
    });
});

/**
 * Définit l'ID de l'utilisateur.
 * @param {string} newUserId L'ID de l'utilisateur.
 */
export function setUserId(newUserId) {
    userId = newUserId;
}

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
        // Quêtes gérées par un objet pour un suivi plus simple
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
    
    /**
     * Démarre une nouvelle quête.
     * @param {string} questId L'ID de la quête à démarrer.
     */
    startQuest(questId) {
        const quest = questsData[questId];
        if (quest) {
            this.quests[questId] = {
                status: 'in_progress',
                objective: {
                    current: 0,
                    required: quest.objective.required
                }
            };
            showNotification(`Nouvelle quête : "${quest.title}"`, 'quest');
            savePlayer(this);
        }
    }
    
    /**
     * Met à jour la progression d'une quête.
     * @param {string} questId L'ID de la quête.
     * @param {number} amount Le montant de la progression à ajouter.
     */
    updateQuestProgress(questId, amount) {
        if (this.quests[questId] && this.quests[questId].status === 'in_progress') {
            this.quests[questId].objective.current += amount;
            if (this.quests[questId].objective.current >= this.quests[questId].objective.required) {
                this.completeQuest(questId);
            }
            savePlayer(this);
        }
    }

    /**
     * Termine une quête et donne les récompenses.
     * @param {string} questId L'ID de la quête à terminer.
     */
    completeQuest(questId) {
        const quest = questsData[questId];
        if (quest && this.quests[questId]) {
            this.quests[questId].status = 'completed';
            applyRewards(quest.rewards);
            showNotification(`Quête terminée : "${quest.title}"`, 'quest_completed');
            if (quest.nextQuest) {
                this.startQuest(quest.nextQuest);
            }
            savePlayer(this);
        }
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
    const newPlayer = new Character(
        name,
        playerClass,
        1,
        0,
        100,
        { strength: 1, intelligence: 1, speed: 1, dexterity: 1 },
        {}, // Commence avec un objet de quêtes vide
        {},
        {},
        [],
        0,
        0,
        0,
        0,
        age,
        height,
        weight
    );
    newPlayer.statPoints = 5;
    recalculateDerivedStats(newPlayer);
    player = newPlayer;

 // Ajoute des objets de départ à l'inventaire du joueur
    newPlayer.addItem(itemsData["lame_stase"]);
    newPlayer.addItem(itemsData["veste_survivant"]);
    newPlayer.addItem(itemsData["fragment_ataraxie"]);
    newPlayer.addItem(itemsData["mnemonique"]);



    // Ajoute la première quête ici, en utilisant la nouvelle méthode startQuest
    player.startQuest("initial_adventure_quest"); 
    
    savePlayer(player);
    return player;
}

export function giveXP(xpAmount) {
    player.xp += xpAmount;
    console.log(`Vous gagnez ${xpAmount} XP !`);

    if (player.xp >= player.xpToNextLevel) {
        player.levelUp();
    }
}

/**
 * Charge l'objet joueur depuis Firestore.
 * @returns {Promise<object|null>} L'objet joueur ou null si non trouvé.
 */
export async function loadCharacter(user) {
    await authPromise;

    if (!userId) {
        console.log("Aucun utilisateur n'est connecté. Impossible de charger un personnage.");
        return null;
    }

    try {
        const charRef = doc(db, "artifacts", "default-app-id", "users", user.uid, "characters", user.uid);
        const characterSnap = await getDoc(charRef);

        if (characterSnap.exists()) {
            const savedPlayer = characterSnap.data();
            const char = new Character(
                savedPlayer.name, savedPlayer.playerClass, savedPlayer.level, savedPlayer.xp, savedPlayer.gold,
                savedPlayer.stats, savedPlayer.quests, savedPlayer.inventory, savedPlayer.equipment,
                savedPlayer.abilities, savedPlayer.hp, savedPlayer.maxHp, savedPlayer.mana, savedPlayer.maxMana,
                savedPlayer.age, savedPlayer.height, savedPlayer.weight
            );
            char.statPoints = savedPlayer.statPoints;
            char.xpToNextLevel = savedPlayer.xpToNextLevel;
            recalculateDerivedStats(char);
            player = char;
            console.log("Personnage chargé depuis Firestore !");
            return player;
        } else {
            console.log("Aucun document de personnage trouvé pour l'utilisateur.");
            return null;
        }
    } catch (error) {
        console.error("Erreur lors du chargement du personnage depuis Firestore : ", error);
        return null;
    }
}

// Fonction pour sauvegarder les données du joueur.
// Cette fonction appelle la fonction existante `saveCharacterData`.
export async function savePlayer(playerData) {
    await saveCharacterData(playerData);
}

/**
 * Sauvegarde les données du personnage dans Firestore.
 * @param {object} playerData Les données du personnage à sauvegarder.
 */
export async function saveCharacterData(playerData) {
    if (!userId) {
        console.error("Erreur : Utilisateur non authentifié.");
        return;
    }
    try {
        const charRef = doc(db, "artifacts", "default-app-id", "users", userId, "characters", userId);
        await setDoc(charRef, playerData, { merge: true });
        console.log("Personnage sauvegardé sur Firestore !");
    } catch (error) {
        console.error("Erreur lors de la sauvegarde du personnage sur Firestore : ", error);
    }
}

/**
 * Supprime le document du personnage de Firestore.
 */
export async function deleteCharacterData(user) {
    if (!userId) return;
    try {
        const charRef = doc(db, "artifacts", "default-app-id", "users", userId, "characters", userId);
        await deleteDoc(charRef);
        console.log("Personnage supprimé sur Firestore !");
    } catch (error) {
        console.error("Erreur lors de la suppression du personnage sur Firestore : ", error);
    }
}

/**
 * Recalcule les statistiques dérivées du joueur (PV, Mana, Dégâts, Défense).
 * @param {object} p L'objet joueur.
 */
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
        giveXP(rewards.xp);
    }
    if (rewards.gold) {
        player.gold += rewards.gold;
        showNotification(`Vous avez trouvé ${rewards.gold} pièces d'or.`, 'info');
    }
    if (rewards.items) {
        rewards.items.forEach(item => {
            const itemDetails = itemsData[item.itemId];
            if (itemDetails) {
                player.addItem({ ...itemDetails, quantity: item.quantity });
            }
        });
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

// Référence aux éléments de l'interface utilisateur
const upgradeShelterBtn = document.getElementById('upgradeShelterBtn');

// Écouteur pour le bouton d'amélioration
if (upgradeShelterBtn) {
    upgradeShelterBtn.addEventListener('click', async () => {
        const success = await upgradeShelter('murs'); // L'amélioration des murs
        if (success) {
            // Mettre à jour l'affichage de l'abri après l'amélioration
            console.log("Amélioration réussie !");
        } else {
            console.log("Échec de l'amélioration.");
        }
    });
}

// Démarrez le système de vagues au lancement du jeu
startNextWaveTimer();