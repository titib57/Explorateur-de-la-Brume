// Fichier : js/core/authManager.js
// Ce module gère l'authentification et la synchronisation des données avec Firestore.

import { auth, db } from './firebase_config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { doc, setDoc, getDoc, deleteDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { Character, setPlayer, recalculateDerivedStats, createCharacterData } from './state.js';
import { showNotification } from './notifications.js';
import { initGame } from './gameEngine.js';
import { updateUIBasedOnPage, showNoCharacterView, showCharacterExistsView } from '../modules/ui.js';

export let userId = null;

/**
 * Sauvegarde les données du personnage dans Firestore.
 * @param {object} playerData Les données du personnage à sauvegarder.
 */
export async function saveCharacterData(playerData) {
    if (!userId) {
        console.error("Erreur : Utilisateur non authentifié.");
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
        const charRef = doc(db, "artifacts", "default-app-id", "users", userId, "characters", userId);
        await setDoc(charRef, dataToSave, { merge: true });
        console.log("Personnage sauvegardé sur Firestore !");
    } catch (error) {
        console.error("Erreur lors de la sauvegarde du personnage sur Firestore : ", error);
        showNotification("Erreur lors de la sauvegarde.", 'error');
    }
}

/**
 * Charge l'objet joueur depuis Firestore.
 * @returns {Promise<object|null>} L'objet joueur ou null si non trouvé.
 */
export async function loadCharacter(user) {
    if (!user || !user.uid) return null;
    try {
        const charRef = doc(db, "artifacts", "default-app-id", "users", user.uid, "characters", user.uid);
        const characterSnap = await getDoc(charRef);
        if (characterSnap.exists()) {
            const savedPlayer = characterSnap.data();
            const char = new Character(
                savedPlayer.name, savedPlayer.playerClass, savedPlayer.level, savedPlayer.xp, savedPlayer.gold,
                savedPlayer.stats, savedPlayer.quests, savedPlayer.inventory, savedPlayer.equipment,
                savedPlayer.abilities, savedPlayer.hp, savedPlayer.maxHp, savedPlayer.mana, savedPlayer.maxMana,
                savedPlayer.safePlaceLocation, savedPlayer.journal
            );
            char.statPoints = savedPlayer.statPoints;
            recalculateDerivedStats(char);
            setPlayer(char);
            console.log("Personnage chargé depuis Firestore !");
            return char;
        } else {
            console.log("Aucun document de personnage trouvé pour l'utilisateur.");
            return null;
        }
    } catch (error) {
        console.error("Erreur lors du chargement du personnage depuis Firestore : ", error);
        return null;
    }
}

/**
 * Gère la création d'un nouveau personnage.
 * @param {string} name Le nom du personnage.
 * @param {string} charClass La classe du personnage.
 */
export async function createNewCharacter(name, charClass) {
    if (!userId) {
        showNotification("Veuillez vous connecter pour créer un personnage.", "error");
        return;
    }
    const newCharacterData = createCharacterData(name, charClass);
    try {
        await saveCharacterData(newCharacterData);
        showNotification("Personnage créé avec succès !", "success");
        setTimeout(() => { window.location.href = "gestion_personnage.html"; }, 1500);
    } catch (error) {
        console.error("Erreur lors de la création du personnage :", error);
        showNotification("Erreur lors de la création. Veuillez réessayer.", "error");
    }
}

/**
 * Gère la suppression du personnage actuel.
 */
export async function deleteCharacter() {
    if (!userId) {
        showNotification("Vous devez être connecté pour supprimer un personnage.", "error");
        return;
    }
    const characterRef = doc(db, "artifacts", "default-app-id", "users", userId, "characters", userId);
    try {
        await deleteDoc(characterRef);
        showNotification("Personnage supprimé avec succès !", "info");
        setTimeout(() => { window.location.href = "character.html"; }, 1500);
    } catch (error) {
        console.error("Erreur lors de la suppression du personnage :", error);
        showNotification("Erreur lors de la suppression. Veuillez réessayer.", "error");
    }
}

/**
 * Démarre l'écoute de l'état d'authentification et des données du joueur.
 */
export function startAuthListener() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            userId = user.uid;
            const characterRef = doc(db, "artifacts", "default-app-id", "users", userId, "characters", userId);

            onSnapshot(characterRef, (docSnap) => {
                const characterData = docSnap.exists() ? docSnap.data() : null;
                if (characterData) {
                    const char = new Character(
                        characterData.name, characterData.playerClass, characterData.level, characterData.xp, characterData.gold,
                        characterData.stats, characterData.quests, characterData.inventory, characterData.equipment,
                        characterData.abilities, characterData.hp, characterData.maxHp, characterData.mana, characterData.maxMana,
                        characterData.safePlaceLocation, characterData.journal
                    );
                    char.statPoints = characterData.statPoints;
                    recalculateDerivedStats(char);
                    setPlayer(char);
                    updateUIBasedOnPage(char); // Appel centralisé pour la mise à jour de l'UI
                } else {
                    setPlayer(null);
                    updateUIBasedOnPage(null); // Gère l'affichage "pas de personnage"
                }
            }, (error) => {
                console.error("Erreur de synchronisation en temps réel:", error);
                showNotification("Erreur de synchronisation des données.", 'error');
            });
        } else {
            userId = null;
            setPlayer(null);
            updateUIBasedOnPage(null);
            const protectedPages = ['world_map.html', 'gestion_personnage.html', 'quests.html'];
            const currentPage = window.location.pathname.split('/').pop();
            if (protectedPages.includes(currentPage)) {
                window.location.href = "login.html";
            }
        }
    });
}

/**
 * Gère la déconnexion de l'utilisateur.
 */
export function handleSignOut() {
    signOut(auth).then(() => {
        window.location.href = "login.html";
    }).catch((error) => {
        console.error("Erreur de déconnexion :", error);
        showNotification("Erreur de déconnexion. Veuillez réessayer.", 'error');
    });
}