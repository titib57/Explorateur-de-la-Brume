// Fichier : js/modules/inventory.js

import { player } from '../core/state.js';
import { itemsData } from '../core/gameData.js';
import { showNotification } from '../core/notifications.js';
import { recalculateDerivedStats } from './character.js';

import { doc, getDoc, runTransaction } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { auth, db } from '../firebase_config.js';

const USERS_COLLECTION = "users";

/**
 * Fonction utilitaire pour trouver un objet par son ID.
 * @param {string} itemId L'ID de l'objet à trouver.
 * @returns {object|null} L'objet trouvé ou null.
 */
function findItemById(itemId) {
    if (!itemId) return null;
    return itemsData.weapons[itemId] || itemsData.armors[itemId] || itemsData.consumables[itemId];
}

/**
 * Gère le chargement de l'inventaire du joueur depuis Firestore.
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

document.addEventListener('DOMContentLoaded', loadAndDisplayInventory);

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

        if (item.type === 'weapon' || item.type === 'armor') {
            itemInfo += `<button class="equip-btn" data-item-id="${item.id}" data-item-type="${item.type}">Équiper</button>`;
        } else if (item.type === 'consumable') {
            itemInfo += `<button class="use-btn" data-item-id="${item.id}">Utiliser</button>`;
        }
        
        itemInfo += `</div>`;
        itemElement.innerHTML = itemInfo;
        inventoryItemsGrid.appendChild(itemElement);
    });

    document.querySelectorAll('.equip-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const itemId = e.target.dataset.itemId;
            const itemType = e.target.dataset.itemType;
            equipItem(itemId, itemType);
        });
    });

    document.querySelectorAll('.use-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const itemId = e.target.dataset.itemId;
            useItem(itemId);
        });
    });

    const equippedWeapon = findItemById(player.equipment.weapon);
    const equippedArmor = findItemById(player.equipment.armor);
    
    document.getElementById('equipped-weapon-name').textContent = equippedWeapon ? equippedWeapon.name : 'Aucune';
    document.getElementById('equipped-armor-name').textContent = equippedArmor ? equippedArmor.name : 'Aucune';
    
    document.getElementById('equipped-weapon-icon').src = equippedWeapon ? equippedWeapon.iconPath : '';
    document.getElementById('equipped-armor-icon').src = equippedArmor ? equippedArmor.iconPath : '';
    
    const unequipWeaponBtn = document.getElementById('unequip-weapon-btn');
    if (unequipWeaponBtn) {
        unequipWeaponBtn.style.display = equippedWeapon ? 'block' : 'none';
        unequipWeaponBtn.addEventListener('click', () => unequipItem('weapon'));
    }
    const unequipArmorBtn = document.getElementById('unequip-armor-btn');
    if (unequipArmorBtn) {
        unequipArmorBtn.style.display = equippedArmor ? 'block' : 'none';
        unequipArmorBtn.addEventListener('click', () => unequipItem('armor'));
    }
}

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
            const item = findItemById(itemId);

            const itemIndex = currentInventory.indexOf(itemId);
            if (itemIndex > -1 && item && item.type === type) {
                if (currentEquipment[type]) {
                    currentInventory.push(currentEquipment[type]);
                }
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
        
        player.equipment = result.currentEquipment;
        player.inventory = result.currentInventory;
        recalculateDerivedStats();
        updateInventoryPageUI();
        showNotification(`${findItemById(itemId).name} a été équipé.`, 'success');

    } catch (error) {
        console.error("Erreur lors de l'équipement de l'objet:", error);
        showNotification(error.message || "Erreur lors de l'équipement de l'objet.", 'error');
    }
}

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
                currentInventory.push(equippedItemId);
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
        
        player.equipment = result.currentEquipment;
        player.inventory = result.currentInventory;
        recalculateDerivedStats();
        updateInventoryPageUI();
        showNotification(`L'objet a été déséquipé.`, 'info');

    } catch (error) {
        console.error("Erreur lors du déséquipement:", error);
        showNotification(error.message || "Erreur lors du déséquipement.", 'error');
    }
}