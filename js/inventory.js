// Fichier : js/inventory.js

/**
 * Applique un effet temporaire au joueur qui sera retiré après une certaine durée.
 * @param {object} effect L'objet d'effet à appliquer.
 * @param {number} duration La durée de l'effet en secondes.
 * @param {string} itemId L'ID de l'objet qui a causé l'effet.
 */
function applyTemporaryEffect(effect, duration, itemId) {
    showNotification(`L'effet de ${itemsData.consumables[itemId].name} est actif pour ${duration} secondes !`, 'info');
    
    let statsToRestore = {};

    // Appliquer les bonus de stats
    if (effect.strengthBonus) {
        player.stats.strength += effect.strengthBonus;
        statsToRestore.strengthBonus = effect.strengthBonus;
    }
    // Ajoutez d'autres bonus de stats ici si nécessaire (e.g., intelligenceBonus, speedBonus)
    
    // Recalculer les stats dérivées pour que le bonus soit visible
    recalculateDerivedStats();
    saveCharacter(player);

    // Retirer les bonus après la durée
    setTimeout(() => {
        if (statsToRestore.strengthBonus) {
            player.stats.strength -= statsToRestore.strengthBonus;
        }
        showNotification(`L'effet de ${itemsData.consumables[itemId].name} a pris fin.`, 'warning');
        recalculateDerivedStats();
        saveCharacter(player);
    }, duration * 1000); // Convertir en millisecondes
}


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
        li.innerHTML = `${item.name} x${count} <button onclick=\"useItem('${itemId}')\">Utiliser</button>`;
        consumablesList.appendChild(li);
    }
}

function useItem(itemId) {
    const itemIndex = player.inventory.findIndex(item => item.id === itemId);
    if (itemIndex > -1) {
        const item = player.inventory[itemIndex];
        if (item.type === 'consumable') {
            // Gérer les effets de soin et de mana
            if (item.effect.hp) {
                player.hp = Math.min(player.maxHp, player.hp + item.effect.hp);
                showNotification(`Vous utilisez une ${item.name} et vous soignez de ${item.effect.hp} PV.`, 'info');
            }
            if (item.effect.mana) {
                player.mana = Math.min(player.maxMana, player.mana + item.effect.mana);
                showNotification(`Vous utilisez une ${item.name} et restaurez ${item.effect.mana} de mana.`, 'info');
            }
            
            // Gérer les effets temporaires
            if (item.effect.duration) {
                applyTemporaryEffect(item.effect, item.effect.duration, itemId);
            }
            
            // Gérer les autres effets (XP, etc.)
            if (item.effect.xp) {
                giveXP(item.effect.xp);
                showNotification(`Vous gagnez ${item.effect.xp} points d'expérience !`, 'info');
            }
            
            player.inventory.splice(itemIndex, 1);
            saveCharacter(player);
            updateInventoryPageUI();
        }
    }
}

function updateInventoryPageUI() {
    const inventoryItemsList = document.getElementById('inventory-items-list');
    const equippedWeapon = document.getElementById('equipped-weapon');
    const equippedArmor = document.getElementById('equipped-armor');

    inventoryItemsList.innerHTML = '';
    
    player.inventory.forEach(itemId => {
        const item = itemsData.weapons[itemId] || itemsData.armors[itemId] || itemsData.consumables[itemId] || itemsData.questItems[itemId];
        if (!item) return;

        const li = document.createElement('li');
        let itemInfo = `${item.name} <span class="item-rarity ${item.rarity}">${item.rarity}</span>`;

        if (item.type === 'weapon' || item.type === 'armor') {
            const isEquipped = (player.equipment.weapon && player.equipment.weapon.id === item.id) || (player.equipment.armor && player.equipment.armor.id === item.id);
            const buttonText = isEquipped ? 'Déséquiper' : 'Équiper';
            const action = isEquipped ? 'unequip' : 'equip';
            itemInfo += ` <button onclick=\"${action}Item('${item.id}', '${item.type}')\">${buttonText}</button>`;
        } else if (item.type === 'consumable') {
            itemInfo += ` <button onclick=\"useItem('${item.id}')\">Utiliser</button>`;
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
                player.inventory.push(player.equipment[type].id);
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
        player.inventory.push(item.id);
        player.equipment[type] = null;
        recalculateDerivedStats();
        saveCharacter(player);
        updateInventoryPageUI();
    }
}