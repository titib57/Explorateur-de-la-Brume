// Fichier: js/core/questsData.js

export const initialQuest = {
    questId: 'start_quest_01',
    title: 'Les premiers pas',
    description: "Apprenez les bases de la survie dans la Brume et trouvez un abri sûr.",
    objectives: [
        { id: 'obj_01', description: 'Atteindre un lieu sûr', completed: false }
    ],
    status: 'active',
    rewards: {
        xp: 50,
        gold: 25
    },
    nextQuestId: 'premiers_pas'
};

// Vous pouvez ajouter d'autres quêtes ici pour une utilisation ultérieure
// export const otherQuests = { ... };