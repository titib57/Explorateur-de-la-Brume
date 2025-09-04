// Fichier : js/core/gestion_personnage.js

import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getFirestore, doc, onSnapshot } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { app } from "./firebase_config.js";

const auth = getAuth(app);
const db = getFirestore(app);

// --- Éléments du DOM ---
const loadingMessage = document.getElementById('loading-message');
const characterSection = document.getElementById('character-section');
const noCharacterSection = document.getElementById('no-character-section');
const characterDisplay = document.getElementById('character-display');
const playBtn = document.getElementById('play-btn');
const deleteBtn = document.getElementById('deleteBtn');
const logoutBtn = document.getElementById('logout-link');

// Carrousel
const carouselItems = document.querySelectorAll('.carousel-item');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
let currentIndex = 0;

// --- Fonctions utilitaires ---
function showUI(element) {
    if (element) {
        element.style.display = 'block';
    }
}

function hideUI(element) {
    if (element) {
        element.style.display = 'none';
    }
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
    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
            currentIndex = (currentIndex > 0) ? currentIndex - 1 : carouselItems.length - 1;
            updateCarousel();
        });

        nextBtn.addEventListener('click', () => {
            currentIndex = (currentIndex < carouselItems.length - 1) ? currentIndex + 1 : 0;
            updateCarousel();
        });
        updateCarousel();
    }
}

// --- Mise à jour de l'UI en fonction de l'état du personnage ---
function updateCharacterUI(character) {
    hideUI(loadingMessage);

    if (character) {
        showUI(characterSection);
        hideUI(noCharacterSection);
        
        if (characterDisplay) {
            characterDisplay.innerHTML = `
                <h3>Nom : ${character.name}</h3>
                <p>Niveau : ${character.level}</p>
                <p>XP : ${character.xp}</p>
                <p>Classe : ${character.class}</p>
            `;
        }
        showUI(playBtn);
        showUI(deleteBtn);
    } else {
        hideUI(characterSection);
        showUI(noCharacterSection);
    }
}

// Gérer la déconnexion de l'utilisateur
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        signOut(auth).then(() => {
            window.location.href = "login.html";
        }).catch((error) => {
            console.error("Erreur de déconnexion :", error);
        });
    });
}

// Lancer le script au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    hideUI(characterSection);
    hideUI(noCharacterSection);
    showUI(loadingMessage);
    
    // Écouteur en temps réel pour l'état d'authentification
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            window.location.href = "login.html";
        } else {
            const userUID = user.uid;
            console.log("Utilisateur connecté :", userUID);
            
            const characterRef = doc(db, "artifacts", "default-app-id", "users", userUID, "characters", userUID);
            
            // Utiliser onSnapshot pour une mise à jour en temps réel
            onSnapshot(characterRef, (docSnap) => {
                const characterData = docSnap.exists() ? docSnap.data() : null;
                updateCharacterUI(characterData);
            }, (error) => {
                console.error("Erreur de synchronisation des données :", error);
                // Gérer l'erreur en affichant l'UI sans personnage
                updateCharacterUI(null);
            });
            
            // Initialisation des boutons du carrousel
            setupCarousel();
        }
    });
});