/**
 * @fileoverview Fichier de données statiques pour les types de donjons.
 * Ces données sont utilisées par le générateur de donjons pour créer des instances
 * basées sur les Points d'Intérêt (POI) du monde.
 */

export const dungeonTypes = {
  // Type de donjon pour les POI historiques comme les châteaux.
  ancient_ruins: {
    name: "Anciennes Ruines",
    description: "Les vestiges d'une civilisation perdue. Attention aux pièges et aux gardiens oubliés.",
    difficulty: 3,
    monsterPool: ["skeleton", "ghost", "golem"],
    bossPool: ["ancient_guardian"],
    rewards: {
      gold: 500,
      items: ["ancient_relic", "rare_scroll"],
    },
  },

  // Type de donjon pour les POI naturels comme les sources ou les grottes.
  underground_cave: {
    name: "Caverne Souterraine",
    description: "Un réseau de grottes sombres, habitées par des créatures des profondeurs.",
    difficulty: 2,
    monsterPool: ["goblin", "bat", "giant_spider"],
    bossPool: ["cave_troll"],
    rewards: {
      gold: 250,
      items: ["raw_gem", "poison_vial"],
    },
  },

  // Type de donjon pour les POI liés à la nature ou à la magie.
  sacred_grove: {
    name: "Bois Sacré",
    description: "Un bosquet enchanteur, mais il est protégé par des esprits de la forêt.",
    difficulty: 4,
    monsterPool: ["dryad", "treant", "fae"],
    bossPool: ["forest_spirit"],
    rewards: {
      gold: 750,
      items: ["enchanted_wood", "magical_herb"],
    },
  },

  // Donjon par défaut si aucun type ne correspond.
  default: {
    name: "Donjon Oublié",
    description: "Un donjon générique, mystérieux et dangereux.",
    difficulty: 1,
    monsterPool: ["slime", "rat", "giant_worm"],
    bossPool: ["giant_rat"],
    rewards: {
      gold: 100,
      items: ["common_potion", "iron_sword"],
    },
  },
};

/**
 * @deprecated Cette structure est remplacée par la logique de `poi-manager.js`
 * qui génère dynamiquement les POI à partir des données OSM.
 * Maintenue ici à titre d'exemple ou de compatibilité si nécessaire.
 */
export const pointsOfInterest = {
  // Cette section est obsolète si vous utilisez poi-manager.js
  // La logique de génération des POI se trouve maintenant dans ce fichier.
  // Vous n'avez pas besoin de remplir cet objet manuellement.
};