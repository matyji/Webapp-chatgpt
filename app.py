from flask import Flask, render_template, request, jsonify
import os
import openai
from openai import OpenAI
from flask_socketio import SocketIO
from Thread import Thread
import json
from datetime import datetime

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

openai.api_key = "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"

@app.route('/')
def index():
    return render_template('index.html')


@app.route('/get_template/<template_name>')
def get_template(template_name):
    return render_template(f"{template_name}.html")



@app.route('/envoyerRequete', methods=['POST'])
async def send_request_to_openai():
    # Exemple de récupération de données de la requête, ajustez selon vos besoins
    data_user = request.json
    thread_id = data_user.get("threadID", "")
    print(data_user)
    user_message = data_user.get("content", "")

    response = openai.completions.create(
    model="gpt-3.5-turbo-instruct",
    prompt=user_message,
    max_tokens=300,
    )
    reponse = response.choices[0].text.strip()
    current_date = datetime.now() 
    date_update = current_date.strftime("%d/%m/%Y %H:%M")
    data_assistant = {"thread_id": thread_id,"role":"assistant","date_creation":date_update,"date_update": date_update,"object":"thread.message","type":"text","content": reponse}
    # Chemin vers le fichier messages.jsonl dans le dossier du thread
    base_dir = 'Threads'
    jsonl_file_path = os.path.join(base_dir, f'{thread_id}', 'messages.jsonl')

    # Ajouter data_user et data_assistant au fichier messages.jsonl
    with open(jsonl_file_path, 'a', encoding='utf-8') as file:
        file.write(json.dumps(data_user, ensure_ascii=False) + '\n')
        file.write(json.dumps(data_assistant, ensure_ascii=False) + '\n')

    return jsonify(data_assistant)

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



@socketio.on('send_request')
def handle_send_request(data):
    user_message = data['message']
    stream = openai.completions.create(
        model="gpt-3.5-turbo-instruct",
        prompt=user_message,
        max_tokens=300,
        stream=True
    )
    for response in stream:
        socketio.emit('response', {'response': response.choices[0].text.strip()})

if __name__ == '__main__':
    socketio.run(app, debug=True)
