// Fichier : js/core/characterManager.js
// Ce module gère les interactions avec l'état du personnage et sa persistance.

import { player, savePlayer, deleteCharacterData, userId } from './state.js';
import { showNotification } from './notifications.js';
import { questsData } from '../data/gameData.js'; // Importe les données de quête
import { auth, db } from './firebase_config.js';
import { updateCharacterUI } from '../modules/characterUI.js';

import { onSnapshot, doc } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

/**
 * Initialise le personnage avec la quête de départ si nécessaire.
 * @param {object} character Le personnage à initialiser.
 */
export function initializeCharacter(character) {
    if (character && (!character.quests || !character.quests.current)) {
        character.quests = {
            current: {
                questId: 'initial_adventure_quest',
                currentProgress: 0,
                ...questsData.initial_adventure_quest // Assurez-vous d'avoir une structure adéquate
            }
        };
        showNotification("Nouvelle quête : Aventure initiale !", 'quest');
        savePlayer(character);
    }
}

/**
 * Établit l'écouteur en temps réel pour les données du personnage.
 */
export function setupCharacterListener() {
    if (!userId) {
        console.warn("L'ID utilisateur n'est pas disponible, l'écouteur ne sera pas activé.");
        updateCharacterUI(null, null);
        return;
    }

    const characterRef = doc(db, "artifacts", "default-app-id", "users", userId, "characters", userId);
    
    onSnapshot(characterRef, (docSnapshot) => {
        const characterData = docSnapshot.exists() ? docSnapshot.data() : null;
        if (characterData) {
            initializeCharacter(characterData);
            savePlayer(characterData); // Met à jour l'état local
        }
        updateCharacterUI(characterData, userId);
    }, (error) => {
        console.error("Erreur lors de l'écoute du personnage : ", error);
        showNotification("Erreur de synchronisation des données.", 'error');
        updateCharacterUI(null, userId);
    });
}

/**
 * Crée un nouveau personnage et le sauvegarde.
 * @param {string} name Le nom du personnage.
 * @param {string} charClass La classe du personnage.
 */
export function createNewCharacter(name, charClass) {
    const newCharacterData = {
        name: name,
        class: charClass,
        xp: 0,
        level: 1,
        quests: {
            current: {
                questId: 'initial_adventure_quest',
                currentProgress: 0
            }
        },
        createdAt: new Date().toISOString(),
        lastPlayed: new Date().toISOString()
    };
    savePlayer(newCharacterData);
    showNotification(`Bienvenue, ${name}!`, 'success');
}

/**
 * Supprime le personnage actuel.
 */
export async function deleteCharacter() {
    if (auth.currentUser) {
        await deleteCharacterData(auth.currentUser);
        showNotification("Votre personnage a été supprimé.", 'success');
    } else {
        console.error("Aucun utilisateur connecté pour la suppression.");
        showNotification("Impossible de supprimer le personnage, utilisateur non connecté.", 'error');
    }
}