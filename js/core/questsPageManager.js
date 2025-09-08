// Fichier : js/modules/questsPageManager.js

import { player } from './state.js';
import { questsData } from './questsData.js';
import { showNotification } from './notifications.js';

let activeTypewriterEffect = null;

export function renderQuestsPage() {
    const bookContainer = document.getElementById('quest-book-pages');
    const loadingMessage = document.getElementById('loading-message');

    if (!bookContainer) return;
    
    if (activeTypewriterEffect) {
        activeTypewriterEffect.cancel();
    }
    
    if (loadingMessage) loadingMessage.style.display = 'none';
    bookContainer.innerHTML = '';

    if (!player || !player.quests) {
        bookContainer.innerHTML = `<div class="book-page"><p class="book-text">Aucune histoire à raconter pour le moment...</p></div>`;
        return;
    }

    let chapterNumber = 1;
    // Affiche les quêtes terminées
    if (player.quests.completed) {
        const completedQuestIds = Object.keys(player.quests.completed);
        for (const questId of completedQuestIds) {
            const questDetails = questsData[questId];
            if (questDetails) {
                const page = createBookPage(chapterNumber, questDetails, 'completed');
                bookContainer.appendChild(page);
                chapterNumber++;
            }
        }
    }

    // Affiche la quête en cours
    if (player.quests.current && player.quests.current.questId) {
        const questId = player.quests.current.questId;
        const questDetails = questsData[questId];
        if (questDetails) {
            const currentProgress = player.quests.current.currentProgress || 0;
            const page = createBookPage(chapterNumber, questDetails, 'active', currentProgress);
            bookContainer.appendChild(page);
        }
    }

    // Si le livre est vide, affiche un message initial
    if (bookContainer.children.length === 0) {
        const page = createBookPage(1, { 
            title: "Votre Aventure Commence", 
            story: "Le récit de votre voyage dans ce monde dévasté n'a pas encore commencé.",
            rewards: {}
        }, 'info');
        bookContainer.appendChild(page);
    }
    
    // Active l'effet de frappe sur la dernière page
    const lastPage = bookContainer.lastElementChild;
    if (lastPage && lastPage.classList.contains('active')) {
        const storyElement = lastPage.querySelector('.book-text');
        if (storyElement && storyElement.dataset.storyText) {
            activeTypewriterEffect = typeWriter(storyElement, storyElement.dataset.storyText);
        }
    }
}

function createBookPage(chapterNum, details, status, currentProgress = 0) {
    const page = document.createElement('div');
    page.className = `book-page ${status}`;
    
    let titleHTML = `<h3>Chapitre ${chapterNum} : ${details.title}</h3>`;
    if (status === 'active') {
        titleHTML = `<h3>Chapitre en cours : ${details.title}</h3>`;
    }

    let storyText = details.story || details.description;
    if (status === 'active' && details.storyUpdates && currentProgress > 0) {
        storyText = details.storyUpdates[currentProgress - 1] || storyText;
    } else if (status === 'completed' && details.storyUpdates) {
        storyText = details.storyUpdates[details.storyUpdates.length - 1] || storyText;
    }

    const storyContent = `<p class="book-text" data-story-text="${storyText}"></p>`;

    // ... (Reste de la fonction inchangée) ...
    
    page.innerHTML = `
        <div class="book-chapter-title">${titleHTML}</div>
        <div class="book-content">
            ${storyContent}
            </div>
    `;

    return page;
}

function typeWriter(element, text, speed = 10) {
    let i = 0;
    let isCanceled = false;
    const promise = new Promise(resolve => {
        function type() {
            if (isCanceled) {
                element.textContent = text;
                resolve();
                return;
            }
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
            } else {
                resolve();
            }
        }
        type();
    });

    promise.cancel = () => { isCanceled = true; };
    return promise;
}