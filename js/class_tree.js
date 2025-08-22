document.addEventListener('DOMContentLoaded', () => {
    if (!checkCharacter()) {
        return;
    }
    loadCharacter();
    updateClassTreeUI();
});

function updateClassTreeUI() {
    const classTreeContainer = document.getElementById('class-tree-container');
    const skillPointsDisplay = document.getElementById('skill-points');

    if (skillPointsDisplay) {
        skillPointsDisplay.textContent = player.skillPoints;
    } else {
        console.warn("Élément 'skill-points' non trouvé.");
    }

    classTreeContainer.innerHTML = '';
    
    const conditionsMet = player.level >= 5 && player.class === 'explorateur';
    
    if (!conditionsMet) {
        const message = document.createElement('p');
        message.textContent = "Vous devez être de la classe 'Explorateur' et avoir atteint le niveau 5 pour choisir une classe.";
        message.style.color = "var(--accent-color-red)";
        message.style.textAlign = "center";
        message.style.marginTop = "20px";
        classTreeContainer.prepend(message);
    }

    for (const classId in classBases) {
        if (classId === 'explorateur') continue;

        const classData = classBases[classId];
        const isUnlocked = player.unlockedClasses.includes(classId);
        const isAvailable = conditionsMet && !isUnlocked;
        
        const node = document.createElement('div');
        node.classList.add('class-node');
        
        if (isUnlocked) {
            node.classList.add('unlocked');
        } else if (isAvailable) {
            node.classList.add('available');
            node.addEventListener('click', () => {
                unlockClass(classId);
            });
        } else {
            node.classList.add('locked');
        }

        node.innerHTML = `
            <h3>${classData.name}</h3>
            <p>${classData.description}</p>
        `;

        classTreeContainer.appendChild(node);
    }
}

function unlockClass(classId) {
    if (player.level < 5 || player.class !== 'explorateur') {
        showNotification("Conditions de déblocage non remplies. Vous devez être de la classe 'Explorateur' et au moins niveau 5.", 'warning');
        return;
    }

    const chosenClassData = classBases[classId];
    
    player.class = classId;
    player.unlockedClasses.push(classId);
    
    // Remplacer les compétences de base par les nouvelles
    player.unlockedSkills = ['fist_attack']; // Conserver l'attaque de base
    const classAbilities = abilitiesData[classId] || [];
    classAbilities.forEach(ability => {
        player.unlockedSkills.push(ability.id);
    });

    player.stats = { ...chosenClassData.stats };
    
    recalculateDerivedStats(player);
    player.hp = player.maxHp;
    player.mana = player.maxMana;

    saveCharacter(player);
    showNotification(`Félicitations ! Vous êtes maintenant un ${chosenClassData.name}.`, 'success');
    setTimeout(() => {
        window.location.href = 'world_map.html';
    }, 3000);
}