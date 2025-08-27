// Fichier : js/quests.js

import { player, savePlayer, loadCharacter, resetDungeon, applyRewards } from '../core/state.js';
import { questsData, monstersData, narrativeSteps, abilitiesData } from '../core/gameData.js';
import { showNotification } from '../core/notifications.js';

// =========================================================================
// NOUVEAU : Logique pour mettre à jour les quêtes et leur affichage
// =========================================================================

/**
 * Met à jour la progression de l'objectif d'une quête active.
 * @param {string} questName Le nom de la quête à mettre à jour.
 * @param {number} amount Le montant à ajouter à l'objectif (ex: 1 pour un monstre tué).
 */
export function updateQuestObjective(questName, amount = 1) {
    if (player.quests.current === questName) {
        // Incrémente la progression de la quête active
        const currentProgress = player.quests.currentProgress || 0;
        player.quests.currentProgress = currentProgress + amount;

        // Récupère les données de la quête pour vérifier l'objectif
        const questData = questsData[questName];
        if (!questData) {
            console.error(`Erreur: La quête '${questName}' n'existe pas dans questsData.`);
            return;
        }

        const required = questData.objective.required;
        
        // Affiche une notification de progression
        showNotification(`${questData.name} : ${player.quests.currentProgress} / ${required}`, 'info');

        // Vérifie si la quête est terminée
        if (player.quests.currentProgress >= required) {
            showNotification(`Objectif de la quête "${questData.name}" terminé !`, 'success');
            // La quête sera marquée comme "terminée" et récompensée
            // lors de l'étape de "fin de quête" dans le donjon.
        }
        savePlayer();
    }
    // Met à jour l'interface du journal des quêtes après la modification
    updateQuestsUI();
}

/**
 * Met à jour l'affichage de toutes les listes de quêtes (non commencées, actives, terminées).
 * Cette fonction est appelée après chaque modification de l'état des quêtes du joueur.
 */
export function updateQuestsUI() {
    // Vérifier si les éléments de l'interface existent avant de les manipuler
    const unstartedList = document.getElementById('unstarted-quests-list');
    const activeList = document.getElementById('active-quests-list');
    const completedList = document.getElementById('completed-quests-list');
    const safePlaceBtn = document.getElementById('safe-place-btn');
    
    if (!unstartedList || !activeList || !completedList || !player) {
        return;
    }

    unstartedList.innerHTML = '';
    activeList.innerHTML = '';
    completedList.innerHTML = '';
    
    // Afficher ou masquer le bouton "Aller au Lieu Sûr"
    if (player.quests.completed.includes('lieu_sur')) {
        if(safePlaceBtn) safePlaceBtn.style.display = 'block';
    } else {
        if(safePlaceBtn) safePlaceBtn.style.display = 'none';
    }

    for (const questId in questsData) {
        const questData = questsData[questId];
        const li = document.createElement('li');
        li.className = 'quest-item';

        const title = document.createElement('p');
        title.className = 'quest-title';
        title.textContent = questData.name;
        li.appendChild(title);

        const description = document.createElement('p');
        description.textContent = questData.description;
        li.appendChild(description);

        // Déterminer le statut de la quête et l'ajouter à la bonne liste
        if (player.quests.current === questId) {
            const progress = document.createElement('p');
            progress.textContent = `Progression : ${player.quests.currentProgress || 0} / ${questData.objective.required}`;
            li.appendChild(progress);
            activeList.appendChild(li);
        } else if (player.quests.completed.includes(questId)) {
            li.classList.add('completed');
            completedList.appendChild(li);
        } else {
            unstartedList.appendChild(li);
        }
    }
}

// =========================================================================
// Fonctions de jeu existantes, avec quelques améliorations
// =========================================================================

document.addEventListener('DOMContentLoaded', () => {
    loadCharacter();
    
    // Déclaration des éléments de l'UI
    const narrativeSection = document.getElementById('narrative-section');
    const narrativeText = document.getElementById('narrative-text');
    const narrativeChoices = document.getElementById('narrative-choices');
    const narrativeContinueBtn = document.getElementById('narrative-continue-btn');

    const battleSection = document.getElementById('battle-section');
    const battleTitle = document.getElementById('battle-title');
    const playerHpEl = document.getElementById('player-hp');
    const playerManaEl = document.getElementById('player-mana');
    const monsterHpEl = document.getElementById('monster-hp');
    const combatLogEl = document.getElementById('combat-log');
    const playerActionsEl = document.getElementById('player-actions');
    const attackBtn = document.getElementById('attack-btn');
    
    const questLogSection = document.getElementById('quest-log');
    const safePlaceBtn = document.getElementById('safe-place-btn');
    
    let activeDungeon = JSON.parse(localStorage.getItem('currentDungeon'));

    let monster;
    let turn = 'player';

    function updateCombatUI() {
        playerHpEl.textContent = `${player.hp}/${player.maxHp}`;
        playerManaEl.textContent = `${player.mana}/${player.maxMana}`;
        monsterHpEl.textContent = `${monster.hp}/${monster.maxHp}`;
    }

    function addCombatLog(message) {
        const p = document.createElement('p');
        p.textContent = message;
        combatLogEl.appendChild(p);
        combatLogEl.scrollTop = combatLogEl.scrollHeight;
    }

    /**
     * Gère la fin de la partie (Game Over).
     * Remplacement de la fonction 'alert()' par une notification.
     */
    function handleGameOver() {
        showNotification("Vous avez été vaincu ! La quête est un échec.", "error");
        setTimeout(() => {
            showNotification("Game Over !", "error");
            resetDungeon();
            window.location.href = 'world_map.html';
        }, 2000);
    }

    function monsterTurn() {
        if (monster.hp <= 0) return;
        
        setTimeout(() => {
            const damage = monster.attack - player.getStat('defense');
            if (damage > 0) {
                player.hp -= damage;
                addCombatLog(`${monster.name} vous attaque pour ${damage} points de dégâts !`);
            } else {
                addCombatLog(`${monster.name} vous attaque, mais n'inflige aucun dégât !`);
            }
            
            player.hp = Math.max(0, player.hp);
            savePlayer();
            updateCombatUI();
            
            if (player.hp <= 0) {
                handleGameOver();
            } else {
                turn = 'player';
                playerActionsEl.style.display = 'block';
                document.getElementById('player-turn-message').style.display = 'block';
            }
        }, 1500);
    }

    function playerAttack() {
        if (turn !== 'player') return;
        
        const playerDamage = player.getStat('strength') + player.getWeaponDamage();
        monster.hp -= playerDamage;
        addCombatLog(`Vous attaquez ${monster.name} et lui infligez ${playerDamage} points de dégâts !`);
        
        monster.hp = Math.max(0, monster.hp);
        updateCombatUI();
        
        if (monster.hp <= 0) {
            addCombatLog(`Vous avez vaincu le ${monster.name} !`);
            
            // Si la quête actuelle a un objectif de 'kill_monster'
            const questData = questsData[player.quests.current];
            if (questData && questData.objective.type === 'kill_monster') {
                updateQuestObjective(player.quests.current);
            }

            battleSection.style.display = 'none';
            narrativeSection.style.display = 'block';
            
            renderNextStep(); // Passage à l'étape narrative suivante
            
        } else {
            turn = 'monster';
            playerActionsEl.style.display = 'none';
            document.getElementById('player-turn-message').style.display = 'none';
            monsterTurn();
        }
    }
    
    if (attackBtn) {
      attackBtn.addEventListener('click', playerAttack);
    }

    function renderStep(stepIndex) {
        const steps = narrativeSteps[activeDungeon.id];
        if (stepIndex >= steps.length) {
            showNotification("Fin de la quête !", "success");
            resetDungeon();
            window.location.href = 'world_map.html';
            return;
        }

        const step = steps[stepIndex];
        narrativeContinueBtn.style.display = 'none';
        narrativeChoices.style.display = 'none';
        narrativeChoices.innerHTML = '';

        switch (step.type) {
            case 'text':
                narrativeText.textContent = step.content;
                narrativeContinueBtn.style.display = 'block';
                break;
            case 'choice':
                narrativeText.textContent = step.content;
                narrativeChoices.style.display = 'block';
                step.choices.forEach(choice => {
                    const btn = document.createElement('button');
                    btn.className = 'btn-primary';
                    btn.textContent = choice.text;
                    btn.addEventListener('click', () => {
                        // Utilisation du nextStep pour éviter une incrémentation multiple
                        activeDungeon.currentStep = choice.nextStep - 1;
                        localStorage.setItem('currentDungeon', JSON.stringify(activeDungeon));
                        renderNextStep();
                    });
                    narrativeChoices.appendChild(btn);
                });
                break;
            case 'combat':
                narrativeSection.style.display = 'none';
                battleSection.style.display = 'block';
                
                monster = { ...monstersData[step.monster] };
                monster.maxHp = monster.hp;
                
                battleTitle.textContent = `Combat contre ${monster.name}`;
                updateCombatUI();
                addCombatLog(`Un ${monster.name} apparaît !`);
                
                turn = 'player';
                playerActionsEl.style.display = 'block';
                document.getElementById('player-turn-message').style.display = 'block';
                break;
            case 'reward':
                applyRewards(step.rewards);
                narrativeText.textContent = step.content;
                // Débloque la prochaine quête si spécifiée
                if (step.nextQuest) {
                    player.quests.unlocked.push(step.nextQuest);
                }
                savePlayer();
                updateQuestsUI(); // Met à jour le journal après la récompense
                narrativeContinueBtn.style.display = 'block';
                break;
            case 'end':
                if (activeDungeon) {
                    // Marque la quête comme terminée
                    if (!player.quests.completed.includes(activeDungeon.id)) {
                        player.quests.completed.push(activeDungeon.id);
                        player.quests.current = null; // Retire la quête de la liste active
                        player.quests.currentProgress = 0; // Réinitialise la progression
                        savePlayer();
                        updateQuestsUI(); // Met à jour le journal une dernière fois
                    }
                }

                showNotification("Fin de la quête !", "success");
                resetDungeon();
                window.location.href = 'world_map.html';
                break;
        }
    }

    function renderNextStep() {
        if (activeDungeon) {
            activeDungeon.currentStep++;
            localStorage.setItem('currentDungeon', JSON.stringify(activeDungeon));
            renderStep(activeDungeon.currentStep);
        }
    }

    if (narrativeContinueBtn) {
        narrativeContinueBtn.addEventListener('click', renderNextStep);
    }
    
    // Ajoute un écouteur d'événements au bouton du lieu sûr
    if (safePlaceBtn) {
        safePlaceBtn.addEventListener('click', () => {
            resetDungeon();
            window.location.href = 'world_map.html';
        });
    }

    // Gérer l'affichage initial de la page
    if (activeDungeon) {
        narrativeSection.style.display = 'block';
        if (questLogSection) questLogSection.style.display = 'none';
        renderStep(activeDungeon.currentStep);
    } else {
       
        if (questLogSection) questLogSection.style.display = 'block';
        updateQuestsUI(); // Utilise la nouvelle fonction de mise à jour de l'UI
    }
});
