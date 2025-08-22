// Fichier : js/core/notifications.js

const notificationContainer = document.createElement('div');
notificationContainer.id = 'notification-container';
document.body.appendChild(notificationContainer);

export function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.classList.add('notification', type);
    notification.textContent = message;
    notificationContainer.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}