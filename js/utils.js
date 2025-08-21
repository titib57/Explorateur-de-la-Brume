function checkCharacter() {
    if (!localStorage.getItem('playerCharacter')) {
        showNotification("Vous devez d'abord créer un personnage.", 'error');
        setTimeout(() => {
            window.location.href = 'character_creation.html';
        }, 1500);
        return false;
    }
    return true;
}