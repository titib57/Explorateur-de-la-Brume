export const elements = {
    'feu': { name: 'Feu', strongAgainst: ['terre', 'poison'], weakAgainst: ['eau', 'foudre'] },
    'eau': { name: 'Eau', strongAgainst: ['feu'], weakAgainst: ['foudre', 'terre'] },
    'terre': { name: 'Terre', strongAgainst: ['foudre', 'poison'], weakAgainst: ['feu', 'eau'] },
    'foudre': { name: 'Foudre', strongAgainst: ['eau'], weakAgainst: ['terre'] },
    'poison': { name: 'Poison', strongAgainst: ['eau'], weakAgainst: ['feu', 'terre'] },
    'neutre': { name: 'Neutre', strongAgainst: [], weakAgainst: [] }
};
