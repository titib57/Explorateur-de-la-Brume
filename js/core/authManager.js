// Fichier: js/core/authManager.js

import { auth, db } from './firebase_config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { doc, setDoc, getDoc, deleteDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { Character, setPlayer, recalculateDerivedStats, createCharacterData } from './state.js';
import { showNotification } from './notifications.js';
import { updateUIBasedOnPage, showCreationUI, showCharacterExistsView } from '../modules/ui.js';

export let userId = null;

function getCharacterRef(userUID) {
    return doc(db, "artifacts", "default-app-id", "users", userUID, "characters", userUID);
}

export async function handleSignOut() {
    try {
        await signOut(auth);
        window.location.href = "login.html";
    } catch (error) {
        console.error("Erreur de déconnexion :", error);
        showNotification("Erreur de déconnexion. Veuillez réessayer.", 'error');
    }
}

export async function saveCharacterData(playerData) {
    if (!userId) {
        console.error("Erreur : Utilisateur non authentifié. L'opération de sauvegarde a été annulée.");
        showNotification("Erreur : Utilisateur non authentifié.", "error");
        return;
    }
    const dataToSave = {
        name: playerData.name || 'Unknown',
        playerClass: playerData.playerClass || 'Adventurer',
        level: playerData.level || 1,
        xp: playerData.xp || 0,
        xpToNextLevel: playerData.xpToNextLevel || 100,
        gold: playerData.gold || 0,
        stats: playerData.stats || {},
        quests: playerData.quests || {},
        inventory: playerData.inventory || {},
        equipment: playerData.equipment || {},
        abilities: playerData.abilities || [],
        hp: playerData.hp || 0,
        maxHp: playerData.maxHp || 0,
        mana: playerData.mana || 0,
        maxMana: playerData.maxMana || 0,
        safePlaceLocation: playerData.safePlaceLocation || null,
        journal: playerData.journal || []
    };
    try {
        const charRef = getCharacterRef(userId);
        await setDoc(charRef, dataToSave, { merge: true });
        console.log("Personnage sauvegardé sur Firestore !");
        showNotification("Sauvegarde réussie !", 'success');
    } catch (error) {
        console.error("Erreur lors de la sauvegarde du personnage sur Firestore : ", error);
        showNotification("Erreur lors de la sauvegarde.", 'error');
    }
}

export async function createNewCharacter(name, charClass) {
    const user = auth.currentUser;
    if (!user) {
        showNotification("Veuillez vous connecter pour créer un personnage.", "error");
        return;
    }
    const newCharacterData = createCharacterData(name, charClass);
    try {
        await saveCharacterData(newCharacterData);
        showNotification("Personnage créé avec succès !", "success");
        // Redirection après la création réussie
        window.location.href = "gestion_personnage.html";
    } catch (error) {
        console.error("Erreur lors de la création du personnage :", error);
        showNotification("Erreur lors de la création. Veuillez réessayer.", "error");
    }
}

export async function deleteCharacter() {
    if (!userId) {
        showNotification("Vous devez être connecté pour supprimer un personnage.", "error");
        return;
    }
    const characterRef = getCharacterRef(userId);
    try {
        await deleteDoc(characterRef);
        showNotification("Personnage supprimé avec succès !", "info");
        window.location.href = "character.html"; // Rediriger vers la page de création
    } catch (error) {
        console.error("Erreur lors de la suppression du personnage :", error);
        showNotification("Erreur lors de la suppression. Veuillez réessayer.", "error");
    }
}

/**
 * Démarre l'écoute de l'état d'authentification et des données du joueur.
 * @param {string} pageName Le nom de la page actuelle ('character' ou 'gestion_personnage').
 */
export function startAuthListener(pageName) {
    onAuthStateChanged(auth, async (user) => {
        userId = user ? user.uid : null;
        
        if (!user) {
            // L'utilisateur n'est pas connecté.
            const protectedPages = ['world_map.html', 'gestion_personnage.html', 'quests.html', 'character.html'];
            const currentPage = window.location.pathname.split('/').pop();
            if (protectedPages.includes(currentPage)) {
                window.location.href = "login.html";
            }
        } else {
            // L'utilisateur est connecté.
            if (pageName === 'character') {
                const characterRef = getCharacterRef(userId);
                const docSnap = await getDoc(characterRef);
                if (docSnap.exists()) {
                    window.location.href = "gestion_personnage.html";
                } else {
                    showCreationUI();
                }
            } else if (pageName === 'gestion_personnage') {
                const characterRef = getCharacterRef(userId);
                onSnapshot(characterRef, (docSnap) => {
                    const characterData = docSnap.exists() ? docSnap.data() : null;
                    const char = characterData ? new Character(
                        characterData.name, characterData.playerClass, characterData.level, characterData.xp, characterData.gold,
                        characterData.stats, characterData.quests, characterData.inventory, characterData.equipment,
                        characterData.abilities, characterData.hp, characterData.maxHp, characterData.mana, characterData.maxMana,
                        characterData.safePlaceLocation, characterData.journal
                    ) : null;

                    setPlayer(char);
                    if (char) {
                        updateUIBasedOnPage(char); // L'UI est mise à jour une fois le personnage chargé
                    } else {
                        window.location.href = "character.html"; // Redirection si le personnage a été supprimé
                    }
                }, (error) => {
                    console.error("Erreur de synchronisation en temps réel:", error);
                    showNotification("Erreur de synchronisation des données.", 'error');
                });
            }
        }
    });
}