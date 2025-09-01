// Fichier : firebase_game_logic.js

import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { doc, getDoc, deleteDoc, setDoc } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
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
        if (!characterDisplay) return;
        characterDisplay.innerHTML = `
            <div class="character-card">
                <h3>${character.name}</h3>
                <p>Classe : ${character.class}</p>
                <p>Niveau : ${character.level}</p>
                <p>Points de vie : ${character.hp}</p>
            </div>
        `;
        if (loadingMessage) loadingMessage.classList.add('hidden');
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
    const characterForm = document.getElementById('character_form');
    const logoutButton = document.getElementById('logout-button');

    // On retire le "if" en double et on s'assure que le code est correctement encadré
    if (characterForm) {
        characterForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // 1. Récupération des valeurs du formulaire
            const userId = auth.currentUser.uid;
            const name = document.getElementById('char-name').value.trim();
            const age = parseInt(document.getElementById('char-age').value);
            const height = parseInt(document.getElementById('char-height').value);
            const weight = parseInt(document.getElementById('char-weight').value);
            const charClass = document.getElementById('char-class').value;

            // 2. Validation simple
            if (!name) {
                showNotification("Veuillez saisir un pseudo pour votre personnage.", "error");
                return;
            }

            // 3. Création de l'objet personnage
            const characterData = {
                name: name,
                age: age,
                height: height,
                weight: weight,
                class: charClass,
                hp: 100,
                level: 1,
                creationDate: new Date()
            };

            // 4. Enregistrement du personnage dans Firestore
            const characterRef = doc(db, "artifacts", "default-app-id", "users", userId, "characters", userId);
            try {
                await setDoc(characterRef, characterData);
                showNotification("Personnage créé avec succès !", "success");

                // 5. Redirection après un court délai pour que la notification soit vue
                setTimeout(() => {
                    window.location.href = "gestion_personnage.html";
                }, 1500);

            } catch (error) {
                console.error("Erreur lors de la création du personnage :", error);
                showNotification("Erreur lors de la création. Veuillez réessayer.", "error");
            }
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
});