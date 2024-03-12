
// Déclaration de la variable div en dehors des fonctions pour qu'elle soit globale
let divThreads = document.getElementById('Threads');
let divChat = document.getElementById('Chat');
let divSettings = document.getElementById('Settings');
let divGrid = document.getElementById('grid');

document.getElementById('icon-arrow-left').addEventListener('click', function() {
    let icone = document.getElementById('icon-arrow-left');
    let icone2 = document.getElementById('icon-arrow-right');
    if (icone.style.display != "none") {
        icone.style.display = "none";
        icone2.style.display = "block";
        divThreads.style.display = "none"; // Utilise la variable div globale
        if(divSettings.style.display == "none"){
            divGrid.classList.remove('expanded-chat2');
            divGrid.classList.add('expanded-chat3');
        }else{
            divGrid.classList.add('expanded-chat1');
        }
    }
});

document.getElementById('icon-arrow-right').addEventListener('click', function() {
    let icone = document.getElementById('icon-arrow-right');
    let icone2 = document.getElementById('icon-arrow-left');
    if (icone.style.display != "none") {
        icone.style.display = "none";
        icone2.style.display = "block";
        divThreads.style.display = "block"; // Utilise la variable div globale
        if(divSettings.style.display == "none"){
            divGrid.classList.remove('expanded-chat3');
            divGrid.classList.add('expanded-chat2');
        }else{
            divGrid.classList.remove('expanded-chat1');
        }
    }
});


document.getElementById('icon2-arrow-right').addEventListener('click', function() {
    let icone = document.getElementById('icon2-arrow-right');
    let icone2 = document.getElementById('icon2-arrow-left');
    if (icone.style.display != "none") {
        icone.style.display = "none";
        icone2.style.display = "block";
        divSettings.style.display = "none"; // Utilise la variable div globale
        if(divThreads.style.display == "none"){
            divGrid.classList.remove('expanded-chat1');
            divGrid.classList.add('expanded-chat3');
        }else{
            divGrid.classList.add('expanded-chat2');
        }
    }
});

document.getElementById('icon2-arrow-left').addEventListener('click', function() {
    let icone = document.getElementById('icon2-arrow-left');
    let icone2 = document.getElementById('icon2-arrow-right');
    if (icone.style.display != "none") {
        icone.style.display = "none";
        icone2.style.display = "block";
        divSettings.style.display = "block"; // Utilise la variable div globale
        if(divThreads.style.display == "none"){
            divGrid.classList.remove('expanded-chat3');
            divGrid.classList.add('expanded-chat1');
        }else{
            divGrid.classList.remove('expanded-chat2');
        }
    }
});

document.addEventListener('DOMContentLoaded', function() {
    var toggleButton = document.getElementById('ThreadParamButton');
    var threadParam = document.getElementById('ThreadParam');

    // Afficher la div lorsque le bouton est cliqué
    toggleButton.addEventListener('click', function(event) {
        if(threadParam.style.display == 'none'){
            threadParam.style.display = 'block';
            event.stopPropagation(); // Empêche l'événement de se propager au document
        }else{
            threadParam.style.display = 'none';
        }
    });

    // Cacher la div lorsque l'on clique en dehors de celle-ci
    document.addEventListener('click', function(event) {
        var isClickInsideElement = threadParam.contains(event.target) || toggleButton.contains(event.target);
        
        if (!isClickInsideElement) {
            threadParam.style.display = 'none';
        }
    });
});