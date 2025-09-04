// js/module/waveManager.js

import { getShelterLocation } from './shelterManager.js';
import { monstersData, bossesData } from '../core/gameDataData.js';

let currentWave = 0;
const waveInterval = 600000; // 10 minutes en millisecondes

/**
 * Lance le minuteur pour démarrer la prochaine vague de monstres.
 */
export function startNextWaveTimer() {
    setTimeout(async () => {
        currentWave++;
        console.log(`Vague de monstres n°${currentWave} en approche !`);
        await spawnWave(currentWave);
        startNextWaveTimer();
    }, waveInterval);
}

/**
 * Gère l'apparition des ennemis pour une vague donnée.
 * @param {number} waveNumber - Le numéro de la vague actuelle.
 */
async function spawnWave(waveNumber) {
    const shelterLocation = await getShelterLocation();
    if (!shelterLocation) {
        console.warn("L'abri n'a pas été trouvé. La vague de monstres est annulée.");
        return;
    }

    const enemies = generateEnemiesForWave(waveNumber);

    for (const enemy of enemies) {
        console.log(`Un ${enemy.name} se dirige vers votre abri !`);
        // Logique de mouvement et de combat à ajouter ici
    }
}

/**
 * Crée une liste d'ennemis pour une vague spécifique, avec des stats ajustées.
 * @param {number} waveNumber - Le numéro de la vague.
 * @returns {Array} Une liste d'objets représentant les ennemis de la vague.
 */
function generateEnemiesForWave(waveNumber) {
    const enemies = [];
    const bossWaveInterval = 5; // Un boss toutes les 5 vagues

    // Vague de boss
    if (waveNumber > 0 && waveNumber % bossWaveInterval === 0) {
        const bossName = 'chef_des_gobelins'; // Nom de l'ID du boss dans vos données
        const bossBaseData = bossesData[bossName];
        
        if (bossBaseData) {
            const multiplier = 1 + (waveNumber / bossWaveInterval - 1) * 0.5;
            enemies.push({
                ...bossBaseData,
                hp: Math.round(bossBaseData.hp * multiplier),
                attack: Math.round(bossBaseData.attack * multiplier),
            });
        }
    } else {
        // Vague de monstres normaux
        const monsterKeys = Object.keys(monstersData);
        // Exclure le mannequin d'entraînement des vagues normales
        const availableMonsters = monsterKeys.filter(key => !monstersData[key].isTutorial);
        const baseEnemyCount = waveNumber * 2;

        for (let i = 0; i < baseEnemyCount; i++) {
            const randomKey = availableMonsters[Math.floor(Math.random() * availableMonsters.length)];
            const monsterBaseData = monstersData[randomKey];

            if (monsterBaseData) {
                const multiplier = 1 + (waveNumber - 1) * 0.2;
                enemies.push({
                    ...monsterBaseData,
                    hp: Math.round(monsterBaseData.hp * multiplier),
                    attack: Math.round(monsterBaseData.attack * multiplier),
                });
            }
        }
    }
    return enemies;
}