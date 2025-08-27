// Fichier : js/modules/character.js
// Ce module gère la logique d'interaction avec l'état du personnage.
// La gestion de l'état elle-même est centralisée dans le module core/state.js.

import { savePlayer, player } from '../core/state.js';


/**
 * Donne une quantité spécifiée de points d'expérience au joueur.
 * @param {number} amount La quantité d'XP à donner.
 */
export function giveXP(amount) {
    if (!player) return; // Assurez-vous que le joueur existe.
    player.addXp(amount);
    savePlayer(player);
}

/**
 * Initialise le personnage avec la quête de départ.
 */
export function initializeCharacter(player) {
    if (player) {
        // Initialise la quête de départ si le joueur n'en a pas déjà une
        if (!player.quests || !player.quests.current) {
            player.quests = {
                current: 'lieu_sur',
            };
            savePlayer(player);
        }
    }
}
