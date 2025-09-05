/**
 * Contient toutes les données des objets du jeu.
 * - weapons: Armes.
 * - armors: Armures.
 * - consumables: Objets à usage unique (potions, nourriture, etc.).
 * - questItems: Objets spécifiques aux quêtes ou à l'histoire.
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
        'baton_appoint': { 
            id: 'baton_appoint', 
            name: 'Bâton d\'appoint', 
            type: 'weapon', 
            attack: 5, 
            rarity: 'common',
            levelRequirement: 1,
            iconPath: 'img/icons/weapons/epee_bois.png',
            description: 'Un simple bâton ramassé dans la Rue d\'Ancienne. Fait l\'affaire en attendant mieux.'
        },
        'lame_fortune': { 
            id: 'lame_fortune', 
            name: 'Lame de fortune', 
            type: 'weapon', 
            attack: 10, 
            rarity: 'common',
            levelRequirement: 1,
            iconPath: 'img/icons/weapons/dague_fer.png',
            description: 'Un couteau de survie en métal recyclé.'
        },
        'arbalete_improvisée': {
            id: 'arbalete_improvisée',
            name: 'Arbalète improvisée',
            type: 'weapon',
            attack: 8,
            rarity: 'common',
            levelRequirement: 1,
            iconPath: 'img/icons/weapons/arc_simple.png',
            description: 'Fabriquée à la va-vite. Fait plus de bruit que de dégâts.'
        },
        'masse_rouillée': {
            id: 'masse_rouillée',
            name: 'Masse de chantier rouillée',
            type: 'weapon',
            attack: 12,
            rarity: 'common',
            levelRequirement: 1,
            iconPath: 'img/icons/weapons/masse_pierre.png',
            description: 'Une masse de démolition récupérée. Lente mais puissante.'
        },
        // Arme de départ
        'lame_stase': {
            id: 'lame_stase',
            name: 'Lame de Stase',
            type: 'weapon',
            attack: 10,
            rarity: 'uncommon',
            levelRequirement: 1,
            iconPath: 'img/icons/weapons/lame_stase.png',
            description: 'Un outil qui génère une impulsion de distorsion temporelle. Utile pour les combats et la collecte de ressources.'
        },
        // Armes peu communes (Uncommon) - Niveau 5
        'lame_garde': {
            id: 'lame_garde',
            name: 'Lame de la Garde',
            type: 'weapon',
            attack: 15,
            rarity: 'uncommon',
            levelRequirement: 5,
            iconPath: 'img/icons/weapons/epee_bronze.png',
            description: 'Une épée de la milice d\'avant la Brume. Plutôt solide.'
        },
        'javelot_alliage': {
            id: 'javelot_alliage',
            name: 'Javelot en alliage',
            type: 'weapon',
            attack: 18,
            rarity: 'uncommon',
            levelRequirement: 5,
            iconPath: 'img/icons/weapons/lance_chasse.png',
            description: 'Un javelot en alliage léger et résistant.'
        },
        'baton_nécromancien': {
            id: 'baton_nécromancien',
            name: 'Bâton du Nécromancien',
            type: 'weapon',
            attack: 16,
            rarity: 'uncommon',
            levelRequirement: 5,
            iconPath: 'img/icons/weapons/baton_serpent.png',
            description: 'Un bâton qui émet une aura corrompue de la Brume.',
            element: 'poison',
            stats: { intelligence: 1 }
        },
        'hache_brume': {
            id: 'hache_brume',
            name: 'Hache de la Brume',
            type: 'weapon',
            attack: 22,
            rarity: 'uncommon',
            levelRequirement: 5,
            iconPath: 'img/icons/weapons/hache_orque.png',
            description: 'Une hache lourde et barbare, imprégnée de l\'énergie de la Brume.'
        },
        'couteau_artisan': {
            id: 'couteau_artisan',
            name: 'Couteau d\'artisan',
            type: 'weapon',
            attack: 13,
            rarity: 'uncommon',
            levelRequirement: 5,
            iconPath: 'img/icons/weapons/dague_acier.png',
            description: 'Un couteau de poche qui se replie sur lui-même, très aiguisé.'
        },
        // Armes rares (Rare) - Niveau 10
        'glaive_cité': {
            id: 'glaive_cité',
            name: 'Glaive de la Cité',
            type: 'weapon',
            attack: 25,
            rarity: 'rare',
            levelRequirement: 10,
            iconPath: 'img/icons/weapons/epee_acier.png',
            description: 'Un glaive en acier finement forgé, très efficace contre les créatures de la Brume.'
        },
        'sceptre_chronomage': {
            id: 'sceptre_chronomage',
            name: 'Sceptre du Chronomage',
            type: 'weapon',
            attack: 20,
            rarity: 'rare',
            levelRequirement: 10,
            iconPath: 'img/icons/weapons/baton_mage.png',
            description: 'Un bâton qui amplifie le mana et la puissance des sorts temporels.',
            stats: { mana: 20, intelligence: 3 },
            element: 'temps'
        },
        'fusil_précis': {
            id: 'fusil_précis',
            name: 'Fusil à fléchettes modifié',
            type: 'weapon',
            attack: 30,
            rarity: 'rare',
            levelRequirement: 10,
            iconPath: 'img/icons/weapons/arbalete_precise.png',
            description: 'Un fusil à fléchettes avec une grande précision. Augmente la chance de coup critique.',
            passiveEffect: { critChance: 0.15 }
        },
        'fouet_foudre': {
            id: 'fouet_foudre',
            name: 'Fouet de la Foudre',
            type: 'weapon',
            attack: 22,
            rarity: 'rare',
            levelRequirement: 10,
            iconPath: 'img/icons/weapons/fouet.png',
            description: 'Un fouet enchanté qui dégage des éclairs. Effet passif : chance de paralyser l\'ennemi.',
            element: 'foudre',
            stats: { intelligence: 2 },
            passiveEffect: { stunChance: 0.05 }
        },
        // Armes épiques (Epic) - Niveau 20
        'lame_éther': {
            id: 'lame_éther',
            name: 'Lame d\'Éther',
            type: 'weapon',
            attack: 45,
            rarity: 'epic',
            levelRequirement: 20,
            iconPath: 'img/icons/weapons/katana_damas.png',
            description: 'Une lame légendaire qui tranche à travers le temps et l\'espace.',
            stats: { speed: 5, dexterity: 5 },
            element: 'éther',
            set: 'set_de_l_éclaireur'
        },
        'marteau_forges': {
            id: 'marteau_forges',
            name: 'Marteau des Forges Oubliées',
            type: 'weapon',
            attack: 60,
            rarity: 'epic',
            levelRequirement: 20,
            iconPath: 'img/icons/weapons/marteau_golem.png',
            description: 'Un marteau si lourd que seul un guerrier puissant peut le soulever. Forgé dans les profondeurs de Metz.',
            stats: { strength: 10, defense: 5 },
            element: 'terre',
            set: 'set_du_défenseur'
        },
        'sceptre_orage': {
            id: 'sceptre_orage',
            name: 'Sceptre d\'Orage de la Citadelle',
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
        'dague_brume': {
            id: 'dague_brume',
            name: 'Dague de la Brume',
            type: 'weapon',
            attack: 40,
            rarity: 'epic',
            levelRequirement: 20,
            iconPath: 'img/icons/weapons/dague_fantome.png',
            description: 'Une dague imprégnée de l\'énergie de la Brume. Parfaite pour des attaques rapides et silencieuses.',
            passiveEffect: { evasionChance: 0.05, speed: 3 },
            element: 'ténèbres',
            set: 'set_de_l_ombre'
        },
        // Armes légendaires (Legendary) - Niveau 40
        'lame_écho': {
            id: 'lame_écho',
            name: 'Lame d\'Écho',
            type: 'weapon',
            attack: 80,
            rarity: 'legendary',
            levelRequirement: 40,
            iconPath: 'img/icons/weapons/lame_spectral.png',
            description: 'Une lame qui résonne avec les âmes oubliées. Ignore 50% de la défense de l\'ennemi.',
            passiveEffect: { armorPenetration: 0.5 },
            element: 'ténèbres'
        },
        'epee_graoully': {
            id: 'epee_graoully',
            name: 'Épée du Graoully',
            type: 'weapon',
            attack: 100,
            rarity: 'legendary',
            levelRequirement: 40,
            iconPath: 'img/icons/weapons/epee_dragon.png',
            description: 'Forgée à partir d\'une griffe du Graoully, cette épée est capable de fendre la Brume elle-même. Possède une puissance de feu incroyable.',
            stats: { strength: 15, critChance: 0.1 },
            element: 'feu'
        },
    },
    armors: {
        // Armures courantes (Common) - Niveau 1
        'veste_survivant': { 
            id: 'veste_survivant', 
            name: 'Veste de survivant', 
            type: 'armor', 
            defense: 5, 
            rarity: 'common',
            levelRequirement: 1,
            iconPath: 'img/icons/armors/plastron_cuir.png',
            description: 'Une veste de base, cousue de pièces de cuir et de tissu.'
        },
        'capuche_éclaireur': {
            id: 'capuche_éclaireur',
            name: 'Capuche d\'éclaireur',
            type: 'armor',
            defense: 2,
            rarity: 'common',
            levelRequirement: 1,
            iconPath: 'img/icons/armors/capuche_tissu.png',
            description: 'Une simple capuche pour se protéger de la Brume.'
        },
        // Armures peu communes (Uncommon) - Niveau 5
        'armure_contrebandier': {
            id: 'armure_contrebandier',
            name: 'Armure de contrebandier',
            type: 'armor',
            defense: 12,
            rarity: 'uncommon',
            levelRequirement: 5,
            iconPath: 'img/icons/armors/armure_fer.png',
            description: 'Une armure faite d\'acier récupéré, solide mais bruyante.'
        },
        'bottes_pisteur': {
            id: 'bottes_pisteur',
            name: 'Bottes de pisteur',
            type: 'armor',
            defense: 3,
            rarity: 'uncommon',
            levelRequirement: 5,
            iconPath: 'img/icons/armors/bottes_cuir.png',
            description: 'Des bottes souples qui augmentent la vitesse et l\'agilité.',
            stats: { speed: 2 }
        },
        'gants_mineur': {
            id: 'gants_mineur',
            name: 'Gants du mineur',
            type: 'armor',
            defense: 4,
            rarity: 'uncommon',
            levelRequirement: 5,
            iconPath: 'img/icons/armors/gants_cuir.png',
            description: 'Des gants épais pour la protection des mains. Parfaits pour la collecte de ressources.'
        },
        // Armures rares (Rare) - Niveau 10
        'armure_arcanum': {
            id: 'armure_arcanum',
            name: 'Armure de l\'Arcanum',
            type: 'armor',
            defense: 25,
            rarity: 'rare',
            levelRequirement: 10,
            iconPath: 'img/icons/armors/armure_mithril.png',
            description: 'Une armure en alliage d\'acier forgé. Légère et incroyablement résistante au temps.',
            resistances: { 'éther': 10 }
        },
        'toge_archiviste': {
            id: 'toge_archiviste',
            name: 'Toge de l\'Archiviste',
            type: 'armor',
            defense: 8,
            rarity: 'rare',
            levelRequirement: 10,
            iconPath: 'img/icons/armors/toge_mage.png',
            description: 'Une toge enchantée qui renforce la magie et l\'intelligence.',
            stats: { intelligence: 3 },
            resistances: { 'ténèbres': 5 }
        },
        'casque_cité': {
            id: 'casque_cité',
            name: 'Casque de la Cité-Haute',
            type: 'armor',
            defense: 5,
            rarity: 'rare',
            levelRequirement: 10,
            iconPath: 'img/icons/armors/casque_fer.png',
            description: 'Un casque robuste qui protège la tête. Provenant d\'un garde de la Cité-Haute.'
        },
        'plastron_acier': {
            id: 'plastron_acier',
            name: 'Plastron en acier métropolitain',
            type: 'armor',
            defense: 30,
            rarity: 'rare',
            levelRequirement: 10,
            iconPath: 'img/icons/armors/plastron_acier.png',
            description: 'Un plastron lourd qui offre une bonne protection contre les attaques physiques.'
        },
        // Armures épiques (Epic) - Niveau 20
        'cuirasse_graoully': {
            id: 'cuirasse_graoully',
            name: 'Cuirasse d\'Écailles du Graoully',
            type: 'armor',
            defense: 40,
            rarity: 'epic',
            levelRequirement: 20,
            iconPath: 'img/icons/armors/armure_dragon.png',
            description: 'Forgée à partir d\'écailles du Graoully, cette armure est presque indestructible.',
            resistances: { 'poison': 20, 'terre': 10 },
            set: 'set_du_défenseur'
        },
        'bottes_brume': {
            id: 'bottes_brume',
            name: 'Bottes de la Brume',
            type: 'armor',
            defense: 10,
            rarity: 'epic',
            levelRequirement: 20,
            iconPath: 'img/icons/armors/bottes_du_chasseur.png',
            description: 'Des bottes qui augmentent considérablement l\'agilité et l\'esquive dans la Brume.',
            stats: { speed: 5 },
            passiveEffect: { evasionChance: 0.1 },
            set: 'set_de_l_éclaireur'
        },
        'casque_ombre': {
            id: 'casque_ombre',
            name: 'Casque de l\'Ombre',
            type: 'armor',
            defense: 15,
            rarity: 'epic',
            levelRequirement: 20,
            iconPath: 'img/icons/armors/casque_assassin.png',
            description: 'Un casque léger qui vous rend plus difficile à repérer.',
            stats: { dexterity: 5 },
            passiveEffect: { stealthBonus: 0.2 },
            set: 'set_de_l_ombre'
        },
        // Armures légendaires (Legendary) - Niveau 40
        'armure_soleil_levant': {
            id: 'armure_soleil_levant',
            name: 'Armure du Soleil Levant',
            type: 'armor',
            defense: 60,
            rarity: 'legendary',
            levelRequirement: 40,
            iconPath: 'img/icons/armors/armure_lumiere.png',
            description: 'Forgée avec le pouvoir des derniers rayons du soleil. Dissipe la Brume autour de son porteur et restaure la vie avec le temps.',
            resistances: { 'ténèbres': 30, 'feu': 10 },
            passiveEffect: { hpRegen: 5 }
        },
    },
    consumables: {
        // Potions et nourriture courantes
        'sérum_santé': { 
            id: 'sérum_santé', 
            name: 'Sérum de Vitalité', 
            type: 'consumable', 
            rarity: 'common',
            effect: { hp: 50 }, 
            iconPath: 'img/icons/consumables/potion_sante.png',
            description: 'Un petit sérum qui restaure 50 points de vie.'
        },
        'ampoule_flux': { 
            id: 'ampoule_flux', 
            name: 'Ampoule de Flux Temporel', 
            type: 'consumable', 
            rarity: 'common',
            effect: { mana: 30 }, 
            iconPath: 'img/icons/consumables/potion_mana.png',
            description: 'Restaure 30 points de mana.'
        },
        'ration_survie': {
            id: 'ration_survie',
            name: 'Ration de survie',
            type: 'consumable',
            rarity: 'common',
            effect: { hp: 15 },
            iconPath: 'img/icons/consumables/pain_sec.png',
            description: 'Une barre de céréales concentrée. Restaure une petite quantité de PV.'
        },
        // Consommable de départ
        'fragment_ataraxie': {
            id: 'fragment_ataraxie',
            name: 'Fragment d\'Ataraxie',
            type: 'consumable',
            rarity: 'uncommon',
            effect: { hp: 50 },
            iconPath: 'img/icons/consumables/fragment_ataraxie.png',
            description: 'Une capsule d\'énergie apaisante qui restaure une partie de votre santé.'
        },
        // Potions et nourriture peu communes
        'sérum_moyen': {
            id: 'sérum_moyen',
            name: 'Sérum de Vitalité moyen',
            type: 'consumable',
            rarity: 'uncommon',
            effect: { hp: 150 },
            iconPath: 'img/icons/consumables/potion_sante.png',
            description: 'Restaure 150 points de vie.'
        },
        'ration_fortifiée': {
            id: 'ration_fortifiée',
            name: 'Ration fortifiée',
            type: 'consumable',
            rarity: 'uncommon',
            effect: { hp: 100 },
            iconPath: 'img/icons/consumables/ration_voyageur.png',
            description: 'Une ration complète pour les longs voyages dans la Brume.'
        },
        'elixir_force': {
            id: 'elixir_force',
            name: 'Élixir de Force',
            type: 'consumable',
            rarity: 'uncommon',
            effect: { stats: { strength: 3, duration: 120 } },
            iconPath: 'img/icons/consumables/elixir_force.png',
            description: 'Augmente votre force de 3 points pendant 2 minutes.'
        },
        // Potions et nourriture rares
        'sérum_supérieur': {
            id: 'sérum_supérieur',
            name: 'Sérum de Vitalité supérieur',
            type: 'consumable',
            rarity: 'rare',
            effect: { hp: 400 },
            iconPath: 'img/icons/consumables/potion_sante_grande.png',
            description: 'Restaure 400 points de vie.'
        },
        'elixir_chronos': {
            id: 'elixir_chronos',
            name: 'Élixir de Chronos',
            type: 'consumable',
            rarity: 'rare',
            effect: { mana: 200 },
            iconPath: 'img/icons/consumables/elixir_mana.png',
            description: 'Restaure une grande quantité de mana.'
        },
        'potion_resistance': {
            id: 'potion_resistance',
            name: 'Potion de Résistance',
            type: 'consumable',
            rarity: 'rare',
            effect: { resistances: { 'poison': 15, 'terre': 15, duration: 300 } },
            iconPath: 'img/icons/consumables/potion_resistance.png',
            description: 'Augmente temporairement votre résistance au poison et à la terre.'
        },
        // Potions et nourriture épiques
        'kit_soin': {
            id: 'kit_soin',
            name: 'Kit de survie d\'urgence',
            type: 'consumable',
            rarity: 'epic',
            effect: { hp: 999, mana: 999 },
            iconPath: 'img/icons/consumables/potion_ultime.png',
            description: 'Un kit de soin complet qui restaure entièrement la vie et le mana.'
        },
        'sérum_berserker': {
            id: 'sérum_berserker',
            name: 'Sérum de Berserker',
            type: 'consumable',
            rarity: 'epic',
            effect: { strengthBonus: 5, duration: 300 }, // +5 Force pour 5 minutes
            iconPath: 'img/icons/consumables/elixir_force.png',
            description: 'Augmente la force de 5 points pendant 5 minutes.'
        },
        'elixir_chance': {
            id: 'elixir_chance',
            name: 'Élixir de Chance',
            type: 'consumable',
            rarity: 'epic',
            effect: { passiveEffect: { goldBonus: 0.5, expBonus: 0.5, duration: 600 } },
            iconPath: 'img/icons/consumables/elixir_chance.png',
            description: 'Augmente les gains d\'or et d\'expérience de 50% pendant 10 minutes.'
        },
    },
    questItems: {
        // Objet de départ
        'mnemonique': {
            id: 'mnemonique',
            name: 'Le Mnémonique',
            type: 'questItem',
            rarity: 'legendary',
            iconPath: 'img/icons/quest/mnemonique.png',
            description: 'Un appareil mystérieux qui détecte les anomalies temporelles et sert de guide.'
        },
        // Objets de quête existants
        'écaille_graoully': { 
            id: 'écaille_graoully', 
            name: 'Écaille de Graoully', 
            type: 'questItem', 
            iconPath: 'img/icons/quest/graoully_scale.png',
            description: 'Une écaille irisée du Graoully, le légendaire dragon de Metz, émettant une faible lueur. Nécessaire pour la quête "Le Secret du Graoully".'
        },
        'plaque_romaine': { 
            id: 'plaque_romaine', 
            name: 'Plaque des Thermes Romains', 
            type: 'questItem', 
            iconPath: 'img/icons/quest/roman_artifact.png',
            description: 'Un fragment de tablette ancienne gravé de runes latines. Nécessaire pour la quête "Les Ruines de Divodurum".'
        },
        'clé_nécropole': {
            id: 'clé_nécropole',
            name: 'Clé de la Nécropole Impériale',
            type: 'questItem',
            iconPath: 'img/icons/quest/cle_souterrain.png',
            description: 'Une clé sculptée dans une pierre ancienne. Elle ouvre le passage vers la nécropole sous la ville.'
        },
        'le_coeur_metz': {
            id: 'le_coeur_metz',
            name: 'Le Cœur de Metz',
            type: 'questItem',
            iconPath: 'img/icons/quest/le_coeur_metz.png',
            description: 'Un cristal pulsant, qui protège la ville de la Brume. Cet artefact est la clé pour repousser la brume.'
        },
        'fragment_purifié': {
            id: 'fragment_purifié',
            name: 'Fragment purifié du Cœur de Metz',
            type: 'questItem',
            rarity: 'legendary',
            iconPath: 'img/icons/quest/cristal_purifie.png',
            description: 'Un fragment de cristal purifié qui peut dissiper la Brume sur une zone entière. Nécessaire pour la quête finale.'
        },
        'livre_ancien': {
            id: 'livre_ancien',
            name: 'Livre des Prophéties Oubliées',
            type: 'questItem',
            rarity: 'rare',
            iconPath: 'img/icons/quest/livre_ancien.png',
            description: 'Un manuscrit usé trouvé dans les archives de la cathédrale. Il contient des informations sur la Brume et son origine.'
        },
        'masque_corrompu': {
            id: 'masque_corrompu',
            name: 'Masque corrompu de l\'Ancien',
            type: 'questItem',
            rarity: 'epic',
            iconPath: 'img/icons/quest/masque_mort.png',
            description: 'Un masque qui dégage une aura de Brume. Porté par un gardien de la Nécropole Impériale.'
        }
    }
};

/**
 * Définit les bonus de set d'équipement.
 * Chaque set a un bonus qui s'active lorsque toutes ses pièces sont équipées.
 */
const itemSets = {
    'set_de_l_éclaireur': {
        name: 'Set de l\'Éclaireur',
        pieces: ['lame_éther', 'bottes_brume'],
        bonus: {
            description: 'Augmente la vitesse de 10 et la chance d\'esquive de 5%.',
            stats: { speed: 10 },
            passiveEffect: { evasionChance: 0.05 }
        }
    },
    'set_du_défenseur': {
        name: 'Set du Défenseur',
        pieces: ['marteau_forges', 'cuirasse_graoully'],
        bonus: {
            description: 'Augmente la force de 15, la défense de 10, et la résistance à la terre de 10.',
            stats: { strength: 15, defense: 10 },
            resistances: { terre: 10 }
        }
    },
    'set_de_l_ombre': {
        name: 'Set de l\'Ombre',
        pieces: ['dague_brume', 'casque_ombre'],
        bonus: {
            description: 'Augmente la vitesse de 5 et la chance de coup critique de 10%.',
            stats: { speed: 5 },
            passiveEffect: { critChance: 0.1 }
        }
    }
};
