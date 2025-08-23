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
    'momie_reveillee': { id: 'momie_reveillee', name: 'Momie réveillée', hp: 50, attack: 15, defense: 9, xpReward: 20, goldReward: 12, element: 'terre' },
    'mannequin_dentrainement': { id: 'mannequin_dentrainement', name: 'Mannequin d\'entraînement', hp: 10, attack: 1, defense: 10, xpReward: 0, goldReward: 0, element: 'neutre', isTutorial: true }
};

export const bossesData = {
    'chef_des_gobelins': { id: 'chef_des_gobelins', name: 'Chef des gobelins', hp: 120, attack: 30, defense: 15, xpReward: 100, goldReward: 50, element: 'terre' },
    'gardien_des_tombes': { id: 'gardien_des_tombes', name: 'Gardien des tombes', hp: 150, attack: 40, defense: 20, xpReward: 150, goldReward: 75, element: 'terre' },
    'chef_des_corbeaux': { id: 'chef_des_corbeaux', name: 'Chef des corbeaux', hp: 100, attack: 35, defense: 10, xpReward: 120, goldReward: 60, element: 'air' },
    'dragon_ancestral': { id: 'dragon_ancestral', name: 'Dragon ancestral', hp: 200, attack: 50, defense: 25, xpReward: 250, goldReward: 120, element: 'feu' },
    'mannequin_dentrainement': { id: 'mannequin_dentrainement', name: 'Mannequin d\'entraînement', hp: 10, attack: 1, defense: 10, xpReward: 0, goldReward: 0, element: 'neutre', isTutorial: true }
};

export const dungeonTypes = {
    'forest': { name: 'Forêt sinistre', description: 'Une forêt sombre où se cachent des créatures dangereuses.', monsterPool: ['gobelin', 'loup', 'sanglier', 'ours'], bossPool: ['chef_des_gobelins', 'ours'], rewards: { gold: 50, xp: 50 } },
    'cave': { name: 'Grotte humide', description: 'Une grotte remplie de créatures des profondeurs.', monsterPool: ['rat_des_egouts', 'serpent_eau', 'grenouille_toxique'], bossPool: ['chef_des_gobelins', 'creature_lacustre'], rewards: { gold: 60, xp: 60 } },
    'ruin': { name: 'Ruine oubliée', description: 'Les vestiges d\'une civilisation perdue, hantés par les esprits.', monsterPool: ['guerrier_fantome', 'momie_reveillee', 'corbeau_enrage'], bossPool: ['gardien_des_tombes', 'chef_des_corbeaux'], rewards: { gold: 75, xp: 75 } },
    'volcano': { name: 'Volcan en fusion', description: 'Un donjon à haut risque, rempli de monstres de feu.', monsterPool: ['scorpion_geant', 'golem_sable', 'dragon_ancestral'], bossPool: ['dragon_ancestral'], rewards: { gold: 100, xp: 100 } },
    'tutoriel': { name: 'Donjon de tutoriel', description: 'Un lieu sûr pour apprendre les bases du combat. Vainquez le mannequin d\'entraînement!', monsterPool: ['mannequin_dentrainement'], bossPool: ['mannequin_dentrainement'], isTutorial: true }
};

export const pointsOfInterest = {
    'tutorial_dungeon_poi': {
        id: 'tutorial_dungeon_poi',
        name: 'Camp d\'entraînement',
        location: { lat: 48.8566, lng: 2.3522 }, // Coordonnées de test, non liées à un lieu réel
        dungeonType: 'tutoriel',
        difficulty: 0,
        questId: 'premiers_pas',
        isTutorial: true,
    },
    'pyramides_de_gizeh_poi': {
        id: 'pyramides_de_gizeh_poi',
        name: 'Pyramides de Gizeh',
        location: { lat: 29.9792, lng: 31.1342 },
        dungeonType: 'ruin',
        difficulty: 5,
        questId: 'pyramides_de_gizeh_quest'
    }
};

export const questsData = {
    'premiers_pas': {
        id: 'premiers_pas',
        name: 'Premiers pas',
        description: 'Rends toi dans le donjon de tutoriel pour vaincre un mannequin d\'entraînement.',
        objective: {
            type: 'kill_monster',
            target: 'mannequin_dentrainement',
            required: 1,
            current: 0
        },
        reward: {
            xp: 50,
            gold: 20,
            item: 'epee_rouillee'
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
    }
};

export const skillsData = {
    'fist_attack': { id: 'fist_attack', name: 'Coup de poing', description: 'Une attaque de base avec le poing.', manaCost: 0, damage: 5 },
    'frappe_puissante': { id: 'frappe_puissante', name: 'Frappe puissante', description: 'Une attaque qui inflige des dégâts massifs.', manaCost: 20, damage: 50 },
    'peau_de_fer': { id: 'peau_de_fer', name: 'Peau de fer', description: 'Augmente la défense de 5 de manière permanente.', manaCost: 0, effect: { defense: 5 } },
    'double_attaque': { id: 'double_attaque', name: 'Double attaque', description: 'Attaque deux fois en une seule action.', manaCost: 15, damage: 20, numberOfHits: 2 },
    'lame_de_feu': { id: 'lame_de_feu', name: 'Lame de feu', description: 'Enflamme votre arme pour infliger des dégâts de feu supplémentaires.', manaCost: 10, damage: 10, element: 'feu' },
    'soin_leger': { id: 'soin_leger', name: 'Soin léger', description: 'Restaure une petite quantité de points de vie.', manaCost: 10, effect: { hp: 30 } },
    'sort_de_foudre': { id: 'sort_de_foudre', name: 'Sort de foudre', description: 'Invoque un éclair pour frapper l\'ennemi.', manaCost: 25, damage: 60, element: 'foudre' },
    'vol_de_vie': { id: 'vol_de_vie', name: 'Vol de vie', description: 'Vole des points de vie à l\'ennemi.', manaCost: 15, damage: 15, effect: { selfHeal: 15 } },
    'frappe_chirurgicale': { id: 'frappe_chirurgicale', name: 'Frappe chirurgicale', description: 'Une attaque rapide et précise.', manaCost: 5, damage: 15 },
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
                manaCost: 0,
                type: 'ability'
            },
            'double_attaque': {
                id: 'double_attaque',
                name: 'Double attaque',
                description: 'Attaque deux fois en une seule action.',
                cost: 2,
                prerequisites: ['frappe_puissante'],
                damage: 20,
                manaCost: 15,
                type: 'ability',
                numberOfHits: 2,
                element: 'neutre'
            }
        }
    },
    'mage': {
        name: "Arbre de compétences du mage",
        skills: {
            'boule_de_feu': {
                id: 'boule_de_feu',
                name: 'Boule de feu',
                description: 'Une boule de feu infligeant des dégâts élémentaires.',
                cost: 1,
                prerequisites: [],
                damage: 25,
                manaCost: 10,
                type: 'ability',
                element: 'feu'
            },
            'soin_leger': {
                id: 'soin_leger',
                name: 'Soin léger',
                description: 'Restaure une petite quantité de points de vie.',
                cost: 1,
                prerequisites: ['boule_de_feu'],
                effect: { hp: 30 },
                manaCost: 10,
                type: 'ability'
            },
            'sort_de_foudre': {
                id: 'sort_de_foudre',
                name: 'Sort de foudre',
                description: 'Invoque un éclair pour frapper l\'ennemi.',
                cost: 2,
                prerequisites: ['soin_leger'],
                damage: 60,
                manaCost: 25,
                type: 'ability',
                element: 'foudre'
            }
        }
    },
    'voleur': {
        name: "Arbre de compétences du voleur",
        skills: {
            'attaque_sournoise': {
                id: 'attaque_sournoise',
                name: 'Attaque sournoise',
                description: 'Une attaque rapide qui a une chance d\'infliger des dégâts supplémentaires.',
                cost: 1,
                prerequisites: [],
                damage: 22,
                manaCost: 8,
                type: 'ability',
                element: 'neutre'
            },
            'jet_de_dague': {
                id: 'jet_de_dague',
                name: 'Jet de dague',
                description: 'Lance une dague sur l\'ennemi.',
                cost: 1,
                prerequisites: ['attaque_sournoise'],
                damage: 18,
                manaCost: 5,
                type: 'ability',
                element: 'neutre'
            },
            'vol_de_vie': {
                id: 'vol_de_vie',
                name: 'Vol de vie',
                description: 'Vole des points de vie à l\'ennemi.',
                cost: 2,
                prerequisites: ['jet_de_dague'],
                damage: 15,
                manaCost: 15,
                type: 'ability',
                effect: { selfHeal: 15 },
                element: 'neutre'
            }
        }
    },
    'explorateur': {
        name: "Arbre de compétences de l'explorateur",
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
                manaCost: 0,
                type: 'ability'
            }
        }
    }
};

export const elements = {
    'feu': { name: 'Feu', strongAgainst: ['terre', 'poison'], weakAgainst: ['eau', 'foudre'] },
    'eau': { name: 'Eau', strongAgainst: ['feu'], weakAgainst: ['foudre', 'terre'] },
    'terre': { name: 'Terre', strongAgainst: ['foudre', 'poison'], weakAgainst: ['feu', 'eau'] },
    'foudre': { name: 'Foudre', strongAgainst: ['eau'], weakAgainst: ['terre'] },
    'poison': { name: 'Poison', strongAgainst: ['eau'], weakAgainst: ['feu', 'terre'] },
    'neutre': { name: 'Neutre', strongAgainst: [], weakAgainst: [] }
};

export const itemSets = {
    'set_du_guerrier_debout': {
        name: "Set du Guerrier Debout",
        pieces: ['epee_du_guerrier_debout', 'armure_du_guerrier_debout'],
        bonus: {
            stats: { strength: 5, defense: 5 },
            special: 'immunite_a_la_peur'
        }
    }
};

export const itemQuests = {
    'potion_de_soin': {
        id: 'potion_de_soin',
        name: 'Potion de soin',
        description: 'Une potion qui restaure des points de vie.',
        effect: { hp: 50 },
        type: 'consumable'
    }
};