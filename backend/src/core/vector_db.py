import os
import zipfile
import tempfile
from pathlib import Path

import pandas as pd
from langchain_core.documents import Document

from src.core.config import config

from qdrant_client import QdrantClient
from langchain_qdrant import QdrantVectorStore
from langchain_qdrant import FastEmbedSparse
from langchain_core.embeddings import Embeddings
import requests
from typing import List

os.environ["DOCLING_ALLOW_EXTERNAL_PLUGINS"] = "true"

import boto3

# from langchain_docling.loader import DoclingLoader #NOTE: this shit is too heavy to install on a server
from src.core.db import engine


# NOTE: Bằng một cách nào đấy cái langchain_google_genai api lỗi? cảm ơn gemini
class DirectGeminiEmbeddings(Embeddings):
    def __init__(self, api_key: str, model: str = "models/gemini-embedding-001"):
        self.api_key = api_key
        self.model = model
        # Endpoint trực tiếp của Google REST API
        self.url = f"https://generativelanguage.googleapis.com/v1beta/{model}:embedContent?key={self.api_key}"

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        # Phục vụ cho việc nạp data (nếu cần dùng bên vector_db.py)
        embeddings = []
        for text in texts:
            embeddings.append(self.embed_query(text))
        return embeddings

    def embed_query(self, text: str) -> List[float]:
        max_retries = 3
        for i in range(max_retries):
            try:
                payload = {"model": self.model, "content": {"parts": [{"text": text}]}}
                response = requests.post(self.url, json=payload)

                if response.status_code == 200:
                    return response.json()["embedding"]["values"]

                elif response.status_code == 500:
                    print(
                        f"⚠️ [API NGU] Google trả lỗi 500. Đang ép chạy lại lần {i + 1}..."
                    )
                else:
                    print(f"Lỗi API: {response.text}")
                    response.raise_for_status()

            except Exception as e:
                if i == max_retries - 1:
                    print("❌ Google API hoàn toàn sập. Bó tay!")
                    raise e
        return []


s3 = boto3.client(
    service_name="s3",
    endpoint_url=config.R2_URL,
    aws_access_key_id=config.R2_ACCESS_KEY,
    aws_secret_access_key=config.R2_SECRET_KEY,
    region_name="auto",
)

client = QdrantClient(url=config.QDRANT_URL, api_key=config.QDRANT_API_KEY)
embeddings = DirectGeminiEmbeddings(
    model="models/gemini-embedding-001",
    api_key=config.GOOGLE_API_KEY,
)

sparse_embeddings = FastEmbedSparse(model_name="Qdrant/bm25")

vectorstore = QdrantVectorStore(
    client=client,
    embedding=embeddings,
    sparse_embedding=sparse_embeddings,
    collection_name="fuet-reviews",
    vector_name="dense",
    sparse_vector_name="sparse",
)


def load_doc_from_r2(bucket: str, file_key: str):
    suffix = Path(file_key).suffix
    print(suffix)
    print(f"fetching {file_key}")

    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp_name = tmp.name
        try:
            s3.download_file(bucket, file_key, tmp_name)
            print("dowloaded")
            all_docs = []
            if suffix == ".zip":
                with tempfile.TemporaryDirectory() as dir:
                    with zipfile.ZipFile(tmp.name, "r") as zip_ref:
                        zip_ref.extractall(dir)
                        for file_path in Path(dir).rglob("*"):
                            if file_path.is_file():
                                loader = DoclingLoader(file_path=str(file_path))
                                docs = loader.load()
                                for doc in docs:
                                    doc.metadata["source"] = f"r2://{bucket}/{file_key}"
                                    doc.page_content = f"Tài liệu: r2://{bucket}/{file_key}.\n Nội dung: \n {doc.page_content}"
                                    all_docs.append(doc)
                                print("loaded")

            else:
                loader = DoclingLoader(file_path=tmp_name)
                all_docs = loader.load()
                for doc in all_docs:
                    doc.metadata["source"] = f"r2://{bucket}/{file_key}"
                print("loaded")
        finally:
            if os.path.exists(tmp_name):
                os.remove(tmp_name)
    return all_docs


def ingest_reviews_csv(cmd, db_engine):
    df = pd.read_sql(cmd, db_engine)

    df["prof_name"] = df["prof_name"].fillna("Giảng viên ẩn danh")
    df["course_name"] = df["course_name"].fillna("Môn học chưa xác định")
    df["content"] = df["content"].fillna("Không có nội dung.")

    documents = []
    for _, row in df.iterrows():
        content = (
            f"Tên Giảng Viên: {row['prof_name']}.\n"
            f"Tên Môn Học: {row['course_name']}.\n"
            f"Review rating: {row['rating']}/5.\n"
            f"Created at: {str(row['created_at'])}.\n"
            f"Review content: {row['content']}"
        )

        metadata = {
            "Tên Giảng Viên": row["prof_name"],
            "Tên Môn Học": row["course_name"],
            "rating": row["rating"],
            "source": "reviews",
            "created_at": str(row["created_at"]),
        }

        doc = Document(page_content=content, metadata=metadata)
        documents.append(doc)
    return documents


def save_to_qdrant(docs):
    if not docs:
        print("No doc to save")
        return
    for doc in docs:
        header = f"\n[Nguồn: {doc.metadata.get('source', 'Unknown')}]\n"
        doc.page_content = header + doc.page_content
    vectorstore.add_documents(docs)


def doc_to_vec(s3):
    with open("obj.txt", "r") as file:
        content = file.read()
    response = s3.list_objects_v2(Bucket="docs")
    objs = []
    contents = response.get("Contents", [])
    if "Contents" in response:
        for obj in contents:
            size = obj.get("Size", 0)
            key = obj.get("Key")

            if key and size < 1_000_000:
                objs.append(key)
    for obj in objs:
        if obj in content:
            print(obj)
            continue
        with open("obj.txt", "a") as file:
            file.write(f"{obj}\n")
        docs = load_doc_from_r2(
            "docs",
            obj,
        )
        if docs:
            save_to_qdrant(docs)


def reviews_to_vec(docs):
    BATCH_SIZE = 500
    for i in range(0, len(docs), BATCH_SIZE):
        batch_docs = docs[i : i + BATCH_SIZE]
        vectorstore.add_documents(documents=batch_docs)


if __name__ == "__main__":
    docs = ingest_reviews_csv(
        "SELECT professors.name as prof_name,courses.name as course_name, * from reviews JOIN professors on reviews.prof_id = professors.id join courses on courses.id = reviews.course_id",
        engine,
    )
    reviews_to_vec(docs)
    doc_to_vec(s3)
