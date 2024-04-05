document.addEventListener('DOMContentLoaded', () => {
    const inputThreadTitle = document.getElementById('thread-title-input');
    inputThreadTitle.addEventListener('keypress', function(event) {
        const threadID = document.getElementById('thread-id').textContent;
        // Vérifie si la touche pressée est "Enter"
        if (event.key === 'Enter') {
            // Empêche le comportement par défaut de "Enter" qui peut rafraîchir la page
            event.preventDefault();

            // Obtient la valeur de l'input
            const title = this.value.trim();

            // Vérifie si l'input n'est pas vide
            if (title) {
                // Met à jour la div avec la valeur de l'input
                updateThread_title(threadID, title);

                // Ici, vous pouvez aussi appeler une fonction pour effectuer d'autres actions,
                // comme mettre à jour le titre du thread sur le serveur
            }
        }
    });
});

function updateThread_title(threadID, newTitle) {
    fetch(`/update_thread/${threadID}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({titre: newTitle})
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

document.addEventListener('DOMContentLoaded', () => {
    // Sélectionner le bouton et la section des paramètres de l'assistant
    const assistantSettingsButton = document.getElementById('show-assistant-settings');
    const assistantSettingsIcon = document.getElementById('show-assistant-settings-icon')
    const assistantSettings = document.getElementById('assistant-settings');
  
    assistantSettingsButton.addEventListener('click', () => {
      // Basculer une classe sur le bouton pour refléter l'état ouvert/fermé
      assistantSettingsIcon.classList.toggle('rotate');
  
      // Basculer l'affichage de la section des paramètres de l'assistant
      if (assistantSettingsIcon.classList.contains('rotate')) {
        assistantSettings.style.display = 'block'; // Ou utiliser une classe pour afficher
        let settings = JSON.parse(localStorage.getItem('assistantSettings'));
        document.getElementById("assistant-instructions").value = settings["instructions"];
        document.getElementById('RAG').checked = settings["RAG"];
      } else {
        assistantSettings.style.display = 'none'; // Ou utiliser une classe pour cacher
      }
    });
  });

  async function get_assistant_settings(thread_id){
    try {
        const response = await fetch(`/get_assistant_settings/${thread_id}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const settings = await response.json();
        localStorage.setItem('assistantSettings', JSON.stringify(settings));

        if(document.getElementById("assistant-instructions")){
            document.getElementById("assistant-instructions").value = settings["instructions"];
        }
        if(document.getElementById('RAG')){
            document.getElementById('RAG').checked = settings["RAG"];
        }

    } catch (error) {
        console.error('Erreur lors du chargement des messages:', error);
        div.innerHTML = 'Erreur lors du chargement des messages.';
    }
  }

  document.addEventListener('DOMContentLoaded', function() {
    const textarea = document.getElementById('assistant-instructions');
    const checkbox = document.getElementById('RAG');

    // Attacher un écouteur d'événement au textarea
    let timeoutId;

    textarea.addEventListener('input', function() {
        // Efface le timeout précédent pour s'assurer que seul le dernier est exécuté
        clearTimeout(timeoutId);
    
        // Définir un nouveau timeout
        timeoutId = setTimeout(() => {
            sendPostRequest();
        }, 500); // Attends 500 ms après la dernière touche pressée pour envoyer la requête
    });    

    // Attacher un écouteur d'événement à la checkbox
    checkbox.addEventListener('change', function() {
        sendPostRequest();
    });
});

async function sendPostRequest() {
    const textarea = document.getElementById('assistant-instructions');
    const checkbox = document.getElementById('RAG');
    const thread_id = document.getElementById('thread-id').textContent;
    const data = {
        textareaValue: textarea.value,
        checkboxChecked: checkbox.checked
    };

    try {
        const response = await fetch(`/update_assistant_settings/${thread_id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        get_assistant_settings(thread_id);
    } catch (error) {
        console.error('Erreur lors de l\'envoi des données:', error);
    }
}