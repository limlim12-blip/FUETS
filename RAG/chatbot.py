from langchain_community.document_loaders import DirectoryLoader, UnstructuredFileLoader
from langchain_community.vectorstores import FAISS
from langchain_community.vectorstores.utils import DistanceStrategy
from langchain_core.prompts import ChatPromptTemplate
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import openAIEmbeddings, ChatOpenAI
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from dotenv import load_dotenv

def rag_chatbot():
    load_dotenv()
    loader = DirectoryLoader(
        path="./data",
        glob="**/*",
        loader_cls=UnstructuredFileLoader,
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

    embeddings = openAIEmbeddings(
        model = "text-embedding-3-mini"
    )

    vectorstore = FAISS.from_documents(
        documents=splits,
        embedding=embeddings,
        distance_strategy=DistanceStrategy.COSINE,
    )

    retriever = vectorstore.as_retriever(
        search_type="similarity_score_threshold",
        search_kwargs={"k": 5, "score_threshould": 0.2}
    )

    # Prompt 
    template = (
        "You are a strict, citation-focused assistant for a private knowledge base.\n"
        "RULES:\n"
        "1) Use ONLY the provided context to answer.\n"
        "2) If the answer is not clearly contained in the context, say: "
        "\"I don't know bases on the provided documents.\"\n"
        "4) If applicable, city sources as (source:page) using the metadata.\n\n"
        "Context:\n{context}\n\n"
        "Question: {question}"
    )

    prompt = ChatPromptTemplate.from_template(template)

    # LLM
    llm = ChatOpenAI(
        model="gpt-3.5-mini",
        temperature=0,
    )

    # RAG Chain
    rag_chain = (
        {"context": retriever, "question": RunnablePassthrough()} 
        | prompt 
        | llm 
        | StrOutputParser()
    )

    while True:
        user_input = input("your question: ").strip()
        if user_input.lower() == "exit":
            print("Exiting the chatbot. Goodbye!")
            break
        answer = rag_chain.invoke({"question": user_input})
        print(f"Answer: {answer}\n")

if __name__ == "__main__":
    rag_chatbot()