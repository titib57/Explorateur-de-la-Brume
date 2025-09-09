// Fichier : js/core/authManager.js

import { auth, db } from './firebase_config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { doc, setDoc, getDoc, deleteDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { Character, setPlayer, recalculateDerivedStats, createCharacterData } from './state.js';
import { showNotification } from './notifications.js';
import { updateUIBasedOnPage } from '../modules/ui.js';

export let userId = null;

// Référence à la collection de personnages
function getCharacterRef(userUID) {
    return doc(db, "artifacts", "default-app-id", "users", userUID, "characters", userUID);
}

/**
 * Gère la déconnexion de l'utilisateur.
 */
export async function handleSignOut() {
    try {
        await signOut(auth);
        window.location.href = "login.html";
    } catch (error) {
        console.error("Erreur de déconnexion :", error);
        showNotification("Erreur de déconnexion. Veuillez réessayer.", 'error');
    }
}

/**
 * Sauvegarde les données du personnage dans Firestore.
 * @param {object} playerData Les données du personnage à sauvegarder.
 */
export async function saveCharacterData(playerData) {
    if (!userId) {
        console.error("Erreur : Utilisateur non authentifié.");
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

/**
 * Gère la création d'un nouveau personnage.
 * @param {string} name Le nom du personnage.
 * @param {string} charClass La classe du personnage.
 */
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
    const characterRef = getCharacterRef(userId);
    try {
        await deleteDoc(characterRef);
        showNotification("Personnage supprimé avec succès !", "info");
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
        userId = user ? user.uid : null;
        
        if (!user) {
            // L'utilisateur n'est pas connecté. On le redirige vers la page de connexion
            // si la page actuelle est une page protégée.
            const protectedPages = ['world_map.html', 'gestion_personnage.html', 'quests.html'];
            const currentPage = window.location.pathname.split('/').pop();
            if (protectedPages.includes(currentPage)) {
                window.location.href = "login.html";
            }
            // Mettre à jour l'interface pour un état déconnecté
            updateUIBasedOnPage(null);
        } else {
            // L'utilisateur est connecté. On écoute les données du personnage.
            const characterRef = getCharacterRef(userId);
            onSnapshot(characterRef, (docSnap) => {
                const characterData = docSnap.exists() ? docSnap.data() : null;
                const char = characterData ? new Character(
                    characterData.name, characterData.playerClass, characterData.level, characterData.xp, characterData.gold,
                    characterData.stats, characterData.quests, characterData.inventory, characterData.equipment,
                    characterData.abilities, characterData.hp, characterData.maxHp, characterData.mana, characterData.maxMana,
                    characterData.safePlaceLocation, characterData.journal
                ) : null;
                if (char) {
                    char.statPoints = characterData.statPoints;
                    recalculateDerivedStats(char);
                }
                setPlayer(char);
                updateUIBasedOnPage(char);
            }, (error) => {
                console.error("Erreur de synchronisation en temps réel:", error);
                showNotification("Erreur de synchronisation des données.", 'error');
                setPlayer(null);
                updateUIBasedOnPage(null);
            });
        }
    });
}