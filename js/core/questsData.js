// Fichier : js/core/questsData.js

export const questsData = {
"initial_adventure_quest": {
    "questId": "initial_adventure_quest",
    "title": "Un nouveau départ",
    "description": "Bienvenue. La première chose à faire est de trouver un endroit sûr. Choisissez un lieu que vous pourrez considérer comme votre abri personnel, puis validez-le pour commencer votre aventure. Cet abri sera votre base, votre refuge.",
    "objective": {
        "type": "validate_current_location",
        "action": "define_shelter",
        "required": 1
    },
    "rewards": {
        "xp": 50,
        "gold": 25,
        "items": [
            {
                "itemId": "outil-de-construction",
                "quantity": 1
            }
        ]
    }
}
};