import os
from langchain_community.document_loaders import DirectoryLoader, PyPDFLoader

from langchain_text_splitters import CharacterTextSplitter
from langchain_text_splitters import RecursiveCharacterTextSplitter

from langchain_openai import OpenAIEmbeddings
from langchain_chroma import Chroma

from dotenv import load_dotenv

load_dotenv()

def load_documents(docs_path='./docs'):
    if not os.path.exists(docs_path):
        raise FileNotFoundError(
            f"The directory {docs_path} does not exist. Please create it and add your company files."
        )
    
    loader = DirectoryLoader(
        path=docs_path,
        glob="**/*.pdf",
        loader_cls=PyPDFLoader,
    )
    documents = loader.load()

    if len(documents) == 0:
        raise FileNotFoundError(
            f"No .pdf files found in {docs_path}. Please add your company documents."
        )
        
    return documents


def split_documents(documents, chunk_size=1000, chunk_overlap=200):
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        length_function=len,
        add_start_index=True, 
        strip_whitespace=True
    )
    
    chunks = text_splitter.split_documents(documents)
    return chunks


def create_vector_store(chunks, persist_directory="db/chroma_db"):    
    embedding_model = OpenAIEmbeddings(model="text-embedding-3-small")
    # kiểm tra nếu đã có dữ liệu trong thư mục persist_directory, nếu có thì load lại vectorstore từ đó, nếu không thì tạo mới
    if os.path.exists(persist_directory) and os.listdir(persist_directory):
        vectorstore = Chroma(
            persist_directory=persist_directory,
            embedding_function=embedding_model,
            collection_metadata={"hnsw:space": "cosine"}
        )
        return vectorstore

    # Nếu chưa có dữ liệu, tiến hành tạo mới
    vectorstore = Chroma.from_documents(
        documents=chunks,
        embedding=embedding_model,
        persist_directory=persist_directory,
        collection_metadata={"hnsw:space": "cosine"}
    )
    
    return vectorstore


def main():
    documents = load_documents(docs_path='./docs')
    chunks = split_documents(documents, chunk_size=1000, chunk_overlap=200)
    vectorstore = create_vector_store(chunks, persist_directory="db/chroma_db")

if __name__ == "__main__":
    main()