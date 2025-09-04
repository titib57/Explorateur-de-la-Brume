// character.js

// Importations des modules de l'application
import { showNotification } from './core/notifications.js';
import { auth, db, savePlayer, deleteCharacterData, userId, authPromise } from './core/firebase_config.js';
import { player, loadCharacter, createCharacter, updateStats, updateStatsDisplay } from './core/state.js';

// --- Éléments du DOM ---
const loadingMessage = document.getElementById('loading-message');
const formTitle = document.getElementById('form-title');
const characterForm = document.getElementById('character-form');
const deleteBtn = document.getElementById('deleteBtn');
const playBtn = document.getElementById('play-btn');
const charNameInput = document.getElementById('char-name');
const charAgeInput = document.getElementById('char-age');
const charHeightInput = document.getElementById('char-height');
const charWeightInput = document.getElementById('char-weight');
const charClassSelect = document.getElementById('char-class');
const popupOverlay = document.getElementById('popup-overlay');
const popupContent = document.getElementById('popup-content');
const confirmDeleteBtn = document.getElementById('confirm-delete');
const cancelDeleteBtn = document.getElementById('cancel-delete');
const userIdDisplay = document.getElementById('user-id-display');

// Carrousel
const carouselItems = document.querySelectorAll('.carousel-item');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
let currentIndex = 0;

// --- Fonctions utilitaires pour l'UI ---
function showUI(element) {
    element.style.display = 'block'; // Utilisation de block pour les sections
}

function hideUI(element) {
    element.style.display = 'none';
}

function showPopup() {
    popupOverlay.style.display = 'flex';
    setTimeout(() => {
        popupContent.style.opacity = '1';
        popupContent.style.transform = 'scale(1)';
    }, 10);
}

function hidePopup() {
    popupContent.style.opacity = '0';
    popupContent.style.transform = 'scale(0.95)';
    setTimeout(() => {
        popupOverlay.style.display = 'none';
    }, 300);
}

// --- Logique du carrousel ---
function updateCarousel() {
    carouselItems.forEach((item, index) => {
        if (index === currentIndex) {
            item.classList.add('active');
            item.style.display = 'block';
        } else {
            item.classList.remove('active');
            item.style.display = 'none';
        }
    });
}

function setupCarousel() {
    prevBtn.addEventListener('click', () => {
        currentIndex = (currentIndex > 0) ? currentIndex - 1 : carouselItems.length - 1;
        updateCarousel();
    });

    nextBtn.addEventListener('click', () => {
        currentIndex = (currentIndex < carouselItems.length - 1) ? currentIndex + 1 : 0;
        updateCarousel();
    });

    // Initialisation
    updateCarousel();
}

// --- Mise à jour de l'UI en fonction de l'état du personnage ---
function updateUI(character) {
    if (character) {
        // Un personnage existe : afficher la page de gestion du personnage
        hideUI(document.getElementById('no-character-section'));
        showUI(document.getElementById('character-section'));
        // ... Logique de remplissage des informations
        document.getElementById('character-display').innerHTML = `
            <h3>Nom : ${character.name}</h3>
            <p>Niveau : ${character.level}</p>
            <p>XP : ${character.xp}</p>
            <p>Classe : ${character.class}</p>
        `;
        showUI(playBtn);
        showUI(deleteBtn);
    } else {
        // Aucun personnage : afficher le formulaire de création
        hideUI(document.getElementById('character-section'));
        showUI(document.getElementById('no-character-section'));
    }
    hideUI(loadingMessage);
}

// --- Gestion des événements et Initialisation ---
(async () => {
    showUI(loadingMessage);
    await authPromise;

    if (!userId) {
        console.log("Utilisateur non connecté.");
        updateUI(null);
        return;
    }

    userIdDisplay.textContent = userId;

    const { onSnapshot, doc } = await import("https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js");
    const characterRef = doc(db, "artifacts", "default-app-id", "users", userId, "characters", userId);

    onSnapshot(characterRef, (docSnapshot) => {
        const characterData = docSnapshot.exists() ? docSnapshot.data() : null;
        updateUI(characterData);
    }, (error) => {
        console.error("Erreur de synchronisation des données :", error);
        showNotification("Erreur de synchronisation des données.", 'error');
        updateUI(null);
    });

    // Écouteur pour la soumission du formulaire de création
    characterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = charNameInput.value.trim();
        if (!name) {
            showNotification("Veuillez donner un nom à votre personnage.", 'error');
            return;
        }

        const newCharacterData = {
            name: name,
            age: parseInt(charAgeInput.value),
            height: parseInt(charHeightInput.value),
            weight: parseInt(charWeightInput.value),
            class: charClassSelect.value,
            xp: 0,
            level: 1,
            quests: {
                current: {
                    questId: 'lieu_sur',
                    currentProgress: 0
                },
                completed: {}
            },
            createdAt: new Date().toISOString(),
            lastPlayed: new Date().toISOString()
        };
        savePlayer(newCharacterData);
    });
    
    // Logique de suppression
    deleteBtn.addEventListener('click', showPopup);
    confirmDeleteBtn.addEventListener('click', () => {
        deleteCharacterData();
        hidePopup();
    });
    cancelDeleteBtn.addEventListener('click', hidePopup);
    
    // Logique pour le bouton "Commencer l'aventure"
    playBtn.addEventListener('click', () => {
        window.location.href = 'world_map.html';
    });

    setupCarousel();
})();