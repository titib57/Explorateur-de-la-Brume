// Fichier : js/core/questsData.js

export const questsData = {
    "initial_adventure_quest": {
        questId: 'initial_adventure_quest',
        title: 'Les premiers pas',
        description: "Apprenez les bases de la survie dans la Brume et trouvez un abri sûr.",
        objective: {
            type: 'talk_to_npc',
            target: 'le-sage',
            required: 1
        },
        rewards: {
            xp: 50,
            gold: 25
        }
    }
};