// Fichier : firebase_game_logic.js

import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { auth, db } from "./firebase_config.js";
import { showNotification } from './notifications.js';
import { deleteCharacterData } from './state.js';
import { initialQuest } from './questsData.js';


document.addEventListener('DOMContentLoaded', () => {
    // Variables pour la page de gestion des personnages
    const noCharacterSection = document.getElementById('no-character-section');
    const characterSection = document.getElementById('character-section');
    const characterDisplay = document.getElementById('character-display');
    const loadingMessage = document.getElementById('loading-message');
    const playBtn = document.getElementById('play-btn');
    const deleteBtn = document.getElementById('delete-btn');
    const updateBtn = document.getElementById('update-btn');
    const statsDisplay = document.getElementById('stats-display');
    const questsDisplay = document.getElementById('quests-display');
    const inventoryDisplay = document.getElementById('inventory-display');
    const equipmentDisplay = document.getElementById('equipment-display');
    const characterInfoDisplay = document.getElementById('character-info-display');
    const characterForm = document.getElementById('character-form');
    const characterExistsSection = document.getElementById('character-exists-section');
    const existingCharacterDisplay = document.getElementById('existing-character-display');
    const deleteBtnOnCharacterPage = document.getElementById('delete-btn-creation-page');
    const logoutLink = document.getElementById('logout-link');

    // Fonction pour rendre le personnage sur la page de gestion
    function renderCharacter(character) {
        if (!character) return;

        // 1. Section "Mon personnage"
        if (characterDisplay) {
            characterDisplay.innerHTML = `
                <h3>${character.name}</h3>
                <p>Niveau : ${character.level}</p>
                <p>Points de vie : ${character.hp}/${character.maxHp}</p>
                <p>Points de magie : ${character.mana}/${character.maxMana}</p>
                <p>Or : ${character.gold}</p>
            `;
        }

        // 2. Section "Statistiques"
        if (statsDisplay && character.stats) {
            statsDisplay.innerHTML = `
                <p>Force : ${character.stats.strength}</p>
                <p>Intelligence : ${character.stats.intelligence}</p>
                <p>Vitesse : ${character.stats.speed}</p>
                <p>Dextérité : ${character.stats.dexterity}</p>
            `;
        }

        // 3. Section "Quêtes"
        if (questsDisplay && character.quests) {
            const questKeys = Object.keys(character.quests);
            if (questKeys.length > 0) {
                questsDisplay.innerHTML = questKeys.map(key => {
                    const quest = character.quests[key];
                    return `
                        <div>
                            <h4>${quest.title}</h4>
                            <p>Statut : ${quest.status}</p>
                        </div>
                    `;
                }).join('');
            } else {
                questsDisplay.innerHTML = '<p>Aucune quête en cours.</p>';
            }
        }

        // 4. Section "Inventaire"
        if (inventoryDisplay && character.inventory) {
            const inventoryKeys = Object.keys(character.inventory);
            if (inventoryKeys.length > 0) {
                inventoryDisplay.innerHTML = inventoryKeys.map(key => {
                    const item = character.inventory[key];
                    return `<p>${item.name} (x${item.quantity})</p>`;
                }).join('');
            } else {
                inventoryDisplay.innerHTML = '<p>Votre inventaire est vide.</p>';
            }
        }

        // 5. Section "Équipement"
        if (equipmentDisplay && character.equipment) {
            equipmentDisplay.innerHTML = `
                <p>Arme : ${character.equipment.weapon ? character.equipment.weapon.name : 'Aucune'}</p>
                <p>Armure : ${character.equipment.armor ? character.equipment.armor.name : 'Aucune'}</p>
            `;
        }

        // Afficher toutes les sections
        const sectionsToDisplay = ['character-section', 'stats-section', 'quest-section', 'inventory-section', 'equipement-section'];
        sectionsToDisplay.forEach(id => {
            const section = document.getElementById(id);
            if (section) section.classList.remove('hidden');
        });

        // Cacher le message de chargement
        if (loadingMessage) loadingMessage.classList.add('hidden');
        if (playBtn) playBtn.classList.remove('hidden');
        if (deleteBtn) deleteBtn.classList.remove('hidden');
        if (updateBtn) updateBtn.classList.remove('hidden');
    }

    // Fonction pour afficher le personnage sur la page de création/validation
    function renderExistingCharacterOnCreationPage(character) {
        if (!existingCharacterDisplay) return;
        existingCharacterDisplay.innerHTML = `
            <div class="character-card">
                <h3>${character.name}</h3>
                <p>Niveau : ${character.level}</p>
                <p>Points de vie : ${character.hp}</p>
                <p>Points de magie : ${character.mana}</p>
                <p>Fatigue : ${character.stamina}</p>
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
    
    // NOUVELLE LOGIQUE : Écouteur de clic pour le bouton "Commencer l'aventure"
    if (playBtn) {
        playBtn.addEventListener('click', async () => {
            const user = auth.currentUser;
            if (user) {
                try {
                    // Vérifiez si le personnage a déjà une quête
                    const docRef = doc(db, "users", user.uid);
                    const docSnap = await getDoc(docRef);
                    const hasActiveQuest = docSnap.exists() && docSnap.data().quests && Object.keys(docSnap.data().quests).length > 0;

                    if (!hasActiveQuest) {
                        // Si le personnage n'a pas de quête, ajoutez la quête initiale
                        await setDoc(docRef, {
                            quests: {
                                [initialQuest.questId]: initialQuest
                            }
                        }, { merge: true });
                        showNotification("Votre première quête a commencé !", "success");
                    }

                    // Redirigez l'utilisateur vers la carte du monde
                    window.location.href = "world_map.html";

                } catch (error) {
                    console.error('Erreur lors du démarrage de la quête :', error);
                    showNotification("Une erreur est survenue. Veuillez réessayer.", "error");
                }
            } else {
                showNotification("Vous devez être connecté pour commencer.", "error");
            }
        });
    }

    // NOUVELLE LOGIQUE pour la page de la carte du monde
    function renderWorldMapCharacterInfo(character) {
        if (characterInfoDisplay) {
            characterInfoDisplay.innerHTML = `
                <div class="player-info">
                    <span>Personnage : **${character.name}**</span>
                    <span>Niveau : **${character.level}**</span>
                    <span>PV : **${character.hp}**</span>
                </div>
            `;
        }
    }

    async function loadCharacterData(user) {
        const characterRef = doc(db, "artifacts", "default-app-id", "users", user.uid, "characters", user.uid);
        try {
            const docSnap = await getDoc(characterRef);
            if (docSnap.exists()) {
                const characterData = docSnap.data();
                if (characterSection) {
                    renderCharacter(characterData);
                    characterSection.classList.remove('hidden');
                    if (noCharacterSection) noCharacterSection.classList.add('hidden');
                } else if (characterExistsSection) {
                    showCharacterExistsView(characterData);
                } else if (characterInfoDisplay) {
                    renderWorldMapCharacterInfo(characterData);
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
                hp: 20,
                level: 1,
                mana: 50,
                stamina: 80,
                strength: 10,
                intelligence: 8,
                gold: 3,
                inventory: {},
                quests: {},
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
            setTimeout(() => {
                window.location.href = "character.html";
            }, 1500);
        });
    }
    if (deleteBtn) {
        deleteBtn.addEventListener('click', deleteCharacterData);
    }
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            signOut(auth).then(() => {
                window.location.href = "login.html";
            }).catch((error) => {
                console.error("Erreur de déconnexion :", error);
            });
        });
    }
    if (updateBtn) {
        updateBtn.addEventListener('click', () => { window.location.href = "character.html"; });
    }
});