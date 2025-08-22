const abilitiesData = {
    guerrier: [
        { id: "puissant_coup", name: "Coup puissant", damage: 20, cost: 5, type: 'damage', element: 'neutre' },
        { id: "charge", name: "Charge", damage: 30, cost: 10, type: 'damage', element: 'neutre' }
    ],
    mage: [
        { id: "boule_de_feu", name: "Boule de feu", damage: 25, cost: 10, type: 'damage', element: 'feu' },
        { id: "eclair", name: "Éclair", damage: 35, cost: 15, type: 'damage', element: 'foudre' }
    ],
    voleur: [
        { id: "attaque_sournoise", name: "Attaque sournoise", damage: 22, cost: 8, type: 'damage', element: 'neutre' },
        { id: "jet_de_dague", name: "Jet de dague", damage: 18, cost: 5, type: 'damage', element: 'neutre' }
    ],
    explorateur: [
        { id: "fist_attack", name: "Coup de poing", damage: 5, cost: 0, type: 'damage', element: 'neutre' }
    ]
};

const classBases = {
    'guerrier': {
        name: "Guerrier",
        description: "Un combattant robuste spécialisé dans les attaques au corps à corps.",
        stats: { strength: 15, intelligence: 5, speed: 10, dexterity: 12 },
        unlockedAt: 5
    },
    'mage': {
        name: "Mage",
        description: "Un lanceur de sorts puissant, utilisant l'intelligence pour déchaîner des sorts élémentaires.",
        stats: { strength: 5, intelligence: 15, speed: 10, dexterity: 12 },
        unlockedAt: 5
    },
    'voleur': {
        name: "Voleur",
        description: "Rapide et furtif, le Voleur utilise son agilité pour surprendre ses ennemis.",
        stats: { strength: 10, intelligence: 8, speed: 15, dexterity: 12 },
        unlockedAt: 5
    },
    'explorateur': {
        name: "Explorateur",
        description: "Un aventurier polyvalent, capable de s'adapter à toutes les situations.",
        stats: { strength: 10, intelligence: 10, speed: 10, dexterity: 10 },
        unlockedAt: 1
    }
};

const monstersData = {
    'lapin_furieux': {
        id: 'lapin_furieux', name: 'Lapin Furieux', hp: 15, mana: 0, attack: 5, defense: 2, xpReward: 10, goldReward: 5, element: 'neutre'
    },
    'sanglier': {
        id: 'sanglier', name: 'Sanglier', hp: 25, mana: 0, attack: 8, defense: 4, xpReward: 15, goldReward: 8, element: 'neutre'
    },
    'bandit': {
        id: 'bandit', name: 'Bandit', hp: 30, mana: 10, attack: 10, defense: 5, xpReward: 20, goldReward: 15, element: 'neutre'
    },
    'scorpion_geant': {
        id: 'scorpion_geant', name: 'Scorpion Géant', hp: 40, mana: 5, attack: 12, defense: 6, xpReward: 30, goldReward: 20, element: 'poison'
    },
    'cobra_royal': {
        id: 'cobra_royal', name: 'Cobra Royal', hp: 35, mana: 10, attack: 15, defense: 5, xpReward: 35, goldReward: 25, element: 'poison'
    },
    'golem_sable': {
        id: 'golem_sable', name: 'Golem de Sable', hp: 50, mana: 0, attack: 10, defense: 10, xpReward: 40, goldReward: 30, element: 'terre'
    },
    'grenouille_toxique': {
        id: 'grenouille_toxique', name: 'Grenouille Toxique', hp: 20, mana: 5, attack: 7, defense: 3, xpReward: 12, goldReward: 6, element: 'poison'
    },
    'serpent_eau': {
        id: 'serpent_eau', name: 'Serpent d\'Eau', hp: 28, mana: 8, attack: 9, defense: 4, xpReward: 18, goldReward: 9, element: 'eau'
    },
    'creature_lacustre': {
        id: 'creature_lacustre', name: 'Créature Lacustre', hp: 45, mana: 15, attack: 13, defense: 7, xpReward: 45, goldReward: 35, element: 'eau'
    }
};

const dungeonsData = {
    'foret': {
        name: 'Forêt Sombre',
        type: 'forest',
        location: [48.9, 6.2],
        monsters: [
            { id: 'lapin_furieux', chance: 0.7 },
            { id: 'sanglier', chance: 0.2 },
            { id: 'bandit', chance: 0.1 }
        ]
    },
    'desert': {
        name: 'Désert aride',
        type: 'desert',
        location: [48.7, 6.5],
        monsters: [
            { id: 'scorpion_geant', chance: 0.6 },
            { id: 'cobra_royal', chance: 0.3 },
            { id: 'golem_sable', chance: 0.1 }
        ]
    },
    'lac': {
        name: 'Bord du lac',
        type: 'lake',
        location: [48.8, 6.8],
        monsters: [
            { id: 'grenouille_toxique', chance: 0.5 },
            { id: 'serpent_eau', chance: 0.4 },
            { id: 'creature_lacustre', chance: 0.1 }
        ]
    }
};

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

const questsData = {
    'premiers_pas': {
        name: 'Premiers pas',
        description: 'Vaincre 3 monstres de la forêt.',
        objective: {
            type: 'kill_monster',
            target: ['lapin_furieux', 'sanglier', 'bandit'],
            required: 3,
            current: 0
        },
        reward: {
            xp: 50,
            gold: 20,
            item: null,
            skill: null
        },
        rewardClaimed: false,
        nextQuestId: 'quete_de_classe'
    },
    'quete_de_classe': {
        name: 'La voie du Héros',
        description: 'Atteindre le niveau 5 et choisir une classe avancée.',
        objective: {
            type: 'reach_level',
            target: '5',
            required: 1,
            current: 0
        },
        reward: {
            xp: 200,
            gold: 100,
            skill: { classTree: 'guerrier', skillId: 'charge' }
        },
        rewardClaimed: false,
        nextQuestId: null
    }
};