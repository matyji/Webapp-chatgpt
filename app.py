from flask import Flask, render_template, request, jsonify
import asyncio
from openai import OpenAI
import json
import os
import json
from datetime import datetime
import shutil

app = Flask(__name__)

# Initialisez votre client AsyncOpenAI ici
client = OpenAI(
    base_url="http://localhost:3928/v1/",
    api_key="sk-xxx"
)

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
    # Chemin vers le fichier messages.json dans le dossier du thread
    json_file_path = os.path.join('Threads', f'{thread_id}', 'messages.jsonl')
    try:
        # Ouvrir le fichier en mode écriture pour effacer son contenu
        with open(json_file_path, 'w') as file:
            pass  # Le fichier est maintenant vidé
        return jsonify({'message': 'Thread cleaned successfully'}), 200
    except Exception as e:
        return jsonify({'message': f'Error cleaning thread: {str(e)}'}), 500


@app.route('/get_AI_reponse', methods=['POST'])
async def send_request_model():
    # Exemple de récupération de données de la requête, ajustez selon vos besoins
    data_user = request.json
    thread_id = data_user.get("thread_id", "")
    user_message = data_user.get("content", "")

    response = client.chat.completions.create(
        model="/home/t0276771/Bureau/Webapp chatGPT/model/mistral-ins-7b-q4/mistral-7b-instruct-v0.2.Q4_K_M.gguf",
        messages=[{"role": "user", "content": user_message}],
    )
    print(response)
    reponse = response.choices[0].message.content
    print(reponse)
    current_date = datetime.now() 
    date_update = current_date.strftime("%d/%m/%Y %H:%M")
    data_assistant = {"thread_id": thread_id,"role":"assistant","date_creation":date_update,"date_update":date_update,"object":"thread.message","type":"text","content": reponse}
    # Chemin vers le fichier messages.jsonl dans le dossier du thread
    base_dir = 'Threads'
    jsonl_file_path = os.path.join(base_dir, f'{thread_id}', 'messages.jsonl')

    # Ajouter data_user et data_assistant au fichier messages.jsonl
    with open(jsonl_file_path, 'a', encoding='utf-8') as file:
        file.write(json.dumps(data_user, ensure_ascii=False) + '\n')
        file.write(json.dumps(data_assistant, ensure_ascii=False) + '\n')

    return jsonify(data_assistant)


if __name__ == '__main__':
    app.run(app, debug=True)

