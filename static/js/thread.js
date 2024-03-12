document.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById('deleteConfirmationModal').style.display = 'none';
    document.getElementById('cleanConfirmationModal').style.display = 'none';
});

document.addEventListener('DOMContentLoaded', function() {
    load_Threads();
});

async function load_Threads() {
    try {
        const response = await fetch('/get_threads');
        const threads = await response.json();

        const threadsContainer = document.querySelector('.Threads');
        threadsContainer.innerHTML = ''; // Nettoyer le conteneur avant d'ajouter les threads

        let lastThreadId = null; // Garder une trace du dernier ID de thread

        for (const thread of threads) {
            const newThreadContent = await createThreadFromTemplate('Thread', thread);
            // Une fois le nouveau contenu de thread ajouté, ajustez la sélection et les autres détails
            document.querySelectorAll('.thread-content').forEach(tc => tc.classList.remove('selected'));
            newThreadContent.classList.add('selected');
            document.getElementById("Thread-title").textContent = thread.titre;
            document.getElementById("thread-title-input").value = thread.titre;
            document.getElementById("thread-id").textContent = thread.id;

            lastThreadId = thread.id; // Mettre à jour le dernier ID de thread
        }

        // Vérifier si lastThreadId est défini avant d'appeler displayChat
        if (lastThreadId !== null) {
            displayChat(lastThreadId); // Appeler displayChat pour le dernier thread après la fin de la boucle
        } else {
            console.log('Aucun thread à afficher.');
        }
    } catch (error) {
        console.error('Error:', error);
    }
};


document.getElementById('new-thread-btn').addEventListener('click', function() {
    const div = document.getElementById('messages-container'); // Remplacez 'maDiv' par l'ID de votre div
    div.innerHTML = '';
    fetch('/new_Thread')
        .then(response => response.json())
        .then(data => {
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
            const threadDelete = tempDiv.querySelector('.delete-thread');
            threadClean.addEventListener('click', function() {
                // Afficher la boîte de dialogue de confirmation
                document.getElementById('cleanConfirmationModal').style.display = 'flex';
                // Stocker temporairement l'ID du thread sur le bouton de confirmation
                document.getElementById('confirmClean').setAttribute('data-thread-id', data['id']);
            });
            threadDelete.addEventListener('click', function() {
                // Afficher la boîte de dialogue de confirmation
                document.getElementById('deleteConfirmationModal').style.display = 'flex';
                // Stocker temporairement l'ID du thread sur le bouton de confirmation
                document.getElementById('confirmDelete').setAttribute('data-thread-id', data['id']);
            });
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
    const div = document.getElementById('messages-container'); // Utilisez l'ID correct de votre div
    div.innerHTML = ''; // Videz la div au début pour s'assurer qu'elle est toujours nettoyée

    fetch(`/get_thread_by/${threadId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(messages => {
            if (messages.length === 0) {
                // Si la réponse est vide, la div a déjà été vidée plus haut
                // Vous pouvez ajouter ici un message par défaut si nécessaire
                console.log("Aucun message à afficher.");
            } else {
                messages.forEach(msg => {
                    if(msg["role"] === "user"){
                        createMessageUserFromTemplate("message-user", msg["content"], msg["date_update"]);
                    }else if(msg["role"] === "assistant"){
                        createMessageAssistantFromTemplate("message-assistant", msg["content"], msg["date_update"]);
                    }
                });
            }
        })
        .catch(error => {
            console.error('Erreur lors du chargement des messages:', error);
            // Vous pourriez aussi afficher un message d'erreur dans la div ici, si désiré
            div.innerHTML = 'Erreur lors du chargement des messages.'; // Exemple d'un message d'erreur affiché
        });
}


function deleteThread(threadId) {
    fetch(`/delete_thread/${threadId}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Problem with deleting the thread');
        }
        return response.json();
    })
    .then(data => {
        console.log(data);
        load_Threads(); // Recharger les threads après la suppression
    })
    .catch(error => console.error('Error:', error));
}

function cleanThread(threadId) {
    fetch(`/clean_thread/${threadId}`, {
        method: 'POST'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Problem with cleaning the thread');
        }
        return response.json();
    })
    .then(data => {
        console.log(data);
        load_Threads(); // Recharger les threads après la suppression
    })
    .catch(error => console.error('Error:', error));
}


document.getElementById('confirmDelete').addEventListener('click', function() {
    const threadId = this.getAttribute('data-thread-id');
    if (threadId) {
        deleteThread(threadId);
        // Cacher la boîte de dialogue de confirmation après la suppression
        document.getElementById('deleteConfirmationModal').style.display = 'none';
    }
});

function hideModalDelete() {
    document.getElementById('deleteConfirmationModal').style.display = 'none';
}

document.getElementById('closeDelete').addEventListener('click', hideModalDelete);
document.getElementById('cancelDelete').addEventListener('click', hideModalDelete);


document.getElementById('confirmClean').addEventListener('click', function() {
    const threadId = this.getAttribute('data-thread-id');
    if (threadId) {
        cleanThread(threadId);
        // Cacher la boîte de dialogue de confirmation après la suppression
        document.getElementById('cleanConfirmationModal').style.display = 'none';
    }
});

function hideModalClean() {
    document.getElementById('cleanConfirmationModal').style.display = 'none';
}

document.getElementById('closeClean').addEventListener('click', hideModalClean);
document.getElementById('cancelClean').addEventListener('click', hideModalClean);