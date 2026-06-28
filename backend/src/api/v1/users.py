from typing import Any
import uuid

from fastapi import APIRouter, HTTPException
from src.api.deps import CurrentUser, SessionDep
from src.models.user import UserCreate, UserPublic, UsersPublic, UserUpdate
from sqlmodel import select
from src.models.user import User


router = APIRouter(prefix="/user")


@router.get("/me", response_model=UserPublic)
async def get_current_user(current_user: CurrentUser) -> Any:
    return current_user


@router.get("/", response_model=UsersPublic)
async def read_users(session: SessionDep, current_user: CurrentUser) -> Any:
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    users = session.exec(select(User)).all()
    return UsersPublic(
        data=[UserPublic.model_validate(u) for u in users], count=len(users)
    )


@router.post("/", response_model=UsersPublic)
async def create_user(
    session: SessionDep,
    current_user: CurrentUser,
    item_in: UserCreate,
) -> Any:
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    review = User.model_validate(item_in)
    session.add(review)
    session.commit()
    session.refresh(review)
    return review


@router.put("/{id}", response_model=UserPublic)
async def update_user(
    id: uuid.UUID,
    session: SessionDep,
    current_user: CurrentUser,
    item_in: UserUpdate,
) -> Any:
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    user = session.get(User, id)
    if not user:
        raise HTTPException(status_code=404, detail="Item not found")

    update_dict = item_in.model_dump(exclude_unset=True)
    user.sqlmodel_update(update_dict)

    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@router.delete("/{id}")
async def delete_user(
    id: uuid.UUID, session: SessionDep, current_user: CurrentUser
) -> Any:
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    user = session.get(User, id)
    if not user:
        raise HTTPException(status_code=404, detail="Item not found")
    session.delete(user)
    session.commit()
    return {"status": "success"}
