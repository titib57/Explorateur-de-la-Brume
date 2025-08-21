// Fichier : js/data.js

// Définition des types et de leurs relations de force et de faiblesse
const typeEffectiveness = {
    fire: {
        weakAgainst: ['water'],
        strongAgainst: ['nature']
    },
    water: {
        weakAgainst: ['nature'],
        strongAgainst: ['fire']
    },
    nature: {
        weakAgainst: ['fire'],
        strongAgainst: ['water']
    }
};

const abilitiesData = {
    guerrier: [
        // Ajout d'un type à chaque attaque de base
        { id: "puissant_coup", name: "Coup puissant", damage: 20, cost: 5, type: 'fire' },
        { id: "charge", name: "Charge", damage: 30, cost: 10, type: 'fire' }
    ],
    mage: [
        { id: "boule_de_feu", name: "Boule de feu", damage: 25, cost: 10, type: 'fire' },
        { id: "eclair", name: "Éclair", damage: 35, cost: 15, type: 'water' }
    ],
    voleur: [
        { id: "attaque_sournoise", name: "Attaque sournoise", damage: 22, cost: 8, type: 'nature' },
        { id: "jet_de_dague", name: "Jet de dague", damage: 18, cost: 5, type: 'nature' }
    ],
    explorateur: [
        { id: "fist_attack", name: "Coup de poing", damage: 5, cost: 0, type: 'normal' }
    ]
};

const classBases = {
    'guerrier': {
        name: "Guerrier",
        description: "Un combattant robuste spécialisé dans les attaques au corps à corps.",
        stats: { strength: 5, intelligence: 1, speed: 3, dexterity: 1 },
        skillTree: "guerrier"
    },
    'mage': {
        name: "Mage",
        description: "Un maître des arcanes qui manipule l'énergie pour lancer des sorts puissants.",
        stats: { strength: 1, intelligence: 5, speed: 2, dexterity: 2 },
        skillTree: "mage"
    },
    'voleur': {
        name: "Voleur",
        description: "Un maître de la furtivité et de la ruse, excellant dans les attaques rapides.",
        stats: { strength: 2, intelligence: 2, speed: 5, dexterity: 3 },
        skillTree: "voleur"
    },
    'explorateur': {
        name: "Explorateur",
        description: "Un aventurier polyvalent qui commence sans classe définie, prêt à découvrir son destin.",
        stats: { strength: 3, intelligence: 3, speed: 3, dexterity: 3 },
        skillTree: "explorateur"
    }
};

const monstersData = {
    'gobelin': {
        id: 'gobelin',
        name: "Gobelin",
        hp: 50,
        mana: 10,
        attack: 10,
        defense: 5,
        type: 'nature', // <-- Ajout du type
        xpReward: 15,
        goldReward: 5
    },
    'slime_vert': {
        id: 'slime_vert',
        name: "Slime vert",
        hp: 30,
        mana: 0,
        attack: 8,
        defense: 2,
        type: 'nature', // <-- Ajout du type
        xpReward: 10,
        goldReward: 2
    },
    'fantome': {
        id: 'fantome',
        name: "Fantôme",
        hp: 40,
        mana: 20,
        attack: 12,
        defense: 8,
        type: 'fire', // <-- Ajout du type
        xpReward: 20,
        goldReward: 10
    }
};

const dungeonsData = {
    'caverne': {
        id: 'caverne',
        name: 'Caverne mystérieuse',
        minigame: 'caverne',
        monster: 'gobelin'
    },
    'tour_du_mage': {
        id: 'tour_du_mage',
        name: 'Tour du mage',
        minigame: 'tour_du_mage',
        monster: 'fantome'
    }
};

const itemsData = {
    weapons: {
        'epee_longue': { id: 'epee_longue', name: 'Épée longue', description: 'Une épée de base.', type: 'weapon', attack: 5 },
        'dague_rapide': { id: 'dague_rapide', name: 'Dague rapide', description: 'Une dague légère et rapide.', type: 'weapon', attack: 3, speed: 1 },
        'baton_magique': { id: 'baton_magique', name: 'Bâton magique', description: 'Augmente la puissance des sorts.', type: 'weapon', intelligence: 3 }
    },
    armors: {
        'armure_cuir': { id: 'armure_cuir', name: 'Armure de cuir', description: 'Offre une protection de base.', type: 'armor', defense: 5 },
        'robe_mage': { id: 'robe_mage', name: 'Robe de mage', description: 'Une robe légère pour les mages.', type: 'armor', defense: 2, mana: 10 }
    },
    consumables: {
        'potion_de_vie': { id: 'potion_de_vie', name: 'Potion de vie', description: 'Restaure 50 PV.', type: 'consumable', effect: { hp: 50 } }
    },
    // Ajout d'une nouvelle catégorie pour les talismans
    talismans: {
        'talisman_feu': {
            id: 'talisman_feu',
            name: 'Talisman de feu',
            description: 'Confère une résistance aux attaques de type Feu.',
            type: 'talisman',
            resistance: 'fire'
        }
    }
};

const skillsData = {
    'fist_attack': {
        id: 'fist_attack',
        name: 'Coup de poing',
        description: 'Une attaque de base.',
        cost: 0,
        prerequisites: [],
        damage: 5,
        manaCost: 0,
        type: 'ability',
        elementalType: 'normal'
    }
};

const skillTreeData = {
    'guerrier': {
        name: "Arbre de compétences du guerrier",
        skills: {
            'frappe_puissante': {
                id: 'frappe_puissante',
                name: 'Frappe puissante',
                description: 'Une attaque lourde qui inflige des dégâts massifs.',
                cost: 1,
                prerequisites: [],
                damage: 50,
                manaCost: 15,
                type: 'ability',
                elementalType: 'fire'
            }
        }
    },
    'mage': {
        name: "Arbre de compétences du mage",
        skills: {
            'eclair_de_foudre': {
                id: 'eclair_de_foudre',
                name: 'Éclair de foudre',
                description: 'Lance un éclair rapide.',
                cost: 1,
                prerequisites: [],
                damage: 40,
                manaCost: 10,
                type: 'ability',
                elementalType: 'water'
            }
        }
    },
    'voleur': {
        name: "Arbre de compétences du voleur",
        skills: {
            'attaque_rapide': {
                id: 'attaque_rapide',
                name: 'Attaque rapide',
                description: 'Une attaque rapide qui a une chance d\'attaquer deux fois.',
                cost: 1,
                prerequisites: [],
                damage: 25,
                manaCost: 10,
                type: 'ability',
                elementalType: 'nature'
            },
            'agilite_superieure': {
                id: 'agilite_superieure',
                name: 'Agilité supérieure',
                description: 'Augmente la vitesse et la dextérité de 2 de manière permanente.',
                cost: 1,
                prerequisites: ['attaque_rapide'],
                effect: { speed: 2, dexterity: 2 },
                type: 'passive'
            }
        }
    },
    'explorateur': {
        name: "Arbre de compétences de l'explorateur",
        skills: {}
    }
};

const questsData = {
    'premier_pas': {
        id: 'premier_pas',
        name: 'Premiers pas',
        description: 'Vaincre 3 gobelins pour prouver votre valeur.',
        objective: {
            type: 'kill_monster',
            target: 'gobelin',
            required: 3,
            current: 0
        },
        reward: {
            xp: 50,
            gold: 20,
            item: 'potion_de_vie'
        }
    }
};