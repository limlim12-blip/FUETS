from typing import Any
import urllib.parse
from botocore.exceptions import ClientError
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from pathlib import Path
import mimetypes
import uuid
from sqlalchemy.engine import url
from sqlmodel import select
from sqlalchemy import func
from typing import Any
import math
from src.api.v1.r2_client import get_s3_client

from src.models.documents import (
    Documents,
    DocumentFile,
    DocumentFileCreate,
    DocumentFilePublic,
    DocumentFilespublic,
    DocumentFileUpdate,
)
from src.api.deps import CurrentUser, SessionDep, get_current_user

router = APIRouter(prefix="/documents", dependencies=[Depends(get_current_user)])


@router.get("/{doc_id}/files", response_model=DocumentFilespublic)
def read_document_files(
    doc_id: uuid.UUID,
    session: SessionDep,
    page: int = Query(1, ge=1),
    page_size: int = Query(15, ge=1, le=100),
) -> Any:
    query = select(DocumentFile).where(DocumentFile.group_id == doc_id)
    count_query = select(func.count()).select_from(query.subquery())
    total = session.exec(count_query).one()
    offset = (page - 1) * page_size
    documents = session.exec(query.offset(offset).limit(page_size)).all()
    total_pages = math.ceil(total / page_size) if total > 0 else 1
    return DocumentFilespublic(
        data=[DocumentFilePublic.model_validate(doc) for doc in documents],
        count=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.post("/{doc_id}/files", response_model=DocumentFilePublic)
def create_document_file(
    *,
    s3=Depends(get_s3_client),
    session: SessionDep,
    current_user: CurrentUser,
    doc_id: uuid.UUID,
    file: UploadFile,
) -> Any:
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    doc = session.get(Documents, doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail=f"Not found {doc_id}")

    doc_name = doc.title
    category = doc.category

    original_file_name = file.filename
    path = Path(original_file_name)
    stem = path.stem
    ext = path.suffix
    prefix = f"documents/{doc_name}"

    r2_key = f"{prefix}/{original_file_name}"
    final_file_name = original_file_name
    counter = 1

    while True:
        try:
            s3.head_object(Bucket="docs", Key=r2_key)
            final_file_name = f"{stem} ({counter}){ext}"
            r2_key = f"{prefix}/{final_file_name}"
            counter += 1
        except ClientError as e:
            if e.response["Error"]["Code"] == "404":
                print(f"The object does not exist.{final_file_name}")
                break
            else:
                raise e

    content_type = file.content_type or "application/octet-stream"
    encoded_title = urllib.parse.quote(doc_name)

    s3.put_object(
        Bucket="docs",
        Key=r2_key,
        Body=file.file,
        ContentType=content_type,
        Metadata={
            "type": ext.lstrip("."),
            "category": category,
            "original_title": encoded_title,
        },
    )
    doc_file = DocumentFileCreate(
        filename=final_file_name,
        url_obj=r2_key,
        type=ext.lstrip("."),
    )

    doc_file_db = DocumentFile.model_validate(doc_file, update={"group_id": doc_id})
    session.add(doc_file_db)
    session.commit()
    session.refresh(doc_file_db)

    return doc_file_db


@router.put("/files/{file_id}", response_model=DocumentFilePublic)
def update_document_file(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    file_id: uuid.UUID,
    item_in: DocumentFileUpdate,
) -> Any:
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    document = session.get(DocumentFile, file_id)
    if not document:
        raise HTTPException(status_code=404, detail="Item not found")

    update_dict = item_in.model_dump(exclude_unset=True)
    document.sqlmodel_update(update_dict)

    session.add(document)
    session.commit()
    session.refresh(document)
    return document


@router.delete("/files/{file_id}")
def delete_document(
    session: SessionDep,
    current_user: CurrentUser,
    file_id: uuid.UUID,
) -> Any:
    document = session.get(DocumentFile, file_id)
    if not document:
        raise HTTPException(status_code=404, detail="Item not found")
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    session.delete(document)
    session.commit()
    return {"status": "success"}
