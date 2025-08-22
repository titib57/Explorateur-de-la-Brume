import { pointsOfInterest, monstersData, dungeonTypes, bossesData } from './gameData.js';
import { showNotification, currentDungeon } from './state.js';

/**
 * Calcule la distance entre deux points géographiques (formule simplifiée).
 */
function calculateDistance(loc1, loc2) {
    const dx = loc1.x - loc2.x;
    const dy = loc1.y - loc2.y;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Génère un donjon dynamique en fonction du lieu réel le plus proche.
 * @param {object} playerLocation La position actuelle du joueur { x, y }.
 */
export function generateDungeon(playerLocation) {
    let closestPOI = null;
    let minDistance = Infinity;

    // Trouver le point d'intérêt le plus proche
    for (const poiId in pointsOfInterest) {
        const poi = pointsOfInterest[poiId];
        const distance = calculateDistance(playerLocation, poi.location);
        if (distance < minDistance) {
            minDistance = distance;
            closestPOI = poi;
        }
    }

    if (!closestPOI) {
        showNotification("Aucun lieu remarquable à proximité !", 'error');
        return false;
    }

    const dungeonType = dungeonTypes[closestPOI.dungeonType];
    
    // Sélectionne un monstre au hasard du pool de monstres du lieu
    const randomMonsterId = closestPOI.monsterPool[Math.floor(Math.random() * closestPOI.monsterPool.length)];
    const monsterData = monstersData[randomMonsterId];
    
    // Crée un objet donjon plus détaillé
    const newDungeon = {
        name: `Le donjon de ${closestPOI.name}`,
        location: closestPOI.location,
        difficulty: closestPOI.difficulty,
        type: closestPOI.dungeonType,
        description: dungeonType.description,
        monsters: [{
            name: monsterData.name,
            hp: monsterData.hp,
            damage: monsterData.damage
        }],
        boss: {
            name: bossesData[dungeonType.boss].name,
            hp: bossesData[dungeonType.boss].hp,
            damage: bossesData[dungeonType.boss].damage
        },
        rewards: dungeonType.rewards
    };

    localStorage.setItem('currentDungeon', JSON.stringify(newDungeon));
    showNotification(`Vous entrez dans ${newDungeon.name}! ${newDungeon.description}`, 'info');

    // Mettre à jour l'état du donjon actuel
    currentDungeon = newDungeon; 
    
    return true;
}