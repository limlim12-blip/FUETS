from fastapi import APIRouter, Depends, HTTPException
from src.models.professor import ProfRead
from src.services.prof_service import ProfService
from src.database.db import get_session

router = APIRouter(prefix="/professors")


def get_user_service() -> ProfService:
    return ProfService(session=Depends(get_session))


@router.get("/", response_model=list[ProfRead])
def get_users(service: ProfService = Depends(get_user_service)):
    return service.list_profs()
