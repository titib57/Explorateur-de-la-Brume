// Fichier : firebase_game_logic.js

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { doc, getDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { auth, db } from "js/core/firebase_config.js";
import { showNotification } from 'js/core/notifications.js';
import { deleteCharacter as deleteCharModule } from 'js/modules/character.js';

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
    const characterRef = doc(db, "characters", user.uid);
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
deleteBtn.addEventListener('click', deleteCharacter);

playBtn.addEventListener('click', () => {
    window.location.href = "game.html"; // Redirige vers la page de jeu
});

updateBtn.addEventListener('click', () => {
    window.location.href = "character.html"; // Redirige vers la page de mise à jour du personnage
});