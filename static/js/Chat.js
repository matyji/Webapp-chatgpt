document.addEventListener('DOMContentLoaded', function() {
    var textarea = document.getElementById('message-input');
    var sendButton = document.getElementById('send-button');
    var threadsContainer = document.querySelector('.Threads'); // Assurez-vous que la classe est correcte

    // Fonction pour vérifier le contenu du textarea et activer/désactiver le bouton
    function toggleButtonState() {
        // Vérifie si le textarea n'est pas vide et si la div Threads contient quelque chose
        var isTextareaNotEmpty = textarea.value.trim().length > 0;
        var doesThreadsContainerHaveContent = threadsContainer.innerHTML.trim().length > 0;
        
        // Le bouton est activé si les deux conditions sont vraies, sinon il est désactivé
        sendButton.disabled = !(isTextareaNotEmpty && doesThreadsContainerHaveContent);
    }

    // Écoute les événements 'input' sur le textarea
    textarea.addEventListener('input', toggleButtonState);

    // Vérifie également l'état quand le contenu de la div Threads change
    // Ceci est un exemple simple qui suppose que le contenu de Threads change rarement.
    // Pour une application plus dynamique, vous pourriez devoir observer les changements dans la div Threads
    if (threadsContainer) {
        new MutationObserver(toggleButtonState).observe(threadsContainer, { childList: true, subtree: true });
    }

    // Vérifie l'état initial au chargement de la page
    toggleButtonState();

    get_model_status();
});


function get_model_status(){
    fetch('/get_model_status')
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if(data["model_loaded"] == false){
            setModeleInactive();
        }else{
            setModeleActive();
        }
    })
    .catch(error => {
        console.error("Erreur lors de la requête:", error);
    });
}

async function sendMessage(valeurInput) {
    let sendButton = document.getElementById('send-button');

    // Vérifie si le bouton est désactivé
    if (sendButton.disabled) {
        // Le bouton est désactivé, donc ne rien faire (sortir de la fonction)
        console.log('Le bouton est désactivé.');
        return;
    }else{
        let date = getCurrentDateTimeFormatted();
        await createMessageUserFromTemplate("message-user", valeurInput, date);
        await createMessageAssistantFromTemplate("message-assistant", "", date);
        get_AI_reponse(valeurInput);

    }
}

$(document).ready(function(){
    var socket = io.connect(window.location.protocol + '//' + window.location.hostname + ':' + window.location.port);
    socket.on('connect', function() {
        console.log('Websocket connecté');
    });

    socket.on('response', function(msg) {
        window.onload = function() {
            scrollToBottomMessage();
          };
        // Trouver la dernière div .message.assistant-message dans .messages-container
        var lastAssistantMessage = $('.messages-container .message.assistant-message').last();
    
        // À l'intérieur de cette div, trouver .message-content-assistant
        var messageContentAssistant = lastAssistantMessage.find('.message-assistant-content');
    
        // Vérifier si le message contient une propriété 'data' ou ajuster selon la structure de 'msg'
        var messageText = msg.data;
    
        // Ajouter le texte du message à l'élément .message-content-assistant
        // Assurez-vous que messageContentAssistant n'est pas vide et existe dans le DOM
        if(messageContentAssistant.length > 0) {
            // Si .message-content-assistant est vide, initialisez-le avec le message
            // Sinon, ajoutez le message à la suite
            if(messageContentAssistant.html().trim() === "") {
                messageContentAssistant.html(messageText);
            } else {
                messageContentAssistant.append(messageText);
                scrollToBottomMessage();
                processCodeBlocks(messageContentAssistant);
                hljs.highlightAll();
            }
        } else {
            console.log("Élément .message-content-assistant introuvable.");
        }
    });
});

function processCodeBlocks(container) {
    let html = container.html();

    // Étendu regex pour capturer facultativement le langage spécifié après les ```
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    
    html = html.replace(codeBlockRegex, function(match, lang, code) {
        const languageClass = lang ? `language-${lang}` : 'language-plaintext';
        return `<div class="code-header">
                    <span>${lang || 'Code'}</span>
                    <span>
                        <button class="flex gap-1 items-center copy-code-button">Copy code</button>
                    </span>
                </div>
                <pre><code class="${languageClass}">${escapeHTML(code)}</code></pre>`;
    });

    // Mettre à jour le contenu de la div avec le nouveau HTML
    container.html(html);
}

function get_AI_reponse(userInput) {
    const threadID = document.getElementById("thread-id").textContent;
    let date_update = getCurrentDateTimeFormatted();
    let data_user = {"thread_id":threadID,"role":"user","date_creation":date_update,"date_update":date_update,"object":"thread.message","type":"text","content": userInput};
    let model_status = document.querySelector(".status-text").style.color;
    if(model_status == "rgb(220, 20, 60)"){
        loadModel().then(()=>{
            $.ajax({
                type: "POST",
                url: "/get_AI_reponse",
                contentType: "application/json",
                data: JSON.stringify(data_user),
                dataType: "json",
                success: function(response) {
                    console.log('Prompt envoyé avec succès');
                    // Vous pouvez également choisir d'initialiser l'interface ici si nécessaire
                },
                error: function(error) {
                    console.log('Erreur lors de l\'envoi du prompt');
                }
            })
        });
    }else{
        $.ajax({
            type: "POST",
            url: "/get_AI_reponse",
            contentType: "application/json",
            data: JSON.stringify(data_user),
            dataType: "json",
            success: function(response) {
                console.log('Prompt envoyé avec succès');
                // Vous pouvez également choisir d'initialiser l'interface ici si nécessaire
            },
            error: function(error) {
                console.log('Erreur lors de l\'envoi du prompt');
            }
        })
    }
}

document.getElementById('send-button').addEventListener('click', sendMessage);
document.getElementById('message-input').addEventListener('keydown', function(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        // Récupérer la valeur entrée par l'utilisateur
        let userInput = document.getElementById('message-input').value;
        // Réinitialiser la valeur de l'input
        document.getElementById('message-input').value = ''; 
        // Envoyer le message
        sendMessage(userInput);
        // Enlever le focus de l'input pour faire disparaître le curseur
        document.getElementById('message-input').blur();
    }
});

function createMessageUserFromTemplate(templateName, messageContent, date) {
    return new Promise((resolve, reject) => {
        fetch(`/get_template/${templateName}`)
            .then(response => response.text())
            .then(template => {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = template;
                
                tempDiv.querySelector('.timestamp').textContent = formatDateTime(date);
                tempDiv.querySelector('.message-content-user').innerHTML = messageContent;
                
                const messagesContainer = document.querySelector('.messages-container');
                if (!messagesContainer) {
                    console.log('Le conteneur de messages n\'a pas été trouvé.');
                    reject('Le conteneur de messages n\'a pas été trouvé.');
                } else {
                    messagesContainer.appendChild(tempDiv);
                    resolve(); // Résoudre la promesse une fois l'opération terminée
                }
            })
            .catch(error => {
                console.error('Error loading the template:', error);
                reject(error); // Rejeter la promesse en cas d'erreur
            });
    });
}

function createMessageAssistantFromTemplate(templateName,content, date) {
    console.log(date);
    return new Promise((resolve, reject) => {
        fetch(`/get_template/${templateName}`)
            .then(response => response.text())
            .then(template => {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = template;
                tempDiv.querySelector('.timestamp').textContent = formatDateTime(date);
                tempDiv.querySelector('.message-assistant-content').innerHTML = formatMessageContent(content);
                
                const messagesContainer = document.querySelector('.messages-container');
                if (!messagesContainer) {
                    console.log('Le conteneur de messages n\'a pas été trouvé.');
                    reject('Le conteneur de messages n\'a pas été trouvé.');
                } else {
                    messagesContainer.appendChild(tempDiv);
                    resolve(); // Résoudre la promesse une fois l'opération terminée
                }
            })
            .catch(error => {
                console.error('Error loading the template:', error);
                reject(error); // Rejeter la promesse en cas d'erreur
            });
    });
}

function formatMessageContent(messageContent) {
    // Détection et formatage des blocs de code avec l'indication de langage pour highlight.js
    const codeRegex = /```(\w+)?\n([\s\S]*?)```/g; // Regex pour détecter les blocs de code avec langage facultatif

    return messageContent.replace(codeRegex, function(match, lang, code) {
        const uniqueId = `code-${Date.now()}`;
        const languageClass = lang ? `language-${lang}` : 'language-plaintext';
        return `<div class="code-header">
                    <span>${lang}</span>
                    <span>
                        <button class="flex gap-1 items-center copy-code-button">
                            <svg class="icon-sm" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M12 3.5C10.8954 3.5 10 4.39543 10 5.5H14C14 4.39543 13.1046 3.5 12 3.5ZM8.53513 3.5C9.22675 2.3044 10.5194 1.5 12 1.5C13.4806 1.5 14.7733 2.3044 15.4649 3.5H17.25C18.9069 3.5 20.25 4.84315 20.25 6.5V18.5C20.25 20.1569 19.1569 21.5 17.25 21.5H6.75C5.09315 21.5 3.75 20.1569 3.75 18.5V6.5C3.75 4.84315 5.09315 3.5 6.75 3.5H8.53513ZM8 5.5H6.75C6.19772 5.5 5.75 5.94772 5.75 6.5V18.5C5.75 19.0523 6.19772 19.5 6.75 19.5H17.25C18.0523 19.5 18.25 19.0523 18.25 18.5V6.5C18.25 5.94772 17.8023 5.5 17.25 5.5H16C16 6.60457 15.1046 7.5 147.5H10C8.89543 7.5 8 6.60457 8 5.5Z" fill="currentColor"></path>
                            </svg>
                            Copy code
                        </button>
                    </span>
                </div>
                <pre><code class="${languageClass}">${escapeHTML(code)}</code></pre>`;
    });
}

document.addEventListener('click', function(event) {
    if (event.target.classList.contains('copy-code-button')) {
        // Trouvez l'élément <pre><code> le plus proche pour obtenir le texte à copier
        const codeBlock = event.target.closest('.code-header').nextElementSibling.querySelector('code');
        const codeToCopy = codeBlock.innerText;
        navigator.clipboard.writeText(codeToCopy).then(() => {
            // Affichez une confirmation ici
            event.target.innerHTML = `<img src="./static/images/saved.png" class="icon-sm" width="24" height="24"></img> Copied!`;
            setTimeout(() => {
                event.target.innerHTML = `<svg class="icon-sm" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M12 3.5C10.8954 3.5 10 4.39543 10 5.5H14C14 4.39543 13.1046 3.5 12 3.5ZM8.53513 3.5C9.22675 2.3044 10.5194 1.5 12 1.5C13.4806 1.5 14.7733 2.3044 15.4649 3.5H17.25C18.9069 3.5 20.25 4.84315 20.25 6.5V18.5C20.25 20.1569 19.1569 21.5 17.25 21.5H6.75C5.09315 21.5 3.75 20.1569 3.75 18.5V6.5C3.75 4.84315 5.09315 3.5 6.75 3.5H8.53513ZM8 5.5H6.75C6.19772 5.5 5.75 5.94772 5.75 6.5V18.5C5.75 19.0523 6.19772 19.5 6.75 19.5H17.25C18.0523 19.5 18.25 19.0523 18.25 18.5V6.5C18.25 5.94772 17.8023 5.5 17.25 5.5H16C16 6.60457 15.1046 7.5 147.5H10C8.89543 7.5 8 6.60457 8 5.5Z" fill="currentColor"></path>
                </svg>
                Copy code`;
            }, 2000);
        }).catch(err => {
            console.error('Could not copy text: ', err);
        });
    }
});


document.getElementById('shortcut').addEventListener('click', loadModel);

async function loadModel() {
    try {
        const response = await fetch('/load_model');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data["message"] == "Modèle chargé avec succès") {
            document.querySelector(".notification-message").textContent = "Model mistral-7b has been started.";
            document.querySelector(".notification").style.display = 'flex'; // Affiche la notification
            setModeleActive();
            // Masque la notification après 3 secondes
            setTimeout(() => {
                document.querySelector(".notification").style.display = 'none';
            }, 3000);
        }
        return data; // Retourne les données pour les chaînages ultérieurs
    } catch (error) {
        console.error("Erreur lors de la requête:", error);
        throw error; // Relance l'erreur pour le chaînage de promesses
    }
}

function scrollToBottomMessage() {
    var div = document.querySelector('.messages-container');
    div.scrollTop = div.scrollHeight;
}

function setModeleActive(){
    document.querySelector(".status-text").style.color = "#2f855a";
    document.querySelector(".status-dot").style.backgroundColor = "#48BB78";
}

function setModeleInactive(){
    document.querySelector(".status-text").style.color = "#DC143C";
    document.querySelector(".status-dot").style.backgroundColor = "#ff3c3c";
}

function updateThread_attribute(threadID, newTitle, content, date) {
    fetch(`/update_thread/${threadID}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({titre: newTitle, content: content, date_update: date})
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

  

function changeButtonText(button, originalText) {
    button.innerHTML = `<svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m5 12 4.7 4.5 9.3-9"/>
    </svg> Copied!`; // Ajoutez ici le SVG de votre choix
    setTimeout(() => {
        button.innerHTML = originalText;
    }, 3000); // Revenez au texte original après 2 secondes
}


function escapeHTML(html) {
    // Cette fonction remplace les caractères spéciaux par leurs entités HTML pour une affichage correct
    return html
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function formatDateTime(dateTimeString) {
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