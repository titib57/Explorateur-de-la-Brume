// js/dungeon_minigames.js

// Mini-jeux textuels basés sur le type de lieu
const miniGamesData = {
    'castle': {
        name: 'Le Jugement du Sphinx',
        description: 'Vous êtes face au Grand Sphinx de Gizeh. Son regard de pierre vous scrute. Pour passer, il vous pose une énigme en trois parties.',
        steps: [
            {
                type: 'text',
                prompt: 'Le Sphinx murmure : "Je suis plus ancien que les pyramides. Je protège un secret qui ne se révèle que sous le regard de Râ. Pour me faire confiance, vous devez d\'abord prouver votre sagesse. Quel objet symbolise le temps et la sagesse ?"\n\nIndice : Il est souvent utilisé par les mages pour mesurer leurs sorts.',
                requiredItem: 'sablier',
                failureMessage: "Le Sphinx reste de marbre. Vous n'avez pas l'objet de sagesse, et un golem de sable se lève pour vous barrer la route.",
                failureConsequence: { type: 'battle', monsterId: 'golem_de_sable' }
            },
            {
                type: 'choice',
                prompt: 'Le sablier scintille et le Sphinx vous demande : "Je me lève le matin sur quatre pattes, le midi sur deux, et le soir sur trois. Que suis-je ?"',
                choices: [
                    { text: 'Un chat', consequence: 'failure' },
                    { text: 'Un homme', consequence: 'success' },
                    { text: 'Un dragon', consequence: 'failure' }
                ],
                successMessage: "Le Sphinx acquiesce et s'écarte. La voie vers un tombeau rempli d'or est ouverte !",
                successConsequence: { type: 'gold', amount: 150 },
                failureMessage: "Le Sphinx rugit et vous lance une malédiction. Vous devez affronter le fantôme d'un pharaon.",
                failureConsequence: { type: 'battle', monsterId: 'fantome_de_pharaon' }
            }
        ]
    },
 'ruins': {
        name: 'Les Ruines de l\'Oubli',
        description: 'Pour passer les ruines, vous devez résoudre une énigme simple, laissée par un voyageur.',
        steps: [
            {
                type: 'text',
                prompt: 'Une voix murmure : "Je suis toujours là mais on ne me voit jamais. On me cherche quand on me perd. Qui suis-je ?"',
                requiredItem: 'le chemin', // Réponse attendue
                failureMessage: "Vous vous êtes perdu dans les ruines. Un gobelin énervé vous barre la route.",
                failureConsequence: { type: 'battle', monsterId: 'goblin_tutoriel' }
            },
            {
                type: 'choice',
                prompt: 'Un homme est dans un ascenseur. Il monte toujours jusqu’au 7e étage et descend au rez-de-chaussée. Sauf si il pleut, il monte au 9e étage. Pourquoi ?',
                choices: [
                    { text: 'Il est petit et il ne peut atteindre le bouton que du 9e étage en se mettant sur la pointe des pieds', consequence: 'failure' },
                    { text: 'Il ne peut atteindre le bouton que du 7e étage en se mettant sur la pointe des pieds', consequence: 'success' },
                    { text: 'Il est claustrophobe et il préfère prendre les escaliers', consequence: 'failure' }
                ],
                successMessage: "La sortie est à vous. Vous avez l'esprit vif.",
                failureMessage: "La réponse est erronée. Un gobelin apparait.",
                successConsequence: { type: 'reward', xp: 50, gold: 10 },
                failureConsequence: { type: 'battle', monsterId: 'goblin_tutoriel' }
            }
        ]
    }
};

/**
 * Gère les conséquences d'un mini-jeu.
 * @param {object} consequence L'objet de conséquence à traiter.
 */
function handleMinigameResult(consequence) {
    if (!consequence) return;

    switch (consequence.type) {
        case 'xp':
            giveXP(consequence.amount);
            break;
        case 'gold':
            player.gold += consequence.amount;
            showNotification(`Vous gagnez ${consequence.amount} pièces d'or !`, 'info');
            break;
        case 'damage':
            player.hp -= consequence.amount;
            showNotification(`Vous subissez ${consequence.amount} points de dégâts !`, 'warning');
            break;
        case 'battle':
            currentMonster = { ...monstersData[consequence.monsterId] };
            localStorage.setItem('currentMonsterId', consequence.monsterId);
            setTimeout(() => {
                window.location.href = 'battle.html';
            }, 1000);
            break;
        case 'item':
            const itemToAdd = itemsData.consumables[consequence.itemId];
            if (itemToAdd) {
                player.inventory.push(itemToAdd);
                showNotification(`Vous trouvez : ${itemToAdd.name} !`, 'success');
            }
            break;
        // Ajoutez d'autres conséquences ici (récompenses, changement de statistiques, etc.)
    }
    saveCharacter(player);
}

/**
 * Lance le mini-jeu pour un type de donjon donné.
 * @param {string} dungeonType Le type de donjon (ex: 'castle', 'ruins').
 * @returns {Promise<boolean>} Une promesse qui résout à true si le mini-jeu est réussi, false sinon.
 */
async function playMinigame(dungeonType) {
    const gameData = miniGamesData[dungeonType];
    if (!gameData) {
        console.warn(`Aucun mini-jeu disponible pour le type de donjon : ${dungeonType}`);
        return false;
    }

    const modal = document.createElement('div');
    modal.classList.add('modal');
    document.body.appendChild(modal);

    const modalContent = document.createElement('div');
    modalContent.classList.add('modal-content');
    modal.appendChild(modalContent);

    showNotification(gameData.description, 'info');

    // Boucle à travers chaque étape de l'énigme
    for (const step of gameData.steps) {
        let stepResult = await new Promise(resolve => {
            modalContent.innerHTML = '';
            const promptElement = document.createElement('p');
            promptElement.innerHTML = `<strong>${gameData.name}</strong><br><br>${step.prompt}`;
            modalContent.appendChild(promptElement);

            if (step.type === 'text') {
                const hasItem = player.inventory.some(item => item.id === step.requiredItem);
                const answerInput = document.createElement('input');
                answerInput.type = 'text';
                answerInput.id = 'minigame-answer';
                answerInput.placeholder = 'Votre réponse...';

                const submitBtn = document.createElement('button');
                submitBtn.textContent = 'Valider';
                submitBtn.classList.add('btn-primary');
                
                modalContent.appendChild(answerInput);
                modalContent.appendChild(submitBtn);

                submitBtn.addEventListener('click', () => {
                    const userAnswer = answerInput.value.toLowerCase().trim();
                    if (step.requiredItem && hasItem) {
                        showNotification('Vous avez l\'objet requis. L\'énigme continue.', 'success');
                        resolve('success');
                    } else if (step.requiredAnswer && userAnswer === step.requiredAnswer.toLowerCase().trim()) {
                        showNotification(step.successMessage, 'success');
                        handleMinigameResult(step.successConsequence);
                        resolve('success');
                    } else {
                        showNotification(step.failureMessage, 'warning');
                        handleMinigameResult(step.failureConsequence);
                        resolve('failure');
                    }
                });

            } else if (step.type === 'choice') {
                step.choices.forEach(choice => {
                    const button = document.createElement('button');
                    button.textContent = choice.text;
                    button.classList.add('minigame-choice-btn', 'btn-primary');
                    modalContent.appendChild(button);

                    button.addEventListener('click', () => {
                        if (choice.consequence === 'success') {
                            showNotification(step.successMessage, 'success');
                            handleMinigameResult(step.successConsequence);
                            resolve('success');
                        } else {
                            showNotification(step.failureMessage, 'warning');
                            handleMinigameResult(step.failureConsequence);
                            resolve('failure');
                        }
                    });
                });
            }
        });

        // Si une étape échoue, la boucle s'arrête
        if (stepResult === 'failure') {
            modal.remove();
            return false;
        }
    }

    // Si toutes les étapes sont réussies
    modal.remove();
    return true;
}