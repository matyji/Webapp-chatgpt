document.addEventListener('DOMContentLoaded', function() {
    fetch('/get_threads')
        .then(response => response.json())
        .then(threads => {
            const threadsContainer = document.querySelector('.Threads');
            const addThreadPromises = threads.map(thread => 
                createThreadFromTemplate('Thread', thread)
                .then(newThreadContent => {
                    // Assurez-vous de supprimer "selected" de tous les threads d'abord
                    document.querySelectorAll('.thread-content.selected').forEach(thread => {
                        thread.classList.remove('selected');
                    });
                    // Ajoutez ensuite "selected" au nouveau thread
                    newThreadContent.classList.add('selected');
                    document.getElementById("Thread-title").textContent = thread.titre;
                    document.getElementById("thread-title-input").value = thread.titre;
                    document.getElementById("thread-id").textContent = thread.id;
                })
                
            );
        })
        .catch(error => console.error('Error:', error));
});

function adjustSelectedClass() {
    // Supprimer la classe 'selected' de tous les éléments
    document.querySelectorAll('.thread-content.selected').forEach(function(thread) {
        thread.classList.remove('selected');
    });
};


document.getElementById('new-thread-btn').addEventListener('click', function() {
    const div = document.getElementById('messages-container'); // Remplacez 'maDiv' par l'ID de votre div
    div.innerHTML = '';
    fetch('/new_Thread')
        .then(response => response.json())
        .then(data => {
            console.log(data); // Afficher la réponse du serveur dans la console
            createThreadFromTemplate("Thread", data)
                .then(newThreadContent => {
                    // Assurez-vous de supprimer "selected" de tous les threads d'abord
                    document.querySelectorAll('.thread-content.selected').forEach(thread => {
                        thread.classList.remove('selected');
                    });
                    // Ajoutez ensuite "selected" au nouveau thread
                    newThreadContent.classList.add('selected');
                    document.getElementById("Thread-title").textContent = data['titre'];
                    document.getElementById("thread-title-input").value = data['titre'];
                    document.getElementById("thread-id").textContent = data['id'];
                });
        })
        .catch(error => console.error('Error:', error));
    });

function createThreadFromTemplate(templateName, data) {
    return fetch(`/get_template/${templateName}`) // Ajoutez "return" ici
        .then(response => response.text())
        .then(template => {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = template;
            // Mise à jour des parties variables du template
            tempDiv.querySelector('.thread-time').textContent = formatDateTime(data['date_update']);
            tempDiv.querySelector('.thread-title').textContent = data['titre'];
            tempDiv.querySelector('.thread-text').textContent = data['content'];
            const threadContent = tempDiv.querySelector('.thread-content');
            addClickListenerToThread(threadContent, data); // Ajoutez l'écouteur d'événements
            threadContent.id = data['id'];
            const threadClean = tempDiv.querySelector('.clean-thread');
            threadClean.id = "clean" + data['id'];
            const threadDelete = tempDiv.querySelector('.delete-thread');
            threadDelete.id = "delete" + data['id'];
            // Insérer le nouveau message dans le DOM
            const threadsContainer = document.querySelector('.Threads');
            if (threadsContainer) {
                threadsContainer.insertBefore(tempDiv.firstChild, threadsContainer.firstChild);
            } else {
                console.log('Le conteneur de messages n\'a pas été trouvé.');
            }
            return threadContent; // Retourne le contenu du thread pour une utilisation ultérieure
        });
    };    

function addClickListenerToThread(threadElement, data) {
    threadElement.addEventListener('click', function() {
        // Supprimer la classe 'selected' de tous les threads
        document.querySelectorAll('.thread-content').forEach(el => {
            el.classList.remove('selected');
        });

        // Ajouter la classe 'selected' à l'élément cliqué
        threadElement.classList.add('selected');
        document.getElementById("Thread-title").textContent = data['titre'];
        document.getElementById("thread-title-input").value = data['titre'];
        document.getElementById("thread-id").textContent = data['id'];
        displayChat(data['id']);
    });
}

function displayChat(threadId) {
    const div = document.getElementById('messages-container'); // Remplacez 'maDiv' par l'ID de votre div
    div.innerHTML = '';
    fetch(`/get_thread_by/${threadId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(messages => {
            messages.forEach(msg => {
                console.log(msg["date_update"]);
                if(msg["role"] === "user"){
                    createMessageUserFromTemplate("message-user", msg["content"], msg["date_update"]) 
                }else if(msg["role"] === "assistant"){
                    createMessageAssistantFromTemplate("message-assistant", msg["content"], msg["date_update"]) 
                }
            });
        })
        .catch(error => {
            console.error('Erreur lors de la récupération des messages:', error);
        });
}