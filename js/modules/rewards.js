/**
 * @fileoverview Module de gestion des récompenses de quêtes avec persistance Firestore.
 * Gère l'attribution d'objets, d'expérience, et d'autres gains aux personnages.
 * @namespace rewards
 */

// Importations des fonctions nécessaires de Firebase Firestore
import { doc, runTransaction } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
// Assurez-vous d'importer votre instance de base de données Firestore
import { db } from '../core/firebase_config.js'; 

/**
 * Attribue les récompenses de quête au personnage en mettant à jour son document Firestore.
 * @param {string} characterId - L'ID unique du personnage.
 * @param {object} rewards - Un objet contenant les récompenses à attribuer.
 * @param {number} [rewards.exp] - Le nombre de points d'expérience à donner.
 * @param {object} [rewards.items] - Un objet clé-valeur d'objets et de quantités.
 * @param {string[]} [rewards.skills] - Une liste de compétences à débloquer.
 * @returns {Promise<boolean>} Une promesse qui résout à vrai si la mise à jour est réussie, faux sinon.
 */
export async function giveRewards(characterId, rewards) {
    if (!characterId || !rewards) {
        console.error("Erreur: ID du personnage ou récompenses manquantes.");
        return false;
    }

    const characterRef = doc(db, 'characters', characterId);

    try {
        await runTransaction(db, async (transaction) => {
            const characterDoc = await transaction.get(characterRef);
            if (!characterDoc.exists()) {
                throw new Error("Le document du personnage n'existe pas.");
            }
            
            const characterData = characterDoc.data();
            const updatedData = {};
            let logMessages = [];

            // 1. Gérer les récompenses d'expérience
            if (rewards.exp) {
                const currentExp = characterData.stats.experience || 0;
                updatedData['stats.experience'] = currentExp + rewards.exp;
                logMessages.push(`+${rewards.exp} XP gagnés !`);
            }

            // 2. Gérer les récompenses d'objets
            if (rewards.items) {
                const currentInventory = characterData.inventory || {};
                const updatedInventory = { ...currentInventory };
                for (const [itemId, quantity] of Object.entries(rewards.items)) {
                    updatedInventory[itemId] = (updatedInventory[itemId] || 0) + quantity;
                    logMessages.push(`+${quantity} x ${itemId} ajoutés à l'inventaire.`);
                }
                updatedData['inventory'] = updatedInventory;
            }

            // 3. Gérer les récompenses de compétences
            if (rewards.skills) {
                const currentSkills = characterData.skills || [];
                const updatedSkills = new Set(currentSkills); // Utilisation d'un Set pour éviter les doublons
                rewards.skills.forEach(skillId => {
                    if (!updatedSkills.has(skillId)) {
                        updatedSkills.add(skillId);
                        logMessages.push(`Compétence débloquée: ${skillId}.`);
                    }
                });
                updatedData['skills'] = Array.from(updatedSkills);
            }

            // Mettre à jour le document avec les champs modifiés
            transaction.update(characterRef, updatedData);
            logMessages.forEach(msg => console.log(msg));
            console.log("Toutes les récompenses ont été attribuées avec succès et sauvegardées. 🎉");
        });

        return true;
    } catch (error) {
        console.error("Échec de la transaction pour l'attribution des récompenses:", error);
        return false;
    }
}