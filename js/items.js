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
            description: 'Une simple épée en bois. Parfaite pour l\'entraînement.'
        },
        'dague_fer': { 
            id: 'dague_fer', 
            name: 'Dague en fer', 
            type: 'weapon', 
            attack: 10, 
            rarity: 'common',
            levelRequirement: 1,
            iconPath: 'img/icons/weapons/dague_fer.png',
            description: 'Une dague affûtée en fer.'
        },
        'arc_simple': {
            id: 'arc_simple',
            name: 'Arc simple',
            type: 'weapon',
            attack: 8,
            rarity: 'common',
            levelRequirement: 1,
            iconPath: 'img/icons/weapons/arc_simple.png',
            description: 'Un arc basique pour les archers débutants.'
        },
        'masse_pierre': {
            id: 'masse_pierre',
            name: 'Masse de pierre',
            type: 'weapon',
            attack: 12,
            rarity: 'common',
            levelRequirement: 1,
            iconPath: 'img/icons/weapons/masse_pierre.png',
            description: 'Une masse lourde qui inflige de solides dégâts.'
        },

        // Armes peu communes (Uncommon) - Niveau 5
        'epee_bronze': {
            id: 'epee_bronze',
            name: 'Épée en bronze',
            type: 'weapon',
            attack: 15,
            rarity: 'uncommon',
            levelRequirement: 5,
            iconPath: 'img/icons/weapons/epee_bronze.png',
            description: 'Une épée de meilleure qualité, en bronze.'
        },
        'lance_chasse': {
            id: 'lance_chasse',
            name: 'Lance de chasse',
            type: 'weapon',
            attack: 18,
            rarity: 'uncommon',
            levelRequirement: 5,
            iconPath: 'img/icons/weapons/lance_chasse.png',
            description: 'Une lance robuste pour la chasse et le combat.'
        },
        'baton_serpent': {
            id: 'baton_serpent',
            name: 'Bâton du Serpent',
            type: 'weapon',
            attack: 16,
            rarity: 'uncommon',
            levelRequirement: 5,
            iconPath: 'img/icons/weapons/baton_serpent.png',
            description: 'Un bâton qui empoisonne les ennemis.',
            element: 'poison',
            stats: { intelligence: 1 }
        },
        'hache_orque': {
            id: 'hache_orque',
            name: 'Hache d\'Orque',
            type: 'weapon',
            attack: 22,
            rarity: 'uncommon',
            levelRequirement: 5,
            iconPath: 'img/icons/weapons/hache_orque.png',
            description: 'Une hache lourde et barbare.'
        },

        // Armes rares (Rare) - Niveau 10
        'epee_acier': {
            id: 'epee_acier',
            name: 'Épée en acier',
            type: 'weapon',
            attack: 25,
            rarity: 'rare',
            levelRequirement: 10,
            iconPath: 'img/icons/weapons/epee_acier.png',
            description: 'Une épée en acier finement forgé, très efficace.'
        },
        'baton_mage': {
            id: 'baton_mage',
            name: 'Bâton de mage',
            type: 'weapon',
            attack: 20,
            rarity: 'rare',
            levelRequirement: 10,
            iconPath: 'img/icons/weapons/baton_mage.png',
            description: 'Un bâton magique qui amplifie le mana et la puissance des sorts.',
            stats: { mana: 20, intelligence: 3 },
            element: 'feu'
        },
        'arbalete_precise': {
            id: 'arbalete_precise',
            name: 'Arbalète précise',
            type: 'weapon',
            attack: 30,
            rarity: 'rare',
            levelRequirement: 10,
            iconPath: 'img/icons/weapons/arbalete_precise.png',
            description: 'Une arbalète avec une grande précision. Augmente la chance de coup critique.',
            passiveEffect: { critChance: 0.15 }
        },

        // Armes épiques (Epic) - Niveau 20
        'katana_damas': {
            id: 'katana_damas',
            name: 'Katana de Damas',
            type: 'weapon',
            attack: 45,
            rarity: 'epic',
            levelRequirement: 20,
            iconPath: 'img/icons/weapons/katana_damas.png',
            description: 'Une lame légendaire au tranchant inégalé.',
            stats: { speed: 5, dexterity: 5 },
            element: 'air',
            set: 'set_du_chasseur'
        },
        'marteau_golem': {
            id: 'marteau_golem',
            name: 'Marteau de golem',
            type: 'weapon',
            attack: 60,
            rarity: 'epic',
            levelRequirement: 20,
            iconPath: 'img/icons/weapons/marteau_golem.png',
            description: 'Un marteau si lourd que seul un guerrier puissant peut le soulever.',
            stats: { strength: 10, defense: 5 },
            element: 'terre',
            set: 'set_du_champion'
        },
        'baton_foudre': {
            id: 'baton_foudre',
            name: 'Bâton de foudre',
            type: 'weapon',
            attack: 35,
            rarity: 'epic',
            levelRequirement: 20,
            iconPath: 'img/icons/weapons/baton_foudre.png',
            description: 'Un bâton qui lance des éclairs. Effet passif : chance de paralyser l\'ennemi.',
            element: 'foudre',
            stats: { intelligence: 10 },
            passiveEffect: { stunChance: 0.05 }
        },

        // Armes légendaires (Legendary) - Niveau 40
        'lame_spectral': {
            id: 'lame_spectral',
            name: 'Lame spectrale',
            type: 'weapon',
            attack: 80,
            rarity: 'legendary',
            levelRequirement: 40,
            iconPath: 'img/icons/weapons/lame_spectral.png',
            description: 'Une lame imprégnée d\'esprit. Ignore 50% de la défense de l\'ennemi.',
            passiveEffect: { armorPenetration: 0.5 },
            element: 'tenebres'
        },
    },
    armors: {
        // Armures courantes (Common) - Niveau 1
        'plastron_cuir': { 
            id: 'plastron_cuir', 
            name: 'Plastron en cuir', 
            type: 'armor', 
            defense: 5, 
            rarity: 'common',
            levelRequirement: 1,
            iconPath: 'img/icons/armors/plastron_cuir.png',
            description: 'Un plastron de base en cuir résistant.'
        },
        'capuche_tissu': {
            id: 'capuche_tissu',
            name: 'Capuche en tissu',
            type: 'armor',
            defense: 2,
            rarity: 'common',
            levelRequirement: 1,
            iconPath: 'img/icons/armors/capuche_tissu.png',
            description: 'Une simple capuche pour se protéger du soleil et de la pluie.'
        },

        // Armures peu communes (Uncommon) - Niveau 5
        'armure_fer': {
            id: 'armure_fer',
            name: 'Armure en fer',
            type: 'armor',
            defense: 12,
            rarity: 'uncommon',
            levelRequirement: 5,
            iconPath: 'img/icons/armors/armure_fer.png',
            description: 'Une armure basique en fer, lourde mais solide.'
        },
        'bottes_cuir': {
            id: 'bottes_cuir',
            name: 'Bottes en cuir',
            type: 'armor',
            defense: 3,
            rarity: 'uncommon',
            levelRequirement: 5,
            iconPath: 'img/icons/armors/bottes_cuir.png',
            description: 'Des bottes souples qui augmentent la vitesse.',
            stats: { speed: 2 }
        },
        
        // Armures rares (Rare) - Niveau 10
        'armure_mithril': {
            id: 'armure_mithril',
            name: 'Armure en mithril',
            type: 'armor',
            defense: 25,
            rarity: 'rare',
            levelRequirement: 10,
            iconPath: 'img/icons/armors/armure_mithril.png',
            description: 'Une armure en mithril, légère et incroyablement résistante.',
            resistances: { 'eau': 10 }
        },
        'toge_mage': {
            id: 'toge_mage',
            name: 'Toge de mage',
            type: 'armor',
            defense: 8,
            rarity: 'rare',
            levelRequirement: 10,
            iconPath: 'img/icons/armors/toge_mage.png',
            description: 'Une toge enchantée qui renforce la magie.',
            stats: { intelligence: 3 },
            resistances: { 'feu': 5 }
        },
        'casque_fer': {
            id: 'casque_fer',
            name: 'Casque en fer',
            type: 'armor',
            defense: 5,
            rarity: 'rare',
            levelRequirement: 10,
            iconPath: 'img/icons/armors/casque_fer.png',
            description: 'Un casque robuste qui protège la tête.'
        },

        // Armures épiques (Epic) - Niveau 20
        'armure_dragon': {
            id: 'armure_dragon',
            name: 'Armure de dragon',
            type: 'armor',
            defense: 40,
            rarity: 'epic',
            levelRequirement: 20,
            iconPath: 'img/icons/armors/armure_dragon.png',
            description: 'Forgée à partir d\'écailles de dragon, cette armure est presque indestructible.',
            resistances: { 'feu': 20, 'terre': 10 },
            set: 'set_du_champion'
        },
        'bottes_du_chasseur': {
            id: 'bottes_du_chasseur',
            name: 'Bottes du Chasseur',
            type: 'armor',
            defense: 10,
            rarity: 'epic',
            levelRequirement: 20,
            iconPath: 'img/icons/armors/bottes_du_chasseur.png',
            description: 'Des bottes qui augmentent considérablement l\'agilité et l\'esquive.',
            stats: { speed: 5 },
            passiveEffect: { evasionChance: 0.1 },
            set: 'set_du_chasseur'
        },
    },
    consumables: {
        // Potions et nourriture courantes
        'potion_sante_petite': { 
            id: 'potion_sante_petite', 
            name: 'Petite potion de santé', 
            type: 'consumable', 
            rarity: 'common',
            effect: { hp: 50 }, 
            iconPath: 'img/icons/consumables/potion_sante.png',
            description: 'Restaure 50 points de vie.'
        },
        'potion_mana_petite': { 
            id: 'potion_mana_petite', 
            name: 'Petite potion de mana', 
            type: 'consumable', 
            rarity: 'common',
            effect: { mana: 30 }, 
            iconPath: 'img/icons/consumables/potion_mana.png',
            description: 'Restaure 30 points de mana.'
        },
        'pain_sec': {
            id: 'pain_sec',
            name: 'Pain sec',
            type: 'consumable',
            rarity: 'common',
            effect: { hp: 15 },
            iconPath: 'img/icons/consumables/pain_sec.png',
            description: 'Un morceau de pain qui a vu de meilleurs jours. Restaure une petite quantité de PV.'
        },

        // Potions et nourriture peu communes
        'potion_sante_moyenne': {
            id: 'potion_sante_moyenne',
            name: 'Potion de santé moyenne',
            type: 'consumable',
            rarity: 'uncommon',
            effect: { hp: 150 },
            iconPath: 'img/icons/consumables/potion_sante.png',
            description: 'Restaure 150 points de vie.'
        },
        'ration_voyageur': {
            id: 'ration_voyageur',
            name: 'Ration de voyageur',
            type: 'consumable',
            rarity: 'uncommon',
            effect: { hp: 100 },
            iconPath: 'img/icons/consumables/ration_voyageur.png',
            description: 'Une ration complète pour les longs voyages.'
        },

        // Potions et nourriture rares
        'potion_sante_grande': {
            id: 'potion_sante_grande',
            name: 'Grande potion de santé',
            type: 'consumable',
            rarity: 'rare',
            effect: { hp: 400 },
            iconPath: 'img/icons/consumables/potion_sante_grande.png',
            description: 'Restaure 400 points de vie.'
        },
        'elixir_mana': {
            id: 'elixir_mana',
            name: 'Élixir de mana',
            type: 'consumable',
            rarity: 'rare',
            effect: { mana: 200 },
            iconPath: 'img/icons/consumables/elixir_mana.png',
            description: 'Restaure une grande quantité de mana.'
        },

        // Potions et nourriture épiques
        'potion_ultime': {
            id: 'potion_ultime',
            name: 'Potion ultime',
            type: 'consumable',
            rarity: 'epic',
            effect: { hp: 999, mana: 999 },
            iconPath: 'img/icons/consumables/potion_ultime.png',
            description: 'Une potion légendaire qui restaure entièrement la vie et le mana.'
        },
        'elixir_force': {
            id: 'elixir_force',
            name: 'Élixir de Force',
            type: 'consumable',
            rarity: 'epic',
            effect: { strengthBonus: 5, duration: 300 }, // +5 Force pour 5 minutes
            iconPath: 'img/icons/consumables/elixir_force.png',
            description: 'Augmente la force de 5 points pendant 5 minutes.'
        },
    },
    questItems: {
        'graoully_scale': { 
            id: 'graoully_scale', 
            name: 'Écaille de Graoully', 
            type: 'questItem', 
            iconPath: 'img/icons/quest/graoully_scale.png',
            description: 'Une écaille de dragon irisée, émettant une faible lueur. Nécessaire pour la quête "Le Secret du Graoully".'
        },
        'roman_artifact': { 
            id: 'roman_artifact', 
            name: 'Artefact Romain', 
            type: 'questItem', 
            iconPath: 'img/icons/quest/roman_artifact.png',
            description: 'Un fragment de tablette ancienne, gravé de runes latines. Nécessaire pour la quête "Les Ruines de Divodurum".'
        },
        'cle_souterrain': {
            id: 'cle_souterrain',
            name: 'Clé du Souterrain',
            type: 'questItem',
            iconPath: 'img/icons/quest/cle_souterrain.png',
            description: 'Une clé sculptée à partir d\'une pierre ancienne. Elle ouvre le passage vers la crypte impériale.'
        },
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
        pieces: ['marteau_golem', 'armure_dragon'],
        bonus: {
            description: 'Augmente la force de 15, la défense de 10, et la résistance à la terre de 10.',
            stats: { strength: 15, defense: 10 },
            resistances: { terre: 10 }
        }
    }
};