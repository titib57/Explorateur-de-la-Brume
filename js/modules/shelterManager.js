/**
 * @fileoverview Gère la logique de l'abri du joueur, incluant la définition et la récupération de sa position.
 * @namespace shelterManager
 */

// Importez les fonctions nécessaires de Firebase
import { doc, getDoc, setDoc } from from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { auth, db } from "../config/firebase-config.js"; // Assurez-vous d'avoir ce fichier de configuration

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
            console.error("Erreur : Aucun utilisateur n'est connecté.");
            return false;
        }

        if (!location || typeof location.x !== 'number' || typeof location.y !== 'number') {
            console.error("Erreur : La position fournie n'est pas valide.");
            return false;
        }

        const shelterRef = doc(db, COLLECTION_NAME, user.uid);
        
        try {
            const docSnap = await getDoc(shelterRef);
            
            // Si le document de l'utilisateur existe, vérifiez si l'abri a déjà été défini
            if (docSnap.exists() && docSnap.data().shelterLocation) {
                console.warn("L'abri a déjà été défini. Il ne peut pas être modifié.");
                return false;
            }

            // Sauvegardez la position de l'abri dans le document Firestore de l'utilisateur
            await setDoc(shelterRef, { shelterLocation: location }, { merge: true });
            
            console.log(`L'abri a été défini à la position : (${location.x}, ${location.y})`);
            return true;
        } catch (error) {
            console.error("Erreur lors de la définition de l'abri sur Firestore:", error);
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
    }
};