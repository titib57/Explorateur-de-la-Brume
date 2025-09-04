// js/module/waveManager.js

import { getShelterLocation } from './shelterManager.js';
import { monstersData, bossesData } from '../core/gameDataData.js';

let currentWave = 0;
const waveInterval = 600000; // 10 minutes en millisecondes

/**
 * Lance la prochaine vague de monstres après un certain délai.
 */
export function startNextWaveTimer() {
    setTimeout(async () => {
        currentWave++;
        console.log(`Vague de monstres n°${currentWave} en approche !`);
        await spawnWave(currentWave);
        startNextWaveTimer(); // Relance le minuteur pour la prochaine vague
    }, waveInterval);
}

/**
 * Gère l'apparition et l'attaque d'une vague de monstres.
 * @param {number} waveNumber - Le numéro de la vague.
 */
async function spawnWave(waveNumber) {
    const shelterLocation = await getShelterLocation();
    if (!shelterLocation) {
        console.warn("L'abri n'a pas été trouvé, la vague de monstres est annulée.");
        return;
    }

    // Définir la composition de la vague en fonction du niveau
    const enemies = generateEnemiesForWave(waveNumber);

    // Démarrer l'attaque
    for (const enemy of enemies) {
        // Logique pour que l'ennemi se déplace vers l'abri
        console.log(`Un ${enemy.name} se dirige vers votre abri !`);
        // Simuler le combat (cela serait géré dans votre logique de jeu)
        // const shelterStats = await getShelterStats(); // Supposons cette fonction
        // if (enemy.attack > shelterStats.defense) {
        //     damageShelter(enemy.attack - shelterStats.defense);
        // }
    }
}

/**
 * Génère une liste de monstres pour la vague donnée.
 * @param {number} waveNumber - Le numéro de la vague.
 * @returns {Array} Une liste d'objets de monstres.
 */
function generateEnemiesForWave(waveNumber) {
    // Exemple : Plus la vague est haute, plus les monstres sont forts et nombreux
    const enemies = [];
    const baseEnemyCount = waveNumber * 2;
    for (let i = 0; i < baseEnemyCount; i++) {
        // Créer des monstres plus forts pour les vagues plus élevées
        enemies.push(getEnemyData('Goblin', waveNumber)); // Exemple de récupération de données de monstres
    }
    return enemies;
}