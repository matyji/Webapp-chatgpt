from flask import Flask, request, jsonify, stream_with_context, Response, render_template
import asyncio
from openai import OpenAI
import json
import os
import json
from datetime import datetime
import shutil
import requests
from Thread import Thread
from threading import Thread

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')


@app.route('/get_template/<template_name>')
def get_template(template_name):
    return render_template(f"{template_name}.html")


@app.route('/get_threads')
def get_threads():
    base_dir = 'Threads'
    threads_info = []

    # S'assurer que le dossier Threads existe
    if os.path.exists(base_dir):
        # Lister tous les sous-dossiers (threads) dans Threads
        for thread_dir in os.listdir(base_dir):
            thread_path = os.path.join(base_dir, thread_dir)
            # Vérifier si le chemin est un dossier pour exclure les fichiers
            if os.path.isdir(thread_path):
                json_path = os.path.join(thread_path, 'thread.json')
                # S'assurer que le fichier thread.json existe
                if os.path.exists(json_path):
                    # Lire les informations du thread depuis thread.json
                    with open(json_path, 'r', encoding='utf-8') as f:
                        thread_info = json.load(f)
                        # Ajouter un champ pour la date de mise à jour pour le tri
                        thread_info['date_update'] = thread_info.get('date_update')
                        threads_info.append(thread_info)
    
    # Trier les threads par date de mise à jour
    threads_info_sorted = sorted(threads_info, key=lambda x: datetime.strptime(x['date_update'], "%d/%m/%Y %H:%M"), reverse=False)
    
    return jsonify(threads_info_sorted)

@app.route('/get_thread_by/<thread_id>')
def get_thread_by(thread_id):
    # Chemin vers le fichier messages.jsonl dans le dossier du thread
    jsonl_file_path = os.path.join('Threads', f'{thread_id}', 'messages.jsonl')
    
    messages = []
    with open(jsonl_file_path, 'r', encoding='utf-8') as file:
        for line in file:
            messages.append(json.loads(line))
    
    return jsonify(messages)


@app.route('/new_Thread', methods=['GET'])
def new_thread():
    new_thread = Thread()  # Instancier la classe Thread, cela crée un nouveau dossier

    return jsonify(new_thread.json)


@app.route('/delete_thread/<thread_id>', methods=['DELETE'])
def delete_thread(thread_id):
    thread_dir = os.path.join('Threads', f'{thread_id}')
    try:
        if os.path.exists(thread_dir):
            shutil.rmtree(thread_dir)  # Supprime récursivement le dossier
            return jsonify({'message': 'Thread deleted successfully'}), 200
        else:
            return jsonify({'message': 'Thread not found'}), 404
    except Exception as e:
        return jsonify({'message': f'Error deleting thread: {str(e)}'}), 500


@app.route('/clean_thread/<thread_id>', methods=['POST'])
def clean_thread(thread_id):
    # Chemin vers le fichier messages.jsonl dans le dossier du thread
    jsonl_file_path = os.path.join('Threads', f'{thread_id}', 'messages.jsonl')
    json_file_path = os.path.join('Threads', f'{thread_id}', 'thread.json')

    try:
        # Effacer le contenu de messages.jsonl
        with open(jsonl_file_path, 'w') as file:
            pass  # Le fichier est maintenant vidé

        # Mettre à jour le champ content dans thread.json
        if os.path.exists(json_file_path):
            with open(json_file_path, 'r+', encoding='utf-8') as file:
                thread_data = json.load(file)
                thread_data['content'] = "No new message"
                # Repositionner le curseur au début du fichier avant de réécrire
                file.seek(0)
                json.dump(thread_data, file, ensure_ascii=False, indent=4)
                # Tronquer le fichier au cas où la nouvelle donnée est plus petite que l'ancienne
                file.truncate()

        return jsonify({'message': 'Thread cleaned successfully'}), 200
    except Exception as e:
        return jsonify({'message': f'Error cleaning thread: {str(e)}'}), 500

@app.route('/update_thread/<thread_id>', methods=['POST'])
def update_thread(thread_id):
    # Le chemin vers le dossier contenant les threads
    thread_dir = os.path.join('Threads', thread_id)
    thread_file_path = os.path.join(thread_dir, 'thread.json')

    if not os.path.exists(thread_file_path):
        return jsonify({'error': 'Thread not found'}), 404

    # Récupération des données envoyées par la requête POST
    data = request.get_json()

    try:
        # Chargement du contenu actuel du fichier thread.json
        with open(thread_file_path, 'r', encoding='utf-8') as file:
            thread_data = json.load(file)

        # Mise à jour du titre dans les données chargées
        thread_data['titre'] = data.get('titre', '')
        thread_data['content'] = data.get('content', '')
        thread_data['date_update'] = data.get('date_update', '')


        # Réécriture du fichier thread.json avec le titre mis à jour
        with open(thread_file_path, 'w', encoding='utf-8') as file:
            json.dump(thread_data, file, ensure_ascii=False, indent=4)

        return jsonify({'message': 'Thread title updated successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/get_AI_reponse', methods=['POST'])
async def send_request_model():
    # Initialisez votre client AsyncOpenAI ici
    client = OpenAI(
        base_url="http://localhost:3928/v1/",
        api_key="sk-xxx"
    )

    data_user = request.json
    thread_id = data_user.get("thread_id", "")
    user_message = data_user.get("content", "")
    prompt = "Tu es un assistant IA réponds moi uniquement en Francais:" + user_message

    # Chemin vers le fichier messages.jsonl dans le dossier du thread
    jsonl_file_path = os.path.join('Threads', thread_id, 'messages.jsonl')

    # Récupérer l'historique des messages et filtrer pour n'obtenir que {"role": ..., "content": ...}
    messages_history = []
    try:
        with open(jsonl_file_path, 'r', encoding='utf-8') as file:
            for line in file:
                msg = json.loads(line)
                # Conserver uniquement les champs "role" et "content"
                filtered_msg = {"role": msg["role"], "content": msg["content"]}
                messages_history.append(filtered_msg)
                
        # Ne garder que les 6 derniers messages
        # messages_history = messages_history[-6:]

    except FileNotFoundError:
        print("Le fichier messages.jsonl n'a pas été trouvé.")

    
    # Ajouter le dernier message de l'utilisateur à la fin de l'historique
    messages_history.append({"role": "user", "content":  prompt})

    # Envoyer la requête au modèle avec l'historique des messages comme contexte
    response = client.chat.completions.create(
        model="/chemin/vers/votre/modele",
        max_tokens=2048,
        messages=messages_history,
    )

    # Traiter la réponse de l'IA
    print(response)
    reponse = response.choices[0].message.content
    current_date = datetime.now() 
    date_update = current_date.strftime("%d/%m/%Y %H:%M")
    data_assistant = {
        "thread_id": thread_id,
        "role": "assistant",
        "date_creation": date_update,
        "date_update": date_update,
        "object": "thread.message",
        "type": "text",
        "content": reponse
    }

    # Ajouter data_user et data_assistant au fichier messages.jsonl
    with open(jsonl_file_path, 'a', encoding='utf-8') as file:
        file.write(json.dumps(data_user, ensure_ascii=False) + '\n')
        file.write(json.dumps(data_assistant, ensure_ascii=False) + '\n')

    return jsonify(data_assistant)


@app.route('/load_model')
def load_model():
    # Paramètres ou données à envoyer dans la requête POST au service / modèle
    data = {
        "llama_model_path": "/home/t0276771/Bureau/Hephaistos/model/mistral-ins-7b-q4/mistral-7b-instruct-v0.2.Q4_K_M.gguf",
        "ctx_len": 4096,
        "ngl": 100,
    }
    headers = {'Content-Type': 'application/json'}

    # URL du service ou du modèle à charger (exemple)
    model_service_url = 'http://localhost:3928/inferences/llamacpp/loadmodel'

    response = requests.post(model_service_url, json=data, headers=headers)

    if response.status_code == 200:
        return jsonify({"message": "Modèle chargé avec succès", "response": response.json()})
    else:
        return jsonify({"error": "Impossible de charger le modèle"}), response.status_code


@app.route('/get_model_status')
def get_model_status():
    # URL du service ou du modèle à charger (exemple)
    model_service_url = 'http://localhost:3928/inferences/llamacpp/modelstatus'

    response = requests.get(model_service_url)

    if response.status_code == 200:
        return jsonify(response.json())
    else:
        return jsonify({"error": "Impossible d'obtenir le status du modèle"}), response.status_code

if __name__ == '__main__':
    app.run(app, debug=True)

