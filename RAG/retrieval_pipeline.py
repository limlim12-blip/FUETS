from langchain_chroma import Chroma
from langchain_openai import OpenAIEmbeddings
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser


load_dotenv()

def get_relevant_documents(query, db_path="db/chroma_db", k=3):    
    embedding_model = OpenAIEmbeddings(model="text-embedding-3-small")

    db = Chroma(
        persist_directory=db_path,
        embedding_function=embedding_model,
        collection_metadata={"hnsw:space": "cosine"}
    )

    retriever = db.as_retriever(search_kwargs={"k": k})

    relevant_docs = retriever.invoke(query)
    
    return relevant_docs


def generate_answer(query, relevant_docs):

    prompt_template = ChatPromptTemplate.from_messages([
        ("system", "You are a helpful assistant."),
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
        "context": context_text
    })
    
    return answer

def main():
    while True:
        user_query = input("Câu hỏi của bạn: ").strip()
        if user_query.lower() in ["exit", "quit"]:
            break
            
        if not user_query:
            continue
if __name__ == "__main__":
    main()