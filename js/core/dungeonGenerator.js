// Fichier : js/core/dungeonGenerator.js (Mise à jour)

import { dungeonTypes } from '../data/dungeons.js';
import { monstersData, bossesData } from '../data/monsters.js';
import { calculateDistance } from '../utils/geoUtils.js';

export function createDungeonData(poi, playerLevel) {
  const dungeonType = dungeonTypes[poi.dungeonType];

  if (!dungeonType) {
    console.error(`Type de donjon inconnu pour le POI : ${poi.dungeonType}`);
    return null;
  }

  const isTutorial = poi.isTutorial || false;
  const levelFactor = Math.max(0, playerLevel - 1);

  const monsterKey = dungeonType.monsterPool[Math.floor(Math.random() * dungeonType.monsterPool.length)];
  const bossKey = dungeonType.bossPool[Math.floor(Math.random() * dungeonType.bossPool.length)];
  
  const monsterBase = monstersData[monsterKey];
  const bossBase = bossesData[bossKey];

  const monsterToScale = isTutorial ? monstersData['mannequin_dentrainement'] : monsterBase;
  const bossToScale = isTutorial ? bossesData['mannequin_dentrainement'] : bossBase;

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
    type: dungeonType.name, // Utilise le nom du type de donjon
    description: dungeonType.description,
    monsters: [scaledMonster], // Le premier monstre générique pour l'étape
    boss: scaledBoss,
    isTutorial: isTutorial,
    rewards: dungeonType.rewards,
    
    // NOUVEAU : Inclure toutes les propriétés narratives du type de donjon
    typeData: dungeonType, // Garder une référence au type de donjon complet pour les propriétés narratives
  };
}