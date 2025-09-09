// Fichier : js/core/dungeonGenerator.js

/**
 * @fileoverview Ce module gère la création de données d'un donjon.
 * Les propriétés du donjon sont mises à l'échelle en fonction du niveau du joueur.
 */

import { dungeonTypes } from '../data/dungeon.js';
import { monstersData, bossesData } from './gameData.js';
import { calculateDistance } from '../utils/geoUtils.js';

/**
 * Crée un objet de données de donjon basé sur un POI et le niveau du joueur.
 * @param {object} poi - Le point d'intérêt généré par poi-manager.js.
 * @param {number} playerLevel - Le niveau du joueur.
 * @returns {object|null} Un objet de données de donjon, ou null si le type de donjon n'existe pas.
 */
export function createDungeonData(poi, playerLevel) {
  // Utilisation de la propriété `dungeonType` du POI pour trouver le bon modèle de donjon.
  const dungeonType = dungeonTypes[poi.dungeonType];

  if (!dungeonType) {
    console.error(`Type de donjon inconnu pour le POI : ${poi.dungeonType}`);
    return null;
  }

  const isTutorial = poi.isTutorial || false;
  const levelFactor = Math.max(0, playerLevel - 1);

  // Sélection des monstres et du boss en fonction du donjon.
  const monsterKey = dungeonType.monsterPool[Math.floor(Math.random() * dungeonType.monsterPool.length)];
  const bossKey = dungeonType.bossPool[Math.floor(Math.random() * dungeonType.bossPool.length)];
  
  const monsterBase = monstersData[monsterKey];
  const bossBase = bossesData[bossKey];

  // Cas spécial pour les donjons tutoriels.
  const monsterToScale = isTutorial ? monstersData['mannequin_dentrainement'] : monsterBase;
  const bossToScale = isTutorial ? bossesData['mannequin_dentrainement'] : bossBase;

  // Fonction utilitaire pour la mise à l'échelle des entités.
  const scaleEntity = (entity) => ({
    ...entity,
    hp: entity.hp + (levelFactor * (isTutorial ? 0 : 5)),
    attack: entity.attack + (levelFactor * (isTutorial ? 0 : 2)),
    defense: entity.defense + (levelFactor * (isTutorial ? 0 : 1)),
    xpReward: entity.xpReward + (levelFactor * (isTutorial ? 0 : 10)),
    goldReward: entity.goldReward + (levelFactor * (isTutorial ? 0 : 5)),
  });

  const scaledMonster = scaleEntity(monsterToScale);
  const scaledBoss = scaleEntity(bossToScale);

  return {
    id: poi.id,
    name: isTutorial ? poi.name : `Donjon de ${poi.name}`,
    location: poi.location,
    difficulty: dungeonType.difficulty,
    type: dungeonType.type,
    description: dungeonType.description,
    monsters: [scaledMonster],
    boss: scaledBoss,
    isTutorial: isTutorial,
    rewards: dungeonType.rewards,
  };
}