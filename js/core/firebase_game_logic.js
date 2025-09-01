// Fichier : firebase_game_logic.js

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { doc, getDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { auth, db } from "./firebase_config.js";
import { showNotification } from './notifications.js';
import { deleteCharacterData } from './state.js';


const noCharacterSection = document.getElementById('no-character-section');
const characterSection = document.getElementById('character-section');
const characterDisplay = document.getElementById('character-display');
const loadingMessage = document.getElementById('loading-message');
const playBtn = document.getElementById('play-btn');
const deleteBtn = document.getElementById('delete-btn');
const updateBtn = document.getElementById('update-btn');


function renderCharacter(character) {
    characterDisplay.innerHTML = `
        <div class="character-card">
            <h3>${character.name}</h3>
            <p>Classe : ${character.class}</p>
            <p>Niveau : ${character.level}</p>
            <p>Points de vie : ${character.hp}</p>
        </div>
    `;
    loadingMessage.classList.add('hidden');
    playBtn.classList.remove('hidden');
    deleteBtn.classList.remove('hidden');
    updateBtn.classList.remove('hidden');
}

function showNoCharacterView() {
    characterSection.classList.add('hidden');
    noCharacterSection.classList.remove('hidden');
}

async function loadCharacterData(user) {
    const characterRef = doc(db, "artifacts", "default-app-id", "users", user.uid, "characters", user.uid);
    try {
        const docSnap = await getDoc(characterRef);
        if (docSnap.exists()) {
            renderCharacter(docSnap.data());
            characterSection.classList.remove('hidden');
            noCharacterSection.classList.add('hidden');
        } else {
            showNoCharacterView();
        }
    } catch (error) {
        console.error("Erreur lors du chargement du personnage:", error);
        showNoCharacterView();
        showNotification("Erreur lors du chargement des données. Veuillez réessayer.", "error");
    }
}


// Gestion de l'état d'authentification
onAuthStateChanged(auth, (user) => {
    if (user) {
        loadCharacterData(user);
    } else {
        // Redirige vers la page de connexion si l'utilisateur n'est pas connecté
        window.location.href = "login.html";
    }
});

// Écouteurs d'événements pour les boutons
const characterForm = document.getElementById('characterForm');
const logoutButton = document.getElementById('logout-button');

// On s'assure que le formulaire du personnage existe avant d'ajouter l'écouteur
if (characterForm) {
    characterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = charNameInput.value.trim();
        // ... le reste de votre logique pour la création de personnage
    });
}

// On s'assure que le bouton de suppression existe
if (deleteBtn) {
    deleteBtn.addEventListener('click', deleteCharacterData);
}

// On s'assure que le bouton de déconnexion existe
if (logoutButton) {
    logoutButton.addEventListener('click', () => {
        signOut(auth).then(() => {
            window.location.href = "login.html";
        }).catch((error) => {
            console.error("Erreur de déconnexion :", error);
        });
    });
}

playBtn.addEventListener('click', () => {
    window.location.href = "world_map.html"; // Redirige vers la page de jeu
});

updateBtn.addEventListener('click', () => {
    window.location.href = "character.html"; // Redirige vers la page de mise à jour du personnage
});