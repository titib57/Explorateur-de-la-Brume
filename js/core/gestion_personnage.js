// Fichier : js/gestion_personnage.js
// Ce script agit comme le point d'entrée pour la page de gestion du personnage.

import { startAuthListener, deleteCharacter, handleSignOut } from './core/authManager.js';
import { player } from './core/state.js';
import { updateUIBasedOnPage, renderCharacter, renderQuestsPage } from './modules/ui.js';
import { updateStatsDisplay, updateInventoryDisplay, updateEquipmentDisplay } from './game/display.js';

/**
 * Récupère un élément du DOM par son ID.
 * @param {string} id L'ID de l'élément.
 * @returns {HTMLElement} L'élément du DOM.
 */
const getElement = id => document.getElementById(id);
const playBtn = getElement('play-btn');
const deleteBtn = getElement('delete-btn');
const logoutLink = getElement('logout-link');

/**
 * Gère le clic sur le bouton "Jouer".
 * Redirige le joueur vers la carte du monde si un personnage est chargé.
 */
function handlePlayClick() {
    if (player && player.name) {
        window.location.href = "world_map.html";
    } else {
        console.error("Impossible de démarrer, le personnage n'est pas chargé.");
    }
}

/**
 * Gère le clic sur les liens de navigation de la page de gestion.
 * Affiche la section correspondante et met à jour son contenu.
 * @param {Event} e L'événement de clic.
 */
function handleSectionNav(e) {
    e.preventDefault();
    const navItem = e.target.closest('.nav-item');
    if (!navItem) return;

    const targetId = navItem.getAttribute('href').substring(1);
    const sections = document.querySelectorAll('#main-content section');
    const navItems = document.querySelectorAll('.nav-item');

    // Cacher toutes les sections et désactiver tous les liens
    sections.forEach(section => section.classList.add('hidden'));
    navItems.forEach(item => item.classList.remove('active-nav-item'));

    // Afficher la section cible et activer le lien
    const targetSection = getElement(targetId);
    if (targetSection) {
        targetSection.classList.remove('hidden');
        navItem.classList.add('active-nav-item');
        
        // Mettre à jour le contenu de la section affichée
        if (player) {
            switch (targetId) {
                case 'character-section':
                    renderCharacter(player);
                    break;
                case 'stats-section':
                    updateStatsDisplay(player);
                    break;
                case 'quest-section':
                    renderQuestsPage(player);
                    break;
                case 'inventory-section':
                    updateInventoryDisplay(player);
                    break;
                case 'equipement-section':
                    updateEquipmentDisplay(player);
                    break;
            }
        }
    }
}

/**
 * Attache tous les écouteurs d'événements nécessaires aux boutons de la page.
 */
function setupEventListeners() {
    // Écouteur pour la navigation par sections
    const sectionNav = getElement('section-nav');
    if (sectionNav) {
        sectionNav.addEventListener('click', handleSectionNav);
    }
    
    if (playBtn) {
        playBtn.addEventListener('click', handlePlayClick);
    }
    
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
            if (confirm("Êtes-vous sûr de vouloir supprimer votre personnage ? Cette action est irréversible.")) {
                deleteCharacter();
            }
        });
    }

    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            handleSignOut();
        });
    }
}

// Lancer la logique de la page une fois le DOM chargé
document.addEventListener('DOMContentLoaded', () => {
    // Démarre l'écouteur d'authentification de Firebase.
    startAuthListener('gestion_personnage');
    
    // Attache les écouteurs d'événements aux boutons.
    setupEventListeners();
});