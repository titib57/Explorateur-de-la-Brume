// Fichier : main.js
// Ce fichier agit comme le point d'entrée de l'application.

import { player, loadCharacter, createCharacter, updateStats, updateStatsDisplay } from './core/state.js';
import { updatePlayerProfileUI, updateBattleUI, updateWorldMapUI, updateStatsUI, showCharacterCreationScreen } from './modules/ui.js';
import { showNotification } from './notifications.js';

// Attendre que le DOM soit complètement chargé avant d'initialiser l'application
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM chargé, initialisation de l'application...");
    
    // Tenter de charger les données du personnage depuis le localStorage
    const savedPlayer = loadCharacter();

    if (savedPlayer) {
        // Si un personnage est trouvé, initialiser le joueur avec ces données
        console.log("Personnage chargé depuis le localStorage.");
        updateStats(player); // Recalculer les stats après le chargement
        showNotification(`Bienvenue, ${player.name} !`, 'success');
        updatePlayerProfileUI(); // Mettre à jour l'UI du profil
    } else {
        // Si aucun personnage n'est trouvé, afficher l'écran de création de personnage
        console.log("Aucun personnage trouvé. Affichage de l'écran de création.");
        showCharacterCreationScreen();
    }

    // Gérer les événements de navigation pour afficher les bonnes interfaces
    setupNavigation();
});

/**
 * Affiche l'écran de création de personnage et gère la logique de création.
 */
function setupCharacterCreation() {
    const creationForm = document.getElementById('creation-form');
    if (creationForm) {
        creationForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const name = document.getElementById('char-name').value;
            const playerClass = document.getElementById('char-class').value;
            const age = document.getElementById('char-age').value;
            const height = document.getElementById('char-height').value;
            const weight = document.getElementById('char-weight').value;
            
            if (name && playerClass && age && height && weight) {
                createCharacter(name, playerClass, age, height, weight);
                showNotification(`Personnage ${name} créé !`, 'success');
                // Rediriger vers la page du profil ou la carte du monde
                window.location.href = 'world_map.html'; 
            } else {
                showNotification("Veuillez remplir tous les champs.", 'error');
            }
        });
    }
}

/**
 * Configure la navigation entre les différentes sections de l'application.
 */
function setupNavigation() {
    document.querySelectorAll('.app-nav-link').forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault(); // Empêche le rechargement de la page
            const targetId = link.getAttribute('data-target');
            
            // Cacher toutes les sections
            document.querySelectorAll('.app-section').forEach(section => section.style.display = 'none');

            // Afficher la section cible et mettre à jour son UI si nécessaire
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.style.display = 'block';
                
                // Mettre à jour l'UI en fonction de la section
                switch(targetId) {
                    case 'player-profile-section':
                        updatePlayerProfileUI();
                        updateStatsDisplay();
                        break;
                    case 'dungeon-map-section':
                        updateWorldMapUI();
                        break;
                    case 'battle-interface':
                        // Logique pour une future bataille
                        break;
                    case 'stats-section':
                        // Pour le moment, l'updateStatsUI prend des paramètres
                        // Il faudrait adapter si c'est la page principale des stats
                        // ou modifier la fonction pour qu'elle utilise l'objet player global
                        // comme le fait updatePlayerProfileUI().
                        break;
                }
            }
        });
    });
}
