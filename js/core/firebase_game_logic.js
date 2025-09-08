/**
 * @fileoverview Module de gestion de la logique des quêtes du jeu.
 * Gère l'acceptation, la mise à jour de la progression et la complétion des quêtes.
 */

// Importations des données et des modules nécessaires
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { doc, getDoc, setDoc, deleteDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { auth, db } from "./firebase_config.js";
import { showNotification } from './notifications.js';
import { questsData } from './questsData.js';
import { updateQuestProgress } from '../modules/quests.js';
import { renderQuestsPage } from './questsPageManager.js';
import { updateJournalDisplay } from '../modules/ui.js'; // Assurez-vous d'avoir cette fonction

// Variable pour stocker l'utilisateur connecté
let currentUser = null;

// Fonction utilitaire pour récupérer un élément du DOM de manière sécurisée
function getElement(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.warn(`Element with ID '${id}' not found. Make sure the HTML page includes this element.`);
    }
    return element;
}

// =========================================================================
// VARIABLES GLOBALES
// =========================================================================
const noCharacterSection = getElement('no-character-section');
const characterSection = getElement('character-section');
const characterDisplay = getElement('character-display');
const loadingMessage = getElement('loading-message');
const playBtn = getElement('play-btn');
const deleteBtn = getElement('delete-btn');
const updateBtn = getElement('update-btn');
const statsDisplay = getElement('stats-display');
const questsDisplay = getElement('quests-display');
const inventoryDisplay = getElement('inventory-display');
const equipmentDisplay = getElement('equipment-display');
const characterInfoDisplay = getElement('character-info-display');
const characterForm = getElement('character-form');
const characterExistsSection = getElement('character-exists-section');
const existingCharacterDisplay = getElement('existing-character-display');
const deleteBtnOnCharacterPage = getElement('delete-btn-creation-page');
const logoutLink = getElement('logout-link');

// Variables pour le journal de bord
const currentQuestTitle = getElement('current-quest-title');
const currentQuestDescription = getElement('current-quest-description');
const currentQuestProgress = getElement('current-quest-progress');
const hpValue = getElement('hp-value');
const goldValue = getElement('gold-value');
const levelValue = getElement('level-value');

// =========================================================================
// FONCTIONS DE GESTION DE L'AFFICHAGE
// =========================================================================

/**
 * Met à jour l'affichage des informations de quête sur la page de gestion.
 * @param {object} character Les données du personnage.
 */
function renderQuestDisplay(character) {
    if (!character || !questsDisplay) return;

    const activeQuestsList = getElement('active-quests-list');
    const unstartedQuestsList = getElement('unstarted-quests-list');
    const completedQuestsList = getElement('completed-quests-list');

    if (activeQuestsList) activeQuestsList.innerHTML = '';
    if (unstartedQuestsList) unstartedQuestsList.innerHTML = '';
    if (completedQuestsList) completedQuestsList.innerHTML = '';

    if (character.quests.current) {
        const questData = questsData[character.quests.current.questId];
        if (questData) {
            const li = document.createElement('li');
            li.innerHTML = `
                <h4>${questData.title}</h4>
                <p>${questData.description}</p>
                <p>Progression : ${character.quests.current.currentProgress || 0} / ${questData.objective.required}</p>
            `;
            if (activeQuestsList) activeQuestsList.appendChild(li);
        }
    } else {
        const li = document.createElement('li');
        li.textContent = "Aucune quête active pour le moment.";
        if (activeQuestsList) activeQuestsList.appendChild(li);
    }

    if (character.quests.completed) {
        for (const questId in character.quests.completed) {
            const questData = questsData[questId];
            if (questData) {
                const li = document.createElement('li');
                li.innerHTML = `<h4>${questData.title}</h4><p>Terminée</p>`;
                if (completedQuestsList) completedQuestsList.appendChild(li);
            }
        }
    }

    for (const questId in questsData) {
        const isCompleted = character.quests.completed && character.quests.completed[questId];
        const isActive = character.quests.current && character.quests.current.questId === questId;

        if (!isCompleted && !isActive) {
            const questData = questsData[questId];
            const li = document.createElement('li');
            li.innerHTML = `
                <h4>${questData.title}</h4>
                <p>${questData.description}</p>
                <button class="accept-quest-btn" data-quest-id="${questId}">Accepter</button>
            `;
            if (unstartedQuestsList) unstartedQuestsList.appendChild(li);
        }
    }
}

/**
 * Met à jour l'affichage complet du personnage sur la page de gestion.
 * @param {object} character Les données du personnage.
 */
function renderCharacter(character) {
    if (!character) return;

    if (characterDisplay) {
        characterDisplay.innerHTML = `
            <h3>${character.name}</h3>
            <p>Niveau : ${character.level}</p>
            <p>Points de vie : ${character.stats.hp}/${character.stats.maxHp}</p>
            <p>Points de magie : ${character.stats.mana}/${character.stats.maxMana}</p>
            <p>Or : ${character.gold}</p>
        `;
    }

    if (statsDisplay && character.stats) {
        statsDisplay.innerHTML = `
            <p>Force : ${character.stats.strength}</p>
            <p>Intelligence : ${character.stats.intelligence}</p>
            <p>Vitesse : ${character.stats.speed}</p>
            <p>Dextérité : ${character.stats.dexterity}</p>
        `;
    }
    
    renderQuestDisplay(character);

    if (equipmentDisplay && character.equipment) {
        equipmentDisplay.innerHTML = `
            <p>Arme : ${character.equipment.weapon ? character.equipment.weapon.name : 'Aucune'}</p>
            <p>Armure : ${character.equipment.armor ? character.equipment.armor.name : 'Aucune'}</p>
        `;
    }
    
    const sectionsToDisplay = ['character-section', 'stats-section', 'quest-section', 'inventory-section', 'equipement-section'];
    sectionsToDisplay.forEach(id => {
        const section = getElement(id);
        if (section) section.classList.remove('hidden');
    });

    if (loadingMessage) loadingMessage.classList.add('hidden');
    if (playBtn) playBtn.classList.remove('hidden');
    if (deleteBtn) deleteBtn.classList.remove('hidden');
    if (updateBtn) updateBtn.classList.remove('hidden');
}

function renderExistingCharacterOnCreationPage(character) {
    if (!existingCharacterDisplay) return;
    existingCharacterDisplay.innerHTML = `
        <div class="character-card">
            <h3>${character.name}</h3>
            <p>Niveau : ${character.level}</p>
            <p>Points de vie : ${character.stats.hp}</p>
            <p>Points de magie : ${character.stats.mana}</p>
            <p>Fatigue : ${character.stats.stamina}</p>
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

// Fonction pour mettre à jour le journal de bord
function renderJournal(character) {
    if (!character) return;
    updateJournalDisplay(character); // Appel à la fonction de mise à jour du journal de bord
    
    if (hpValue && character.stats) {
        hpValue.textContent = `${character.stats.hp} / ${character.stats.maxHp}`;
    }
    if (goldValue) {
        goldValue.textContent = character.gold;
    }
    if (levelValue) {
        levelValue.textContent = character.level;
    }
}

async function loadCharacterData(user) {
    // Cette fonction est maintenant obsolète car nous utilisons onSnapshot
    // Cependant, nous la conservons pour les cas d'utilisation uniques
    const characterRef = doc(db, "artifacts", "default-app-id", "users", user.uid, "characters", user.uid);
    try {
        const docSnap = await getDoc(characterRef);
        if (docSnap.exists()) {
            const characterData = docSnap.data();
            if (window.location.pathname.includes('gestion_personnage.html')) {
                renderCharacter(characterData);
                if (noCharacterSection) noCharacterSection.classList.add('hidden');
                characterSection.classList.remove('hidden');
            } else if (window.location.pathname.includes('character.html')) {
                showCharacterExistsView(characterData);
            }
        } else {
            showNoCharacterView();
        }
    } catch (error) {
        console.error("Erreur lors du chargement du personnage:", error);
        showNotification("Erreur lors du chargement des données. Veuillez réessayer.", "error");
    }
}

// NOUVELLE FONCTION: Accepter une quête et la sauvegarder sur Firestore
async function acceptQuestAndSave(questId, user) {
    const characterRef = doc(db, "artifacts", "default-app-id", "users", user.uid, "characters", user.uid);
    try {
        const docSnap = await getDoc(characterRef);
        if (docSnap.exists()) {
            const characterData = docSnap.data();

            if (characterData.quests && characterData.quests.current) {
                showNotification("Vous avez déjà une quête en cours. Terminez-la d'abord !", "warning");
                return;
            }

            const questDefinition = questsData[questId];
            if (!questDefinition) {
                showNotification("Erreur: Cette quête n'existe pas.", "error");
                return;
            }

            const newQuestData = {
                questId: questId,
                currentProgress: 0
            };

            const updatedQuests = characterData.quests || { completed: {} };
            updatedQuests.current = newQuestData;

            await setDoc(characterRef, { quests: updatedQuests }, { merge: true });

            showNotification(`Quête "${questDefinition.title}" acceptée !`, "success");

            // Si le joueur est sur la page de gestion, on met à jour l'affichage
            if (window.location.pathname.includes('gestion_personnage.html')) {
                renderCharacter(characterData);
            }

            // Si le joueur est sur la nouvelle page de quêtes, on la met à jour
            if (window.location.pathname.includes('quests.html')) {
                renderQuestsPage();
            }

        } else {
            showNotification("Erreur: Personnage non trouvé.", "error");
        }
    } catch (error) {
        console.error("Erreur lors de l'acceptation de la quête:", error);
        showNotification("Une erreur est survenue lors de l'acceptation de la quête.", "error");
    }
}

/**
 * Gère la complétion d'un objectif de quête de manière générique.
 * @param {string} objectiveAction - Le type d'action de l'objectif (par ex. 'define_shelter', 'gather').
 * @param {any} [payload] - Données supplémentaires nécessaires à la mise à jour (par ex. l'ID de l'objet collecté).
 */
async function completeQuestObjective(objectiveAction, payload = null) {
    if (!currentUser) {
        showNotification("Vous devez être connecté pour mettre à jour la quête.", "error");
        return;
    }

    try {
        const characterRef = doc(db, "artifacts", "default-app-id", "users", currentUser.uid, "characters", currentUser.uid);
        const docSnap = await getDoc(characterRef);

        if (docSnap.exists()) {
            let characterData = docSnap.data();

            characterData = await updateQuestProgress(characterData, currentUser.uid, objectiveAction, payload);

            if (characterData) {
                await setDoc(characterRef, characterData);
                showNotification("Objectif de quête mis à jour !", "success");
                
                // Si le joueur est sur la page de la carte du monde, on met à jour le journal de bord
                if (window.location.pathname.includes('world_map.html')) {
                    renderJournal(characterData);
                }
                // Si le joueur est sur la nouvelle page de quêtes, on la met à jour
                if (window.location.pathname.includes('quests.html')) {
                    renderQuestsPage();
                }
            }
        }
    } catch (error) {
        console.error("Erreur lors de la mise à jour de l'objectif de quête :", error);
        showNotification("Erreur lors de la mise à jour de la quête. Veuillez réessayer.", "error");
    }
}

// =========================================================================
// GESTION DES ÉVÉNEMENTS
// =========================================================================
document.addEventListener('DOMContentLoaded', () => {

    if (playBtn) {
        playBtn.addEventListener('click', async () => {
            if (!currentUser) {
                showNotification("Vous devez être connecté pour commencer.", "error");
                return;
            }
            try {
                const docRef = doc(db, "artifacts", "default-app-id", "users", currentUser.uid, "characters", currentUser.uid);
                const docSnap = await getDoc(docRef);
                const characterData = docSnap.data();

                if (!characterData.quests || !characterData.quests.current) {
                    const initialQuestData = {
                        questId: 'initial_adventure_quest',
                        ...questsData.initial_adventure_quest,
                        status: 'active',
                        currentProgress: 0
                    };
                    characterData.quests.current = initialQuestData;
                    await setDoc(docRef, { quests: characterData.quests }, { merge: true });
                    showNotification("Votre première quête a commencé !", "success");
                }
                window.location.href = "world_map.html";
            } catch (error) {
                console.error('Erreur lors du démarrage de la quête :', error);
                showNotification("Une erreur est survenue. Veuillez réessayer.", "error");
            }
        });
    }

    if (characterForm) {
        characterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!currentUser) {
                showNotification("Veuillez vous connecter pour créer un personnage.", "error");
                setTimeout(() => { window.location.href = "login.html"; }, 1500);
                return;
            }
            const name = document.getElementById('char-name').value.trim();
            const age = parseInt(document.getElementById('char-age').value);
            const height = parseInt(document.getElementById('char-height').value);
            const weight = parseInt(document.getElementById('char-weight').value);
            const charClass = document.getElementById('char-class').value;

            if (!name) {
                showNotification("Veuillez saisir un pseudo pour votre personnage.", "error");
                return;
            }
            const initialStats = {
                hp: 100,
                maxHp: 100,
                mana: 50,
                maxMana: 50,
                stamina: 80,
                strength: 10,
                intelligence: 8,
                speed: 10,
                dexterity: 10,
                luck: 5,
                xp: 0,
                nextLevelXp: 100
            };
            const characterData = {
                name: name,
                age: age,
                height: height,
                weight: weight,
                class: charClass,
                level: 1,
                gold: 3,
                inventory: {},
                equipment: {},
                quests: {
                    current: null,
                    completed: {}
                },
                stats: initialStats,
                creationDate: new Date()
            };
            const characterRef = doc(db, "artifacts", "default-app-id", "users", currentUser.uid, "characters", currentUser.uid);
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

    async function deleteCharacterData() {
        if (!currentUser) {
            showNotification("Vous devez être connecté pour supprimer un personnage.", "error");
            return;
        }
        const characterRef = doc(db, "artifacts", "default-app-id", "users", currentUser.uid, "characters", currentUser.uid);
        try {
            await deleteDoc(characterRef);
            showNotification("Personnage supprimé avec succès !", "info");
            setTimeout(() => { window.location.href = "character.html"; }, 1500);
        } catch (error) {
            console.error("Erreur lors de la suppression du personnage :", error);
            showNotification("Erreur lors de la suppression. Veuillez réessayer.", "error");
        }
    }

    if (deleteBtnOnCharacterPage) {
        deleteBtnOnCharacterPage.addEventListener('click', async () => {
            await deleteCharacterData();
        });
    }

    if (deleteBtn) {
        deleteBtn.addEventListener('click', async () => {
            await deleteCharacterData();
        });
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

    document.addEventListener('click', (event) => {
        if (event.target.classList.contains('accept-quest-btn')) {
            if (!currentUser) {
                showNotification("Vous devez être connecté pour accepter une quête.", "error");
                return;
            }
            const questId = event.target.dataset.questId;
            acceptQuestAndSave(questId, currentUser);
        }
    });

    const validateShelterBtn = getElement('set-safe-place-btn');
    if (validateShelterBtn) {
        validateShelterBtn.addEventListener('click', () => {
            if (!currentUser) {
                showNotification("Vous devez être connecté pour mettre à jour la quête.", "error");
                return;
            }
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const shelterLocation = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        };
                        completeQuestObjective("define_shelter", shelterLocation);
                    },
                    (error) => {
                        console.error("Erreur de géolocalisation:", error);
                        showNotification("Impossible d'obtenir votre position. Veuillez autoriser la géolocalisation.", "error");
                    }
                );
            } else {
                showNotification("La géolocalisation n'est pas supportée par votre navigateur.", "error");
            }
        });
    }

    // Le point d'entrée unique de l'application
    onAuthStateChanged(auth, (user) => {
        if (user) {
            currentUser = user; // Stocke l'utilisateur dans la variable globale
            // Écoute en temps réel les changements du document de personnage
            const characterRef = doc(db, "artifacts", "default-app-id", "users", user.uid, "characters", user.uid);
            onSnapshot(characterRef, (docSnap) => {
                if (docSnap.exists()) {
                    const characterData = docSnap.data();
                    if (window.location.pathname.includes('world_map.html')) {
                        renderJournal(characterData);
                    } else if (window.location.pathname.includes('gestion_personnage.html')) {
                        renderCharacter(characterData);
                        if (noCharacterSection) noCharacterSection.classList.add('hidden');
                        characterSection.classList.remove('hidden');
                    } else if (window.location.pathname.includes('quests.html')) {
                        // NOUVEAU: Appelle la fonction de rendu de la nouvelle page de quêtes
                        renderQuestsPage();
                    } else if (window.location.pathname.includes('character.html')) {
                        showCharacterExistsView(characterData);
                    }
                } else {
                    if (window.location.pathname.includes('gestion_personnage.html')) {
                        window.location.href = "character.html";
                    }
                    if (window.location.pathname.includes('world_map.html')) {
                         window.location.href = "character.html";
                    }
                    if (window.location.pathname.includes('quests.html')) {
                         window.location.href = "character.html";
                    }
                    showNoCharacterView();
                }
            }, (error) => {
                console.error("Erreur de synchronisation en temps réel:", error);
                showNotification("Erreur de synchronisation des données.", 'error');
            });
        } else {
            currentUser = null; // Réinitialise l'utilisateur
            // Redirige vers la page de connexion si l'utilisateur est déconnecté sur une page protégée
            if (window.location.pathname.includes('world_map.html') || window.location.pathname.includes('gestion_personnage.html') || window.location.pathname.includes('quests.html')) {
                 window.location.href = "login.html";
            }
        }
    });
});