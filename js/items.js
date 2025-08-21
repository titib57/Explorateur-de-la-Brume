// Fichier : js/items.js

/**
 * Contient toutes les données des objets du jeu.
 * - weapons: Armes.
 * - armors: Armures.
 * - consumables: Objets à usage unique (potions, etc.).
 * - questItems: Objets spécifiques aux quêtes.
 */
const itemsData = {
    weapons: {
        'epee_bois': { 
            id: 'epee_bois', 
            name: 'Épée en bois', 
            type: 'weapon', 
            attack: 5, 
            iconPath: 'img/icons/epee_bois.png',
            description: 'Une simple épée en bois. Parfaite pour l\'entraînement.'
        },
        'dague_fer': { 
            id: 'dague_fer', 
            name: 'Dague en fer', 
            type: 'weapon', 
            attack: 10, 
            iconPath: 'img/icons/dague_fer.png',
            description: 'Une dague affûtée en fer.'
        },
        // Ajoutez d'autres armes ici
    },
    armors: {
        'plastron_cuir': { 
            id: 'plastron_cuir', 
            name: 'Plastron en cuir', 
            type: 'armor', 
            defense: 5, 
            iconPath: 'img/icons/plastron_cuir.png',
            description: 'Un plastron de base en cuir résistant.'
        },
        // Ajoutez d'autres armures ici
    },
    consumables: {
        'potion_sante': { 
            id: 'potion_sante', 
            name: 'Potion de santé', 
            type: 'consumable', 
            effect: { hp: 50 }, 
            iconPath: 'img/icons/potion_sante.png',
            description: 'Restaure 50 points de vie.'
        },
        'potion_mana': { 
            id: 'potion_mana', 
            name: 'Potion de mana', 
            type: 'consumable', 
            effect: { mana: 30 }, 
            iconPath: 'img/icons/potion_mana.png',
            description: 'Restaure 30 points de mana.'
        },
        // Ajoutez d'autres consommables ici
    },
    questItems: {
        'graoully_scale': { 
            id: 'graoully_scale', 
            name: 'Écaille de Graoully', 
            type: 'questItem', 
            iconPath: 'img/icons/graoully_scale.png',
            description: 'Une écaille de dragon irisée, émettant une faible lueur. Nécessaire pour la quête "Le Secret du Graoully".'
        },
        'roman_artifact': { 
            id: 'roman_artifact', 
            name: 'Artefact Romain', 
            type: 'questItem', 
            iconPath: 'img/icons/roman_artifact.png',
            description: 'Un fragment de tablette ancienne, gravé de runes latines. Nécessaire pour la quête "Les Ruines de Divodurum".'
        }
    }
};