// Fichier : firebase_game_logic.js

import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { doc, getDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { auth, db } from "./firebase_config.js";
import { showNotification } from './notifications.js';
import { deleteCharacterData } from './state.js';

document.addEventListener('DOMContentLoaded', () => {
    // Toutes ces variables sont maintenant dans la bonne portée
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
        if (playBtn) playBtn.classList.remove('hidden');
        if (deleteBtn) deleteBtn.classList.remove('hidden');
        if (updateBtn) updateBtn.classList.remove('hidden');
    }

    function showNoCharacterView() {
        if (characterSection) characterSection.classList.add('hidden');
        if (noCharacterSection) noCharacterSection.classList.remove('hidden');
    }

    async function loadCharacterData(user) {
        const characterRef = doc(db, "artifacts", "default-app-id", "users", user.uid, "characters", user.uid);
        try {
            const docSnap = await getDoc(characterRef);
            if (docSnap.exists()) {
                renderCharacter(docSnap.data());
                if (characterSection) characterSection.classList.remove('hidden');
                if (noCharacterSection) noCharacterSection.classList.add('hidden');
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
            window.location.href = "login.html";
        }
    });

    // Écouteurs d'événements pour les boutons
    const characterForm = document.getElementById('characterForm');
    const logoutButton = document.getElementById('logout-button');

    if (characterForm) {
        characterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = charNameInput.value.trim();
        });
    }

    if (deleteBtn) {
        deleteBtn.addEventListener('click', deleteCharacterData);
    }

    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            signOut(auth).then(() => {
                window.location.href = "login.html";
            }).catch((error) => {
                console.error("Erreur de déconnexion :", error);
            });
        });
    }

    // Ces écouteurs sont maintenant au bon endroit
    if (playBtn) {
        playBtn.addEventListener('click', () => {
            window.location.href = "world_map.html";
        });
    }

    if (updateBtn) {
        updateBtn.addEventListener('click', () => {
            window.location.href = "character.html";
        });
    }
}); // C'est ici que le bloc DOMContentLoaded se termine