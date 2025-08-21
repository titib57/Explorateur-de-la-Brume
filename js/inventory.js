// Fichier : js/inventory.js

function updateConsumablesUI() {
    const consumablesList = document.getElementById('consumable-list');
    if (!consumablesList) return;
    consumablesList.innerHTML = '';
    
    const uniqueConsumables = {};
    player.inventory.forEach(item => {
        if (item.type === 'consumable') {
            uniqueConsumables[item.id] = (uniqueConsumables[item.id] || 0) + 1;
        }
    });

    for (const itemId in uniqueConsumables) {
        const item = itemsData.consumables[itemId];
        const count = uniqueConsumables[itemId];
        const li = document.createElement('li');
        li.innerHTML = `${item.name} x${count} <button onclick="useItem('${itemId}')">Utiliser</button>`;
        consumablesList.appendChild(li);
    }
}

function useItem(itemId) {
    const itemIndex = player.inventory.findIndex(item => item.id === itemId);
    if (itemIndex > -1) {
        const item = player.inventory[itemIndex];
        if (item.type === 'consumable') {
            if (item.effect.hp) {
                player.hp = Math.min(player.maxHp, player.hp + item.effect.hp);
                showNotification(`Vous utilisez une ${item.name} et vous soignez de ${item.effect.hp} PV.`, 'info');
                updateQuestObjective('use_item', item.id);
            }
            player.inventory.splice(itemIndex, 1);
            saveCharacter(player);
            // La logique de combat doit être mise à jour après l'utilisation
            updateBattleUI();
        }
    } else {
        console.error("Objet non trouvé dans l'inventaire :", itemId);
    }
}

function updateInventoryPageUI() {
    const inventoryItemsList = document.getElementById('inventory-items-list');
    const equippedWeapon = document.getElementById('equipped-weapon');
    const equippedArmor = document.getElementById('equipped-armor');

    if (!inventoryItemsList || !equippedWeapon || !equippedArmor) return;

    inventoryItemsList.innerHTML = '';

    player.inventory.forEach((item, index) => {
        const li = document.createElement('li');
        let itemInfo = `${item.name}`;
        
        if (item.type === 'weapon' || item.type === 'armor') {
            const equippedId = player.equipment[item.type]?.id;
            const isEquipped = equippedId === item.id;
            const buttonText = isEquipped ? 'Déséquiper' : 'Équiper';
            const action = isEquipped ? 'unequip' : 'equip';
            itemInfo += ` <button onclick="${action}Item('${item.id}', '${item.type}')">${buttonText}</button>`;
        } else if (item.type === 'consumable') {
            itemInfo += ` <button onclick="useItem('${item.id}')">Utiliser</button>`;
        }
        
        li.innerHTML = itemInfo;
        inventoryItemsList.appendChild(li);
    });

    equippedWeapon.textContent = player.equipment.weapon ? player.equipment.weapon.name : 'Aucune';
    equippedArmor.textContent = player.equipment.armor ? player.equipment.armor.name : 'Aucune';
}

function equipItem(itemId, type) {
    const itemIndex = player.inventory.findIndex(item => item.id === itemId);
    if (itemIndex > -1) {
        const item = player.inventory[itemIndex];
        if (item.type === type) {
            if (player.equipment[type]) {
                player.inventory.push(player.equipment[type]);
            }
            player.equipment[type] = item;
            player.inventory.splice(itemIndex, 1);
            recalculateDerivedStats();
            saveCharacter(player);
            updateInventoryPageUI();
        }
    }
}

function unequipItem(type) {
    const item = player.equipment[type];
    if (item) {
        player.inventory.push(item);
        player.equipment[type] = null;
        recalculateDerivedStats();
        saveCharacter(player);
        updateInventoryPageUI();
    }
}