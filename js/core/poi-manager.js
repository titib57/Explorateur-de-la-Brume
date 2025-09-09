// Fichier : js/core/poi-manager.js

/**
 * @fileoverview Ce module gère la création dynamique de Points d'Intérêt (POI)
 * à partir de données OpenStreetMap (OSM) et leur manipulation.
 */

/**
 * Modèles de POI. Chaque clé correspond à un type de lieu dans le jeu
 * et peut être associée à des tags OSM pour la génération.
 * @type {object}
 */
export const poiTemplates = {
  // Modèle pour les châteaux (associé à `historic=castle` dans OSM)
  castle: {
    name: "Château en ruines",
    description: "Une ancienne forteresse qui cache sans doute de lourds secrets.",
    type: "historic",
    dungeonType: "ancient_ruins", // Type de donjon associé
  },

  // Modèle pour les tavernes (associé à `amenity=pub` ou `amenity=bar`)
  tavern: {
    name: "Taverne",
    description: "Un lieu de repos et d'échange, idéal pour les rumeurs.",
    type: "amenity",
    dungeonType: "underground_cave", // Type de donjon souterrain associé
  },

  // Modèle pour les sources naturelles (associé à `natural=spring`)
  spring: {
    name: "Source mystérieuse",
    description: "Une source d'eau aux propriétés revigorantes.",
    type: "natural",
    dungeonType: "sacred_grove", // Type de donjon associé à la nature
  },
};

/**
 * Crée un POI pour le jeu à partir d'un objet de données brutes d'OSM.
 * Associe les tags OSM à un modèle de jeu prédéfini.
 * @param {object} osmData - Les données brutes d'un nœud ou d'un chemin d'OSM.
 * @returns {object|null} Un objet POI formaté pour le jeu, ou null si aucun modèle ne correspond.
 */
export function createPoiFromOsm(osmData) {
  const { tags, id, lat, lon } = osmData;
  let template = null;
  let name = tags.name || null;

  // On détermine le modèle à utiliser en fonction des tags OSM.
  if (tags.historic === 'castle') {
    template = poiTemplates.castle;
  } else if (tags.amenity === 'pub' || tags.amenity === 'bar') {
    template = poiTemplates.tavern;
  } else if (tags.natural === 'spring') {
    template = poiTemplates.spring;
  }

  if (!template) {
    return null; // Aucun modèle correspondant, on ignore ce POI.
  }

  // Si le nom n'est pas fourni par OSM, on utilise celui du modèle.
  if (!name) {
    name = template.name;
  }

  // Construction de l'objet POI final.
  return {
    id: id,
    name: name,
    description: template.description,
    type: template.type,
    dungeonType: template.dungeonType,
    location: { lat: lat, lon: lon },
  };
}

/**
 * Fonctions utilitaires pour manipuler une liste de POI.
 */
export const poiUtils = {
  /**
   * Trouve un POI par son identifiant.
   * @param {Array<object>} poiList - La liste de POI.
   * @param {number} id - L'identifiant du POI.
   * @returns {object|undefined} Le POI trouvé ou undefined.
   */
  findById: (poiList, id) => poiList.find(poi => poi.id === id),

  /**
   * Met à jour un POI dans la liste.
   * @param {Array<object>} poiList - La liste de POI.
   * @param {object} updatedPoi - Le POI mis à jour.
   */
  update: (poiList, updatedPoi) => {
    const index = poiList.findIndex(poi => poi.id === updatedPoi.id);
    if (index !== -1) {
      poiList[index] = { ...poiList[index], ...updatedPoi };
    }
  },

  /**
   * Supprime un POI de la liste.
   * @param {Array<object>} poiList - La liste de POI.
   * @param {number} id - L'identifiant du POI à supprimer.
   * @returns {Array<object>} La nouvelle liste sans le POI.
   */
  delete: (poiList, id) => poiList.filter(poi => poi.id !== id),
};