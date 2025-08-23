// Fichier : js/quests.js

import { player, saveCharacter, loadCharacter, resetDungeon, applyRewards } from '../core/state.js';
import { questsData, monstersData, narrativeSteps, abilitiesData } from '../core/gameData.js';
import { showNotification } from '../core/notifications.js';

document.addEventListener('DOMContentLoaded', () => {
    loadCharacter();

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
    
    // Nouveaux éléments pour le journal des quêtes
    const questLogSection = document.getElementById('quest-log');
    const unstartedQuestsList = document.getElementById('unstarted-quests-list');
    const activeQuestsList = document.getElementById('active-quests-list');
    const completedQuestsList = document.getElementById('completed-quests-list');
    
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
            saveCharacter();
            updateCombatUI();
            
            if (player.hp <= 0) {
                addCombatLog("Vous avez été vaincu ! La quête est un échec.");
                setTimeout(() => {
                    alert("Game Over !");
                    resetDungeon();
                    window.location.href = 'world_map.html';
                }, 2000);
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
            battleSection.style.display = 'none';
            narrativeSection.style.display = 'block';
            
            activeDungeon.currentStep++;
            localStorage.setItem('currentDungeon', JSON.stringify(activeDungeon));
            renderStep(activeDungeon.currentStep);
            
        } else {
            turn = 'monster';
            playerActionsEl.style.display = 'none';
            document.getElementById('player-turn-message').style.display = 'none';
            monsterTurn();
        }
    }
    
    attackBtn.addEventListener('click', playerAttack);

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
                        activeDungeon.currentStep = choice.nextStep - 1;
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
                const nextQuest = questsData[step.nextQuest];
                if (nextQuest) {
                     showNotification(`Nouvelle quête débloquée : ${nextQuest.name}!`, "info");
                }
                narrativeContinueBtn.style.display = 'block';
                break;
            case 'end':
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

    narrativeContinueBtn.addEventListener('click', renderNextStep);

    // Fonction principale de rendu du journal des quêtes
    function renderQuestLog() {
        unstartedQuestsList.innerHTML = '';
        activeQuestsList.innerHTML = '';
        completedQuestsList.innerHTML = '';

        // Parcourir toutes les quêtes possibles du jeu
        for (const questId in questsData) {
            const questData = questsData[questId];
            const playerQuest = player.quests[questId];
            
            const li = document.createElement('li');
            li.className = 'quest-item';
            
            const title = document.createElement('p');
            title.className = 'quest-title';
            title.textContent = questData.name;
            li.appendChild(title);

            const description = document.createElement('p');
            description.textContent = questData.description;
            li.appendChild(description);

            // Déterminer le statut de la quête
            if (playerQuest) {
                // Quête en cours ou terminée
                if (playerQuest.objective.current >= playerQuest.objective.required) {
                    li.classList.add('completed');
                    completedQuestsList.appendChild(li);
                } else {
                    const progress = document.createElement('p');
                    progress.textContent = `Progression : ${playerQuest.objective.current} / ${playerQuest.objective.required}`;
                    li.appendChild(progress);
                    activeQuestsList.appendChild(li);
                }
            } else {
                // Quête non commencée
                unstartedQuestsList.appendChild(li);
            }
        }
    }

    // Gérer l'affichage initial de la page
    if (activeDungeon) {
        narrativeSection.style.display = 'block';
        questLogSection.style.display = 'none';
        renderStep(activeDungeon.currentStep);
    } else {
        narrativeSection.style.display = 'none';
        questLogSection.style.display = 'block';
        renderQuestLog();
    }
});