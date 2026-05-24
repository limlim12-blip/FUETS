from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

from langchain_core.messages import HumanMessage, AIMessage, MessagesPlaceholder

from backend.src.core import db


load_dotenv()

def get_relevant_documents(query, db_path="db/chroma_db", k=3):    
    embedding_model = OpenAIEmbeddings(model="text-embedding-3-small")

    db = Chroma(
        persist_directory=db_path,
        embedding_function=embedding_model,
        collection_metadata={"hnsw:space": "cosine"}
    )
    # MMR retriever
    retriever = db.as_retriever(
        search_type="mmr",
        search_kwargs={
            "k": k,
            "fetch_k": 10,
            "lambda_mult": 0.5
        }
    )

    relevant_docs = retriever.invoke(query)
    
    return relevant_docs


def generate_answer(query, relevant_docs):

    prompt_template = ChatPromptTemplate.from_messages([
        ("system", "You are a helpful assistant that answers questions based on the provided documents and previous conversation history."),
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", (
            "Based on the following documents, please answer this question: {query}\n\n"
            "Documents:\n{context}\n\n"
            "Please provide a clear, helpful answer using only the information from these documents."
        ))
    ])

    llm = ChatOpenAI(model="gpt-4o", temperature=0)

    context_text = "\n".join([f"- {doc.page_content}" for doc in relevant_docs])

    rag_chain = prompt_template | llm | StrOutputParser()
    
    answer = rag_chain.invoke({
        "query": query,
        "context": context_text,
        "chat_history": chat_history
    })
    
    return answer

def main():
    llm = ChatOpenAI(model="gpt-4o", temperature=0)

    rewrite_prompt = ChatPromptTemplate.from_messages([
        ("system", "Given the chat history, rewrite the new question to be standalone and searchable. Just return the rewritten question, nothing else."),
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "New question: {user_question}")
    ])
    question_rewriter = rewrite_prompt | llm | StrOutputParser()

    chat_history = []

    while True:
        user_query = input("Your question: ").strip()
        if user_query.lower() in ["exit", "quit"]:
            print("Goodbye!")
            break         
        if not user_query:
            continue

        if chat_history:
            search_question = question_rewriter.invoke({
                "chat_history": chat_history,
                "user_question": user_query
            })
        else:
            search_question = user_query

        relevant_docs = get_relevant_documents(query=search_question)

        answer = generate_answer(query=user_query, relevant_docs=relevant_docs, chat_history=chat_history)

        chat_history.append(HumanMessage(content=user_query))
        chat_history.append(AIMessage(content=answer))


if __name__ == "__main__":
    main()