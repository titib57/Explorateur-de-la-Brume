// Fichier: js/core/questsData.js

export const questsData = {
    'lieu_sur': {
        id: 'lieu_sur',
        name: 'Lieu sûr',
        description: 'Pour commencer votre aventure, choisissez un "Lieu sûr" sur la carte. C\'est là que se trouvera le Donjon du Tutoriel.',
        objective: {
            type: 'set_safe_place',          
            target: 'any',
            required: 1,
            current: 0
        },
        reward: {
            xp: 0,
            gold: 0,
        },
        nextQuestId: 'premier_pas'
    },
        'premiers_pas': {
        id: 'premiers_pas',
        name: 'Premiers pas',
        description: 'Trouver et explorer le donjon du tutoriel.',
        objective: {
            type: 'kill_monster',
            target: 'mannequin_dentrainement',
            required: 1,
            current: 0
        },
        reward: {
            xp: 50,
            gold: 20,
            item: 'epee_rouillee'
        },
        nextQuestId: 'lart_devoluer'
    },
    'lart_devoluer': {
        id: 'lart_devoluer',
        name: 'L\'art d\'évoluer',
        description: 'Tuez 2 monstres pour augmenter votre niveau à 2.',
        objective: {
            type: 'reach_level',
            target: 2,
            required: 1,
            current: 0
        },
        reward: {
            xp: 100,
            gold: 50
        },
        nextQuestId: 'une_nouvelle_competence'
    },
    'une_nouvelle_competence': {
        id: 'une_nouvelle_competence',
        name: 'Une nouvelle compétence',
        description: 'Utilisez vos points de compétence pour débloquer une nouvelle capacité dans l\'arbre de compétences.',
        objective: {
            type: 'unlock_skill',
            target: 'any',
            required: 1,
            current: 0
        },
        reward: {
            xp: 150,
            gold: 75
        },
        nextQuestId: 'le_remede_miracle'
    },
    'le_remede_miracle': {
        id: 'le_remede_miracle',
        name: 'Le remède miracle',
        description: 'Utilisez la potion de soin que vous avez trouvée pour vous soigner.',
        objective: {
            type: 'use_item',
            target: 'potion_de_soin',
            required: 1,
            current: 0
        },
        reward: {
            xp: 100,
            gold: 50
        },
        nextQuestId: 'vers_une_nouvelle_voie'
    },
    'vers_une_nouvelle_voie': {
        id: 'vers_une_nouvelle_voie',
        name: 'Vers une nouvelle voie',
        description: 'Atteignez le niveau 5 pour avoir accès au choix de classe.',
        objective: {
            type: 'reach_level',
            target: 5,
            required: 1,
            current: 0
        },
        reward: {
            xp: 250,
            gold: 100
        },
        nextQuestId: 'choisir_sa_voie'
    },
    'choisir_sa_voie': {
        id: 'choisir_sa_voie',
        name: 'Choisir sa voie',
        description: 'Choisissez une nouvelle classe dans l\'arbre des classes pour terminer le tutoriel.',
        objective: {
            type: 'unlock_class',
            target: 'any',
            required: 1,
            current: 0
        },
        reward: {
            xp: 500,
            gold: 250
        },
        nextQuestId: null
    },
    'pyramides_de_gizeh_quest': {
        id: 'pyramides_de_gizeh_quest',
        name: 'La malédiction des pharaons',
        description: 'Un ancien pharaon maudit a été réveillé. Calmez sa rage en l\'affrontant dans son tombeau.',
        objective: {
            type: 'kill_monster',
            target: 'gardien_des_tombes',
            required: 1,
            current: 0
        },
        reward: {
            xp: 450,
            gold: 250,
            item: 'amulette_du_sable'
        }
    }
};
