// Fichier : js/Utils.js
// Fournit des fonctions utilitaires générales pour le jeu.

import { showNotification } from '../core/notifications.js';
import { player } from '../core/state.js';

/**
 * Vérifie si un personnage de joueur existe dans l'état du jeu.
 * Si ce n'est pas le cas, affiche une notification et redirige l'utilisateur.
 * @returns {boolean} Vrai si un personnage existe, faux sinon.
 */
export function checkCharacter() {
    if (!player) {
        showNotification("Vous devez d'abord créer un personnage.", 'error');
        setTimeout(() => {
            window.location.href = 'character.html';
        }, 1500);
        return false;
    }
    return true;
}

/**
 * Ajoute un message au journal de combat sur l'interface utilisateur.
 * @param {string} message Le message à ajouter.
 * @param {string} className La classe CSS à appliquer au message.
 */
export function addToCombatLog(message, className) {
    const combatLog = document.getElementById('combat-log');
    if (combatLog) {
        const entry = document.createElement('p');
        entry.textContent = message;
        entry.classList.add(className);
        combatLog.appendChild(entry);
        combatLog.scrollTop = combatLog.scrollHeight;
    }
}