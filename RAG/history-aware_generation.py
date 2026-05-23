from dotenv import load_dotenv
from langchain_chroma import Chroma
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
import os
load_dotenv()

persistent_directory = "db/chroma_db"
embedding = OpenAIEmbeddings(model="text-embedding-3-small")

db = Chroma(
    persist_directory=persistent_directory,
    embedding_function=embedding
)

model = ChatOpenAI(model="gpt-4o")

chat_history = []

def ask_question(user_question):
    global chat_history

    if chat_history:
        messages = [
            SystemMessage(content="Given the chat history, rewrite the new question to be standalone and searchable. Just return the rewritten question, nothing else."),
        ] + chat_history + [
            HumanMessage(content=user_question)
        ]

        result = model.invoke(messages)
        search_question = result.content.strip()
        print(f"Searching for: {search_question}")

    else:   
        search_question = user_question

    retriever = db.as_retriever(search_kwargs={"k": 3})
    docs = retriever.invoke(search_question)  

    combined_input = f"""Based on the following documents, please answer this question: {user_question} 
    Documents:
    {"\n".join([f"- {doc.page_content}" for doc in docs])}
    Please provide a clear, helpful answer using only the information from these documents.
    """

    messages = [
        SystemMessage(content="You are a helpful assistant that answers questions based on the provided documents and previous conversation history.")
    ] + chat_history + [
        HumanMessage(content=combined_input)
    ]
    result = model.invoke(messages)
    answer = result.content.strip()

    chat_history.append(HumanMessage(content=user_question))
    chat_history.append(AIMessage(content=answer))
    return answer

def start_chat():
    print("Welcome to the RAG chatbot! Type 'exit' to quit.")
    while True:
        question = input("Your question: ")
        if question.lower() in ("exit", "quit"):
            break
        if not question:
            continue
        ask_question(question)


if __name__ == "__main__":
    start_chat()