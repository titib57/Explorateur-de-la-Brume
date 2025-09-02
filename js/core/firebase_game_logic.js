// Fichier : firebase_game_logic.js

import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { doc, getDoc, deleteDoc, setDoc } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { auth, db } from "./firebase_config.js";
import { showNotification } from './notifications.js';
import { deleteCharacterData } from './state.js';

document.addEventListener('DOMContentLoaded', () => {
    // Variables pour la page de gestion des personnages
    const noCharacterSection = document.getElementById('no-character-section');
    const characterSection = document.getElementById('character-section');
    const characterDisplay = document.getElementById('character-display');
    const loadingMessage = document.getElementById('loading-message');
    const playBtn = document.getElementById('play-btn');
    const deleteBtn = document.getElementById('delete-btn');
    const updateBtn = document.getElementById('update-btn');

// NOUVELLE VARIABLE pour la page de carte du monde
    const characterInfoDisplay = document.getElementById('character-info-display'); 

    // Variables pour la page de création de personnage (nouveaux)
    const characterForm = document.getElementById('character-form');
    const characterExistsSection = document.getElementById('character-exists-section');
    const existingCharacterDisplay = document.getElementById('existing-character-display');
    // Changement ici : le sélecteur pointe maintenant vers l'ID unique
    const deleteBtnOnCharacterPage = document.getElementById('delete-btn-creation-page');

    // Autres boutons
    const logoutButton = document.getElementById('logout-button');

    function renderCharacter(character) {
        if (!characterDisplay) return;
        characterDisplay.innerHTML = `
            <div class="character-card">
            <h3>${character.name}</h3>
            <p>Classe : ${character.class}</p>
            <p>Niveau : ${character.level}</p>
            <p>Points de vie : ${character.hp}</p>
            <p>Mana : ${character.mana}</p>
            <p>Endurance : ${character.stamina}</p>
            </div>
        `;
        if (loadingMessage) loadingMessage.classList.add('hidden');
        if (playBtn) playBtn.classList.remove('hidden');
        if (deleteBtn) deleteBtn.classList.remove('hidden');
        if (updateBtn) updateBtn.classList.remove('hidden');
    }

// NOUVELLE LOGIQUE pour la page de la carte du monde
    if (characterInfoDisplay) {
        characterInfoDisplay.innerHTML = `
            <div class="player-info">
                <span>Personnage : **${character.name}**</span>
                <span>Niveau : **${character.level}**</span>
                <span>PV : **${character.hp}**</span>
            </div>
        `;
    }

    function renderExistingCharacterOnCreationPage(character) {
        if (!existingCharacterDisplay) return;
        existingCharacterDisplay.innerHTML = `
            <div class="character-card">
            <h3>${character.name}</h3>
            <p>Classe : ${character.class}</p>
            <p>Niveau : ${character.level}</p>
            <p>Points de vie : ${character.hp}</p>
            <p>Mana : ${character.mana}</p>
            <p>Endurance : ${character.stamina}</p>
            </div>
        `;
        if (loadingMessage) loadingMessage.classList.add('hidden');
    }

    function showNoCharacterView() {
        if (characterSection) characterSection.classList.add('hidden');
        if (noCharacterSection) noCharacterSection.classList.remove('hidden');
        if (characterExistsSection) characterExistsSection.classList.add('hidden');
        if (characterForm) characterForm.classList.remove('hidden');
    }

    function showCharacterExistsView(character) {
        if (noCharacterSection) noCharacterSection.classList.add('hidden');
        if (characterForm) characterForm.classList.add('hidden');
        if (characterExistsSection) characterExistsSection.classList.remove('hidden');
        renderExistingCharacterOnCreationPage(character);
    }

    async function loadCharacterData(user) {
        const characterRef = doc(db, "artifacts", "default-app-id", "users", user.uid, "characters", user.uid);
        try {
            const docSnap = await getDoc(characterRef);
            if (docSnap.exists()) {
                // S'il y a un personnage, affichez la vue appropriée
                if (characterSection) {
                    renderCharacter(docSnap.data());
                    characterSection.classList.remove('hidden');
                    if (noCharacterSection) noCharacterSection.classList.add('hidden');
                } else if (characterExistsSection) {
                    showCharacterExistsView(docSnap.data());
                }
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
    if (characterForm) {
        characterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!auth.currentUser) {
                showNotification("Veuillez vous connecter pour créer un personnage.", "error");
                setTimeout(() => { window.location.href = "login.html"; }, 1500);
                return;
            }
            const userId = auth.currentUser.uid;
            const name = document.getElementById('char-name').value.trim();
            const age = parseInt(document.getElementById('char-age').value);
            const height = parseInt(document.getElementById('char-height').value);
            const weight = parseInt(document.getElementById('char-weight').value);
            const charClass = document.getElementById('char-class').value;

            if (!name) {
                showNotification("Veuillez saisir un pseudo pour votre personnage.", "error");
                return;
            }

            const characterData = {
                name: name,
                age: age,
                height: height,
                weight: weight,
                class: charClass,
                hp: 100,
                level: 1,
                mana: 50, // Point de magie pour les sorts 🧙‍♂️
                stamina: 80, // Endurance pour les actions physiques 🏃‍♂️
                strength: 10, // Force pour le combat 💪
                intelligence: 8, // Intelligence pour les sorts et énigmes 🧠
                gold: 3, // Argent du personnage 💰
                inventory: [couteau, potionPV], // Inventaire pour les objets et équipements
                quests: {} // Suivi des quêtes
                creationDate: new Date()
            };

            const characterRef = doc(db, "artifacts", "default-app-id", "users", userId, "characters", userId);
            try {
                await setDoc(characterRef, characterData);
                showNotification("Personnage créé avec succès !", "success");
                setTimeout(() => { window.location.href = "gestion_personnage.html"; }, 1500);
            } catch (error) {
                console.error("Erreur lors de la création du personnage :", error);
                showNotification("Erreur lors de la création. Veuillez réessayer.", "error");
            }
        });
    }

    if (deleteBtnOnCharacterPage) {
        deleteBtnOnCharacterPage.addEventListener('click', async () => {
            await deleteCharacterData();
            showNotification("Personnage supprimé. Vous pouvez en créer un nouveau.", "info");
            // Changement ici : Redirection pour recharger la page
            setTimeout(() => {
                window.location.href = "character.html";
            }, 1500);
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
        playBtn.addEventListener('click', () => { window.location.href = "world_map.html"; });
    }
    if (updateBtn) {
        updateBtn.addEventListener('click', () => { window.location.href = "character.html"; });
    }
});