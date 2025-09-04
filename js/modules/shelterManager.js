/**
 * @fileoverview Gère la logique de l'abri du joueur, incluant la définition et la récupération de sa position.
 * @namespace shelterManager
 */

// Importez les fonctions nécessaires de Firebase
import { doc, getDoc, setDoc, runTransaction } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { auth, db } from "../core/firebase_config.js";

const COLLECTION_NAME = "users";
const DOC_NAME = "shelter";

export const shelterManager = {
    /**
     * Définit l'abri à la position actuelle du joueur et le sauvegarde sur Firestore.
     * @param {Object} location - L'objet de position du joueur (ex: { x: 10, y: 25 }).
     * @returns {Promise<boolean>} Une promesse qui résout à true si l'abri est défini, false sinon.
     */
    async defineShelter(location) {
        const user = auth.currentUser;
        if (!user) {
            console.error("Aucun utilisateur n'est connecté.");
            return false;
        }
        // Utilisation de lat/lng pour être cohérent avec Leaflet
        if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
            console.error("La position de l'abri est invalide.");
            return false;
        }

        const shelterRef = doc(db, COLLECTION_NAME, user.uid);

        try {
            await runTransaction(db, async (transaction) => {
                const docSnap = await transaction.get(shelterRef);

                // Si l'abri existe, on lève une erreur pour annuler la transaction
                if (docSnap.exists() && docSnap.data().shelterLocation) {
                    throw new Error("Shelter already exists.");
                }

                // Sinon, on met à jour le document
                transaction.set(shelterRef, { shelterLocation: location }, { merge: true });
            });

            console.log(`L'abri a été défini à la position : (${location.lat}, ${location.lng})`);
            return true;
        } catch (error) {
            if (error.message === "Shelter already exists.") {
                console.warn("L'abri a déjà été défini. Il ne peut pas être modifié.");
            } else {
                console.error("Erreur lors de la définition de l'abri sur Firestore:", error);
            }
            return false;
        }
    },

    /**
     * Récupère la position de l'abri depuis Firestore.
     * @returns {Promise<object|null>} Une promesse qui résout à la position de l'abri ou null si non défini.
     */
    async getShelterLocation() {
        const user = auth.currentUser;
        if (!user) {
            console.warn("Aucun utilisateur n'est connecté.");
            return null;
        }

        const shelterRef = doc(db, COLLECTION_NAME, user.uid);

        try {
            const docSnap = await getDoc(shelterRef);
            if (docSnap.exists() && docSnap.data().shelterLocation) {
                const location = docSnap.data().shelterLocation;
                console.log("Position de l'abri récupérée depuis Firestore.");
                return location;
            } else {
                console.warn("L'abri n'a pas encore été défini sur Firestore.");
                return null;
            }
        } catch (error) {
            console.error("Erreur lors de la récupération de l'abri depuis Firestore:", error);
            return null;
        }
    },

    /**
     * Améliore l'abri en augmentant son niveau et ses statistiques de défense.
     * @param {string} upgradeType - Le type d'amélioration (ex: 'murs', 'portail').
     * @returns {Promise<boolean>} Vrai si l'amélioration est réussie.
     */
    async upgradeShelter(upgradeType) {
        const user = auth.currentUser;
        if (!user) {
            console.error("Erreur : Aucun utilisateur n'est connecté.");
            return false;
        }

        const shelterRef = doc(db, COLLECTION_NAME, user.uid);

        try {
            await runTransaction(db, async (transaction) => {
                const docSnap = await transaction.get(shelterRef);
                const shelterData = docSnap.data() || {};

                const currentLevel = shelterData.shelterLevel || 0;
                const currentStats = shelterData.shelterStats || { defense: 0, durability: 0 };
                
                // Mettez ici la logique de vérification des ressources
                
                const newLevel = currentLevel + 1;
                const newStats = {
                    defense: currentStats.defense + 10,
                    durability: currentStats.durability + 50
                };
                
                transaction.update(shelterRef, {
                    shelterLevel: newLevel,
                    shelterStats: newStats
                });
            });

            console.log(`L'abri a été amélioré au niveau avec de nouvelles statistiques.`);
            return true;

        } catch (error) {
            console.error("Erreur lors de l'amélioration de l'abri:", error);
            return false;
        }
    }
};