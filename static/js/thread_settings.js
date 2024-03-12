document.addEventListener('DOMContentLoaded', () => {
    const inputThreadTitle = document.getElementById('thread-title-input');
    inputThreadTitle.addEventListener('keypress', function(event) {
        const threadID = document.getElementById('thread-id').textContent;
        const firstMessageAssistantContent = document.querySelector('.message-assistant-content');
        // Stocker le contenu de l'élément s'il existe, sinon stocker "No new message"
        const messageContent = firstMessageAssistantContent ? firstMessageAssistantContent.textContent : "No new message";
        // Vérifie si la touche pressée est "Enter"
        if (event.key === 'Enter') {
            // Empêche le comportement par défaut de "Enter" qui peut rafraîchir la page
            event.preventDefault();

            // Obtient la valeur de l'input
            const title = this.value.trim();

            // Vérifie si l'input n'est pas vide
            if (title) {
                // Met à jour la div avec la valeur de l'input
                updateThread_attribute(threadID, title, messageContent);

                // Ici, vous pouvez aussi appeler une fonction pour effectuer d'autres actions,
                // comme mettre à jour le titre du thread sur le serveur
            }
        }
    });
});

function updateThread_attribute(threadID, newTitle, content) {
    fetch(`/update_thread/${threadID}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({titre: newTitle, content: content})
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        load_Threads();
        // Vous pouvez ici mettre à jour l'interface utilisateur pour refléter le changement de titre
    })
    .catch((error) => {
        console.error('Erreur:', error);
    });
}

