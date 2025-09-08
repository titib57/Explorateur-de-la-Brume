// Fichier : js/core/authManager.js
// Ce module gère l'authentification et la synchronisation des données avec Firestore.

import { auth, db } from './firebase_config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { doc, setDoc, getDoc, deleteDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { Character, setPlayer, recalculateDerivedStats } from './state.js';
import { showNotification } from './notifications.js';
import { updateWorldMapUI } from '../modules/ui.js';
import { initGame } from './gameEngine.js'; // Import de la fonction d'initialisation du jeu

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
 * Démarre l'écoute de l'état d'authentification et des données du joueur.
 */
export function startAuthListener() {
    let isInitialLoad = true;
    onAuthStateChanged(auth, (user) => {
        if (user) {
            userId = user.uid;
            const characterRef = doc(db, "artifacts", "default-app-id", "users", userId, "characters", userId);
            
            // Écouteur en temps réel des données du joueur
            onSnapshot(characterRef, (docSnap) => {
                if (docSnap.exists()) {
                    const savedPlayer = docSnap.data();
                    const char = new Character(
                        savedPlayer.name, savedPlayer.playerClass, savedPlayer.level, savedPlayer.xp, savedPlayer.gold,
                        savedPlayer.stats, savedPlayer.quests, savedPlayer.inventory, savedPlayer.equipment,
                        savedPlayer.abilities, savedPlayer.hp, savedPlayer.maxHp, savedPlayer.mana, savedPlayer.maxMana,
                        savedPlayer.safePlaceLocation, savedPlayer.journal
                    );
                    char.statPoints = savedPlayer.statPoints;
                    recalculateDerivedStats(char);
                    setPlayer(char);
                    
                    if (isInitialLoad) {
                        initGame();
                        isInitialLoad = false;
                    }
                    updateWorldMapUI(char);
                } else {
                    setPlayer(null);
                    console.log("Aucun document de personnage trouvé.");
                    if (window.location.pathname.includes('world_map.html') || window.location.pathname.includes('gestion_personnage.html')) {
                        window.location.href = "character.html";
                    }
                }
            }, (error) => {
                console.error("Erreur de synchronisation en temps réel:", error);
                showNotification("Erreur de synchronisation des données.", 'error');
            });
        } else {
            userId = null;
            setPlayer(null);
            window.location.href = "login.html";
        }
    });
}