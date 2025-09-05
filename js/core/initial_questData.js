// Fichier : js/core/questsData.js

export const initial_questsData = {

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
        },
        "nextQuest": "learn_crafting_quest" // La quête suivante à déclencher
    },

    "learn_crafting_quest": {
        "questId": "learn_crafting_quest",
        "title": "Les premières constructions",
        "description": "Maintenant que votre abri est sécurisé, il est temps d'apprendre à fabriquer des objets. Votre outil de construction vous permet de créer des éléments essentiels. Fabriquez une caisse de rangement pour stocker vos ressources.",
        "objective": {
            "type": "craft_item",
            "itemId": "caisse-de-rangement",
            "required": 1
        },
        "rewards": {
            "xp": 75,
            "gold": 50,
            "items": [
                {
                    "itemId": "plan-de-travail-simple",
                    "quantity": 1
                }
            ]
        },
        "previousQuest": "initial_adventure_quest",
        "nextQuest": "explore_surroundings_quest"
    },

    "explore_surroundings_quest": {
        "questId": "explore_surroundings_quest",
        "title": "Premiers pas hors de l'abri",
        "description": "Votre abri est aménagé, mais les ressources ne sont pas infinies. Le monde extérieur est rempli de matières premières et de dangers. Explorez les environs et collectez 5 unités de bois pour la suite de vos projets.",
        "objective": {
            "type": "gather_resources",
            "resourceId": "bois",
            "required": 5
        },
        "rewards": {
            "xp": 100,
            "gold": 75
        },
        "previousQuest": "learn_crafting_quest",
        "nextQuest": "introduction_to_combat_quest"
    },

    "introduction_to_combat_quest": {
        "questId": "introduction_to_combat_quest",
        "title": "La première menace",
        "description": "Les environs de votre abri ne sont pas toujours sûrs. Une créature inoffensive rôde à proximité. Apprenez à vous défendre en la vainquant. Cela vous rapportera de l'expérience et des matériaux précieux.",
        "objective": {
            "type": "defeat_enemy",
            "enemyId": "creature-faible",
            "required": 1
        },
        "rewards": {
            "xp": 150,
            "gold": 100,
            "items": [
                {
                    "itemId": "peaux-de-creature",
                    "quantity": 1
                }
            ]
        },
        "previousQuest": "explore_surroundings_quest",
        "nextQuest": "first_main_story_quest"
    },

    "first_main_story_quest": {
        "questId": "first_main_story_quest",
        "title": "Un appel au secours",
        "description": "Un message de détresse est apparu sur votre carte. Il est temps de mettre vos compétences à l'épreuve. Rendez-vous au lieu indiqué pour découvrir le début de l'histoire principale et aider un personnage en détresse.",
        "objective": {
            "type": "go_to_location",
            "locationId": "village-abandonne",
            "required": 1
        },
        "rewards": {
            "xp": 200,
            "gold": 150
        },
        "previousQuest": "introduction_to_combat_quest"
    }

};