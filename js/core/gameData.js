// Fichier : js/core/gameData.js

export const abilitiesData = {
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

export const classBases = {
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

export const itemsData = {
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

export const monstersData = {
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
    'creature_lacustre': { id: 'creature_lacustre', name: 'Créature lacustre', hp: 70, attack: 20, defense: 12, xpReward: 28, goldReward: 18, element: 'eau' },
    'rat_des_egouts': { id: 'rat_des_egouts', name: 'Rat des égouts', hp: 20, attack: 5, defense: 2, xpReward: 5, goldReward: 2, element: 'neutre' },
    'corbeau_enrage': { id: 'corbeau_enrage', name: 'Corbeau enragé', hp: 25, attack: 7, defense: 3, xpReward: 8, goldReward: 4, element: 'air' },
    'momie_reveillee': { id: 'momie_reveillee', name: 'Momie réveillée', hp: 50, attack: 15, defense: 10, xpReward: 20, goldReward: 12, element: 'terre' },
    'scarabee_geants': { id: 'scarabee_geants', name: 'Scarabée géant', hp: 45, attack: 18, defense: 6, xpReward: 18, goldReward: 9, element: 'terre' },
    'guerrier_fantome': { id: 'guerrier_fantome', name: 'Guerrier fantôme', hp: 80, attack: 25, defense: 10, xpReward: 30, goldReward: 15, element: 'neutre' },
    'dragon_ancestral': { id: 'dragon_ancestral', name: 'Dragon ancestral', hp: 120, attack: 40, defense: 20, xpReward: 50, goldReward: 30, element: 'feu' }
};

export const skillsData = {
    'fist_attack': {
        id: 'fist_attack',
        name: 'Coup de poing',
        description: 'Une attaque de base avec le poing.',
        manaCost: 0,
        damage: 5
    }
};

export const skillTreeData = {
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
    }
};

export const questsData = {
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
        nextQuestId: 'lart_devoluer'
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
    }
};

export const locationTypes = {
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

export const elements = {
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

export const itemSets = {
    'set_du_guerrier_debout': {
        name: "Set du Guerrier Debout",
        pieces: ['epee_du_guerrier_debout', 'armure_du_guerrier_debout'],
        bonus: {
            stats: {
                strength: 5,
            }
        }
    }
};

export const pointsOfInterest = {
    'tour_eiffel': {
        name: 'Tour Eiffel',
        location: { x: 48.8584, y: 2.2945 },
        difficulty: 'facile',
        dungeonType: 'tour',
        monsterPool: ['rat_des_egouts', 'corbeau_enrage'],
        questId: 'tour_eiffel_quest'
    },
    'pyramides_de_gizeh': {
        name: 'Pyramides de Gizeh',
        location: { x: 29.9792, y: 31.1342 },
        difficulty: 'intermediaire',
        dungeonType: 'tombeau',
        monsterPool: ['momie_reveillee', 'scarabee_geants'],
        questId: 'pyramides_de_gizeh_quest'
    },
    'grande_muraille_de_chine': {
        name: 'Grande Muraille de Chine',
        location: { x: 40.4319, y: 116.5704 },
        difficulty: 'difficile',
        dungeonType: 'muraille',
        monsterPool: ['guerrier_fantome', 'dragon_ancestral'],
        questId: 'grande_muraille_de_chine_quest'
    }
};

export const dungeonTypes = {
    'tour': {
        description: 'Une ancienne tour infestée de créatures volantes et d\'esprits tourmentés.',
        boss: 'chef_des_corbeaux',
        rewards: { gold: 50, item: 'plume_rare' }
    },
    'tombeau': {
        description: 'Les couloirs sinueux et sombres d\'un tombeau antique gardé par des âmes perdues.',
        boss: 'gardien_des_tombes',
        rewards: { gold: 150, item: 'amulette_du_sable' }
    },
    'muraille': {
        description: 'Les vestiges d\'une muraille défensive où des guerriers fantômes patrouillent inlassablement.',
        boss: 'dragon_ancestral',
        rewards: { gold: 500, item: 'epee_du_dragon' }
    }
};

export const bossesData = {
    'chef_des_corbeaux': { name: 'Chef des Corbeaux', hp: 50, damage: 15 },
    'gardien_des_tombes': { name: 'Gardien des Tombes', hp: 100, damage: 30 },
    'dragon_ancestral': { name: 'Dragon Ancestral', hp: 200, damage: 50 }
};

export const poiQuests = {
    'tour_eiffel_quest': {
        id: 'tour_eiffel_quest',
        name: 'L\'esprit de fer de la Tour',
        description: 'L\'esprit de Gustave Eiffel a été corrompu par la brume. Vainquez-le pour ramener la paix à Paris.',
        objective: {
            type: 'kill_monster',
            target: 'chef_des_corbeaux', 
            required: 1,
            current: 0
        },
        reward: {
            xp: 200,
            gold: 100,
            item: 'epee_de_feu'
        }
    },
    'pyramides_de_gizeh_quest': {
        id: 'pyramides_de_gizeh_quest',
        name: 'La malédiction des pharaons',
        description: 'Un ancien pharaon maudit a été réveillé. Calmez sa rage en l\'affrontant dans son tombeau.',
        objective: {
            type: 'kill_monster',
            target: 'gardien_des_tombes',
            required: 1,
            current: 0
        },
        reward: {
            xp: 450,
            gold: 250,
            item: 'amulette_du_sable'
        }
    },
    'grande_muraille_de_chine_quest': {
        id: 'grande_muraille_de_chine_quest',
        name: 'La défense de l\'Empereur',
        description: 'L\'esprit protecteur de la Grande Muraille s\'est retourné contre son peuple. Affrontez le dragon ancestral pour libérer son âme.',
        objective: {
            type: 'kill_monster',
            target: 'dragon_ancestral',
            required: 1,
            current: 0
        },
        reward: {
            xp: 800,
            gold: 500,
            item: 'epee_du_dragon'
        }
    }
};