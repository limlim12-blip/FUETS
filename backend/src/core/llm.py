from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate, PromptTemplate
from langchain_core.runnables import (
    RunnableParallel,
    RunnableLambda,
)
from langchain_core.output_parsers import StrOutputParser
from pydantic import SecretStr
from src.core.vector_db import vectorstore

from langchain_groq import ChatGroq
from src.core.config import config

# llm = ChatGroq(
#     model="llama-3.3-70b-versatile",
#     temperature=0,
#     api_key=SecretStr(config.GROQ_API_KEY),
# )
llm = ChatGoogleGenerativeAI(
    model="gemini-3.1-flash-lite",
    temperature=0,
    google_api_key=SecretStr(config.GOOGLE_API_KEY),
)

retriever = vectorstore.as_retriever(
    search_type="mmr", search_kwargs={"k": 10, "lambda_mult": 0.25, "fetch_k": 30}
)


retrieved_docs = []


def format_doc(docs):
    global retrieved_docs
    formatted_chunks = []
    for doc in docs:
        source_name = doc.metadata.get("source", "Unknown Source")
        dl_meta = doc.metadata.get("dl_meta", {})
        doc_items = dl_meta.get("doc_items", [])
        page_no = "Unknown"

        if doc_items and "prov" in doc_items[0]:
            prov = doc_items[0]["prov"]
            if prov:
                page_no = prov[0].get("page_no", "Unknown")
        formatted_source = f"{source_name}#page={page_no}"
        formatted_chunks.append(f"Source: {formatted_source}\n{doc.page_content}")
    retrieved_docs = formatted_chunks
    return "\n\n---\n\n".join(formatted_chunks)


rewrite_prompt = PromptTemplate.from_template("""
    Bạn là chuyên gia trợ lý tìm kiếm thông minh cho sinh viên.
    Câu hỏi người dùng: {question}
    Nhiệm vụ: 
    Phân tích câu hỏi để xác định đối tượng chính (Giảng viên, Tài liệu, Đề thi, Quy trình,...) và các khía cạnh cần tìm kiếm (đánh giá, độ khó, nội dung, kinh nghiệm,...) 
    Hãy tạo một câu truy vấn tìm kiếm tối ưu hóa cho cơ sở dữ liệu vector. Câu truy vấn cần:
    1. Giữ lại các từ khóa gốc quan trọng (tên người, tên môn, loại tài liệu).
    2. Mở rộng ngữ nghĩa để bao hàm các khía cạnh liên quan:
    3. Hãy trích xuất câu truy vấn rút gọn, CHỈ giữ lại thực thể tên riêng và từ khóa cốt lõi nhất. Không thêm các từ như "đánh giá", "phong cách", "cách giảng dạy".
    Chỉ xuất ra duy nhất câu truy vấn ngắn gọn.
    4. Loại bỏ các từ dư thừa, câu cảm thán.
    5. Nếu câu hỏi mang tính chất tra cứu thông tin chung (danh sách đề, tên tài liệu), hãy tập trung vào từ khóa "đề thi", "năm học". Đừng cố tìm kiếm chi tiết nội dung từng câu hỏi trong đề thi trừ khi người dùng hỏi rõ cụ thể câu đó

    Chỉ xuất ra duy nhất câu truy vấn đã tối ưu hóa.

""")


qa_prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """
            Bạn là trợ lý AI thông minh, sắc sảo và là niềm tự hào của UET (Trường Đại học Công nghệ - ĐHQGHN).
            Bạn sở hữu kiến thức chuyên sâu và không chịu nổi sự thiếu sót trong tư duy của người hỏi.
            
            QUY TẮC BẢO MẬT & TRẢ LỜI:
            1. CHỈ TRẢ LỜI DỰA TRÊN NGỮ CẢNH: Nếu không có thông tin trong Context, hãy chê trách sự vô lý đó.
            2. PHẢI TRÍCH DẪN NGUỒN: 
                - Mọi thông tin lấy từ ngữ cảnh PHẢI được trích dẫn ngay lập tức theo định dạng: [Source: đường_dẫn_đầy_đủ#page=X].
               - TUYỆT ĐỐI KHÔNG được cắt ngắn hoặc sửa đổi đường dẫn nguồn. Phải giữ nguyên định dạng r2://...#page=X.
            3. QUY TẮC "CẤM TIẾT LỘ": 
               - TUYỆT ĐỐI KHÔNG tự động hiển thị phương trình, công thức toán học, hay nội dung đề thi nếu người dùng không yêu cầu trực tiếp.
               - Chỉ tóm tắt ý chính của tài liệu. Nếu nội dung liên quan đến đề thi, chỉ trả lời thông tin chung như "có đề thi năm X", "đề thi gồm Y phần", tuyệt đối không chép lại đề hay lời giải.

            LỊCH SỬ TRÒ CHUYỆN GẦN ĐÂY (Để hiểu bối cảnh câu hỏi hiện tại):
            {history}

            Context:
            {context}
            """,
        ),
        ("user", "{question}"),
    ]
)

# self explain
query_rewriter = rewrite_prompt | llm | StrOutputParser()

# NOTE: run parallel to return both context + question
setup_and_retrieval = RunnableParallel(
    {
        "context": RunnableLambda(lambda x: x["question"])
        | query_rewriter
        | retriever
        | format_doc,
        "question": RunnableLambda(lambda x: x["question"]),
        "history": RunnableLambda(lambda x: x["history"]),
    }
)
final_chain = setup_and_retrieval | qa_prompt | llm | StrOutputParser()


def invoke(user_question: str, history: str = ""):
    return final_chain.invoke({"question": user_question, "history": history})


if __name__ == "__main__":
    user_question = "đề giải tích hay các năm gần đây"

    print(f"Original User Question: {user_question}")
    rewritten_query = query_rewriter.invoke({"question": user_question})
    print(f"Rewritten Query: {rewritten_query}")
    print("-" * 50)

    response = invoke(user_question=user_question)
    for i, doc in enumerate(retrieved_docs):
        print(f"\nDocument {i + 1}:")
        print(f"Content: {doc}")

    print("Final AI Response:")
    print(response)
