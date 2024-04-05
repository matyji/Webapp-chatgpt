import json
from langchain import hub
from langchain_community.document_loaders import DirectoryLoader
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter


embed_model_id = 'WhereIsAI/UAE-Large-V1'
dir_loader = DirectoryLoader("./Documents")
docs = dir_loader.load()
    
text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
splits = text_splitter.split_documents(docs)
vectorstore = Chroma.from_documents(documents=splits, embedding=HuggingFaceEmbeddings(model_name=embed_model_id), persist_directory="./BD")
vectorstore.persist()

print("Base de données initialisée")