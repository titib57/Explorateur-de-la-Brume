document.addEventListener('DOMContentLoaded', () => {
    console.log("Script class_tree.js chargé.");

  document.addEventListener('DOMContentLoaded', () => {
    if (!checkCharacter()) {
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
            const isAvailable = conditionsMet;

            const node = document.createElement('div');
            node.className = 'class-node';
            
            const title = document.createElement('h3');
            title.textContent = classData.name;
            node.appendChild(title);
            
            const description = document.createElement('p');
            description.textContent = classData.description;
            node.appendChild(description);

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

            classTreeContainer.appendChild(node);
            console.log(`Nœud de classe '${classData.name}' ajouté. État : ${node.classList.contains('unlocked') ? 'débloqué' : (node.classList.contains('available') ? 'disponible' : 'verrouillé')}`);
        }
    }

    function unlockClass(classId) {
        console.log(`Tentative de déverrouillage de la classe : ${classId}`);
        if (player.level < 5 || player.class !== 'explorateur') {
            showNotification("Conditions de déblocage non remplies. Vous devez être de la classe 'Explorateur' et au moins niveau 5.", 'warning');
            return;
        }

        const chosenClassData = classBases[classId];
        player.class = classId;
        player.unlockedClasses.push(classId);

        if (abilitiesData[classId]) {
            player.unlockedSkills.push(...abilitiesData[classId]);
        }
        
        player.stats = { ...chosenClassData.stats };
        
        recalculateDerivedStats();
        player.hp = player.maxHp;
        player.mana = player.maxMana;

        saveCharacter(player);
        showNotification(`Félicitations ! Vous êtes maintenant un ${chosenClassData.name}.`, 'success');
        setTimeout(() => {
            window.location.href = 'world_map.html';
        }, 3000);
    }
    updateClassTreeUI();
});