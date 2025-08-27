// Fichier : js/modules/inventory.js

import { player, savePlayer, loadCharacter } from '../core/state.js';
import { itemsData, itemSets } from '../core/gameData.js';
import { showNotification } from '../core/notifications.js';
import { recalculateDerivedStats } from './character.js';

document.addEventListener('DOMContentLoaded', () => {
    if (!loadCharacter()) {
        return;
    }
    updateInventoryPageUI();
});

export function updateInventoryPageUI() {
    if (!player) return;
    const inventoryItemsGrid = document.getElementById('inventory-items-grid');
    if (!inventoryItemsGrid) return;

    inventoryItemsGrid.innerHTML = '';
    const items = player.inventory.map(itemId => itemsData.weapons[itemId] || itemsData.armors[itemId] || itemsData.consumables[itemId]);
    
    items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.classList.add('inventory-item', `rarity-${item.rarity || 'common'}`);
        
        let itemInfo = `<img src="${item.iconPath}" alt="${item.name}">
                        <span class="item-name">${item.name}</span>
                        <div class="tooltip">
                            <h4>${item.name}</h4>
                            <p>Rareté: ${item.rarity || 'common'}</p>
                            <p>${item.description}</p>`;

        if (item.type === 'weapon' || item.type === 'armor') {
            itemInfo += `<button onclick="equipItem('${item.id}', '${item.type}')">Équiper</button>`;
        } else if (item.type === 'consumable') {
            itemInfo += `<button onclick="useItem('${item.id}')">Utiliser</button>`;
        }
        
        itemInfo += `</div>`;
        itemElement.innerHTML = itemInfo;
        inventoryItemsGrid.appendChild(itemElement);
    });

    // Update equipped items display
    document.getElementById('equipped-weapon-name').textContent = player.equipment.weapon ? player.equipment.weapon.name : 'Aucune';
    document.getElementById('equipped-armor-name').textContent = player.equipment.armor ? player.equipment.armor.name : 'Aucune';
    
    document.getElementById('equipped-weapon-icon').src = player.equipment.weapon ? player.equipment.weapon.iconPath : '';
    document.getElementById('equipped-armor-icon').src = player.equipment.armor ? player.equipment.armor.iconPath : '';
}

export function useItem(itemId) {
    const item = itemsData.consumables[itemId];
    if (!item) {
        showNotification("Cet objet ne peut pas être utilisé.", 'error');
        return;
    }

    if (item.effect.hp) {
        player.hp = Math.min(player.maxHp, player.hp + item.effect.hp);
        showNotification(`Vous avez récupéré ${item.effect.hp} PV.`, 'success');
    }
    if (item.effect.mana) {
        player.mana = Math.min(player.maxMana, player.mana + item.effect.mana);
        showNotification(`Vous avez récupéré ${item.effect.mana} Mana.`, 'success');
    }

    // Retirer l'objet de l'inventaire
    const index = player.inventory.indexOf(itemId);
    if (index > -1) {
        player.inventory.splice(index, 1);
    }
    
    savePlayer(player);
    updateInventoryPageUI();
    updateConsumablesUI();
}

export function equipItem(itemId, type) {
    const itemIndex = player.inventory.findIndex(item => item.id === itemId);
    if (itemIndex > -1) {
        const item = player.inventory[itemIndex];
        if (item.type === type) {
            if (player.equipment[type]) {
                player.inventory.push(player.equipment[type].id);
            }
            player.equipment[type] = item;
            player.inventory.splice(itemIndex, 1);
            recalculateDerivedStats();
            savePlayer(player);
            updateInventoryPageUI();
            showNotification(`${item.name} a été équipé.`, 'success');
        }
    }
}

export function unequipItem(type) {
    const item = player.equipment[type];
    if (item) {
        player.inventory.push(item.id);
        player.equipment[type] = null;
        recalculateDerivedStats();
        savePlayer(player);
        updateInventoryPageUI();
        showNotification(`${item.name} a été déséquipé.`, 'info');
    }
}