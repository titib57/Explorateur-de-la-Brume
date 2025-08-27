import { createCharacter, savePlayer, loadCharacter, player, updateStatsDisplay } from '../core/state.js';

/**
 * Ajoute un objet à l'inventaire du joueur.
 * @param {string} itemId L'ID de l'objet.
 * @param {number} quantity La quantité à ajouter.
 */
export function addItem(itemId, quantity = 1) {
    if (!player) return;
    player.addItemToInventory(itemId, quantity);
}

/**
 * Change l'équipement du joueur (arme ou armure).
 * @param {string} itemId L'ID de l'objet à équiper.
 */
export function equipItem(itemId) {
    if (!player) return;

    const item = itemsData.weapons[itemId] || itemsData.armors[itemId];
    if (!item) {
        showNotification("Cet objet n'existe pas.", 'error');
        return;
    }

    const type = item.type;
    const oldItem = player.equipment[type];

    if (oldItem) {
        // Déséquiper l'ancien objet et le remettre dans l'inventaire
        if (!player.inventory[oldItem.id]) {
            player.inventory[oldItem.id] = 0;
        }
        player.inventory[oldItem.id]++;
    }

    // Équiper le nouvel objet
    player.equipment[type] = item;
    if (player.inventory[itemId] > 0) {
        player.inventory[itemId]--;
        if (player.inventory[itemId] === 0) {
            delete player.inventory[itemId];
        }
    }

    // Recalculer les stats après avoir équipé l'objet
    recalculateDerivedStats();
    showNotification(`Vous avez équipé ${item.name}.`, 'success');
    savePlayer(player);
}
