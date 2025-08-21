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
        { id: "fist_attack", name: "Coup de poing", damage: 5, cost: 0, type: 'basic' }
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
        description: "Un lanceur de sorts puissant spécialisé dans la magie élémentaire.",
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
        description: "Un guerrier agile et rapide qui excelle dans l'art du combat sournois.",
        stats: {
            strength: 2,
            intelligence: 2,
            speed: 5,
            dexterity: 3
        },
        skillTree: "voleur"
    },
    'explorateur': {
        name: "Explorateur",
        description: "Un aventurier polyvalent sans spécialisation particulière.",
        stats: {
            strength: 2,
            intelligence: 2,
            speed: 2,
            dexterity: 2
        }
    }
};

const itemsData = {
    weapons: {
        'epee_en_fer': {
            id: 'epee_en_fer',
            name: 'Épée en Fer',
            type: 'weapon',
            damage: 15,
            price: 50,
            description: 'Une épée de fer basique, utile pour commencer.',
            prerequisites: {
                class: ['guerrier']
            }
        },
        'arc_en_bois': {
            id: 'arc_en_bois',
            name: 'Arc en Bois',
            type: 'weapon',
            damage: 10,
            price: 40,
            description: 'Un arc simple, parfait pour les débutants.',
            prerequisites: {
                class: ['voleur', 'explorateur']
            }
        },
        'baton_en_chene': {
            id: 'baton_en_chene',
            name: 'Bâton en Chêne',
            type: 'weapon',
            damage: 8,
            price: 35,
            description: 'Un bâton magique, souvent utilisé par les mages.',
            prerequisites: {
                class: ['mage']
            }
        }
    },
    armors: {
        'armure_de_cuir': {
            id: 'armure_de_cuir',
            name: 'Armure de Cuir',
            type: 'armor',
            defense: 10,
            price: 60,
            description: 'Une armure légère et flexible.',
            prerequisites: {
                class: ['guerrier', 'voleur', 'explorateur']
            }
        },
        'toge_de_lin': {
            id: 'toge_de_lin',
            name: 'Toge de Lin',
            type: 'armor',
            defense: 5,
            price: 20,
            description: 'Une toge simple qui offre une protection minimale.',
            prerequisites: {
                class: ['mage']
            }
        }
    },
    consumables: {
        'potion_de_vie': {
            id: 'potion_de_vie',
            name: 'Potion de Vie',
            type: 'consumable',
            effect: { hp: 50 },
            price: 25,
            description: 'Une potion qui restaure 50 points de vie.'
        },
        'potion_de_mana': {
            id: 'potion_de_mana',
            name: 'Potion de Mana',
            type: 'consumable',
            effect: { mana: 30 },
            price: 15,
            description: 'Restaure 30 points de mana.'
        },
        // Nouvel objet pour la quête du Sphinx
        'sablier': {
            id: 'sablier',
            name: 'Sablier ancien',
            type: 'quest_item',
            description: 'Un sablier rempli de sable doré, symbole du temps et de la sagesse. Utile pour certaines énigmes.'
        }
    }
};

const dungeonsData = {
    'goblin_cave': {
        name: 'Grotte des Gobelins',
        monster: 'gobelin',
        minigame: 'ruins',
        difficulty: 'facile',
        boss: 'gobelin_champion',
        location: { lat: 48.8584, lon: 2.2945 } // Tour Eiffel, Paris
    },
    'haunted_castle': {
        name: 'Château Hanté',
        monster: 'fantome',
        minigame: 'castle', // C'est ici que l'énigme du Sphinx est activée
        difficulty: 'moyen',
        boss: 'fantome_de_pharaon',
        location: { lat: 48.8573, lon: 2.3045 } // Grand Palais, Paris
    }
};

const monstersData = {
    'gobelin': {
        id: 'gobelin',
        name: 'Gobelin',
        hp: 50,
        maxHp: 50,
        attackDamage: 15,
        xpReward: 10,
        goldReward: 5,
        type: 'nature'
    },
    'gobelin_champion': {
        id: 'gobelin_champion',
        name: 'Champion Gobelin',
        hp: 120,
        maxHp: 120,
        attackDamage: 25,
        xpReward: 50,
        goldReward: 30,
        type: 'nature'
    },
    'fantome': {
        id: 'fantome',
        name: 'Fantôme',
        hp: 80,
        maxHp: 80,
        attackDamage: 20,
        xpReward: 20,
        goldReward: 10,
        type: 'water'
    },
    // Nouveau monstre pour la première étape
    'golem_de_sable': {
        id: 'golem_de_sable',
        name: 'Golem de Sable',
        hp: 75,
        maxHp: 75,
        attackDamage: 22,
        xpReward: 30,
        goldReward: 15,
        type: 'nature'
    },
    // Nouveau monstre pour la deuxième étape
    'fantome_de_pharaon': {
        id: 'fantome_de_pharaon',
        name: 'Fantôme de Pharaon',
        hp: 150,
        maxHp: 150,
        attackDamage: 30,
        xpReward: 75,
        goldReward: 50,
        type: 'fire'
    },
};

const skillTreeData = {
    'guerrier': {
        name: "Arbre de compétences du guerrier",
        skills: {
            'coup_puissant': {
                id: 'coup_puissant',
                name: 'Coup puissant',
                description: 'Un coup violent qui inflige des dégâts supplémentaires.',
                cost: 1,
                prerequisites: [],
                damage: 20,
                manaCost: 10,
                type: 'ability',
                elementalType: 'fire'
            },
            'charge': {
                id: 'charge',
                name: 'Charge',
                description: 'Charge l\\'ennemi, étourdissant et infligeant des dégâts.',
                cost: 1,
                prerequisites: ['coup_puissant'],
                damage: 30,
                manaCost: 15,
                type: 'ability',
                elementalType: 'fire'
            }
        }
    },
    'mage': {
        name: "Arbre de compétences du mage",
        skills: {
            'boule_de_feu': {
                id: 'boule_de_feu',
                name: 'Boule de feu',
                description: 'Lance une boule de feu qui inflige des dégâts magiques.',
                cost: 1,
                prerequisites: [],
                damage: 25,
                manaCost: 10,
                type: 'ability',
                elementalType: 'fire'
            },
            'eclair': {
                id: 'eclair',
                name: 'Éclair',
                description: 'Frappe l\\'ennemi avec un éclair puissant.',
                cost: 1,
                prerequisites: ['boule_de_feu'],
                damage: 35,
                manaCost: 15,
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
                description: 'Une attaque rapide qui a une chance d\\'attaquer deux fois.',
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
        },
        rewardClaimed: false
    }
};