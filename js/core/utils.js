// Fichier : js/core/utils.js

import { showNotification } from './notifications.js';
import { loadCharacter } from './state.js';

export function checkCharacter() {
    if (!localStorage.getItem('playerCharacter')) {
        showNotification("Vous devez d'abord créer un personnage.", 'error');
        setTimeout(() => {
            window.location.href = 'character_creation.html';
        }, 1500);
        return false;
    }
    return true;
}

export function addToCombatLog(message, className) {
    const combatLog = document.getElementById('combat-log');
    if (combatLog) {
        const entry = document.createElement('p');
        entry.textContent = message;
        entry.classList.add(className);
        combatLog.appendChild(entry);
        combatLog.scrollTop = combatLog.scrollHeight; // Scroll vers le bas
    }
}