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
        createMessageUserFromTemplate("message-user", userInput);
        envoyerRequete(userInput);
    }
}


document.getElementById('send-button').addEventListener('click', sendMessage);
document.getElementById('message-input').addEventListener('keydown', function(event){
    if(event.key === 'Enter' && ! event.shiftKey){
        sendMessage();
    }
});



function createMessageUserFromTemplate(templateName, messageContent, date) {
    fetch(`/get_template/${templateName}`)
        .then(response => response.text())
        .then(template => {
            // Création d'un élément temporaire pour contenir le template HTML
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = template;
            
            // Mise à jour des parties variables du template
            tempDiv.querySelector('.timestamp').textContent = date;
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
    const threadID = document.getElementById("thread-id").textContent;
    let date_update = getCurrentDateTimeFormatted();
    console.log(date_update)
    let data_user = {"thread_id":threadID,"role":"user","date_creation":date_update,"date_update":date_update,"object":"thread.message","type":"text","content": userInput};
    fetch('/envoyerRequete', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data_user),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Réponse reçue:', data);
        reponse = data["content"]
        createMessageAssistantFromTemplate("message-assistant", reponse)
    })
    .catch((error) => {
        console.error('Erreur:', error);
    });
}

function createMessageAssistantFromTemplate(templateName, reponse, date) {
    fetch(`/get_template/${templateName}`)
        .then(response => response.text())
        .then(template => {
            // Création d'un élément temporaire pour contenir le template HTML
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = template;
            
            // Mise à jour des parties variables du template
            tempDiv.querySelector('.timestamp').textContent = formatDateTime(date);
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


function formatDateTime(dateTimeString) {
    console.log(dateTimeString);
    // Vérifier si dateTimeString est défini
    if (!dateTimeString) {
        console.error('formatDateTime appelé avec une valeur undefined ou null');
        return ''; // Retourner une chaîne vide ou une valeur par défaut
    }

    // Parser manuellement la chaîne de date pour obtenir jour, mois, année, heure et minute
    const [datePart, timePart] = dateTimeString.split(' ');
    const [day, month, year] = datePart.split('/').map(num => parseInt(num, 10));
    const [hour, minute] = timePart.split(':').map(num => parseInt(num, 10));

    const dateTime = new Date(year, month - 1, day, hour, minute);
    const now = new Date();

    const isToday = dateTime.getDate() === now.getDate() &&
                    dateTime.getMonth() === now.getMonth() &&
                    dateTime.getFullYear() === now.getFullYear();

    if (isToday) {
        return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    } else {
        return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    }
}


function getCurrentDateTimeFormatted() {
    const now = new Date();

    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Janvier est 0 !
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}`;
}