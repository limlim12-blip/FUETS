from typing import Any, List
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
from src.api.v1.r2_client import get_s3_client, BUCKET_NAME

from src.models.documents import (
    Documents,
    DocumentFile,
    DocumentFileCreate,
    DocumentFileBase,
    DocumentFilePublic,
    DocumentFilespublic,
    DocumentFileUpdate,
)
from src.api.deps import CurrentUser, SessionDep, get_current_user

router = APIRouter(prefix="/documents", dependencies=[Depends(get_current_user)])


@router.get("/{doc_id}/files", response_model=DocumentFilespublic)
async def read_document_files(
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


@router.post("/{doc_id}/files", response_model=DocumentFilespublic)
async def create_document_file(
    *,
    s3=Depends(get_s3_client),
    session: SessionDep,
    current_user: CurrentUser,
    doc_id: uuid.UUID,
    files: List[UploadFile] = File(default=[]),
) -> Any:
    try:
        uploaded_docs = []
        if not current_user.is_superuser:
            raise HTTPException(status_code=403, detail="Not enough permissions")

        document = session.get(Documents, doc_id)
        if not document:
            raise HTTPException(status_code=404, detail=f"Not found {doc_id}")

        dir_name = document.obj_title
        encoded_title = urllib.parse.quote(str(dir_name))
        for file in files:
            file_name = file.filename or "unknown.pdf"
            r2_key = f"documents/{dir_name}/{file_name}"
            ext = file_name.split(".")[-1] if "." in file_name else "unknown"
            content = await file.read()
            s3.put_object(
                Bucket="docs",
                Key=r2_key,
                Body=content,
                ContentType="application/octet-stream",
                Metadata={
                    "type": ext,
                    "category": urllib.parse.quote(str(document.category))
                    or "uncategorized",
                    "original_title": encoded_title,
                },
            )
            file_size_bytes = len(content)
            size_str = f"{round(file_size_bytes / 1024)} KB"

            doc = DocumentFileBase(
                filename=file_name,
                type=ext,
                size=size_str,
                url_obj=r2_key,
            )
            doc = DocumentFile.model_validate(doc, update={"group_id": document.id})
            session.add(doc)
            uploaded_docs.append(doc)
        session.commit()
        docs = DocumentFilespublic(
            data=uploaded_docs,
            count=len(uploaded_docs),
            page=1,
            page_size=len(uploaded_docs),
            total_pages=1,
        )
        return docs
    except Exception as e:
        import traceback

        print("=" * 50)
        traceback.print_exc()
        print(f"Error: {str(e)}")
        session.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/files/{file_id}", response_model=DocumentFilePublic)
async def update_document_file(
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
async def delete_document(
    session: SessionDep,
    current_user: CurrentUser,
    file_id: uuid.UUID,
    s3=Depends(get_s3_client),
) -> Any:
    document = session.get(DocumentFile, file_id)
    if not document:
        raise HTTPException(status_code=404, detail="Item not found")
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    session.delete(document)

    session.commit()
    s3.delete_object(Bucket=BUCKET_NAME, Key=document.url_obj)
    return {"status": "success"}
