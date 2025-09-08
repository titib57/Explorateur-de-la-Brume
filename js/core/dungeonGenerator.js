// Fichier : js/core/dungeonGenerator.js
// Ce module gère la logique de création des données d'un donjon.

import { dungeonTypes, monstersData, bossesData } from './dungeons.js';
import { calculateDistance } from '../utils/geoUtils.js';

/**
 * Crée un objet de données de donjon avec des statistiques mises à l'échelle en fonction du niveau du joueur.
 * @param {object} poi - Le point d'intérêt.
 * @param {object} dungeonType - Le type de donjon.
 * @param {number} playerLevel - Le niveau du joueur.
 * @returns {object} Un objet de données de donjon prêt à être sauvegardé.
 */
export function createDungeonData(poi, dungeonType, playerLevel) {
    const isTutorial = poi.isTutorial;
    const levelFactor = Math.max(0, playerLevel - 1);

    const monsterBase = monstersData[dungeonType.monsterPool[Math.floor(Math.random() * dungeonType.monsterPool.length)]];
    const bossBase = bossesData[dungeonType.bossPool[Math.floor(Math.random() * dungeonType.bossPool.length)]];

    // Les monstres de tutoriel n'ont pas d'échelle
    const monsterToScale = isTutorial ? monstersData['mannequin_dentrainement'] : monsterBase;
    const bossToScale = isTutorial ? bossesData['mannequin_dentrainement'] : bossBase;

    // Fonction utilitaire pour la mise à l'échelle des entités
    const scaleEntity = (entity) => ({
        ...entity,
        hp: entity.hp + (levelFactor * (isTutorial ? 0 : 5)),
        attack: entity.attack + (levelFactor * (isTutorial ? 0 : 2)),
        defense: entity.defense + (levelFactor * (isTutorial ? 0 : 1)),
        xpReward: entity.xpReward + (levelFactor * (isTutorial ? 0 : 10)),
        goldReward: entity.goldReward + (levelFactor * (isTutorial ? 0 : 5))
    });

    const scaledMonster = scaleEntity(monsterToScale);
    const scaledBoss = scaleEntity(bossToScale);
    
    return {
        id: poi.id,
        name: isTutorial ? poi.name : `Le donjon de ${poi.name}`,
        location: poi.location,
        difficulty: poi.difficulty,
        type: poi.dungeonType,
        description: dungeonType.description,
        monsters: [scaledMonster],
        boss: scaledBoss,
        isTutorial: isTutorial,
        rewards: dungeonType.rewards
    };
}