from typing import Any

from fastapi import APIRouter
from src.api.deps import CurrentUser
from src.models.user import UserPublic

router = APIRouter(prefix="/user")


@router.get("/me", response_model=UserPublic)
def get_current_user(current_user: CurrentUser) -> Any:
    return current_user
