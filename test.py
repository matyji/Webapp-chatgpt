import os
import asyncio
from openai import AsyncOpenAI

client = AsyncOpenAI(
    base_url="http://localhost:3928/v1/chat/completions",
    api_key="sk-xxx"
)



async def main():
    stream = await client.chat.completions.create(
        model="/home/t0276771/Bureau/Webapp chatGPT/model/mistral-ins-7b-q4/mistral-7b-instruct-v0.2.Q4_K_M.gguf",
        messages=[{"role": "user", "content": "Say this is a test"}],
        stream=True,
    )
    async for chunk in stream:
        print(chunk.choices[0].delta.content or "", end="")
    print()

asyncio.run(main())





"""
@app.route('/envoyerRequete', methods=['POST'])
async def send_request_to_openai():
    # Exemple de récupération de données de la requête, ajustez selon vos besoins
    data_user = request.json
    thread_id = data_user.get("thread_id", "")
    user_message = data_user.get("content", "")

    response = openai.completions.create(
    model="gpt-3.5-turbo-instruct",
    prompt=user_message,
    max_tokens=300,
    )
    reponse = response.choices[0].text.strip()
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
        socketio.emit('response', {'response': response.choices[0].text.strip()})"""