from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Query, Depends
from pydantic import ValidationError
import urllib.parse
import os
from typing import List, Optional
from src.models.documents import DocumentFileBase, DocumentFile, DocumentBase, Documents

from sqlalchemy import asc, desc
import uuid
from sqlmodel import col, select
from sqlalchemy import func
from typing import Any, Optional
from src.api.v1.r2_client import get_s3_client, BUCKET_NAME, download_file
from src.models.user import Message
from src.api.v1.r2_client import get_current_user
import math

from src.models.documents import (
    Documents,
    DocumentCreate,
    DocumentPublic,
    Documentspublic,
    DocumentUpdate,
)
from src.api.deps import CurrentUser, SessionDep, get_current_user

router = APIRouter(prefix="/documents", dependencies=[Depends(get_current_user)])


@router.get("/", response_model=Documentspublic)
async def read_documents(
    session: SessionDep,
    page: int = Query(1, ge=1),
    page_size: int = Query(15, ge=1, le=100),
    sort_by: Optional[str] = Query(None),
    order: Optional[str] = Query("asc"),
    search: Optional[str] = Query(None),
) -> Any:
    query = select(Documents)

    if search:
        query = query.where(col(Documents.title).ilike(f"%{search}%"))

    if sort_by:
        sort_column = getattr(Documents, sort_by)
        query = query.order_by(
            desc(sort_column) if order == "desc" else asc(sort_column)
        )
    count_query = select(func.count()).select_from(query.subquery())
    total = session.exec(count_query).one()

    offset = (page - 1) * page_size
    documents = session.exec(
        query.order_by(col(Documents.created_at).desc()).offset(offset).limit(page_size)
    ).all()

    total_pages = math.ceil(total / page_size) if total > 0 else 1
    return Documentspublic(
        data=[DocumentPublic.model_validate(doc) for doc in documents],
        count=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/{id}", response_model=DocumentPublic)
async def read_document(session: SessionDep, id: uuid.UUID) -> Any:
    document = session.get(Documents, id)
    if not document:
        raise HTTPException(status_code=404, detail="Item not found")
    return document


def checker(item_in: str = Form(...)):
    try:
        return DocumentCreate.model_validate_json(item_in)
    except ValidationError as e:
        raise HTTPException(status_code=422, detail=f"{e.errors()}")


@router.post("/", response_model=DocumentPublic)
async def create_document(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    item_in: DocumentCreate = Depends(checker),
    files: List[UploadFile] = File(default=[]),
    s3=Depends(get_s3_client),
) -> Any:
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    if not files:
        return Message(message="Document with empty content")

    document = Documents.model_validate(item_in)
    session.add(document)
    session.flush()
    dir_name = document.obj_title
    encoded_title = urllib.parse.quote(str(dir_name))
    try:
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
                    "category": item_in.category or "uncategorized",
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
        session.commit()
        session.refresh(document)

        return document
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{id}", response_model=DocumentPublic)
async def update_document(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID,
    item_in: DocumentUpdate,
) -> Any:
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    document = session.get(Documents, id)
    if not document:
        raise HTTPException(status_code=404, detail="Item not found")

    update_dict = item_in.model_dump(exclude_unset=True)
    document.sqlmodel_update(update_dict)

    session.add(document)
    session.commit()
    session.refresh(document)
    return document


@router.delete("/{id}")
async def delete_document(
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID,
    s3=Depends(get_s3_client),
) -> Any:
    document = session.get(Documents, id)
    if not document:
        raise HTTPException(status_code=404, detail="Item not found")
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    for object in s3.list_objects_v2(
        Bucket=BUCKET_NAME, Prefix=f"documents/{document.obj_title}"
    )["Contents"]:
        file_delete = object["Key"]
        s3.delete_object(Bucket=BUCKET_NAME, Key=file_delete)
    session.delete(document)
    session.commit()
    return {"status": "success"}
