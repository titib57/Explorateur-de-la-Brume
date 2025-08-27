// Fichier : js/elements.js

/**
 * Définit la matrice de force et de faiblesse entre les éléments.
 * strongAgainst : L'élément est fort contre cet autre élément (dégâts augmentés).
 * weakAgainst : L'élément est faible contre cet autre élément (dégâts réduits).
 */
const elements = {
    'feu': {
        name: 'Feu',
        strongAgainst: ['terre', 'poison'],
        weakAgainst: ['eau', 'foudre']
    },
    'eau': {
        name: 'Eau',
        strongAgainst: ['feu'],
        weakAgainst: ['foudre', 'terre']
    },
    'terre': {
        name: 'Terre',
        strongAgainst: ['foudre', 'poison'],
        weakAgainst: ['feu', 'eau']
    },
    'foudre': {
        name: 'Foudre',
        strongAgainst: ['eau'],
        weakAgainst: ['terre']
    },
    'poison': {
        name: 'Poison',
        strongAgainst: ['eau'],
        weakAgainst: ['feu', 'terre']
    },
    'neutre': {
        name: 'Neutre',
        strongAgainst: [],
        weakAgainst: []
    }
};

/**
 * Calcule les dégâts infligés par un attaquant à une cible, en tenant compte des éléments.
 * @param {object} attacker L'objet de l'attaquant (joueur ou monstre).
 * @param {object} target L'objet de la cible (joueur ou monstre).
 * @param {number} baseDamage Les dégâts de base de l'attaque.
 * @param {string} attackElement L'élément de l'attaque (p. ex., 'feu', 'eau').
 * @returns {object} Un objet contenant les dégâts finaux et le modificateur de dégâts.
 */
export function calculateElementalDamage(attacker, target, baseDamage, attackElement) {
    let damageMultiplier = 1;
    let message = null;

    if (attackElement && target.element) {
        const attackerElementData = elements[attackElement];
        
        if (attackerElementData.strongAgainst.includes(target.element)) {
            damageMultiplier = 1.5; // Dégâts augmentés
            message = `L'attaque de ${attackerElementData.name} est super efficace contre le monstre de ${elements[target.element].name}!`;
        } else if (attackerElementData.weakAgainst.includes(target.element)) {
            damageMultiplier = 0.5; // Dégâts réduits
            message = `L'attaque de ${attackerElementData.name} est peu efficace contre le monstre de ${elements[target.element].name}!`;
        }
    }

    // Calcul final des dégâts
    let finalDamage = Math.max(0, (baseDamage * damageMultiplier) - target.defense);

    // Gérer les coups critiques
    if (Math.random() * 100 < attacker.critChance) {
        finalDamage *= attacker.critDamage;
        message = (message ? message + " " : "") + "Coup critique !";
    }

    return {
        damage: Math.round(finalDamage),
        multiplier: damageMultiplier,
        message: message
    };
}