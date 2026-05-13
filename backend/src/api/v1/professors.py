from fastapi import APIRouter, HTTPException
import uuid
from sqlmodel import col, select, func
from src.models.schema import (
    Professor,
    ProfCreate,
    ProfPublic,
    ProfsPublic,
    ProfUpdate,
)

from src.api.deps import CurrentUser, SessionDep
from typing import Any

router = APIRouter(prefix="/profs")


@router.get("/", response_model=ProfsPublic)
def read_profs(session: SessionDep, offset: int = 0, limit: int = 100) -> Any:
    count = session.exec(select(func.count()).select_from(Professor)).one()
    profs = session.exec(
        select(Professor).order_by(col(Professor.name)).offset(offset).limit(limit)
    ).all()
    profs_public = [ProfPublic.model_validate(course) for course in profs]
    return ProfsPublic(data=profs_public, count=count)


@router.get("/{id}", response_model=ProfPublic)
def read_prof(session: SessionDep, id: uuid.UUID) -> Any:
    prof = session.get(Professor, id)
    if not prof:
        raise HTTPException(status_code=404, detail="Item not found")
    return prof


@router.post("/", response_model=ProfPublic)
def create_prof(
    *, session: SessionDep, current_user: CurrentUser, item_in: ProfCreate
) -> Any:
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    prof = Professor.model_validate(item_in)
    session.add(prof)
    session.commit()
    session.refresh(prof)
    pass


@router.put("/{id}", response_model=ProfPublic)
def update_prof(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID,
    item_in: ProfUpdate,
) -> Any:
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    prof = session.get(Professor, id)
    if not prof:
        raise HTTPException(status_code=404, detail="Item not found")
    update_dict = item_in.model_dump(exclude_unset=True)
    prof.sqlmodel_update(update_dict)
    session.add(prof)
    session.commit()
    session.refresh(prof)
    return prof


@router.delete("/{id}")
def delete_prof(session: SessionDep, current_user: CurrentUser, id: uuid.UUID) -> Any:
    prof = session.get(Professor, id)
    if not prof:
        raise HTTPException(status_code=404, detail="Item not found")
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    session.delete(prof)
    session.commit()
