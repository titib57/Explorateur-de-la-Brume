// js/dungeon_minigames.js

import { showNotification } from './core/notifications.js';

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
    'ruins': {
        description: "Vous explorez des ruines antiques envahies par la végétation. Pour trouver le chemin, vous devez déchiffrer une inscription latine.",
        questions: ["Qu'est-ce qui est 'Veni, vidi, vici' ?", "Quelle est la traduction de 'Alea iacta est' ?", "Quel empereur a construit le Colisée ?"],
        answers: ["je suis venu, j'ai vu, j'ai vaincu", "le sort en est jeté", "vespasien"],
        successMessage: "L'inscription brille, révélant un passage secret sous vos pieds.",
        failureMessage: "Une dalle s'effondre sous vous, vous tombez dans un piège !"
    },
    'forest': {
        description: "Vous traversez une forêt dense, le chemin est obscurci par un épais brouillard. Un vieil esprit de la forêt vous met à l'épreuve avec une devinette.",
        questions: ["Je n'ai pas de poumons, mais j'ai besoin d'air. Je n'ai pas de bouche, mais j'ai besoin d'eau. Je ne suis pas un être vivant. Que suis-je ?", "Qu'est-ce qui a une tête et une queue, mais pas de corps ?", "Qu'est-ce qui est mou et qui est au fond du lit ?"],
        answers: ["le feu", "une pièce de monnaie", "une couette"],
        successMessage: "L'esprit souriant dissipe le brouillard, vous révélant un chemin clair.",
        failureMessage: "L'esprit furieux fait se refermer les arbres derrière vous, vous avez maintenant un monstre à affronter."
    }
};

/**
 * Lance un mini-jeu en fonction du type de donjon.
 * @param {object} dungeon Le donjon en cours d'exploration.
 * @returns {Promise<boolean>} Une promesse qui se résout en `true` si le joueur réussit, `false` sinon.
 */
export function startMiniGame(dungeon) {
    return new Promise((resolve, reject) => {
        const dungeonType = dungeon.type;
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
            // Utiliser includes() pour permettre des réponses partielles ou plus flexibles
            if (userAnswer.includes(correctAnswer.toLowerCase())) {
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
