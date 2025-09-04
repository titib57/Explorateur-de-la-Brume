// Fichier : js/modules/inventory.js

import { player } from '../core/state.js';
import { itemsData } from '../core/gameData.js';
import { showNotification } from '../core/notifications.js';

import { doc, getDoc, runTransaction } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { auth, db } from '../firebase_config.js';

const USERS_COLLECTION = "users";

/**
 * Structure de données optimisée pour une recherche rapide de tous les objets.
 */
const allItems = {
    ...itemsData.weapons,
    ...itemsData.armors,
    ...itemsData.consumables
};

/**
 * Fonction utilitaire pour trouver un objet par son ID.
 */
function findItemById(itemId) {
    if (!itemId) return null;
    return allItems[itemId];
}

/**
 * Gère le chargement de l'inventaire et de l'équipement du joueur depuis Firestore.
 */
async function loadAndDisplayInventory() {
    if (!auth.currentUser) return;

    try {
        const userDocRef = doc(db, USERS_COLLECTION, auth.currentUser.uid);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
            const userData = docSnap.data();
            player.inventory = userData.inventory || [];
            player.equipment = userData.equipment || { weapon: null, armor: null };
            updateInventoryPageUI();
            showNotification("Inventaire et équipement chargés depuis Firestore.", 'success');
        } else {
            console.warn("Document utilisateur introuvable. L'inventaire est vide.");
            player.inventory = [];
            player.equipment = { weapon: null, armor: null };
            updateInventoryPageUI();
        }
    } catch (error) {
        console.error("Erreur lors du chargement des données depuis Firestore:", error);
        showNotification("Erreur lors du chargement des données.", 'error');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadAndDisplayInventory();
    setupInventoryEventListeners();
});

/**
 * Configure un seul écouteur d'événements sur le conteneur de l'inventaire
 * pour gérer les clics sur les boutons d'utilisation.
 */
function setupInventoryEventListeners() {
    const inventoryItemsGrid = document.getElementById('inventory-items-grid');
    if (!inventoryItemsGrid) return;

    inventoryItemsGrid.addEventListener('click', (e) => {
        const target = e.target;
        // On ne gère plus que l'utilisation ici
        if (target.classList.contains('use-btn')) {
            const itemId = target.dataset.itemId;
            useItem(itemId);
        }
    });

    // Les écouteurs pour les boutons déséquiper seront gérés ailleurs (équipement.js)
}

export function updateInventoryPageUI() {
    if (!player) return;
    const inventoryItemsGrid = document.getElementById('inventory-items-grid');
    if (!inventoryItemsGrid) return;

    inventoryItemsGrid.innerHTML = '';
    
    player.inventory.forEach(itemId => {
        const item = findItemById(itemId);
        if (!item) return;

        const itemElement = document.createElement('div');
        itemElement.classList.add('inventory-item', `rarity-${item.rarity || 'common'}`);

        let itemInfo = `<img src="${item.iconPath}" alt="${item.name}">
                        <span class="item-name">${item.name}</span>
                        <div class="tooltip">
                            <h4>${item.name}</h4>
                            <p>Rareté: ${item.rarity || 'common'}</p>
                            <p>${item.description}</p>`;

        // Seuls les consommables ont un bouton 'utiliser' ici
        if (item.type === 'consumable') {
            itemInfo += `<button class="use-btn" data-item-id="${item.id}">Utiliser</button>`;
        }
        
        itemInfo += `</div>`;
        itemElement.innerHTML = itemInfo;
        inventoryItemsGrid.appendChild(itemElement);
    });

    // L'affichage de l'équipement sera géré par une autre fonction dans un autre fichier
    const equippedWeapon = findItemById(player.equipment.weapon);
    const equippedArmor = findItemById(player.equipment.armor);
    
    document.getElementById('equipped-weapon-name').textContent = equippedWeapon ? equippedWeapon.name : 'Aucune';
    document.getElementById('equipped-armor-name').textContent = equippedArmor ? equippedArmor.name : 'Aucune';
    
    document.getElementById('equipped-weapon-icon').src = equippedWeapon ? equippedWeapon.iconPath : '';
    document.getElementById('equipped-armor-icon').src = equippedArmor ? equippedArmor.iconPath : '';
    
    // On ne gère plus l'affichage des boutons déséquiper ici
    const unequipWeaponBtn = document.getElementById('unequip-weapon-btn');
    if (unequipWeaponBtn) {
        unequipWeaponBtn.style.display = equippedWeapon ? 'block' : 'none';
    }
    const unequipArmorBtn = document.getElementById('unequip-armor-btn');
    if (unequipArmorBtn) {
        unequipArmorBtn.style.display = equippedArmor ? 'block' : 'none';
    }
}

/**
 * Ajoute un objet à l'inventaire du joueur dans Firestore.
 * Cette opération est atomique grâce à la transaction.
 * @param {string} itemId L'ID de l'objet.
 */
export async function addItem(itemId) {
    if (!auth.currentUser) {
        showNotification("Vous devez être connecté pour ajouter des objets.", 'error');
        return;
    }

    try {
        await runTransaction(db, async (transaction) => {
            const userDocRef = doc(db, USERS_COLLECTION, auth.currentUser.uid);
            const docSnap = await transaction.get(userDocRef);
            if (!docSnap.exists()) {
                throw new Error("Document utilisateur introuvable.");
            }

            const userData = docSnap.data();
            const currentInventory = userData.inventory || [];
            currentInventory.push(itemId);
            
            transaction.update(userDocRef, { inventory: currentInventory });
        });

        const item = findItemById(itemId);
        // Mettre à jour l'état local après la réussite de la transaction
        player.inventory.push(itemId);
        updateInventoryPageUI(); // Mise à jour de l'UI
        showNotification(`L'objet ${item.name} a été ajouté à l'inventaire.`, 'success');
    } catch (error) {
        console.error("Erreur lors de l'ajout de l'objet:", error);
        showNotification(error.message || "Erreur lors de l'ajout de l'objet.", 'error');
    }
}

/**
 * Gère l'utilisation d'un objet consomptible via une transaction Firestore.
 */
export async function useItem(itemId) {
    if (!auth.currentUser) {
        showNotification("Vous devez être connecté pour utiliser des objets.", 'error');
        return;
    }

    try {
        await runTransaction(db, async (transaction) => {
            const userDocRef = doc(db, USERS_COLLECTION, auth.currentUser.uid);
            const docSnap = await transaction.get(userDocRef);
            if (!docSnap.exists()) {
                throw new Error("Document utilisateur introuvable.");
            }

            const userData = docSnap.data();
            const currentInventory = userData.inventory || [];
            const item = findItemById(itemId);
            
            const itemIndex = currentInventory.indexOf(itemId);
            if (itemIndex > -1 && item && item.type === 'consumable') {
                currentInventory.splice(itemIndex, 1);
                
                if (item.effect.hp) player.hp = Math.min(player.maxHp, player.hp + item.effect.hp);
                if (item.effect.mana) player.mana = Math.min(player.maxMana, player.mana + item.effect.mana);

                transaction.update(userDocRef, { inventory: currentInventory });
            } else {
                throw new Error("L'objet n'est pas dans l'inventaire ou ne peut pas être utilisé.");
            }
        });

        const item = findItemById(itemId);
        updateInventoryPageUI();
        showNotification(`Vous avez utilisé ${item.name}.`, 'success');
    } catch (error) {
        console.error("Erreur lors de l'utilisation de l'objet:", error);
        showNotification(error.message || "Erreur lors de l'utilisation de l'objet.", 'error');
    }
}