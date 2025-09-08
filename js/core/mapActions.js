// Fichier : js/core/mapActions.js
// Ce module gère la logique des actions liées à la carte, déclenchées par l'interface utilisateur.

import { player } from "./state.js";
import { showNotification } from "./notifications.js";
import { saveCharacterData } from "./authManager.js";
import { updateQuestProgress } from "./gameEngine.js";
import { getSelectedDungeon, getPlayerMarkerPosition, isPlayerInDungeonRange } from "../modules/map.js";
import { generateDungeon } from "../data/dungeons.js";

/**
 * Gère le clic sur le bouton "Définir le lieu sûr".
 */
export async function handleSetSafePlaceClick() {
    if (!player) {
        showNotification("Impossible de définir le lieu, personnage non chargé.", "error");
        return;
    }
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const safePlaceLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                player.safePlaceLocation = safePlaceLocation;
                try {
                    await saveCharacterData(player);
                    updateQuestProgress("define_shelter");
                    showNotification("Abri de survie défini et sauvegardé ! La quête est mise à jour.", "success");
                } catch (error) {
                    console.error("Erreur lors de la sauvegarde du lieu sûr:", error);
                    showNotification("Erreur lors de la sauvegarde du lieu sûr.", "error");
                }
            },
            (error) => {
                console.error("Erreur de géolocalisation:", error);
                showNotification("Impossible d'obtenir votre position pour définir le lieu sûr.", "error");
            }
        );
    } else {
        showNotification("La géolocalisation n'est pas supportée par votre navigateur.", "error");
    }
}

/**
 * Gère le clic sur le bouton "Entrer dans le donjon".
 */
export function handleStartBattleClick() {
    const selectedDungeon = getSelectedDungeon();
    const playerPosition = getPlayerMarkerPosition();

    if (!selectedDungeon) {
        showNotification("Veuillez sélectionner un donjon pour y entrer.", 'warning');
        return;
    }

    if (!isPlayerInDungeonRange(playerPosition)) {
        showNotification("Vous êtes trop loin de ce donjon pour y entrer.", 'warning');
        return;
    }

    // La logique de génération et de redirection est déplacée ici.
    generateDungeon(selectedDungeon.isTutorial ? 'tutoriel' : { lat: selectedDungeon.location.lat, lng: selectedDungeon.location.lng });
    window.location.href = 'battle.html';
}