import boto3
import uuid
import urllib.parse
# NOTE: To decode => urllib.parse.unquote(response['Metadata']['category'])

import os
from sqlmodel import Session, create_engine
from pathlib import Path
from src.models.documents import DocumentFileBase, DocumentFile, DocumentBase, Documents
import pandas as pd
import mimetypes
from src.core.config import config

s3 = boto3.client(
    service_name="s3",
    endpoint_url=config.R2_URL,
    aws_access_key_id=config.R2_ACCESS_KEY,
    aws_secret_access_key=config.R2_SECRET_KEY,
    region_name="auto",
)

engine = create_engine(config.DB_URL, echo=True, pool_pre_ping=True)

doc_folder = pd.read_csv("./src/utils/doc.csv")


def upload_course_document(dir_path: Path, category: str, db_group_id: uuid.UUID):
    dir_name = Path(dir_path).name
    files = [f for f in Path(dir_path).iterdir() if f.is_file()]
    for file in files:
        file_name = file.name
        print("dir_name: ", dir_name)
        print("file_name: ", file_name)
        content_type, _ = mimetypes.guess_type(dir_path)
        if content_type is None:
            content_type = "application/octet-stream"

        ext = file_name.split(".")[-1] if "." in file_name else "unknown"
        print("ext: ", ext)

        file_size_bytes = os.path.getsize(file)
        size_str = f"{round(file_size_bytes / 1024)} KB"

        r2_key = f"documents/{dir_name}/{file_name}"
        category = urllib.parse.quote(category)
        title = urllib.parse.quote(dir_name)
        with open(file, "rb") as f:
            s3.put_object(
                bucket="docs",
                key=r2_key,
                body=f,
                contenttype=content_type,
                metadata={
                    "type": ext,
                    "category": category,
                    "original_title": title,
                },
            )
        print(f"Upload: {r2_key}")

        doc = DocumentFileBase(
            filename=file_name,
            type=ext,
            size=size_str,
            url_obj=r2_key,
        )
        doc = DocumentFile.model_validate(doc, update={"group_id": db_group_id})

        with Session(engine) as session:
            session.add(doc)
            session.commit()
            session.refresh(doc)


if __name__ == "__main__":
    docs_path = "./src/utils/docs"
    dirs = [dir for dir in Path(docs_path).iterdir() if dir.is_dir()]
    for dir in dirs:
        matching_row = doc_folder.loc[doc_folder["name"].str.strip() == dir.name]
        if not matching_row.empty:
            category_tag = str(matching_row.iloc[0]["tag"])
            original_link = str(matching_row.iloc[0]["link"])
            dir_path = Path(docs_path) / Path(dir.name)
            print("dir_path", dir_path)
            doc = DocumentBase(
                title=dir.name, category=category_tag, original_link=original_link
            )
            doc = Documents.model_validate(doc)

            with Session(engine) as session:
                session.add(doc)
                session.commit()
                session.refresh(doc)
                db_group_id = doc.id

            upload_course_document(dir_path, category_tag, db_group_id)
            print("========================================================")
        else:
            print("matching empty")
