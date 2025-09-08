// Fichier : js/pages/world_map.js
// Ce fichier est l'orchestrateur de la page world_map.html.

import { startAuthListener, handleSignOut, saveCharacterData } from '../core/authManager.js';
import { updateUIBasedOnPage, handleMapUIEvents } from '../modules/ui.js';
import { initMap } from '../modules/map.js';
import { player } from '../core/state.js';
import { updateQuestProgress } from '../core/gameEngine.js';
import { showNotification } from '../core/notifications.js';

// Fonction d'initialisation de la page
document.addEventListener('DOMContentLoaded', () => {
    // Écouteur pour la déconnexion
    const logoutLink = document.getElementById('logout-link');
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            handleSignOut();
        });
    }
    
    // Attendre que l'objet player soit chargé pour initialiser la carte.
    // La fonction startAuthListener de authManager.js se charge de la synchronisation
    // et appelle updateUIBasedOnPage, qui à son tour appellera initMap
    // une fois que les données sont disponibles.
    startAuthListener();
    handleMapUIEvents();
});

// Gère le bouton "Définir le lieu sûr" de l'interface
export async function handleSetSafePlace() {
    if (!player) {
        showNotification("Impossible de définir le lieu, personnage non chargé.", "error");
        return;
    }
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const safePlaceLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                player.safePlaceLocation = safePlaceLocation;
                try {
                    await saveCharacterData(player);
                    await updateQuestProgress('define_shelter', safePlaceLocation);
                    showNotification("Abri de survie défini et sauvegardé ! La quête est mise à jour.", "success");
                    updateUIBasedOnPage(player); // Met à jour l'UI pour cacher le bouton
                } catch (error) {
                    console.error("Erreur lors de la sauvegarde du lieu sûr:", error);
                    showNotification("Erreur lors de la sauvegarde du lieu sûr.", "error");
                }
            },
            (error) => {
                console.error("Erreur de géolocalisation:", error);
                showNotification("Impossible d'obtenir votre position pour définir le lieu sûr.", "error");
            }
        );
    } else {
        showNotification("La géolocalisation n'est pas supportée par votre navigateur.", "error");
    }
}