from langchain_community.document_loaders import DirectoryLoader, UnstructuredFileLoader
from langchain_community.vectorstores import FAISS
from langchain_community.vectorstores.utils import DistanceStrategy
from langchain_core.prompts import ChatPromptTemplate
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_experimental.text_splitter import SemanticChunker
from langchain_openai import (
    OpenAIEmbeddings,
    ChatOpenAI
)
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from dotenv import load_dotenv

from langchain_core.messages import HumanMessage, AIMessage
from langchain_core.runnables import RunnableLambda

from langchain_community.document_loaders import PyPDFLoader
import os

def format_docs(docs):
    formatted = []

    for doc in docs:
        source = doc.metadata.get("source", "unknown")

        formatted.append(
            f"Source: {source}\n{doc.page_content}"
        )

    return "\n\n".join(formatted)

def format_chat_history(history):
    formatted = []

    for msg in history:
        if isinstance(msg, HumanMessage):
            formatted.append(f"Human: {msg.content}")
        elif isinstance(msg, AIMessage):
            formatted.append(f"AI: {msg.content}")

    return "\n".join(formatted)

def rag_chatbot():
    load_dotenv()
    
    loader = DirectoryLoader(
        path="./docs",
        glob="**/*.pdf",
        loader_cls=PyPDFLoader,
        show_progress=True,
        use_multithreading=True,
    )

    docs = loader.load()

    MARKDOWN_SEPARATORS = [
        "\n#{1,6} ",
        "'''\n",
        "\n\\*\\*\\*+\n",
        "\n---+\n",
        "\n___+\n",
        "\n\n",
        "\n",
        " ",
        "",
    ]
    # Split documents into chunks
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size = 1200,
        chunk_overlap = 200,
        add_start_index = True,
        strip_whitespace = True,
        separators=MARKDOWN_SEPARATORS,
    )


    splits = text_splitter.split_documents(docs)

    embeddings = OpenAIEmbeddings(
        model = "text-embedding-3-small",
    )

    if os.path.exists("faiss_index"):

        vectorstore = FAISS.load_local(
            "faiss_index",
            embeddings,
            allow_dangerous_deserialization=True
        )

    else:

        vectorstore = FAISS.from_documents(
            documents=splits,
            embedding=embeddings,
            distance_strategy=DistanceStrategy.COSINE,
        )

        vectorstore.save_local("faiss_index")

        retriever = vectorstore.as_retriever(
            search_type="similarity_score_threshold",
            search_kwargs={"k": 5, "score_threshold": 0.2}
        )

    # Prompt 
    template = (
        "You are a strict, citation-focused assistant for a private knowledge base.\n"
        "RULES:\n"
        "1) Use ONLY the provided context to answer.\n"
        "2) If the answer is not clearly contained in the context, say: "
        "\"I don't know based on the provided documents.\"\n"
        "4) If applicable, cite sources as (source:page) using the metadata.\n\n"
        "Context:\n{context}\n\n"
        "Question: {question}"
    )

    prompt = ChatPromptTemplate.from_template(template)

    # rewrite
    rewrite_template = """
    Given the conversation history and the latest user question,
    rewrite the question so it is standalone and fully self-contained.

    Chat History:
    {chat_history}

    Question:
    {question}

    Standalone question:
    """
    rewrite_prompt = ChatPromptTemplate.from_template(rewrite_template)

    # LLM
    llm = ChatOpenAI(
        model="gpt-4o-mini",
        temperature=0,
    )

    # Rewriter Chain
    question_rewriter = (
        rewrite_prompt
        | llm
        | StrOutputParser()
    )

    # retrieve_context function
    def retrieve_context(input_dict):
        standalone_question = question_rewriter.invoke({
            "chat_history": format_chat_history(input_dict["chat_history"]),
            "question": input_dict["question"]
        })

        docs = retriever.invoke(standalone_question)
        return {
            "context": format_docs(docs),
            "question": standalone_question
        }

    chat_history = []

    # RAG Chain
    rag_chain = (
    RunnableLambda(retrieve_context)
    | prompt
    | llm
    | StrOutputParser()
    )
    

    while True:
        user_input = input("your question: ").strip()
        if user_input.lower() == "exit":
            print("Exiting the chatbot. Goodbye!")
            break
        answer = rag_chain.invoke({
            "question": user_input,
            "chat_history": chat_history
        })
        print(f"Answer: {answer}\n")
        chat_history.append(HumanMessage(content=user_input))
        chat_history.append(AIMessage(content=answer))

if __name__ == "__main__":
    rag_chatbot()