// Fichier : js/core/notifications.js
// Ce module gère l'affichage des notifications dans l'interface utilisateur.

const notificationContainer = document.createElement('div');
notificationContainer.id = 'notification-container';
document.body.appendChild(notificationContainer);

document.addEventListener('DOMContentLoaded', function() {
    const boutonCreer = document.getElementById('creer');
    const popupOverlay = document.getElementById('popup-overlay');
    const boutonContinuer = document.getElementById('continuer');
    const boutonAnnuler = document.getElementById('annuler');

    boutonCreer.addEventListener('click', function() {
        popupOverlay.style.display = 'flex';
    });

    boutonContinuer.addEventListener('click', function() {
        window.location.href = 'stats.html';
    });

    boutonAnnuler.addEventListener('click', function() {
        popupOverlay.style.display = 'none';
    });
});

/**
 * Affiche une notification temporaire à l'écran.
 * @param {string} message Le message à afficher.
 * @param {string} type Le type de notification ('success', 'error', 'info').
 */
export function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.classList.add('notification', type);
    notification.textContent = message;
    notificationContainer.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}
