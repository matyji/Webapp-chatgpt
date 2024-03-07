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

function sendMessage() {
    let sendButton = document.getElementById('send-button');
    let userInput = document.getElementById('message-input').value;

    // Vérifie si le bouton est désactivé
    if (sendButton.disabled) {
        // Le bouton est désactivé, donc ne rien faire (sortir de la fonction)
        console.log('Le bouton est désactivé.');
        return;
    }else{
        document.getElementById('message-input').value = null;
        createMessageUserFromTemplate("message-user", userInput)
        envoyerRequete(userInput);
    }
}


document.getElementById('send-button').addEventListener('click', sendMessage);


function createMessageUserFromTemplate(templateName, messageContent) {
    fetch(`/get_template/${templateName}`)
        .then(response => response.text())
        .then(template => {
            // Création d'un élément temporaire pour contenir le template HTML
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = template;
            
            // Mise à jour des parties variables du template
            tempDiv.querySelector('.timestamp').textContent = new Date().toLocaleTimeString();
            tempDiv.querySelector('.message-content-user').textContent = messageContent;
            // Insérer le nouveau message dans le DOM
            const messagesContainer = document.querySelector('.messages-container');
            if (!messagesContainer) {
                console.log('Le conteneur de messages n\'a pas été trouvé.');
            } else {
                messagesContainer.appendChild(tempDiv);
            }
        })
        .catch(error => console.error('Error loading the template:', error));
}

function envoyerRequete(userInput) {
    fetch('/envoyerRequete', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userInput }),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Réponse reçue:', data);
        reponse = data["reponse"]
        createMessageAssistantFromTemplate("message-assistant", reponse)
    })
    .catch((error) => {
        console.error('Erreur:', error);
    });
}

function createMessageAssistantFromTemplate(templateName, reponse) {
    fetch(`/get_template/${templateName}`)
        .then(response => response.text())
        .then(template => {
            // Création d'un élément temporaire pour contenir le template HTML
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = template;
            
            // Mise à jour des parties variables du template
            tempDiv.querySelector('.timestamp').textContent = new Date().toLocaleTimeString();
            tempDiv.querySelector('.message-assistant-content').textContent = reponse;
            // Insérer le nouveau message dans le DOM
            const messagesContainer = document.querySelector('.messages-container');
            if (!messagesContainer) {
                console.log('Le conteneur de messages n\'a pas été trouvé.');
            } else {
                messagesContainer.appendChild(tempDiv);
            }
        })
        .catch(error => console.error('Error loading the template:', error));
}