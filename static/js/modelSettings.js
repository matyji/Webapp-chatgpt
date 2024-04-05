const rangeInputs = document.querySelectorAll('input[type="range"]')
const numberInput = document.querySelector('input[type="number"]')

function handleInputChange(e) {
  let target = e.target
  if (e.target.type !== 'range') {
    target = document.getElementById('range')
  } 
  const min = target.min
  const max = target.max
  const val = target.value
  
  target.style.backgroundSize = (val - min) * 100 / (max - min) + '% 100%'
}

rangeInputs.forEach(input => {
  input.addEventListener('input', handleInputChange)
})

numberInput.addEventListener('input', handleInputChange)

document.addEventListener('DOMContentLoaded', () => {
    // Sélectionner le bouton et la section des paramètres de l'assistant
    const modelSettingsButton = document.getElementById('show-model-settings');
    const modelSettingsIcon = document.getElementById('show-model-settings-icon')
    const modelSettings = document.getElementById('model-settings');
  
    modelSettingsButton.addEventListener('click', () => {
      // Basculer une classe sur le bouton pour refléter l'état ouvert/fermé
      modelSettingsIcon.classList.toggle('rotate');
  
      // Basculer l'affichage de la section des paramètres de l'assistant
      if (modelSettingsIcon.classList.contains('rotate')) {
        modelSettings.style.display = 'block'; // Ou utiliser une classe pour afficher
      } else {
        modelSettings.style.display = 'none'; // Ou utiliser une classe pour cacher
      }
    });
  });

  document.addEventListener('DOMContentLoaded', () => {
    // Select the button and the assistant settings section
    const inferenceSettingsButton = document.getElementById('show-inference-settings');
    const inferenceSettingsIcon = document.getElementById('show-inference-settings-icon');
    const inferenceSettings = document.getElementById('inference-settings');
    const inferenceToolbar = document.getElementById('toolbar-inference'); // Replace with your actual toolbar selector
  
    inferenceSettingsButton.addEventListener('click', () => {
      // Toggle the 'rotate' class on the icon
      inferenceSettingsIcon.classList.toggle('rotate');
  
      // Toggle the 'bis' and 'bis2' classes on the toolbar based on the 'rotate' state
      if (inferenceSettingsIcon.classList.contains('rotate')) {
        inferenceSettings.style.display = 'block'; // Or use a class to show
        inferenceToolbar.classList.remove('bis');
        inferenceToolbar.classList.add('bis2');
      } else {
        inferenceSettings.style.display = 'none'; // Or use a class to hide
        inferenceToolbar.classList.remove('bis2');
        inferenceToolbar.classList.add('bis');
      }
    });
  });

  document.addEventListener('DOMContentLoaded', () => {
    // Select the button and the assistant settings section
    const modelParameterButton = document.getElementById('show-model-parameters');
    const modelParameterIcon = document.getElementById('show-model-parameters-icon');
    const modelParameter = document.getElementById('model-parameters');
    const modelParameterToolbar = document.getElementById('toolbar-model-parameters'); // Use the correct toolbar selector

  
    modelParameterButton.addEventListener('click', () => {
      // Toggle the 'rotate' class on the icon
      modelParameterIcon.classList.toggle('rotate');
  
      // Toggle between 'bis' and 'bis2' classes on the toolbar based on the 'rotate' state
      if (!modelParameterIcon.classList.contains('rotate')) {
        // When the icon is not rotated, hide settings and switch to 'bis'
        modelParameter.style.display = 'none';
        modelParameterToolbar.classList.remove('bis2');
        modelParameterToolbar.classList.add('bis');
      } else {
        // When the icon is rotated, show settings and switch to 'bis2'
        modelParameter.style.display = 'block';
        modelParameterToolbar.classList.remove('bis');
        modelParameterToolbar.classList.add('bis2');
      }
    });
  });

  document.addEventListener('DOMContentLoaded', () => {
    // Select the button and the assistant settings section
    const engineSettingsButton = document.getElementById('show-engine-settings');
    const engineSettingsIcon = document.getElementById('show-engine-settings-icon');
    const engineSettings = document.getElementById('engine-settings');
    const engineSettingsToolbar = document.getElementById('toolbar-engine-settings'); // Use the correct toolbar selector

  
    engineSettingsButton.addEventListener('click', () => {
      // Toggle the 'rotate' class on the icon
      engineSettingsIcon.classList.toggle('rotate');
  
      // Toggle between 'bis' and 'bis2' classes on the toolbar based on the 'rotate' state
      if (!engineSettingsIcon.classList.contains('rotate')) {
        // When the icon is not rotated, hide settings and switch to 'bis'
        engineSettings.style.display = 'none';
        engineSettingsToolbar.classList.remove('bis2');
        engineSettingsToolbar.classList.add('bis');
      } else {
        // When the icon is rotated, show settings and switch to 'bis2'
        engineSettings.style.display = 'block';
        engineSettingsToolbar.classList.remove('bis');
        engineSettingsToolbar.classList.add('bis2');
        loadEngineParameter();
      }
    });
  });
  

document.addEventListener('DOMContentLoaded', () => {
    const rangeInput = document.getElementById('slider-ctx');
    const numberInput = document.getElementById('input-ctx');
    let debounceTimeout = null;
  
    const sendPostRequest = (value) => {
      // Here you would send your POST request with the value
      console.log('Sending POST request with value:', value);
  
      // For example:
      // fetch('/api/endpoint', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ value }),
      // })
      // .then(response => response.json())
      // .then(data => console.log(data))
      // .catch((error) => console.error('Error:', error));
    };
  
    const handleInput = (event) => {
      const value = event.target.value;
      numberInput.value = value;
  
      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(() => sendPostRequest(value), 1500); // Wait for 1 second after the last event
    };
  
    rangeInput.addEventListener('input', handleInput);
  
    numberInput.addEventListener('input', function() {
      rangeInput.value = this.value;
      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(() => sendPostRequest(this.value), 1500); // Same debounce for number input
    });
  });

function updateEngineParameter(thread_id, newValue){
    fetch(`/update_thread/${thread_id}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ctx: newValue})
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        loadEngineParameter(thread_id);
        // Vous pouvez ici mettre à jour l'interface utilisateur pour refléter le changement de titre
    })
    .catch((error) => {
        console.error('Erreur:', error);
    });
}

async function loadEngineParameter(thread_id){
    try {
        const response = await fetch(`/get_engine_parameters/${thread_id}`);
        const engineParameter = await response.json();

        let rangeInput = document.getElementById('slider-ctx');
        let numberInput = document.getElementById('input-ctx');
        rangeInput.value = engineParameter;
        numberInput.value = engineParameter;

        document.getElementById
    } catch (error) {
        console.error('Error:', error);
    }
}