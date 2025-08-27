// Fichier : js/core/notifications.js
// Ce module gère l'affichage des notifications dans l'interface utilisateur.

const notificationContainer = document.createElement('div');
notificationContainer.id = 'notification-container';
document.body.appendChild(notificationContainer);

// Ajout d'un écouteur d'événement pour s'assurer que le DOM est prêt
document.addEventListener('DOMContentLoaded', function() {
    const boutonCreer = document.getElementById('creer');
    const popupOverlay = document.getElementById('popup-overlay');
    const boutonContinuer = document.getElementById('continuer');
    const boutonAnnuler = document.getElementById('annuler');

    // Vérifier si les éléments existent avant d'ajouter des écouteurs
    if (boutonCreer && popupOverlay) {
        boutonCreer.addEventListener('click', function(e) {
            // Empêcher la soumission du formulaire si le bouton est dans un formulaire
            e.preventDefault(); 
            popupOverlay.style.display = 'flex';
        });
    }

    if (boutonContinuer) {
        boutonContinuer.addEventListener('click', function() {
            window.location.href = 'stats.html';
        });
    }

    if (boutonAnnuler) {
        boutonAnnuler.addEventListener('click', function() {
            if (popupOverlay) {
                popupOverlay.style.display = 'none';
            }
        });
    }
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
