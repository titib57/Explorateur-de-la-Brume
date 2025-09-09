// Fichier : js/core/dungeonNarrator.js

/**
 * @fileoverview Ce module gère la génération de l'expérience narrative d'un donjon,
 * incluant les descriptions, les combats, les énigmes et les choix.
 */

import { player } from "../core/state.js"; // Pour les PV du joueur, etc.
import { showNotification } from "../core/notifications.js"; // Pour les retours visuels
import { monstersData, puzzlesData } from '../core/gameData.js'; // Assurez-vous d'avoir des `puzzlesData`
import { saveCharacterData } from "../core/authManager.js"; 

/**
 * Représente l'état actuel de l'exploration du donjon.
 * @type {object}
 */
let currentDungeonState = {
  currentStage: 0,
  maxStages: 0,
  dungeonData: null,
  activeEncounter: null, // Pour gérer le combat ou l'énigme en cours
};

/**
 * Initialise le narrateur de donjon avec les données du donjon généré.
 * @param {object} dungeonData - Les données du donjon générées par dungeonGenerator.js.
 */
export function initializeDungeonNarrator(dungeonData) {
  currentDungeonState.dungeonData = dungeonData;
  currentDungeonState.currentStage = 0;
  // Définir le nombre d'étapes basé sur la difficulté ou un nombre fixe.
  currentDungeonState.maxStages = dungeonData.isTutorial ? 3 : Math.floor(Math.random() * (dungeonData.difficulty + 2)) + 3; // 3 à 5 ou 6 étapes
  currentDungeonState.activeEncounter = null;
  console.log("Narrateur de donjon initialisé pour :", dungeonData.name);
  // On commence l'exploration
  advanceDungeonStage();
}

/**
 * Avance à l'étape suivante du donjon, générant un nouvel événement.
 */
export function advanceDungeonStage() {
  currentDungeonState.currentStage++;

  if (currentDungeonState.currentStage > currentDungeonState.maxStages) {
    // Si toutes les étapes normales sont terminées, passer au boss.
    startBossBattle();
    return;
  }

  const dungeon = currentDungeonState.dungeonData;
  const availableEvents = dungeon.typeData.events; // Utilisez dungeon.typeData pour accéder aux propriétés du type de donjon

  // Choisir un événement aléatoire parmi ceux disponibles pour ce type de donjon
  const eventType = availableEvents[Math.floor(Math.random() * availableEvents.length)];
  const storyText = dungeon.typeData.storyArcs[Math.floor(Math.random() * dungeon.typeData.storyArcs.length)];

  // Afficher la description de l'étape actuelle
  displayDungeonNarrative(storyText);

  // Gérer l'événement spécifique
  switch (eventType) {
    case "combat":
      startRandomCombat();
      break;
    case "puzzle":
      startRandomPuzzle(dungeon.typeData.puzzleDifficulty);
      break;
    case "choice":
      makeDecision(dungeon.typeData.choices || ["Continuer tout droit", "Prendre un chemin détourné"]);
      break;
    case "trap":
        triggerTrap();
        break;
    case "dialogue":
        startDialogue();
        break;
    default:
      console.warn("Type d'événement inconnu :", eventType);
      advanceDungeonStage(); // Avancer pour éviter de rester bloqué
  }
}

/**
 * Affiche le texte narratif de l'étape actuelle du donjon.
 * @param {string} text - Le texte narratif à afficher.
 * @param {Array<object>} [options] - Options d'action pour le joueur.
 */
function displayDungeonNarrative(text, options = []) {
  // Ceci est une fonction factice. Dans votre jeu réel, elle mettrait à jour l'UI.
  console.log("--- NOUVELLE ÉTAPE DU DONJON ---");
  console.log(text);
  if (options.length > 0) {
    console.log("Options disponibles :", options.map(opt => opt.text).join(" / "));
  } else {
    // Si pas d'options, on avance automatiquement (ex: après un combat)
    // Ou on affiche un bouton "Continuer"
    console.log("Cliquez sur 'Continuer' pour avancer.");
  }
  // Idéalement, ici, vous mettez à jour votre DOM pour afficher le texte et les boutons d'action.
}

/**
 * Démarre un combat aléatoire avec des monstres du pool du donjon.
 */
function startRandomCombat() {
  const dungeon = currentDungeonState.dungeonData;
  const monsterKey = dungeon.monsters[0].id; // Ou choisissez aléatoirement parmi le pool de monstres du donjon
  const enemy = { ...monstersData[monsterKey] }; // Crée une copie pour ne pas modifier l'original
  
  console.log(`Un ${enemy.name} attaque !`);
  showNotification(`Un ${enemy.name} vous barre la route !`, 'danger');
  currentDungeonState.activeEncounter = { type: "combat", enemy: enemy };
  // Ici, vous afficherez l'interface de combat. Une fois le combat terminé,
  // la fonction qui gère la fin du combat appellera `advanceDungeonStage()`.
  
  // Pour la démo, on simule un combat rapide
  setTimeout(() => {
    if (Math.random() > 0.3) { // 70% de chances de gagner
      showNotification(`Vous avez vaincu le ${enemy.name} !`, 'success');
      // Gagner de l'XP et de l'or (simplifié)
      player.xp += enemy.xpReward;
      player.gold += enemy.goldReward;
      console.log(`Vous gagnez ${enemy.xpReward} XP et ${enemy.goldReward} or.`);
      advanceDungeonStage();
    } else {
      showNotification(`Vous avez été vaincu par le ${enemy.name} !`, 'error');
      // Gérer la défaite (retour à la ville, perte d'objets, etc.)
      console.log("Le joueur est vaincu.");
      // Redirect to map or game over screen
    }
  }, 2000);
}

/**
 * Lance une énigme aléatoire.
 * @param {string} difficulty - La difficulté de l'énigme ('easy', 'medium', 'hard').
 */
function startRandomPuzzle(difficulty) {
  const availablePuzzles = puzzlesData.filter(p => p.difficulty === difficulty);
  if (availablePuzzles.length === 0) {
      console.warn("Pas d'énigmes disponibles pour la difficulté :", difficulty);
      advanceDungeonStage();
      return;
  }
  const puzzle = availablePuzzles[Math.floor(Math.random() * availablePuzzles.length)];
  console.log(`Énigme : ${puzzle.question}`);
  showNotification(`Une énigme se dresse devant vous !`, 'info');
  currentDungeonState.activeEncounter = { type: "puzzle", puzzle: puzzle };

  // Pour la démo, on simule la résolution
  setTimeout(() => {
    if (Math.random() > 0.5) { // 50% de chances de résoudre
      showNotification(`Vous avez résolu l'énigme !`, 'success');
      console.log("Vous résolvez l'énigme et continuez.");
      // Récompense ou déblocage
      advanceDungeonStage();
    } else {
      showNotification(`L'énigme vous a échappé. Vous perdez un peu de temps.`, 'warning');
      console.log("L'énigme n'est pas résolue.");
      // Pénalité (dégâts, perte de temps, autre combat)
      advanceDungeonStage(); // On continue quand même pour la démo
    }
  }, 3000);
}

/**
 * Présente un choix au joueur et gère les conséquences.
 * @param {Array<string>} choices - Les options de choix.
 */
function makeDecision(choices) {
  console.log("Faites un choix :", choices);
  showNotification("Un choix s'offre à vous...", 'info');
  currentDungeonState.activeEncounter = { type: "choice", choices: choices };
  // Ici, vous afficheriez les boutons de choix et un gestionnaire d'événements
  // qui, une fois le choix fait, appellerait `handleChoice(selectedOption)`.
  
  // Pour la démo, on choisit aléatoirement
  setTimeout(() => {
    const chosen = choices[Math.floor(Math.random() * choices.length)];
    console.log(`Vous avez choisi : "${chosen}".`);
    showNotification(`Vous avez choisi : "${chosen}".`, 'info');
    // Gérer les conséquences du choix (simplifié)
    if (chosen.includes("chemin détourné") || chosen.includes("nager")) {
      showNotification("Un événement imprévu se produit...", 'warning');
      // Peut-être un combat bonus ou un piège
      startRandomCombat(); // Ou triggerTrap()
    } else {
      showNotification("Vous continuez sans encombre.", 'success');
      advanceDungeonStage();
    }
  }, 2500);
}

/**
 * Déclenche un piège aléatoire.
 */
function triggerTrap() {
    console.log("Un piège se déclenche !");
    const damage = Math.floor(Math.random() * 10) + 5;
    player.hp -= damage;
    showNotification(`Vous marchez sur un piège et subissez ${damage} dégâts !`, 'danger');
    console.log(`PV restants : ${player.hp}`);
    if (player.hp <= 0) {
        showNotification("Vous avez succombé au piège !", 'error');
        // Gérer la mort
    } else {
        advanceDungeonStage();
    }
}

/**
 * Démarre un dialogue avec un PNJ.
 */
function startDialogue() {
    console.log("Vous rencontrez un personnage étrange...");
    const dialogues = [
        "Un vieil ermite vous dit : 'Le chemin est semé d'embûches, mais de grandes richesses attendent les braves.'",
        "Une fée lumineuse vous propose : 'Je peux soigner vos blessures, mais à quel prix ?'",
        "Un spectre vous murmure : 'Cherche le troisième œil de la bête...'."
    ];
    const dialogue = dialogues[Math.floor(Math.random() * dialogues.length)];
    showNotification(dialogue, 'info');
    currentDungeonState.activeEncounter = { type: "dialogue", text: dialogue };

    // Après un dialogue, on avance
    setTimeout(() => advanceDungeonStage(), 4000);
}

/**
 * Lance la bataille finale contre le boss du donjon.
 */
function startBossBattle() {
  const dungeon = currentDungeonState.dungeonData;
  const boss = dungeon.boss;
  
  console.log(`Le redoutable ${boss.name} apparaît !`);
  showNotification(`Le boss du donjon, ${boss.name}, vous défie !`, 'danger');
  currentDungeonState.activeEncounter = { type: "boss_combat", enemy: boss };
  // Afficher l'interface de combat de boss.

  // Pour la démo, on simule un combat de boss
  setTimeout(() => {
    if (Math.random() > 0.2) { // 80% de chances de gagner le boss
      showNotification(`Félicitations ! Vous avez vaincu le redoutable ${boss.name} !`, 'success');
      // Gagner les récompenses du donjon
      player.xp += boss.xpReward + dungeon.rewards.gold; // Exemple
      player.gold += dungeon.rewards.gold;
      console.log("Donjon terminé avec succès ! Récompenses :", dungeon.rewards);
      updateQuestProgress("clear_dungeon"); // Mettre à jour une quête si nécessaire
      // Rediriger vers la carte ou un écran de victoire
    } else {
      showNotification(`Le ${boss.name} vous a écrasé...`, 'error');
      // Gérer la défaite
      console.log("Le joueur est vaincu par le boss.");
    }
  }, 4000);
}

// Pourrait être utilisé pour gérer les choix du joueur (si vous avez des boutons d'UI)
export function handleChoice(optionText) {
  // Logique pour traiter l'option choisie par le joueur
  console.log(`Le joueur a choisi : ${optionText}`);
  // Puis avancer l'étape ou déclencher un autre événement
  advanceDungeonStage();
}

// Fonction pour récupérer l'état actuel du donjon (utile pour l'UI)
export function getCurrentDungeonState() {
    return currentDungeonState;
}