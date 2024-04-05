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
from flask_socketio import SocketIO
from langchain import hub
from langchain_community.document_loaders import DirectoryLoader
from langchain_community.vectorstores import Chroma
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnableParallel, RunnablePassthrough
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_core.prompts import PromptTemplate

app = Flask(__name__)
socketio = SocketIO(app)

global vectorstore
vectorstore = None

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
    new_thread = Thread()  # Instancier la classe Thread
    return jsonify(new_thread.get_thread_json())  # Utiliser get_thread_json pour obtenir les informations du thread en format JSON



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


        # Réécriture du fichier thread.json avec le titre mis à jour
        with open(thread_file_path, 'w', encoding='utf-8') as file:
            json.dump(thread_data, file, ensure_ascii=False, indent=4)

        return jsonify({'message': 'Thread title updated successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/update_assistant_settings/<thread_id>', methods=['POST'])
def update_assistant_settings(thread_id):
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
        thread_data['assistant_settings']['instructions'] = data.get('textareaValue', '')
        thread_data['assistant_settings']['RAG'] = data.get('checkboxChecked', '')


        # Réécriture du fichier thread.json avec le titre mis à jour
        with open(thread_file_path, 'w', encoding='utf-8') as file:
            json.dump(thread_data, file, ensure_ascii=False, indent=4)

        return jsonify({'message': 'Assistant settings updated successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/get_assistant_settings/<thread_id>')
def get_assistant_settings(thread_id):
    # Le chemin vers le dossier contenant les threads
    thread_dir = os.path.join('Threads', thread_id)
    thread_file_path = os.path.join(thread_dir, 'thread.json')

    if not os.path.exists(thread_file_path):
        return jsonify({'error': 'Thread not found'}), 404

    try:
        # Chargement du contenu actuel du fichier thread.json
        with open(thread_file_path, 'r', encoding='utf-8') as file:
            thread_data = json.load(file)

        # Mise à jour du titre dans les données chargées
        assistant_settings = thread_data.get('assistant_settings', '')

        return jsonify(assistant_settings), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/get_AI_reponse', methods=['POST'])
async def send_request_model():

    data_user = request.json
    thread_id = data_user.get("thread_id", "")
    user_message = data_user.get("content", "")
    instructions = data_user.get("instructions", "")
    RAG = data_user.get("RAG", "")
    prompt = instructions + "Reponds moi uniquement en Francais:" + user_message

    # Chemin vers le fichier messages.jsonl dans le dossier du thread
    jsonl_file_path = os.path.join('Threads', thread_id, 'messages.jsonl')
    thread_json_path = os.path.join('Threads', thread_id, 'thread.json')

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
    if RAG:
        complete_reponse = generate_RAG_reponse(messages_history)
    else:
        complete_reponse = generate_reponse(messages_history)

    # Traiter la réponse de l'IA
    current_date = datetime.now() 
    date_update = current_date.strftime("%d/%m/%Y %H:%M")

    with open(thread_json_path, 'r+', encoding='utf-8') as file:
        thread_data = json.load(file)
        thread_data['date_update'] = date_update
        if thread_data['content'] == "No new message":  # Si messages_history est vide
            thread_data['content'] = complete_reponse
        file.seek(0)
        json.dump(thread_data, file, ensure_ascii=False, indent=4)
        file.truncate()

    data_assistant = {
        "thread_id": thread_id,
        "role": "assistant",
        "date_creation": date_update,
        "date_update": date_update,
        "object": "thread.message",
        "type": "text",
        "content": complete_reponse
    }

    # Ajouter data_user et data_assistant au fichier messages.jsonl
    with open(jsonl_file_path, 'a', encoding='utf-8') as file:
        file.write(json.dumps(data_user, ensure_ascii=False) + '\n')
        file.write(json.dumps(data_assistant, ensure_ascii=False) + '\n')

    return jsonify(data_assistant)

def generate_reponse(messages_history):
        # Initialisez votre client AsyncOpenAI ici
    client = OpenAI(
        base_url="http://localhost:3928/v1/",
        api_key="sk-xxx"
    )
    
    response = client.chat.completions.create(
        model="/chemin/vers/votre/modele",
        max_tokens=2048,
        stream = True,
        messages=messages_history
    )
    complete_reponse = ""
    for chunk in response:
        reponse = chunk.choices[0].delta.content if chunk.choices[0].delta.content else ""
        socketio.emit('response', {'data': reponse})
        complete_reponse += reponse
    return complete_reponse

def generate_RAG_reponse(question):
    # Recuperer localement le vectorestore
    global vectorstore
    if vectorstore is None:
        embeddings = HuggingFaceEmbeddings(model_name="WhereIsAI/UAE-Large-V1")
        vectorstore = Chroma(
            persist_directory="./BD",
            embedding_function=embeddings,
        )
    retriever = vectorstore.as_retriever()
    #prompt = PromptTemplate.from_template("""Vous êtes assistant pour les tâches de réponses aux questions. Utilisez les éléments de contexte récupérés suivants pour répondre uniquement en francais à la question. Si vous ne connaissez pas la réponse, dites simplement que vous ne la savez pas. Utilisez trois phrases maximum et gardez la réponse concise.
    #    Question : {question}
    #    Context : {context}
    #    Répondre:"""
    #)
    prompt = PromptTemplate.from_template("""Vous êtes un assistant expert python. Si vous ne connaissez pas la réponse, dites simplement que vous ne la savez pas. Utilisez trois phrases maximum et gardez la réponse concise.
        Question : {question}
        Context : {context}
        Répondre:"""
    )
    llm = ChatOpenAI(
        base_url="http://localhost:3928/v1/",
        api_key="sk-xxx"
    )


    def format_docs(docs):
        return "\n\n".join(doc.page_content for doc in docs)


    rag_chain_from_docs = (
        RunnablePassthrough.assign(context=(lambda x: format_docs(x["context"])))
        | prompt
        | llm
        | StrOutputParser()
    )

    rag_chain_with_source = RunnableParallel(
        {"context": retriever, "question": RunnablePassthrough()}
    ).assign(answer=rag_chain_from_docs)

    final_reponse = ""
    for chunk in rag_chain_with_source.stream(question):
        if 'answer' in chunk and chunk['answer']:  # Vérifie si 'answer' est dans chunk et n'est pas vide
            socketio.emit('response', {'data': chunk["answer"]})
            final_reponse += chunk["answer"]
    return final_reponse
        

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
    socketio.run(app, debug=True)

