// Fichier : js/inventory.js

function updateInventoryPageUI() {
    const equippedWeaponName = document.getElementById('equipped-weapon-name');
    const equippedArmorName = document.getElementById('equipped-armor-name');
    const equippedWeaponIcon = document.getElementById('equipped-weapon-icon');
    const equippedArmorIcon = document.getElementById('equipped-armor-icon');
    const inventoryItemsGrid = document.getElementById('inventory-items-grid');

    if (!equippedWeaponName || !equippedArmorName || !inventoryItemsGrid) return;
    
    equippedWeaponName.textContent = player.equipment.weapon ? player.equipment.weapon.name : 'Aucune';
    equippedArmorName.textContent = player.equipment.armor ? player.equipment.armor.name : 'Aucune';
    equippedWeaponIcon.src = player.equipment.weapon ? player.equipment.weapon.iconPath : '';
    equippedArmorIcon.src = player.equipment.armor ? player.equipment.armor.iconPath : '';
    
    inventoryItemsGrid.innerHTML = '';

    player.inventory.forEach(itemId => {
        const item = getItemById(itemId);
        if (!item) return;

        const itemElement = document.createElement('div');
        itemElement.classList.add('item-card', `rarity-${item.rarity}`);
        
        let actions = '';
        if (item.type === 'weapon' || item.type === 'armor') {
            const isEquipped = (player.equipment.weapon && player.equipment.weapon.id === item.id) || (player.equipment.armor && player.equipment.armor.id === item.id);
            const actionText = isEquipped ? 'Déséquiper' : 'Équiper';
            const actionFunc = isEquipped ? `unequipItem('${item.type}')` : `equipItem('${item.id}')`;
            actions += `<button onclick="${actionFunc}">${actionText}</button>`;
        } else if (item.type === 'consumable') {
            actions += `<button onclick="useItem('${item.id}')">Utiliser</button>`;
        }
        
        itemElement.innerHTML = `
            <img src="${item.iconPath}" alt="${item.name}">
            <p>${item.name}</p>
            ${actions}
        `;

        inventoryItemsGrid.appendChild(itemElement);
    });
}

function equipItem(itemId) {
    const item = getItemById(itemId);
    if (!item) {
        showNotification("Cet objet n'existe pas.", 'error');
        return;
    }
    
    if (item.levelRequirement && player.level < item.levelRequirement) {
        showNotification(`Vous devez être de niveau ${item.levelRequirement} pour équiper cet objet.`, 'warning');
        return;
    }
    
    const itemIndex = player.inventory.findIndex(id => id === itemId);
    if (itemIndex > -1) {
        if (player.equipment[item.type]) {
            player.inventory.push(player.equipment[item.type].id);
        }
        player.equipment[item.type] = item;
        player.inventory.splice(itemIndex, 1);
        
        recalculateDerivedStats(player);
        saveCharacter(player);
        updateInventoryPageUI();
        showNotification(`${item.name} équipé(e).`, 'success');
    }
}

function unequipItem(type) {
    const item = player.equipment[type];
    if (item) {
        player.inventory.push(item.id);
        player.equipment[type] = null;
        recalculateDerivedStats(player);
        saveCharacter(player);
        updateInventoryPageUI();
        showNotification(`${item.name} déséquipé(e).`, 'info');
    }
}

function useItem(itemId) {
    const item = getItemById(itemId);
    if (!item || item.type !== 'consumable') {
        showNotification("Impossible d'utiliser cet objet.", 'error');
        return;
    }
    
    const itemIndex = player.inventory.findIndex(id => id === itemId);
    if (itemIndex > -1) {
        player.inventory.splice(itemIndex, 1);
        player.hp = Math.min(player.hp + item.heal, player.maxHp);
        player.mana = Math.min(player.mana + item.mana, player.maxMana);
        saveCharacter(player);
        showNotification(`Vous utilisez ${item.name}.`, 'info');
        updateInventoryPageUI();
    }
}