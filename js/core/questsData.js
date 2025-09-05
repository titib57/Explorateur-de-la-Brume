// Fichier : js/core/questsData.js

export const questsData = {


// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    // --- INTRO + TUTORIEL ---
// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

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
        "previousQuest": "introduction_to_combat_quest",
        "nextQuest": "age_gallo_romain"
    },







// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    // --- L'Âge Gallo-Romain (Divodurum) ---
// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


    "age_gallo_romain": {
        "questId": "age_gallo_romain",
        "title": "La Mémoire de Divodurum",
        "description": "Les premiers pas dans l'Anomalie Cognitive. Vous devez percer le brouillard d'Ataraxie au cœur de la ville antique et libérer la Cathédrale Saint-Étienne, un lieu de pouvoir. Les âmes romaines piégées murmurent leur souffrance, et vous devez collecter leurs fragments de souvenirs pour déverrouiller l'accès au donjon et affronter le mal qui s'y cache.",
        "objective": {
            "type": "purge_dungeon",
            "target": "dungeon_cathedrale_saint_etienne",
            "required": 1
        },
        "prerequisites": {
            "quests": ["murmure_architecte_perdu", "murmure_soldat_sans_nom", "murmure_artisan_maudit"],
            "description": "Collecter les Fragments de la Ligne Temporelle pour déverrouiller la Cathédrale."
        },
        "rewards": {
            "xp": 500,
            "gold": 150,
            "items": [
                { "itemId": "schema-philosophique-gardiens", "quantity": 1 }
            ]
        }
    },
    // Nouvelle quête principale pour l'Architecte Perdu
    "murmure_architecte_perdu": {
        "questId": "murmure_architecte_perdu",
        "title": "Murmure de l'Architecte Perdu",
        "description": "Un fantôme vous appelle depuis la Porte des Allemands. Il a perdu ses plans, mais il se souvient avoir caché son journal dans un lieu fréquenté. Vous devez d'abord le retrouver pour découvrir l'emplacement du 'Croquis des Liens'.",
        "objective": {
            "type": "find_item",
            "targetItem": "journal-de-l-architecte",
            "required": 1
        },
        "rewards": {
            "xp": 50,
            "gold": 25,
            "items": [
                { "itemId": "journal-de-l-architecte", "quantity": 1 }
            ]
        },
        "nextQuest": "rechercher_croquis_perdu"
    },
    "rechercher_croquis_perdu": {
        "questId": "rechercher_croquis_perdu",
        "title": "Rechercher le Croquis Perdu",
        "description": "D'après les notes du journal, les plans de l'architecte sont cachés près des remparts, un lieu autrefois destiné à un grand projet. Rendez-vous sur place pour récupérer le 'Croquis des Liens', le premier fragment de la Ligne Temporelle.",
        "objective": {
            "type": "collect_item_at_location",
            "targetLocation": "remparts_anciens",
            "item": "croquis_des_liens",
            "required": 1
        },
        "prerequisites": {
            "quests": ["murmure_architecte_perdu"],
            "description": "Avoir trouvé le journal de l'architecte."
        },
        "rewards": {
            "xp": 100,
            "gold": 50,
            "items": [
                { "itemId": "croquis-des-liens", "quantity": 1 }
            ]
        }
    },
    // Nouvelle quête principale pour le Soldat Sans Nom
    "murmure_soldat_sans_nom": {
        "questId": "murmure_soldat_sans_nom",
        "title": "Murmure du Soldat Sans Nom",
        "description": "L'esprit d'un soldat hante la Citadelle, incapable de se reposer. Il a perdu son identité, mais sa plaque est un puzzle. Vous devez vous rendre aux anciennes casernes pour trouver la 'Clé de Déchiffrement' qui débloquera son nom et le second fragment.",
        "objective": {
            "type": "find_item",
            "targetItem": "cle-de-dechiffrement",
            "required": 1
        },
        "rewards": {
            "xp": 50,
            "gold": 25,
            "items": [
                { "itemId": "cle-de-dechiffrement", "quantity": 1 }
            ]
        },
        "nextQuest": "decrypter_plaque_identite"
    },
    "decrypter_plaque_identite": {
        "questId": "decrypter_plaque_identite",
        "title": "Décrypter la Plaque d'Identité",
        "description": "Avec la Clé de Déchiffrement en main, retournez à la Citadelle pour révéler le nom gravé sur la plaque. Ce n'est pas un nom ordinaire, mais le titre d'une ancienne Sentinelle de l'Anomalie Cognitive, ce qui vous donne le deuxième fragment de la Ligne Temporelle.",
        "objective": {
            "type": "use_item_at_location",
            "targetLocation": "citadelle",
            "item": "plaque_identite",
            "required": 1
        },
        "prerequisites": {
            "quests": ["murmure_soldat_sans_nom"],
            "description": "Avoir trouvé la Clé de Déchiffrement."
        },
        "rewards": {
            "xp": 100,
            "gold": 50,
            "items": [
                { "itemId": "plaque-identite", "quantity": 1 }
            ]
        }
    },
    // Nouvelle quête principale pour l'Artisan Maudit
    "murmure_artisan_maudit": {
        "questId": "murmure_artisan_maudit",
        "title": "Murmure de l'Artisan Maudit",
        "description": "Un artisan maudit est lié à une création inachevée sur la Place Saint-Louis. Il a besoin de vous pour retrouver les 'Trois Liens Célestes' pour compléter son œuvre. Ces liens sont des constellations cachées sur des monuments historiques, visibles uniquement avec un 'Outil d'Observation'.",
        "objective": {
            "type": "find_item",
            "targetItem": "outil-d-observation",
            "required": 1
        },
        "rewards": {
            "xp": 50,
            "gold": 25,
            "items": [
                { "itemId": "outil-d-observation", "quantity": 1 }
            ]
        },
        "nextQuest": "reveler_la_lumiere"
    },
    "reveler_la_lumiere": {
        "questId": "reveler_la_lumiere",
        "title": "Révéler la Lumière",
        "description": "Utilisez l'Outil d'Observation sur la Place Saint-Louis pour localiser les trois liens célestes sur les bâtiments environnants. Une fois alignés, ils révéleront le 'Fragment de la Lumière', un code informatique qui déverrouille le donjon de la Cathédrale.",
        "objective": {
            "type": "puzzle_at_location",
            "targetLocation": "place_saint_louis",
            "required": 1
        },
        "prerequisites": {
            "quests": ["murmure_artisan_maudit"],
            "description": "Avoir trouvé l'Outil d'Observation."
        },
        "rewards": {
            "xp": 100,
            "gold": 50,
            "items": [
                { "itemId": "fragment-de-la-lumiere", "quantity": 1 }
            ]
        }
    },





// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    // --- L'Âge Médiéval (Graoully) ---
// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

    "age_medieval": {
        "questId": "age_medieval",
        "title": "L'Écho du Graoully",
        "description": "Les souvenirs libérés de l'époque gallo-romaine ont réveillé un mal plus ancien. Vous devez vaincre l'écho du Graoully qui se nourrit de la peur médiévale dans la Rue Taison.",
        "objective": {
            "type": "purge_dungeon",
            "target": "dungeon_rue_taison",
            "required": 1
        },
        "prerequisites": {
            "quests": ["le_murmure_du_saint_oublie", "le_murmure_de_la_regle_brisee"],
            "description": "Trouver le Livre des Rituels et l'Œil du Saint pour accéder à la Rue Taison."
        },
        "rewards": {
            "xp": 750,
            "gold": 200,
            "items": [
                { "itemId": "codex-regles-simulation", "quantity": 1 }
            ]
        }
    },
    "le_murmure_du_saint_oublie": {
        "questId": "le_murmure_du_saint_oublie",
        "title": "Le Murmure du Saint Oublié",
        "description": "Un prêtre fantôme vous demande de retrouver les reliques qui ont vaincu le Graoully autrefois. Vous devez trouver l'Œil du Saint, une relique de la Cathédrale.",
        "objective": {
            "type": "collect_item_at_location",
            "targetLocation": "cathedrale_saint_etienne",
            "item": "oeil_du_saint",
            "required": 1
        },
        "rewards": {
            "xp": 150,
            "gold": 75,
            "items": [
                { "itemId": "oeil-du-saint", "quantity": 1 }
            ]
        }
    },
    "le_murmure_de_la_regle_brisee": {
        "questId": "le_murmure_de_la_regle_brisee",
        "title": "Le Murmure de la Règle Brisée",
        "description": "Aidez un artisan fantôme à la Place d'Armes à retrouver les 'règles sacrées' qui ont permis d'emprisonner le Graoully. Ce codex est un fragment des règles de la simulation elle-même.",
        "objective": {
            "type": "collect_item_at_location",
            "targetLocation": "place_d_armes",
            "item": "cle_de_la_sagesse",
            "required": 1
        },
        "rewards": {
            "xp": 150,
            "gold": 75,
            "items": [
                { "itemId": "cle-de-la-sagesse", "quantity": 1 }
            ]
        }
    },



// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    // --- L'Âge de l'Empire Allemand ---
// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


    "age_allemand": {
        "questId": "age_allemand",
        "title": "Le Spectre de l'Ingénieur Impérial",
        "description": "L'esprit de l'Empire allemand se manifeste à la Gare de Metz, cherchant à réécrire le passé. Vous devez déchiffrer ses plans complexes et l'affronter dans un duel de logique.",
        "objective": {
            "type": "purge_dungeon",
            "target": "dungeon_gare_de_metz",
            "required": 1
        },
        "prerequisites": {
            "quests": ["le_murmure_du_vagabond", "le_murmure_de_la_merveille_d_acier"],
            "description": "Trouver la Boussole de l'Urbaniste et les Plans de l'Architecte pour déverrouiller l'entrée de la Gare."
        },
        "rewards": {
            "xp": 1000,
            "gold": 250,
            "items": [
                { "itemId": "plans-de-lempire", "quantity": 1 }
            ]
        }
    },
    "le_murmure_du_vagabond": {
        "questId": "le_murmure_du_vagabond",
        "title": "Le Murmure du Vagabond",
        "description": "Un fantôme de vagabond vous demande de l'aide pour retrouver les 'flux d'énergie' de la ville, qui vous serviront de boussole pour naviguer dans le donjon.",
        "objective": {
            "type": "locate_at_location",
            "targetLocation": "centre_ville",
            "required": 1
        },
        "rewards": {
            "xp": 200,
            "gold": 100,
            "items": [
                { "itemId": "boussole-de-lurbaniste", "quantity": 1 }
            ]
        }
    },
    "le_murmure_de_la_merveille_d_acier": {
        "questId": "le_murmure_de_la_merveille_d_acier",
        "title": "Le Murmure de la Merveille d'Acier",
        "description": "Aidez un architecte à retrouver ses plans pour la Gare de Metz. Ces plans vous révèleront les schémas complexes du donjon.",
        "objective": {
            "type": "collect_item_at_location",
            "targetLocation": "quartier_de_la_gare",
            "item": "plans_de_l_architecte",
            "required": 1
        },
        "rewards": {
            "xp": 200,
            "gold": 100,
            "items": [
                { "itemId": "plans-de-l-architecte", "quantity": 1 }
            ]
        }
    },


  

// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    // --- L'Âge de la Forteresse ---
// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


    "age_forteresse": {
        "questId": "age_forteresse",
        "title": "Les Souvenirs Piégés",
        "description": "La mémoire est verrouillée par une discipline de fer au Fort de Queuleu. Infiltrez ce lieu pour libérer les souvenirs piégés.",
        "objective": {
            "type": "purge_dungeon",
            "target": "dungeon_fort_de_queuleu",
            "required": 1
        },
        "prerequisites": {
            "quests": ["le_murmure_du_cartographe", "le_murmure_du_prisonnier"],
            "description": "Utiliser les fragments de la carte et les messages décryptés pour naviguer dans le Fort."
        },
        "rewards": {
            "xp": 1250,
            "gold": 300,
            "items": [
                { "itemId": "schemes-de-la-discipline", "quantity": 1 }
            ]
        }
    },
    "le_murmure_du_cartographe": {
        "questId": "le_murmure_du_cartographe",
        "title": "Le Murmure du Cartographe",
        "description": "Un fantôme de cartographe vous demande de retrouver des morceaux de carte pour trouver les passages secrets du Fort.",
        "objective": {
            "type": "collect_items_at_location",
            "targetLocation": "fort_de_queuleu",
            "item": "fragments_de_carte",
            "required": 3
        },
        "rewards": {
            "xp": 250,
            "gold": 125,
            "items": [
                { "itemId": "plan-des-passages-secrets", "quantity": 1 }
            ]
        }
    },
    "le_murmure_du_prisonnier": {
        "questId": "le_murmure_du_prisonnier",
        "title": "Le Murmure du Prisonnier",
        "description": "Aidez l'esprit d'un prisonnier à décrypter des messages cachés qui révèlent les faiblesses du Commandant qui hante le fort.",
        "objective": {
            "type": "decrypt_messages_at_location",
            "targetLocation": "fort_de_queuleu",
            "required": 1
        },
        "rewards": {
            "xp": 250,
            "gold": 125,
            "items": [
                { "itemId": "decryption-manuel", "quantity": 1 }
            ]
        }
    },




// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  // --- L'Âge de l'Art et de la Censure ---
// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

  "age_art_censure": {
        "questId": "age_art_censure",
        "title": "La Censure de l'Art",
        "description": "L'art est considéré comme trop subjectif et est en danger. Vous devez vous rendre au Musée de la Cour d'Or pour protéger les souvenirs enfermés et affronter le Spectre du Censeur.",
        "objective": {
            "type": "purge_dungeon",
            "target": "dungeon_musee_cour_dor",
            "required": 1
        },
        "prerequisites": {
            "quests": ["le_murmure_du_sculpteur", "le_murmure_de_la_richesse_oubliee"],
            "description": "Utiliser la clé du sculpteur et l'indice sur la collection secrète pour déverrouiller le donjon."
        },
        "rewards": {
            "xp": 1500,
            "gold": 400,
            "items": [
                { "itemId": "archive-des-arts", "quantity": 1 }
            ]
        }
    },
    "le_murmure_du_sculpteur": {
        "questId": "le_murmure_du_sculpteur",
        "title": "Le Murmure du Sculpteur",
        "description": "Un fantôme de sculpteur vous demande de l'aider à retrouver une 'clé' pour terminer sa dernière œuvre et ouvrir une salle cachée dans le musée.",
        "objective": {
            "type": "find_key_at_location",
            "targetLocation": "musee_de_la_cour_d_or",
            "required": 1
        },
        "rewards": {
            "xp": 300,
            "gold": 150,
            "items": [
                { "itemId": "cle-de-la-creation", "quantity": 1 }
            ]
        }
    },
    "le_murmure_de_la_richesse_oubliee": {
        "questId": "le_murmure_de_la_richesse_oubliee",
        "title": "Le Murmure de la Richesse Oubliée",
        "description": "Aidez un fantôme à retrouver des objets de valeur qui vous donneront un indice sur la collection secrète du musée, essentielle pour affronter le censeur.",
        "objective": {
            "type": "find_clue_at_location",
            "targetLocation": "musee_de_la_cour_d_or",
            "required": 1
        },
        "rewards": {
            "xp": 300,
            "gold": 150,
            "items": [
                { "itemId": "indice-secret", "quantity": 1 }
            ]
        }
    },





// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    // --- Climax Final ---
// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


    "climax_final": {
        "questId": "climax_final",
        "title": "Le Nœud du Réseau",
        "description": "Au Centre Pompidou-Metz, vous faites face au Passeur du Vide, le Gardien de la simulation de Metz. C'est l'ultime confrontation et la révélation de la véritable nature de votre lutte. La décision vous appartient.",
        "objective": {
            "type": "confront_boss",
            "target": "passeur_du_vide",
            "required": 1
        },
        "prerequisites": {
            "quests": ["age_art_censure"],
            "description": "Après avoir purifié le Musée de la Cour d'Or, vous pouvez accéder au Centre Pompidou-Metz."
        },
        "rewards": {
            "xp": 5000,
            "gold": 1000,
            "items": [
                { "itemId": "fragment-de-realite", "quantity": 1 }
            ]
        }
    }
};
