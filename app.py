from flask import Flask, render_template, request, jsonify
from GPT_requete import send_message
import os
import openai
from openai import OpenAI
from flask_socketio import SocketIO

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
    data = request.json
    user_message = data.get("message", "")

    response = openai.completions.create(
    model="gpt-3.5-turbo-instruct",
    prompt=user_message,
    max_tokens=300,
    )
    return jsonify({"reponse" : response.choices[0].text.strip()})


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
