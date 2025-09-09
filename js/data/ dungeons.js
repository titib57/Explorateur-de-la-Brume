// Fichier : js/data/dungeon.js (Mise à jour)

export const dungeonTypes = {
  ancient_ruins: {
    name: "Anciennes Ruines",
    description: "Les vestiges d'une civilisation perdue. Attention aux pièges et aux gardiens oubliés.",
    difficulty: 3,
    monsterPool: ["skeleton", "ghost", "golem"],
    bossPool: ["ancient_guardian"],
    rewards: { gold: 500, items: ["ancient_relic", "rare_scroll"] },
    
    // NOUVELLES PROPRIÉTÉS POUR LA NARRATION
    storyArcs: [
      "Vous vous aventurez dans les ruines, sentant une présence oubliée...",
      "Un vieux mécanisme rouillé bloque votre chemin. Faut-il l'activer ?",
      "Des murmures résonnent dans les couloirs, vous invitant à explorer une pièce sombre."
    ],
    events: ["combat", "puzzle", "choice", "trap"], // Types d'événements possibles
    puzzleDifficulty: "medium",
  },

  underground_cave: {
    name: "Caverne Souterraine",
    description: "Un réseau de grottes sombres, habitées par des créatures des profondeurs.",
    difficulty: 2,
    monsterPool: ["goblin", "bat", "giant_spider"],
    bossPool: ["cave_troll"],
    rewards: { gold: 250, items: ["raw_gem", "poison_vial"] },
    
    // NOUVELLES PROPRIÉTÉS POUR LA NARRATION
    storyArcs: [
      "L'air devient lourd et humide à mesure que vous descendez dans la caverne...",
      "Des traces de griffes géantes ornent les parois. Quelque chose de grand vit ici.",
      "Un lac souterrain s'étend devant vous. Le traverser à la nage ou chercher un passage ?"
    ],
    events: ["combat", "choice", "dialogue"], 
    puzzleDifficulty: "easy",
  },

  sacred_grove: {
    name: "Bois Sacré",
    description: "Un bosquet enchanteur, mais il est protégé par des esprits de la forêt.",
    difficulty: 4,
    monsterPool: ["dryad", "treant", "fae"],
    bossPool: ["forest_spirit"],
    rewards: { gold: 750, items: ["enchanted_wood", "magical_herb"] },
    
    // NOUVELLES PROPRIÉTÉS POUR LA NARRATION
    storyArcs: [
      "La lumière du soleil peine à traverser la canopée, créant une ambiance mystique...",
      "Des fleurs aux couleurs éclatantes attirent votre regard, mais sont-elles sans danger ?",
      "Une mélodie envoûtante flotte dans l'air, vous appelant plus profondément dans le bosquet."
    ],
    events: ["combat", "puzzle", "dialogue", "choice"],
    puzzleDifficulty: "hard",
  },

  default: {
    name: "Donjon Oublié",
    description: "Un donjon générique, mystérieux et dangereux.",
    difficulty: 1,
    monsterPool: ["slime", "rat", "giant_worm"],
    bossPool: ["giant_rat"],
    rewards: { gold: 100, items: ["common_potion", "iron_sword"] },
    
    // NOUVELLES PROPRIÉTÉS POUR LA NARRATION
    storyArcs: [
      "Vous entrez dans un ancien passage, la poussière s'envole à chacun de vos pas...",
      "Des bruits étranges se font entendre au loin, mieux vaut rester sur ses gardes."
    ],
    events: ["combat", "choice"],
    puzzleDifficulty: "easy",
  },
};

export const pointsOfInterest = {}; // Reste vide, car géré par poi-manager.js