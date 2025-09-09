// Fichier : js/modules/dungeonController.js

import { player } from "../core/state.js";
import { showNotification } from "../core/notifications.js";
import { initializeDungeonNarrator, advanceDungeonStage, getCurrentDungeonState, handleChoice } from "../core/dungeonNarrator.js";
import { puzzlesData } from "../core/gameData.js";
import { monstersData, bossesData } from "../data/monsters.js";

import { createDungeonData } from "../core/dungeonGenerator.js";
import { getSelectedDungeon } from "./map.js";
import { handleLogout } from "../core/authManager.js";

// Éléments du DOM
const dungeonNameElement = document.getElementById("dungeon-name");
const narrativeInterface = document.getElementById("dungeon-narrative-interface");
const narrativeTextElement = document.getElementById("narrative-text");
const actionButtonsContainer = document.getElementById("action-buttons");
const battleInterface = document.getElementById("battle-interface");

// Éléments du combat
const playerStatsElement = document.getElementById("player-stats");
const monsterStatsElement = document.getElementById("monster-stats");
const combatLogElement = document.getElementById("combat-log");
const playerHpBar = document.getElementById("player-hp-bar");
const monsterHpBar = document.getElementById("monster-hp-bar");

/**
 * Affiche la bonne interface (narration ou combat) en fonction de l'état du donjon.
 */
function updateInterface() {
  const state = getCurrentDungeonState();
  if (!state.dungeonData) {
    return;
  }

  // Afficher le nom du donjon
  dungeonNameElement.textContent = state.dungeonData.name;

  // Cacher les deux interfaces pour éviter les conflits
  narrativeInterface.style.display = 'none';
  battleInterface.style.display = 'none';

  // Logique pour déterminer quelle interface afficher
  if (state.activeEncounter) {
    switch (state.activeEncounter.type) {
      case "combat":
      case "boss_combat":
        showBattleInterface(state.activeEncounter.enemy);
        break;
      case "puzzle":
        showPuzzleInterface(state.activeEncounter.puzzle);
        break;
      case "choice":
        showChoiceInterface(state.activeEncounter.choices);
        break;
      case "trap":
      case "dialogue":
        showNarrativeInterface(state.activeEncounter.text);
        break;
      default:
        narrativeInterface.style.display = 'block';
        narrativeTextElement.textContent = state.activeEncounter.text || "Quelque chose s'est produit.";
    }
  } else {
    // Si pas de rencontre active, on est dans la phase narrative
    showNarrativeInterface();
  }
}

/**
 * Affiche l'interface narrative.
 * @param {string} text - Le texte narratif à afficher.
 * @param {string} buttonText - Le texte du bouton pour avancer.
 */
function showNarrativeInterface(text, buttonText = "Continuer") {
  narrativeInterface.style.display = 'block';
  narrativeTextElement.textContent = text;
  actionButtonsContainer.innerHTML = `<button id="continue-button">${buttonText}</button>`;
  document.getElementById("continue-button").addEventListener("click", () => {
    advanceDungeonStage();
    updateInterface();
  });
}

/**
 * Affiche l'interface de combat.
 * @param {object} enemy - L'objet ennemi à combattre.
 */
function showBattleInterface(enemy) {
  battleInterface.style.display = 'block';
  updateBattleUI(enemy);
  // Ici, vous devrez ajouter des écouteurs pour les boutons d'attaque, fuite, etc.
  // Une fois le combat terminé (victoire ou défaite), vous appelez `advanceDungeonStage()`
  // ou gérez la mort du joueur.
}

/**
 * Affiche l'interface d'énigme.
 * @param {object} puzzle - L'objet énigme.
 */
function showPuzzleInterface(puzzle) {
  narrativeInterface.style.display = 'block';
  narrativeTextElement.innerHTML = `<h3>Énigme :</h3><p>${puzzle.question}</p>`;
  actionButtonsContainer.innerHTML = '';
  
  puzzle.answers.forEach(answer => {
    const button = document.createElement("button");
    button.textContent = answer.text;
    button.addEventListener("click", () => {
      // Gérer la réponse à l'énigme
      handleChoice(answer.text);
      updateInterface();
    });
    actionButtonsContainer.appendChild(button);
  });
}

/**
 * Affiche l'interface de choix.
 * @param {Array<string>} choices - Les options de choix.
 */
function showChoiceInterface(choices) {
  narrativeInterface.style.display = 'block';
  narrativeTextElement.innerHTML = "<h3>Faites un choix :</h3>";
  actionButtonsContainer.innerHTML = '';
  
  choices.forEach(choice => {
    const button = document.createElement("button");
    button.textContent = choice;
    button.addEventListener("click", () => {
      handleChoice(choice);
      updateInterface();
    });
    actionButtonsContainer.appendChild(button);
  });
}

/**
 * Met à jour l'interface de combat (barres de vie, noms, etc.).
 * @param {object} enemy - L'objet ennemi.
 */
function updateBattleUI(enemy) {
  // Mettre à jour les stats du joueur
  document.getElementById("player-name").textContent = player.name;
  document.getElementById("player-hp").textContent = player.hp;
  document.getElementById("player-max-hp").textContent = player.maxHp;
  document.getElementById("player-mana").textContent = player.mana;
  document.getElementById("player-max-mana").textContent = player.maxMana;
  // Mettre à jour les barres de vie
  playerHpBar.style.width = `${(player.hp / player.maxHp) * 100}%`;
  
  // Mettre à jour les stats de l'ennemi
  document.getElementById("monster-name").textContent = enemy.name;
  document.getElementById("monster-hp").textContent = enemy.hp;
  document.getElementById("monster-max-hp").textContent = enemy.maxHp;
  monsterHpBar.style.width = `${(enemy.hp / enemy.maxHp) * 100}%`;
}


// --- Initialisation du contrôleur de donjon ---
document.addEventListener("DOMContentLoaded", () => {
  const selectedPoi = getSelectedDungeon(); // Récupère le POI sauvegardé de la session
  if (!selectedPoi) {
    // Si aucun donjon n'a été sélectionné (rechargement de page), on redirige
    window.location.href = 'world_map.html';
    return;
  }
  
  // Génère les données du donjon
  const dungeonData = createDungeonData(selectedPoi, player.level);
  if (!dungeonData) {
      window.location.href = 'world_map.html';
      return;
  }
  
  // Initialise le narrateur avec les données générées
  initializeDungeonNarrator(dungeonData);
  
  // Démarre la première étape narrative et met à jour l'interface
  updateInterface();
  
  // Gère le bouton de déconnexion
  document.getElementById('logout-link').addEventListener('click', handleLogout);
});