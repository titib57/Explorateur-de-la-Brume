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


