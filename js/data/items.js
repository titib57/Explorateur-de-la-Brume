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
};export const itemSets = {
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