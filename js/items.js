// Fichier : js/items.js

/**
 * Contient toutes les données des objets du jeu.
 * - weapons: Armes.
 * - armors: Armures.
 * - consumables: Objets à usage unique (potions, nourriture, etc.).
 * - questItems: Objets spécifiques aux quêtes.
 *
 * Propriétés des objets:
 * - rarity (chaîne) : 'common', 'uncommon', 'rare', 'epic', 'legendary'
 * - levelRequirement (nombre) : Niveau minimum requis pour équiper l'objet.
 * - element (chaîne) : Type de dégât élémentaire (pour les armes). Ex: 'feu', 'eau'.
 * - resistances (objet) : Résistance aux dégâts élémentaires (pour les armures). Ex: { feu: 10 }
 * - stats (objet) : Bonus de statistiques. Ex: { strength: 2, intelligence: 1 }
 * - passiveEffect (objet) : Effets passifs. Ex: { hpRegen: 1, goldBonus: 0.1 }
 * - set (chaîne) : Nom du set d'équipement auquel l'objet appartient.
 */
const itemsData = {
    weapons: {
        // Armes courantes (Common) - Niveau 1
        'epee_bois': { 
            id: 'epee_bois', 
            name: 'Épée en bois', 
            type: 'weapon', 
            attack: 5, 
            rarity: 'common',
            levelRequirement: 1,
            iconPath: 'img/icons/weapons/epee_bois.png',
            description: 'Une simple épée en bois, parfaite pour l\'entraînement.'
        },
        'arc_simple': {
            id: 'arc_simple',
            name: 'Arc simple',
            type: 'weapon',
            attack: 4,
            rarity: 'common',
            levelRequirement: 1,
            iconPath: 'img/icons/weapons/arc_simple.png',
            description: 'Un arc de chasse basique, mais efficace.'
        }
    },
    armors: {
        'armure_cuir': {
            id: 'armure_cuir',
            name: 'Armure de cuir',
            type: 'armor',
            defense: 5,
            rarity: 'common',
            levelRequirement: 1,
            iconPath: 'img/icons/armors/armure_cuir.png',
            description: 'Une armure légère en cuir, qui offre une protection minimale.'
        }
    },
    consumables: {
        'potion_de_vie': {
            id: 'potion_de_vie',
            name: 'Potion de vie',
            type: 'consumable',
            heal: 20,
            iconPath: 'img/icons/consumables/potion_de_vie.png',
            description: 'Restaure 20 PV.'
        },
        'potion_de_mana': {
            id: 'potion_de_mana',
            name: 'Potion de mana',
            type: 'consumable',
            mana: 15,
            iconPath: 'img/icons/consumables/potion_de_mana.png',
            description: 'Restaure 15 PM.'
        }
    },
    questItems: {
        'le_coeur_metz': {
            id: 'le_coeur_metz',
            name: 'Le Cœur de Metz',
            type: 'questItem',
            iconPath: 'img/icons/quest/le_coeur_metz.png',
            description: 'Un cristal pulsant, qui protège la ville de la Brume. Cet artefact est la clé pour repousser la brume.'
        },
        'cristal_purifie': {
            id: 'cristal_purifie',
            name: 'Cristal Purifié',
            type: 'questItem',
            rarity: 'legendary',
            iconPath: 'img/icons/quest/cristal_purifie.png',
            description: 'Un cristal légendaire qui peut dissiper la Brume sur une zone entière. Nécessaire pour la quête finale.'
        }
    }
};

/**
 * Définit les bonus de set d'équipement.
 * Chaque set a un bonus qui s'active lorsque toutes ses pièces sont équipées.
 */
const itemSets = {
    'set_du_chasseur': {
        name: 'Set du Chasseur',
        pieces: ['katana_damas', 'bottes_du_chasseur'],
        bonus: {
            description: 'Augmente la vitesse de 10 et la chance d\'esquive de 5%.',
            stats: { speed: 10 },
            passiveEffect: { evasionChance: 0.05 }
        }
    },
    'set_du_champion': {
        name: 'Set du Champion',
        pieces: ['marteau_guerre', 'armure_champion'],
        bonus: {
            description: 'Augmente la force de 10 et la défense de 5.',
            stats: { strength: 10, defense: 5 }
        }
    }
};