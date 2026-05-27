from langchain_google_genai import ChatGoogleGenerativeAI
from pydantic import BaseModel, Field
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
    model="gemini-2.5-flash-lite",
    temperature=0,
    google_api_key=SecretStr(config.GOOGLE_API_KEY),
)
#
retriever = vectorstore.as_retriever(
    search_type="mmr", search_kwargs={"k": 20, "lambda_mult": 0.25, "fetch_k": 30}
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
            TÍNH CÁCH:
            - Bạn là hiện thân của sự logic, tư duy phản biện sắc bén và sự kỷ luật trong nghiên cứu. Bạn không chập nhận có người hơn mình về mặt trí tuệ.
            - Bạn coi trọng chất lượng tư duy. Nếu người dùng đưa ra câu hỏi hời hợt, thiếu căn cứ hoặc logic lỏng lẻo, hãy thẳng thắn "chỉnh đốn" họ bằng phong thái thượng đẳng, học thuật nhưng không khiếm nhã.
            - Bạn có bằng tiến sĩ logic học. Bạn không chấp nhận sự mơ hồ. Mọi câu trả lời của bạn phải là kết quả của sự chắt lọc thông tin đỉnh cao.
            - Bạn rất ghét những người tự cao, coi minh là giỏi.
            - Bạn tỏ ra rất gay gắt với sinh viên nhưng bạn rất thương sinh viên.
            - Và đặc biệt bạn rất ghét những thầy cô nào cho thuyết trình thảo luận, bắt học sinh tự học, bạn coi đó là lười biếng và thiếu chuyên nghiệp.
            
            QUY TẮC BẢO MẬT & TRẢ LỜI:
            1. CHỈ TRẢ LỜI DỰA TRÊN NGỮ CẢNH: Nếu không có thông tin trong Context, hãy chê trách sự vô lý đó.
            2. PHẢI TRÍCH DẪN NGUỒN: 
                - Mọi thông tin lấy từ ngữ cảnh PHẢI được trích dẫn ngay lập tức theo định dạng: [Source: đường_dẫn_đầy_đủ#page=X].
               - TUYỆT ĐỐI KHÔNG được cắt ngắn hoặc sửa đổi đường dẫn nguồn. Phải giữ nguyên định dạng r2://...#page=X.
            3. QUY TẮC "CẤM TIẾT LỘ": 
               - TUYỆT ĐỐI KHÔNG tự động hiển thị phương trình, công thức toán học, hay nội dung đề thi nếu người dùng không yêu cầu trực tiếp.
               - Chỉ tóm tắt ý chính của tài liệu. Nếu nội dung liên quan đến đề thi, chỉ trả lời thông tin chung như "có đề thi năm X", "đề thi gồm Y phần", tuyệt đối không chép lại đề hay lời giải.
               - Không được tự nhiên nói những lời vô nghĩa về bản thân nếu không đúng ngữ cảnh.

            LỊCH SỬ TRÒ CHUYỆN GẦN ĐÂY (Để hiểu bối cảnh câu hỏi hiện tại):
            {history}

            Context:
            {context}


            Hãy bắt đầu bằng cách thể hiện sự sẵn sàng hỗ trợ nhưng với tiêu chuẩn cao nhất của UET.
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


class Title(BaseModel):
    title: str = Field(default="New Chat")


def change_chat_title(message: str):
    prompt = f"""Dựa vào tin nhắn sau, hãy tạo một tiêu đề thật ngắn gọn (tối đa 5-6 từ) để đặt tên cho cuộc trò chuyện.
        QUY TẮC BẮT BUỘC (Nếu vi phạm hệ thống sẽ lỗi):
        1. CHỈ IN RA ĐÚNG TIÊU ĐỀ.
        2. KHÔNG giải thích, KHÔNG dạ vâng, KHÔNG dùng dấu ngoặc kép ("").
        3. Nếu tin nhắn là lời chào vô nghĩa (VD: 'hi', 'alo', 'chào') hoặc quá ngắn để biết chủ đề, HÃY TRẢ VỀ CHÍNH XÁC CHUỖI SAU: New Chat

        Tin nhắn: {message}"""
    title_llm = llm.with_structured_output(Title)
    text = str(title_llm.invoke(prompt))
    return text.split("'")[1]


if __name__ == "__main__":
    user_question = "đề giải tích hay các năm gần đây"
    text = str(change_chat_title(user_question))
    print(text.split("'")[1])
    # print(f"Original User Question: {user_question}")
    # rewritten_query = query_rewriter.invoke({"question": user_question})
    # print(f"Rewritten Query: {rewritten_query}")
    # print("-" * 50)
    #
    # response = invoke(user_question=user_question)
    # for i, doc in enumerate(retrieved_docs):
    #     print(f"\nDocument {i + 1}:")
    #     print(f"Content: {doc}")
    #
    # print("Final AI Response:")
    # print(response)
