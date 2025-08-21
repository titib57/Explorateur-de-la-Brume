// Fichier : js/inventory.js

// Données fictives d'objets (À FUSIONNER AVEC VOTRE FICHIER data.js)

function updateInventoryPageUI() {
    const equippedWeaponIcon = document.getElementById('equipped-weapon-icon');
    const equippedWeaponName = document.getElementById('equipped-weapon-name');
    const equippedArmorIcon = document.getElementById('equipped-armor-icon');
    const equippedArmorName = document.getElementById('equipped-armor-name');
    const inventoryGrid = document.getElementById('inventory-items-grid');

    if (!inventoryGrid) return;
    inventoryGrid.innerHTML = '';
    
    // Affichage de l'équipement
    if (player.equipment.weapon) {
        equippedWeaponIcon.src = itemsData.weapons[player.equipment.weapon.id].iconPath;
        equippedWeaponName.textContent = player.equipment.weapon.name;
    } else {
        equippedWeaponIcon.src = '';
        equippedWeaponName.textContent = 'Aucune';
    }

    if (player.equipment.armor) {
        equippedArmorIcon.src = itemsData.armors[player.equipment.armor.id].iconPath;
        equippedArmorName.textContent = player.equipment.armor.name;
    } else {
        equippedArmorIcon.src = '';
        equippedArmorName.textContent = 'Aucune';
    }

    // Affichage des objets dans la grille
    player.inventory.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'inventory-item';

        const itemData = itemsData[item.type + 's'][item.id];
        if (!itemData) return;
        
        itemElement.innerHTML = `
            <img src="${itemData.iconPath}" alt="${itemData.name}">
            <span class="item-name">${itemData.name}</span>
            <div class="tooltip">
                <p><b>${itemData.name}</b></p>
                <p>Type: ${itemData.type}</p>
                <p>${itemData.description || "Pas de description"}</p>
            </div>
        `;
        
        itemElement.addEventListener('click', () => {
            if (item.type === 'weapon') {
                equipItem(item.id, 'weapon');
            } else if (item.type === 'armor') {
                equipItem(item.id, 'armor');
            } else if (item.type === 'consumable') {
                useItem(item.id);
            }
        });

        inventoryGrid.appendChild(itemElement);
    });
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
            updateInventoryPageUI();
        }
    }
}