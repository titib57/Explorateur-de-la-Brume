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
        }
    }
}

// Mise à jour de l'interface de l'inventaire
function updateInventoryPageUI() {
    const inventoryItemsList = document.getElementById('inventory-items-list');
    if (!inventoryItemsList) return;
    inventoryItemsList.innerHTML = '';

    const equippedWeapon = document.getElementById('equipped-weapon');
    const equippedArmor = document.getElementById('equipped-armor');
    const equippedTalisman = document.getElementById('equipped-talisman'); // <-- Ajout de l'ID du talisman

    // Ajout d'une nouvelle ligne pour le talisman
    document.getElementById('equipment-display').innerHTML = `
        <h3>Équipement actuel</h3>
        <p>Arme: <span id="equipped-weapon">${player.equipment.weapon ? player.equipment.weapon.name : 'Aucune'}</span></p>
        <p>Armure: <span id="equipped-armor">${player.equipment.armor ? player.equipment.armor.name : 'Aucune'}</span></p>
        <p>Talisman: <span id="equipped-talisman">${player.equipment.talisman ? player.equipment.talisman.name : 'Aucun'}</span></p>
    `;

    player.inventory.forEach(item => {
        const li = document.createElement('li');
        let itemInfo = `${item.name} (${item.description})`;
        
        const isEquipped = (player.equipment.weapon && player.equipment.weapon.id === item.id) ||
                           (player.equipment.armor && player.equipment.armor.id === item.id) ||
                           (player.equipment.talisman && player.equipment.talisman.id === item.id);

        if (item.type === 'weapon' || item.type === 'armor' || item.type === 'talisman') { // <-- Ajout du type 'talisman'
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
    equippedTalisman.textContent = player.equipment.talisman ? player.equipment.talisman.name : 'Aucun'; // <-- Ajout du talisman
}

function equipItem(itemId, type) {
    const itemIndex = player.inventory.findIndex(item => item.id === itemId);
    if (itemIndex > -1) {
        const item = player.inventory[itemIndex];
        if (item.type === type) {
            // Déséquiper l'objet déjà équipé s'il y en a un
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

function giveItemToPlayer(itemId, amount = 1) {
    for (let i = 0; i < amount; i++) {
        const itemData = itemsData.consumables[itemId] || itemsData.weapons[itemId] || itemsData.armors[itemId] || itemsData.talismans[itemId];
        if (itemData) {
            player.inventory.push({ ...itemData });
        }
    }
    saveCharacter(player);
    showNotification(`${amount} ${itemData.name}(s) ajouté(s) à votre inventaire.`, 'info');
}