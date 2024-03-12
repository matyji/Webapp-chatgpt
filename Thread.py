from datetime import datetime
import os
import uuid
import json

class Thread:
    def __init__(self, base_dir='Threads'):
        self.base_dir = base_dir
        self.id = str(uuid.uuid4())[:8] 
        self.ID = f"Thread_{self.id}"
        self.path = os.path.join(self.base_dir, f"Thread_{self.id}")
        os.makedirs(self.path, exist_ok=True)  # Créer le dossier
        self.title = "New Thread"
        self.content = "No new message"
        now = datetime.now() 
        self.date_creation = now.strftime("%d/%m/%Y %H:%M")
        self.json = {"id": self.ID, "titre": self.title, "content": self.content, "date_creation": self.date_creation, "date_update": self.date_creation}

        self.save_thread_info()
        self.create_thread_messages()

    def save_thread_info(self):
        # Chemin complet vers le fichier thread.json
        json_path = os.path.join(self.path, 'thread.json')
        # Écriture de self.json dans thread.json
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(self.json, f, ensure_ascii=False, indent=4)

    def create_thread_messages(self):
        try:
            jsonl_file_path = os.path.join(self.path, 'messages.jsonl')
            with open(jsonl_file_path, 'w', encoding='utf-8') as file:
                pass  # Pas besoin d'écrire quoi que ce soit, juste créer le fichier
        except Exception as e:
            print(f"Erreur lors de la création du fichier : {e}")

