// Fichier : js/modules/class_tree.js

import { player, savePlayer, loadCharacter } from '../core/state.js';
import { classBases, abilitiesData } from '../core/gameData.js';
import { showNotification } from '../core/notifications.js';
import { recalculateDerivedStats } from './character.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log("Script class_tree.js chargé.");

    if (!loadCharacter()) {
        return;
    }
    
    console.log("Personnage chargé :", player);

    const classTreeContainer = document.getElementById('class-tree-container');
    const skillPointsDisplay = document.getElementById('skill-points');

    if (skillPointsDisplay) {
        skillPointsDisplay.textContent = player.skillPoints;
    } else {
        console.warn("Élément 'skill-points' non trouvé.");
    }

    function updateClassTreeUI() {
        console.log("Mise à jour de l'interface de l'arbre des classes.");
        classTreeContainer.innerHTML = '';
        
        const conditionsMet = player.level >= 5 && player.playerClass === 'explorer';

        if (!conditionsMet) {
            const message = document.createElement('p');
            message.textContent = "Vous devez être de la classe 'Explorateur' et avoir atteint le niveau 5 pour choisir une classe.";
            message.style.color = "var(--accent-color-red)";
            message.style.textAlign = "center";
            message.style.marginTop = "20px";
            classTreeContainer.prepend(message);
        }

        for (const classId in classBases) {
            if (classId === 'explorer') continue;

            const classData = classBases[classId];
            const isUnlocked = player.unlockedClasses.includes(classId);
            const isCurrentClass = player.playerClass === classId;

            const node = document.createElement('div');
            node.classList.add('class-node');
            
            node.innerHTML = `
                <h4>${classData.name}</h4>
                <p>${classData.description}</p>
                <p>Niveau requis : 5</p>
                <p>Classe requise : Explorateur</p>
            `;

            if (isCurrentClass) {
                node.classList.add('unlocked');
                node.innerHTML += `<p>Actuellement sélectionné</p>`;
            } else if (isUnlocked) {
                node.classList.add('unlocked');
            } else if (conditionsMet) {
                node.classList.add('available');
                node.addEventListener('click', () => {
                    unlockClass(classId);
                });
            } else {
                node.classList.add('locked');
            }

            classTreeContainer.appendChild(node);
            console.log(`Nœud de classe '${classData.name}' ajouté. État : ${node.classList.contains('unlocked') ? 'débloqué' : (node.classList.contains('available') ? 'disponible' : 'verrouillé')}`);
        }
    }

    function unlockClass(classId) {
        console.log(`Tentative de déverrouillage de la classe : ${classId}`);
        if (player.level < 5 || player.playerClass !== 'explorer') {
            showNotification("Conditions de déblocage non remplies. Vous devez être de la classe 'Explorateur' et au moins niveau 5.", 'warning');
            return;
        }

        const chosenClassData = classBases[classId];
        player.playerClass = classId;
        player.unlockedClasses.push(classId);

        if (abilitiesData[classId]) {
            player.unlockedSkills.push(...abilitiesData[classId]);
        }
        
        player.stats = { ...chosenClassData.stats };
        
        recalculateDerivedStats();
        player.hp = player.maxHp;
        player.mana = player.maxMana;

        savePlayer(player);
        showNotification(`Félicitations ! Vous êtes maintenant un ${chosenClassData.name}.`, 'success');
        setTimeout(() => {
            window.location.href = 'world_map.html';
        }, 3000);
    }
    
    updateClassTreeUI();
});
