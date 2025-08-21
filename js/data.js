const abilitiesData = {
    guerrier: [
        { id: "puissant_coup", name: "Coup puissant", damage: 20, cost: 5, type: 'damage' },
        { id: "charge", name: "Charge", damage: 30, cost: 10, type: 'damage' }
    ],
    mage: [
        { id: "boule_de_feu", name: "Boule de feu", damage: 25, cost: 10, type: 'damage' },
        { id: "eclair", name: "Éclair", damage: 35, cost: 15, type: 'damage' }
    ],
    voleur: [
        { id: "attaque_sournoise", name: "Attaque sournoise", damage: 22, cost: 8, type: 'damage' },
        { id: "jet_de_dague", name: "Jet de dague", damage: 18, cost: 5, type: 'damage' }
    ],
    explorateur: [
        { id: "fist_attack", name: "Coup de poing", damage: 5, cost: 0, type: 'damage' }
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
            type: 'weapon'
        },
        'arc_simple': {
            id: 'arc_simple',
            name: 'Arc simple',
            damage: 4,
            type: 'weapon'
        },
        'baton_en_bois': {
            id: 'baton_en_bois',
            name: 'Bâton en bois',
            damage: 3,
            type: 'weapon'
        },
        'dague_simple': {
            id: 'dague_simple',
            name: 'Dague simple',
            damage: 3,
            type: 'weapon'
        }
    },
    armors: {
        'tunique_de_lin': {
            id: 'tunique_de_lin',
            name: 'Tunique de lin',
            defense: 2,
            type: 'armor'
        },
        'plastron_en_cuir': {
            id: 'plastron_en_cuir',
            name: 'Plastron en cuir',
            defense: 5,
            type: 'armor'
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
    'gobelin': {
        name: 'Gobelin',
        maxHp: 30,
        hp: 30,
        attackDamage: 8,
        xpReward: 25,
        goldReward: 5
    },
    'loup': {
        name: 'Loup',
        maxHp: 40,
        hp: 40,
        attackDamage: 10,
        xpReward: 35,
        goldReward: 8
    },
    'chef_gobelin': {
        name: 'Chef Gobelin',
        maxHp: 80,
        hp: 80,
        attackDamage: 15,
        xpReward: 100,
        goldReward: 25
    }
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
                type: 'ability'
            },
            'peau_de_fer': {
                id: 'peau_de_fer',
                name: 'Peau de fer',
                description: 'Augmente la défense de 5 de manière permanente.',
                cost: 1,
                prerequisites: ['frappe_puissante'],
                effect: { defense: 5 },
                type: 'passive'
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
                type: 'ability'
            },
            'bouclier_arcanique': {
                id: 'bouclier_arcanique',
                name: 'Bouclier Arcanique',
                description: 'Augmente le mana max de 10 de manière permanente.',
                cost: 1,
                prerequisites: ['eclair_de_foudre'],
                effect: { maxMana: 10 },
                type: 'passive'
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
                type: 'ability'
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
            item: 'potion_de_vie_basique'
        },
        completed: false,
        rewardClaimed: false
    }
};