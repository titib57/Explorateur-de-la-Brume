// js/dungeon_minigames.js

// Mini-jeux textuels basés sur le type de lieu
const miniGamesData = {
    'castle': {
        description: "Vous entrez dans un ancien château, son labyrinthe de couloirs est une énigme. Pour avancer, vous devez deviner le mot de passe du fantôme gardien.",
        questions: ["Le premier mot est 'chevalier', le second est 'dragon'. Quel est le troisième ?", "Quel est le plus grand château du monde ?", "Combien de tours a le château de Chambord ?"],
        answers: ["princesse", "château de prague", "3"],
        successMessage: "Le fantôme acquiesce, la voie s'ouvre devant vous.",
        failureMessage: "Une herse tombe, bloquant le chemin. Vous devez affronter le fantôme gardien !",
        successXP: 50,
        successGold: 20
    },
    'castle': {
        description: "Vous entrez dans un ancien château, son labyrinthe de couloirs est une énigme. Pour avancer, vous devez deviner le mot de passe du fantôme gardien.",
        questions: ["Le premier mot est 'chevalier', le second est 'dragon'. Quel est le troisième ?", "Quel est le plus grand château du monde ?", "Combien de tours a le château de Chambord ?"],
        answers: ["princesse", "château de prague", "3"],
        successMessage: "Le fantôme acquiesce, la voie s'ouvre devant vous.",
        failureMessage: "Une herse tombe, bloquant le chemin. Vous devez affronter le fantôme gardien !",
        successXP: 50,
        successGold: 20
    },
    'ruins': {
        description: "Vous explorez des ruines antiques envahies par la végétation. Pour trouver le chemin, vous devez déchiffrer une inscription latine.",
        questions: ["Qu'est-ce qui est 'Veni, vidi, vici' ?", "Quelle est la traduction de 'Alea iacta est' ?", "Quel empereur a construit le Colisée ?"],
        answers: ["je suis venu, j'ai vu, j'ai vaincu", "le sort en est jeté", "vespasien"],
        successMessage: "L'inscription brille, révélant un passage secret sous vos pieds.",
        failureMessage: "Une dalle s'effondre sous vous, vous tombez dans un piège. Vous devez affronter le gardien des ruines !",
        successXP: 75,
        successGold: 30
    }
    'ruins': {
        description: "Vous explorez des ruines antiques envahies par la végétation. Pour trouver le chemin, vous devez déchiffrer une inscription latine.",
        questions: ["Qu'est-ce qui est 'Veni, vidi, vici' ?", "Quelle est la traduction de 'Alea iacta est' ?", "Quel empereur a construit le Colisée ?"],
        answers: ["je suis venu, j'ai vu, j'ai vaincu", "le sort en est jeté", "vespasien"],
        successMessage: "L'inscription brille, révélant un passage secret sous vos pieds.",
        failureMessage: "Une dalle s'effondre sous vous, vous tombez dans une fosse. Le gardien des ruines vous attend !",
        successXP: 40,
        successGold: 15
    },
    'fort': {
        description: "Un ancien fort, solide et impénétrable. Pour le franchir, vous devez répondre à une question de stratégie militaire.",
        questions: ["Qui a dit 'La meilleure défense, c'est l'attaque' ?", "Quel est le nom de la tour qui défend l'entrée d'une forteresse ?", "En quelle année Napoléon a-t-il été vaincu à Waterloo ?"],
        answers: ["frédéric ii", "donjon", "1815"],
        successMessage: "Une porte secrète glisse silencieusement, vous laissant passer.",
        failureMessage: "Un piège se déclenche ! Le gardien du fort a été alerté !",
        successXP: 45,
        successGold: 18
    },
    'chateau': {
        description: "Vous arrivez devant un somptueux château. Pour y entrer, vous devez résoudre une énigme du majordome.",
        questions: ["Je n'ai pas de voix mais je raconte toutes les histoires. Qui suis-je ?", "Qu'est-ce qui a des dents mais ne peut pas manger ?", "Plus tu en as, moins tu en vois. Qui suis-je ?"],
        answers: ["un livre", "un râteau", "le noir"],
        successMessage: "Le majordome s'incline, le pont-levis s'abaisse. Vous pouvez passer.",
        failureMessage: "Le majordome s'offusque et le chevalier-gardien du château vous attaque !",
        successXP: 55,
        successGold: 25
    },
    'tour': {
        description: "Vous vous trouvez au pied d'une ancienne tour de guet. Pour l'escalader, vous devez répondre à une question sur la hauteur.",
        questions: ["Quelle est la plus haute tour du monde ?", "Quelle est la tour la plus célèbre de Pise ?", "Qui a construit la tour Eiffel ?"],
        answers: ["burj khalifa", "la tour penchée", "gustave eiffel"],
        successMessage: "Une échelle apparaît mystérieusement, vous pouvez monter.",
        failureMessage: "La pierre se fissure sous votre pied, le gardien des hauteurs vous attaque !",
        successXP: 35,
        successGold: 15
    },
    'cimetiere': {
        description: "Un cimetière ancien et lugubre vous barre le chemin. Pour le traverser, vous devez honorer la mémoire des morts en répondant correctement à une question.",
        questions: ["Quel célèbre compositeur a été enterré au cimetière du Père-Lachaise ?", "Dans quelle ville se trouve le plus grand cimetière du monde ?", "Quel est le plus grand cimetière de Paris ?"],
        answers: ["chopin", "baghdad", "père-lachaise"],
        successMessage: "Les âmes apaisées vous ouvrent un passage. Vous pouvez passer.",
        failureMessage: "Vous avez perturbé les esprits, les morts se lèvent de leurs tombes pour vous affronter !",
        successXP: 30,
        successGold: 10
    },
    'eglise': {
        description: "Vous entrez dans une vieille église abandonnée. Pour vous approcher de l'autel, vous devez répondre à une question religieuse.",
        questions: ["Qui a été le premier pape ?", "Quelle est la ville sainte de l'islam ?", "Quel est le nom de la tour où sont placées les cloches ?"],
        answers: ["saint pierre", "la mecque", "clocher"],
        successMessage: "Une lumière divine éclaire votre chemin. Vous pouvez vous approcher de l'autel.",
        failureMessage: "Le silence est brisé par des cris de fantômes, le démon de l'église vous attaque !",
        successXP: 40,
        successGold: 20
    },
    'cathedrale': {
        description: "Une immense cathédrale gothique se dresse devant vous. Pour y entrer, vous devez répondre à une question sur son architecture.",
        questions: ["Quelle est la cathédrale la plus célèbre de Paris ?", "Qu'est-ce qu'une gargouille ?", "Quel est le nom de la partie d'une église où se trouvent les sièges des chanoines ?"],
        answers: ["notre-dame", "une créature mythologique", "le chœur"],
        successMessage: "La grande porte s'ouvre, vous pouvez entrer.",
        failureMessage: "Une gargouille s'anime sur le toit, le gardien de la cathédrale vous attaque !",
        successXP: 60,
        successGold: 30
    }
};

/**
 * Lance un mini-jeu textuel pour un donjon donné.
 * @param {object} dungeon - Les données du donjon
 * @returns {Promise<boolean>} Une promesse qui se résout en `true` si le joueur réussit, `false` sinon.
 */
function startMiniGame(dungeon) {
    return new Promise((resolve, reject) => {
        // La clé du mini-jeu est le type de lieu (e.g., 'castle' de 'osm_castle_12345' ou 'static_chateau_versailles')
        // On prend le deuxième élément après le split pour récupérer le type.
        const dungeonType = dungeon.id.split('_')[1];
        const gameData = miniGamesData[dungeonType];

        if (!gameData) {
            console.warn(`Aucun mini-jeu disponible pour le type de donjon : ${dungeonType}`);
            resolve(false);
            return;
        }

        const randomIndex = Math.floor(Math.random() * gameData.questions.length);
        const question = gameData.questions[randomIndex];
        const correctAnswer = gameData.answers[randomIndex];

        const modal = document.createElement('div');
        modal.classList.add('modal');
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Mini-jeu : ${dungeon.name}</h3>
                <p>${gameData.description}</p>
                <p><strong>Question :</strong> ${question}</p>
                <input type="text" id="minigame-answer" placeholder="Votre réponse...">
                <button id="minigame-submit">Valider</button>
            </div>
        `;
        document.body.appendChild(modal);

        document.getElementById('minigame-submit').addEventListener('click', () => {
            const userAnswer = document.getElementById('minigame-answer').value.toLowerCase().trim();
            if (userAnswer === correctAnswer.toLowerCase()) {
                showNotification(gameData.successMessage, 'success');
                resolve(true); // Le joueur a réussi le mini-jeu
            } else {
                showNotification(gameData.failureMessage, 'warning');
                resolve(false); // Le joueur a échoué
            }
            modal.remove();
        });
    });
}