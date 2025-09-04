// Fichier : js/modules/equipment.js

// Imports nécessaires pour le fonctionnement des transactions et de l'interface utilisateur
import { player, updateStatsDisplay, recalculateDerivedStats } from '../core/state.js';
import { itemsData } from '../core/gameData.js';
import { showNotification } from '../core/notifications.js';

// Imports Firebase
import { doc, runTransaction } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { auth, db } from '../firebase_config.js';

const USERS_COLLECTION = "users";

// Structure de données optimisée pour une recherche rapide des objets.
const allItems = {
    ...itemsData.weapons,
    ...itemsData.armors
};

/**
 * Fonction utilitaire pour trouver un objet d'équipement par son ID.
 * Utilise la structure de données optimisée pour une recherche en O(1).
 * @param {string} itemId L'ID de l'objet à trouver.
 * @returns {object|null} L'objet trouvé ou null.
 */
function findEquipmentItemById(itemId) {
    if (!itemId) return null;
    return allItems[itemId];
}

/**
 * Gère l'équipement d'un objet via une transaction Firestore.
 * Assure la cohérence des données en manipulant l'inventaire et l'équipement simultanément.
 * @param {string} itemId L'ID de l'objet à équiper.
 * @param {string} type Le type de l'objet (arme ou armure).
 */
export async function equipItem(itemId, type) {
    if (!auth.currentUser) {
        showNotification("Vous devez être connecté pour équiper des objets.", 'error');
        return;
    }

    try {
        const result = await runTransaction(db, async (transaction) => {
            const userDocRef = doc(db, USERS_COLLECTION, auth.currentUser.uid);
            const docSnap = await transaction.get(userDocRef);
            if (!docSnap.exists()) {
                throw new Error("Document utilisateur introuvable.");
            }

            const userData = docSnap.data();
            const currentEquipment = userData.equipment || {};
            const currentInventory = userData.inventory || [];
            const item = findEquipmentItemById(itemId);

            const itemIndex = currentInventory.indexOf(itemId);
            if (itemIndex > -1 && item && item.type === type) {
                // Si un objet est déjà équipé, le renvoyer à l'inventaire
                if (currentEquipment[type]) {
                    currentInventory.push(currentEquipment[type]);
                }
                // Équiper le nouvel objet et le retirer de l'inventaire
                currentEquipment[type] = itemId;
                currentInventory.splice(itemIndex, 1);
                
                transaction.update(userDocRef, {
                    inventory: currentInventory,
                    equipment: currentEquipment
                });
                return { currentEquipment, currentInventory };
            } else {
                 throw new Error("Cet objet ne peut pas être équipé.");
            }
        });
        
        // Mettre à jour l'état local après le succès de la transaction
        player.equipment = result.currentEquipment;
        player.inventory = result.currentInventory;
        recalculateDerivedStats();
        updateStatsDisplay(); // Mise à jour de l'affichage des stats
        showNotification(`${findEquipmentItemById(itemId).name} a été équipé.`, 'success');
        
    } catch (error) {
        console.error("Erreur lors de l'équipement de l'objet:", error);
        showNotification(error.message || "Erreur lors de l'équipement de l'objet.", 'error');
    }
}

/**
 * Gère le déséquipement d'un objet via une transaction Firestore.
 * @param {string} type Le type d'objet à déséquiper (arme ou armure).
 */
export async function unequipItem(type) {
    if (!auth.currentUser) {
        showNotification("Vous devez être connecté pour déséquiper des objets.", 'error');
        return;
    }

    try {
        const result = await runTransaction(db, async (transaction) => {
            const userDocRef = doc(db, USERS_COLLECTION, auth.currentUser.uid);
            const docSnap = await transaction.get(userDocRef);
            if (!docSnap.exists()) {
                throw new Error("Document utilisateur introuvable.");
            }

            const userData = docSnap.data();
            const currentEquipment = userData.equipment || {};
            const currentInventory = userData.inventory || [];
            const equippedItemId = currentEquipment[type];

            if (equippedItemId) {
                // Renvoyer l'objet déséquipé à l'inventaire
                currentInventory.push(equippedItemId);
                // Déséquiper l'emplacement
                currentEquipment[type] = null;
                
                transaction.update(userDocRef, {
                    inventory: currentInventory,
                    equipment: currentEquipment
                });
                return { currentEquipment, currentInventory };
            } else {
                 throw new Error("Rien n'est équipé.");
            }
        });
        
        // Mettre à jour l'état local après le succès de la transaction
        player.equipment = result.currentEquipment;
        player.inventory = result.currentInventory;
        recalculateDerivedStats();
        updateStatsDisplay(); // Mise à jour de l'affichage des stats
        showNotification(`L'objet a été déséquipé.`, 'info');
        
    } catch (error) {
        console.error("Erreur lors du déséquipement:", error);
        showNotification(error.message || "Erreur lors du déséquipement.", 'error');
    }
}