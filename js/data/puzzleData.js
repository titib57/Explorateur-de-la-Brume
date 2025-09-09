/**
 * @fileoverview Fichier de données pour les énigmes du jeu.
 * Chaque énigme a une difficulté, une question et des réponses.
 * Les réponses contiennent le texte à afficher et un indicateur si elles sont correctes.
 */
export const puzzlesData = [
    // Énigmes de difficulté 'easy'
    {
        id: "easy_1",
        difficulty: "easy",
        question: "Je suis un plat délicieux que personne ne peut manger. Que suis-je ?",
        answers: [
            { text: "Une assiette", isCorrect: true },
            { text: "Une fourchette", isCorrect: false },
            { text: "Une cuillère", isCorrect: false }
        ]
    },
    {
        id: "easy_2",
        difficulty: "easy",
        question: "Je n'ai ni voix ni jambes, mais je me déplace de maison en maison. Que suis-je ?",
        answers: [
            { text: "Une rivière", isCorrect: false },
            { text: "Une lettre", isCorrect: true },
            { text: "Le vent", isCorrect: false }
        ]
    },
    
    // Énigmes de difficulté 'medium'
    {
        id: "medium_1",
        difficulty: "medium",
        question: "J'ai des villes, mais pas de maisons. J'ai des montagnes, mais pas d'arbres. J'ai de l'eau, mais pas de poissons. Que suis-je ?",
        answers: [
            { text: "Une carte géographique", isCorrect: true },
            { text: "Un lac asséché", isCorrect: false },
            { text: "Le ciel", isCorrect: false }
        ]
    },
    {
        id: "medium_2",
        difficulty: "medium",
        question: "Je peux être long ou court, je peux être cultivé ou acheté. Je peux être un défi ou une bénédiction. Que suis-je ?",
        answers: [
            { text: "Un voyage", isCorrect: false },
            { text: "Une vie", isCorrect: false },
            { text: "Un cheveu", isCorrect: true }
        ]
    },
    
    // Énigmes de difficulté 'hard'
    {
        id: "hard_1",
        difficulty: "hard",
        question: "Je suis celui qui te voit quand tu ne me vois pas. Je suis toujours devant toi mais tu ne peux pas me toucher. Je ne suis pas ton reflet. Que suis-je ?",
        answers: [
            { text: "Ton ombre", isCorrect: false },
            { text: "Ton futur", isCorrect: true },
            { text: "Le temps", isCorrect: false }
        ]
    },
    {
        id: "hard_2",
        difficulty: "hard",
        question: "Plus j'enlève, plus je deviens grand. Que suis-je ?",
        answers: [
            { text: "Un trou", isCorrect: true },
            { text: "Le temps qui passe", isCorrect: false },
            { text: "Le silence", isCorrect: false }
        ]
    }
];