#!/bin/bash

# Recherche et tue les processus Flask et Nitro

# Tuer les processus Flask
echo "Recherche et tue les processus Flask..."
pids_flask=$(pgrep -f "flask")
if [ -n "$pids_flask" ]; then
    echo "Processus Flask trouvés. Tentative de les tuer..."
    kill -9 $pids_flask
    echo "Processus Flask tués avec succès."
else
    echo "Aucun processus Flask trouvé."
fi

# Tuer les processus Nitro
echo "Recherche et tue les processus Nitro..."
pids_nitro=$(pgrep -f "nitro")
if [ -n "$pids_nitro" ]; then
    echo "Processus Nitro trouvés. Tentative de les tuer..."
    kill -9 $pids_nitro
    echo "Processus Nitro tués avec succès."
else
    echo "Aucun processus Nitro trouvé."
fi
