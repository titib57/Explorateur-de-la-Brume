// Fichier : js/modules/character.js

import { saveCharacter, player, loadCharacter } from '../core/state.js';
import { classBases, questsData } from '../core/gameData.js';
import { showNotification } from '../core/notifications.js';

export function createCharacter(name, age, height, weight, charClass) {
    const newCharacter = {
        name,
        age,
        height,
        weight,
        class: charClass,
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
            armor: null
        },
        quests: {
            'premiers_pas': { ...questsData.premiers_pas }
        }
    };

    saveCharacter(newCharacter);
    
    if (localStorage.getItem('playerCharacter')) {
        showNotification('Personnage créé avec succès !', 'success');
        setTimeout(() => {
            window.location.href = 'stats.html';
        }, 2000);
    } else {
        showNotification('Erreur: Impossible de sauvegarder le personnage. Veuillez réessayer.', 'error');
    }
}

export function giveXP(amount) {
    player.xp += amount;
    showNotification(`Vous avez gagné ${amount} XP !`, 'info');
    if (player.xp >= player.xpToNextLevel) {
        levelUp();
    }
}

export function levelUp() {
    player.level++;
    player.xp = player.xp - player.xpToNextLevel;
    player.xpToNextLevel = Math.floor(player.xpToNextLevel * 1.5);
    player.statPoints += 3;
    player.skillPoints += 1;
    showNotification(`Félicitations ! Vous êtes passé au niveau ${player.level} !`, 'success');
    recalculateDerivedStats();
}

export function recalculateDerivedStats() {
    const baseStats = classBases[player.class].stats;
    let totalStats = { ...player.stats };

    // Ajouter les bonus d'équipement
    if (player.equipment.weapon && player.equipment.weapon.stats) {
        for (const stat in player.equipment.weapon.stats) {
            totalStats[stat] = (totalStats[stat] || 0) + player.equipment.weapon.stats[stat];
        }
    }
    if (player.equipment.armor && player.equipment.armor.stats) {
        for (const stat in player.equipment.armor.stats) {
            totalStats[stat] = (totalStats[stat] || 0) + player.equipment.armor.stats[stat];
        }
    }

    // Calculer les stats dérivées
    player.maxHp = 50 + (totalStats.strength * 5) + (player.level * 10);
    player.maxMana = 20 + (totalStats.intelligence * 5) + (player.level * 5);
    player.attackDamage = 10 + (totalStats.strength * 2);
    player.defense = 5 + (totalStats.dexterity * 1.5);
    player.critChance = 5 + (totalStats.dexterity * 0.5);
    player.critDamage = 1.5 + (totalStats.dexterity * 0.05);

    // S'assurer que les PV et le mana ne dépassent pas le maximum
    if (player.hp > player.maxHp) player.hp = player.maxHp;
    if (player.mana > player.maxMana) player.mana = player.maxMana;
}