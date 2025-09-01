import { getAuth, onAuthStateChanged, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { app } from "./firebase_config.js"; // Assurez-vous que ce fichier exporte votre app Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";

const auth = getAuth(app);
const db = getFirestore(app);

const noCharacterSection = document.getElementById('no-character-section');
const characterSection = document.getElementById('character-section');
const characterDisplay = document.getElementById('character-display');
const loadingMessage = document.getElementById('loading-message');
const playBtn = document.getElementById('play-btn');
const deleteBtn = document.getElementById('delete-btn');
const updateBtn = document.getElementById('update-btn');

function showNotification(message, type = 'success') {
    const notificationContainer = document.getElementById('notification-container');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notificationContainer.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function renderCharacter(character) {
    characterDisplay.innerHTML = `
        <div class="character-card">
            <h3>${character.name}</h3>
            <p>Classe : ${character.class}</p>
            <p>Niveau : ${character.level}</p>
            <p>Points de vie : ${character.hp}</p>
        </div>
    `;
    loadingMessage.classList.add('hidden');
    playBtn.classList.remove('hidden');
    deleteBtn.classList.remove('hidden');
    updateBtn.classList.remove('hidden');
}

function showNoCharacterView() {
    characterSection.classList.add('hidden');
    noCharacterSection.classList.remove('hidden');
}

async function loadCharacterData(user) {
    const characterRef = doc(db, "characters", user.uid);
    try {
        const docSnap = await getDoc(characterRef);
        if (docSnap.exists()) {
            renderCharacter(docSnap.data());
            characterSection.classList.remove('hidden');
            noCharacterSection.classList.add('hidden');
        } else {
            showNoCharacterView();
        }
    } catch (error) {
        console.error("Erreur lors du chargement du personnage:", error);
        showNoCharacterView();
        showNotification("Erreur lors du chargement des données. Veuillez réessayer.", "error");
    }
}

async function deleteCharacter() {
    const user = auth.currentUser;
    if (user) {
        const characterRef = doc(db, "characters", user.uid);
        try {
            await deleteDoc(characterRef);
            showNoCharacterView();
            showNotification("Personnage supprimé avec succès !");
        } catch (error) {
            console.error("Erreur lors de la suppression du personnage:", error);
            showNotification("Erreur lors de la suppression. Veuillez réessayer.", "error");
        }
    }
}

// Gestion de l'état d'authentification
onAuthStateChanged(auth, (user) => {
    if (user) {
        loadCharacterData(user);
    } else {
        // Redirige vers la page de connexion si l'utilisateur n'est pas connecté
        window.location.href = "login.html";
    }
});

// Écouteurs d'événements pour les boutons
deleteBtn.addEventListener('click', deleteCharacter);

playBtn.addEventListener('click', () => {
    window.location.href = "game.html"; // Redirige vers la page de jeu
});

updateBtn.addEventListener('click', () => {
    window.location.href = "character.html"; // Redirige vers la page de mise à jour du personnage
});