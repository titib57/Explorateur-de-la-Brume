// Fichier : js/utils/geoUtils.js
// Ce module contient des fonctions utilitaires pour la géolocalisation.

/**
 * Calcule la distance entre deux points géographiques en utilisant la formule de Haversine simplifiée.
 * @param {object} loc1 Le premier emplacement { lat, lng }.
 * @param {object} loc2 Le deuxième emplacement { lat, lng }.
 * @returns {number} La distance entre les deux points en mètres.
 */
export function calculateDistance(loc1, loc2) {
    const R = 6371e3; // Rayon de la Terre en mètres
    const toRad = (deg) => deg * Math.PI / 180;

    const lat1 = toRad(loc1.lat);
    const lat2 = toRad(loc2.lat);
    const deltaLat = toRad(loc2.lat - loc1.lat);
    const deltaLon = toRad(loc2.lng - loc1.lng);

    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance en mètres
}