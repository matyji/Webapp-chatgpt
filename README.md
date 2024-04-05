## Hephaistos : Assistant IA Local avec Mistral-7B-GGUF

Bienvenue sur Hephaistos, une application Flask conçue pour intégrer de manière fluide la puissance du modèle de langage large Mistral-7B-GGUF pour une utilisation locale. Hephaistos offre une interface web conviviale qui apporte des capacités d'IA sophistiquées à portée de main sans nécessiter de configuration complexe ou de dépendances au cloud. Avec des fonctionnalités telles que Nitro pour une inférence accélérée, des conversations basées sur des threads et des discussions enrichies par des documents, Hephaistos est votre porte d'entrée pour explorer l'IA localement avec aisance.

<p align="center">
    <img src="static/images/ai.png" alt="Application Hephaistos" style="width: 20%; min-width: 300px; display: block; margin: auto;">
</p>

[![Flask](https://img.shields.io/badge/framework-Flask-blue.svg)](https://flask.palletsprojects.com/en/2.0.x/)
[![Python 3.7+](https://img.shields.io/badge/python-3.7+-blue.svg)](https://www.python.org/downloads/release/python-370/)

**Fonctionnalités Clés :**

- **Intégration de Nitro :** Profitez de Nitro (https://nitro.jan.ai/), un serveur d'inférence rapide et léger de seulement 3 Mo, pour dynamiser vos applications IA locales.
- **Conversations Multi-threads :** Créez plusieurs fils de discussion pour gérer des conversations séparées avec le modèle Mistral-7B-GGUF, améliorant l'interaction utilisateur.
- **Interaction Basée sur des Instructions :** Chaque conversation peut être guidée par des instructions spécifiques, offrant des réponses personnalisées de la part du modèle.
- **Discussion avec Documents :** Intégrez des documents dans vos conversations pour que le modèle puisse puiser des informations, utilisant la puissance de la génération augmentée par récupération (RAG) pour des interactions enrichies.

### Prérequis

Pour une utilisation optimale d'Hephaistos, il est requis d'avoir une carte graphique NVIDIA disposant d'au moins 8 Go de VRAM. Cette configuration est nécessaire pour tirer pleinement parti des capacités de calcul du modèle Mistral-7B-GGUF et assurer une expérience fluide et réactive.

### Pour Commencer

Pour démarrer avec Hephaistos, suivez ces étapes simples :

1. Clonez le dépôt :

- ```git clone https://github.com/matyji/hephaistos.git```

2. Créez un environnement virtuel :

- ```python3 -m venv env```

3. Activez l'environnement virtuel :

- ```source env/bin/activate```

4. Installez les dépendances requises :

- ```pip install -r requirements.txt```

5. Lancez l'application :

- ```./App_start.sh```

- Visitez `http://localhost:5000` dans votre navigateur pour commencer à explorer les capacités de Hephaistos avec Mistral-7B-GGUF.

6. Fermer l'application ( important pour ferme le server nitro)

- ```./stop_app.sh```

### Documentation & Support

Pour des instructions plus détaillées et un support, documentation : `en travaux`. 

Si vous rencontrez des problèmes ou avez des suggestions, n'hésitez pas à ouvrir un problème sur notre [dépôt GitHub](https://github.com/matyji/hephaistos/issues).

### Crédits

L'interface visuelle d'Hephaistos s'inspire et modifie celle de l'application Jan (https://github.com/janhq/jan). Nous exprimons notre gratitude à l'équipe de Jan pour leur travail.

### Remerciements

Ce projet a été rendu possible par la disponibilité du modèle Mistral-7B-GGUF et de la technologie du serveur Nitro. Nous reconnaissons également les contributions de la communauté open source pour rendre des projets comme celui-ci réalisables.

