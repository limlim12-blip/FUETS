from fastapi import APIRouter, HTTPException, Query, Depends
from sqlalchemy import asc, desc
import uuid
from sqlmodel import col, select
from sqlalchemy import func
from typing import Any, Optional
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
def read_documents(
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
def read_document(session: SessionDep, id: uuid.UUID) -> Any:
    document = session.get(Documents, id)
    if not document:
        raise HTTPException(status_code=404, detail="Item not found")
    return document


@router.post("/", response_model=DocumentPublic)
def create_document(
    *, session: SessionDep, current_user: CurrentUser, item_in: DocumentCreate
) -> Any:
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    document = Documents.model_validate(item_in)
    session.add(document)
    session.commit()
    session.refresh(document)
    return document


@router.put("/{id}", response_model=DocumentPublic)
def update_document(
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
def delete_document(
    session: SessionDep, current_user: CurrentUser, id: uuid.UUID
) -> Any:
    document = session.get(Documents, id)
    if not document:
        raise HTTPException(status_code=404, detail="Item not found")
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    session.delete(document)
    session.commit()
    return {"status": "success"}
