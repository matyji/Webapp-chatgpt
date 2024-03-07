document.addEventListener('DOMContentLoaded', function() {
    var textarea = document.getElementById('message-input');
    var sendButton = document.getElementById('send-button');

    // Fonction pour vérifier le contenu du textarea et activer/désactiver le bouton
    function toggleButtonState() {
        // Si le textarea n'est pas vide, le bouton est activé, sinon il est désactivé
        sendButton.disabled = !textarea.value.trim();
    }

    // Écoute les événements 'input' sur le textarea
    textarea.addEventListener('input', toggleButtonState);

    // Vérifie l'état initial au chargement de la page
    toggleButtonState();
});
