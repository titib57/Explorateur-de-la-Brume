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
        stats: {
            strength: 5,
            intelligence: 1,
            speed: 3,
            dexterity: 1
        },
        skillTree: "guerrier"
    },
    'mage': {
        name: "Mage",
        description: "Un lanceur de sorts puissant qui maîtrise les éléments.",
        stats: {
            strength: 1,
            intelligence: 5,
            speed: 2,
            dexterity: 2
        },
        skillTree: "mage"
    },
    'voleur': {
        name: "Voleur",
        description: "Un expert en furtivité et en attaques rapides.",
        stats: {
            strength: 2,
            intelligence: 2,
            speed: 4,
            dexterity: 4
        },
        skillTree: "voleur"
    },
    'explorateur': {
        name: "Explorateur",
        description: "Un aventurier courageux qui débute dans le monde.",
        stats: {
            strength: 1,
            intelligence: 1,
            speed: 1,
            dexterity: 1
        },
        skillTree: "explorateur"
    }
};

const itemsData = {
    weapons: {
        'epee_rouillee': {
            id: 'epee_rouillee',
            name: 'Épée rouillée',
            damage: 5,
            type: 'weapon',
            element: 'neutre',
            stats: { strength: 1 }
        },
        'epee_de_feu': {
            id: 'epee_de_feu',
            name: 'Épée de feu',
            damage: 15,
            type: 'weapon',
            element: 'feu',
            stats: { strength: 3 }
        },
        'arc_simple': {
            id: 'arc_simple',
            name: 'Arc simple',
            damage: 4,
            type: 'weapon',
            element: 'neutre',
            stats: { dexterity: 1 }
        },
        'baton_en_bois': {
            id: 'baton_en_bois',
            name: 'Bâton en bois',
            damage: 3,
            type: 'weapon',
            element: 'neutre',
            stats: { intelligence: 1 }
        },
        'dague_simple': {
            id: 'dague_simple',
            name: 'Dague simple',
            damage: 3,
            type: 'weapon',
            element: 'neutre',
            stats: { dexterity: 1 }
        }
    },
    armors: {
        'tunique_de_lin': {
            id: 'tunique_de_lin',
            name: 'Tunique de lin',
            defense: 2,
            type: 'armor',
            stats: { dexterity: 1 }
        },
        'plastron_en_cuir': {
            id: 'plastron_en_cuir',
            name: 'Plastron en cuir',
            defense: 5,
            type: 'armor',
            stats: { strength: 2 }
        }
    },
    consumables: {
        'potion_de_vie_basique': {
            id: 'potion_de_vie_basique',
            name: 'Potion de vie basique',
            effect: { hp: 30 },
            type: 'consumable'
        }
    }
};

const monstersData = {
    'gobelin': { id: 'gobelin', name: 'Gobelin', hp: 30, attack: 10, defense: 5, xpReward: 10, goldReward: 5, element: 'terre' },
    'loup': { id: 'loup', name: 'Loup', hp: 40, attack: 15, defense: 7, xpReward: 15, goldReward: 8, element: 'neutre' },
    'ours': { id: 'ours', name: 'Ours enragé', hp: 80, attack: 25, defense: 10, xpReward: 30, goldReward: 15, element: 'terre' },
    'lapin_furieux': { id: 'lapin_furieux', name: 'Lapin furieux', hp: 20, attack: 5, defense: 2, xpReward: 5, goldReward: 2, element: 'neutre' },
    'sanglier': { id: 'sanglier', name: 'Sanglier', hp: 35, attack: 12, defense: 8, xpReward: 12, goldReward: 7, element: 'terre' },
    'bandit': { id: 'bandit', name: 'Bandit de grand chemin', hp: 50, attack: 20, defense: 10, xpReward: 25, goldReward: 10, element: 'neutre' },
    'scorpion_geant': { id: 'scorpion_geant', name: 'Scorpion géant', hp: 45, attack: 18, defense: 6, xpReward: 18, goldReward: 9, element: 'feu' },
    'cobra_royal': { id: 'cobra_royal', name: 'Cobra royal', hp: 40, attack: 16, defense: 5, xpReward: 16, goldReward: 8, element: 'poison' },
    'golem_sable': { id: 'golem_sable', name: 'Golem de sable', hp: 90, attack: 22, defense: 15, xpReward: 35, goldReward: 20, element: 'terre' },
    'grenouille_toxique': { id: 'grenouille_toxique', name: 'Grenouille toxique', hp: 25, attack: 8, defense: 4, xpReward: 8, goldReward: 4, element: 'eau' },
    'serpent_eau': { id: 'serpent_eau', name: 'Serpent d\'eau', hp: 30, attack: 10, defense: 5, xpReward: 10, goldReward: 6, element: 'eau' },
    'creature_lacustre': { id: 'creature_lacustre', name: 'Créature lacustre', hp: 70, attack: 20, defense: 12, xpReward: 28, goldReward: 18, element: 'eau' }
};

const skillsData = {
    'fist_attack': {
        id: 'fist_attack',
        name: 'Coup de poing',
        description: 'Une attaque de base avec le poing.',
        manaCost: 0,
        damage: 5
    }
};

const skillTreeData = {
    'guerrier': {
        name: "Arbre de compétences du guerrier",
        skills: {
            'frappe_puissante': {
                id: 'frappe_puissante',
                name: 'Frappe puissante',
                description: 'Une attaque qui inflige des dégâts massifs.',
                cost: 1,
                prerequisites: [],
                damage: 50,
                manaCost: 20,
                type: 'ability',
                element: 'neutre'
            },
            'peau_de_fer': {
                id: 'peau_de_fer',
                name: 'Peau de fer',
                description: 'Augmente la défense de 5 de manière permanente.',
                cost: 1,
                prerequisites: ['frappe_puissante'],
                effect: { defense: 5 },
                type: 'passive',
                element: 'neutre'
            }
        }
    },
    'mage': {
        name: "Arbre de compétences du mage",
        skills: {
            'eclair_de_foudre': {
                id: 'eclair_de_foudre',
                name: 'Éclair de foudre',
                description: 'Un puissant éclair qui frappe la cible.',
                cost: 1,
                prerequisites: [],
                damage: 60,
                manaCost: 20,
                type: 'ability',
                element: 'foudre'
            },
            'bouclier_arcanique': {
                id: 'bouclier_arcanique',
                name: 'Bouclier Arcanique',
                description: 'Augmente le mana max de 10 de manière permanente.',
                cost: 1,
                prerequisites: ['eclair_de_foudre'],
                effect: { maxMana: 10 },
                type: 'passive',
                element: 'neutre'
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
                element: 'neutre'
            },
            'agilite_superieure': {
                id: 'agilite_superieure',
                name: 'Agilité supérieure',
                description: 'Augmente la vitesse et la dextérité de 2 de manière permanente.',
                cost: 1,
                prerequisites: ['attaque_rapide'],
                effect: { speed: 2, dexterity: 2 },
                type: 'passive',
                element: 'neutre'
            }
        }
    },
    'explorateur': {
        name: "Arbre de compétences de l'explorateur",
        skills: {
            'sucer_glaçons': {
                id: 'sucer_glaçons',
                name: 'Sucer des glaçons',
                description: 'Se mettre assis et suçer des glaçons...',
                cost: 0,
                prerequisites: [],
                damage: 0,
                manaCost: 0,
                effect: { hp: 5 },
                type: 'ability',
                element: 'neutre'
            },
}
    
};

const questsData = {
    'premiers_pas': {
        id: 'premiers_pas',
        name: 'Premiers pas',
        description: 'Rends toi dans le donjon de tutoriel pour vaincre un mannequin d\'entraînement.',
        objective: {
            type: 'kill_monster',
            target: 'Mannequin',
            required: 1,
            current: 0
        },
        reward: {
            xp: 50,
            gold: 20,
            item: 'potion_de_soin'
        },
        nextQuestId: 'lart_devoluer' // ID de la prochaine quête à débloquer
    },
    'lart_devoluer': {
        id: 'lart_devoluer',
        name: 'L\'art d\'évoluer',
        description: 'Vainquez les monstres et augmentez votre niveau à 2.',
        objective: {
            type: 'reach_level',
            target: 2,
            required: 1,
            current: 0
        },
        reward: {
            xp: 100,
            gold: 50
        },
        nextQuestId: 'une_nouvelle_competence'
    },
    'une_nouvelle_competence': {
        id: 'une_nouvelle_competence',
        name: 'Une nouvelle compétence',
        description: 'Utilisez vos points de compétence pour débloquer une nouvelle capacité dans l\'arbre de compétences.',
        objective: {
            type: 'unlock_skill',
            target: 'any',
            required: 1,
            current: 0
        },
        reward: {
            xp: 150,
            gold: 75
        },
        nextQuestId: 'le_remede_miracle'
    },
    'le_remede_miracle': {
        id: 'le_remede_miracle',
        name: 'Le remède miracle',
        description: 'Utilisez la potion de soin que vous avez trouvée pour vous soigner.',
        objective: {
            type: 'use_item',
            target: 'potion_de_soin',
            required: 1,
            current: 0
        },
        reward: {
            xp: 100,
            gold: 50
        },
        nextQuestId: 'vers_une_nouvelle_voie'
    },
    'vers_une_nouvelle_voie': {
        id: 'vers_une_nouvelle_voie',
        name: 'Vers une nouvelle voie',
        description: 'Atteignez le niveau 5 pour avoir accès au choix de classe.',
        objective: {
            type: 'reach_level',
            target: 5,
            required: 1,
            current: 0
        },
        reward: {
            xp: 250,
            gold: 100
        },
        nextQuestId: 'choisir_sa_voie'
    },
    'choisir_sa_voie': {
        id: 'choisir_sa_voie',
        name: 'Choisir sa voie',
        description: 'Choisissez une nouvelle classe dans l\'arbre des classes pour terminer le tutoriel.',
        objective: {
            type: 'unlock_class',
            target: 'any',
            required: 1,
            current: 0
        },
        reward: {
            xp: 500,
            gold: 250
        },
        nextQuestId: null
    },
    'quete_foret': {
        id: 'quete_foret',
        name: 'Le mystère de la forêt',
        description: 'Vainquez 5 loups pour découvrir la source des étranges bruits dans la forêt.',
        objective: {
            type: 'kill_monster',
            target: 'loup',
            current: 0,
            required: 5
        },
        reward: {
            xp: 100,
            gold: 50
        },
        nextQuestId: null
    },
    'quete_plaine': {
        id: 'quete_plaine',
        name: 'Chasse aux bandits',
        description: 'Éliminez les bandits qui terrorisent les plaines.',
        objective: {
            type: 'kill_monster',
            target: 'bandit',
            current: 0,
            required: 3
        },
        reward: {
            xp: 120,
            gold: 60
        },
        nextQuestId: null
    },
    'quete_desert': {
        id: 'quete_desert',
        name: 'L\'ombre du désert',
        description: 'Trouvez et affrontez le golem de sable qui garde le trésor du désert.',
        objective: {
            type: 'kill_monster',
            target: 'golem_sable',
            current: 0,
            required: 1
        },
        reward: {
            xp: 150,
            gold: 80
        },
        nextQuestId: null
    },
    'quete_lac': {
        id: 'quete_lac',
        name: 'Les profondeurs du lac',
        description: 'Défendez le village en éliminant les créatures lacustres qui attaquent les pêcheurs.',
        objective: {
            type: 'kill_monster',
            target: 'creature_lacustre',
            current: 0,
            required: 2
        },
        reward: {
            xp: 130,
            gold: 70
        },
        nextQuestId: null
    }
};

const locationTypes = {
    'foret': {
        name: 'Forêt mystérieuse',
        monsters: [
            { id: 'gobelin', chance: 0.6 },
            { id: 'loup', chance: 0.3 },
            { id: 'ours', chance: 0.1 }
        ]
    },
    'plaine': {
        name: 'Plaines verdoyantes',
        monsters: [
            { id: 'lapin_furieux', chance: 0.7 },
            { id: 'sanglier', chance: 0.2 },
            { id: 'bandit', chance: 0.1 }
        ]
    },
    'desert': {
        name: 'Désert aride',
        monsters: [
            { id: 'scorpion_geant', chance: 0.6 },
            { id: 'cobra_royal', chance: 0.3 },
            { id: 'golem_sable', chance: 0.1 }
        ]
    },
    'lac': {
        name: 'Bord du lac',
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

// --- Données de quêtes par donjon ---
const dungeonQuestsData = {
    'foret': 'quete_foret',
    'plaine': 'quete_plaine',
    'desert': 'quete_desert',
    'lac': 'quete_lac',
};