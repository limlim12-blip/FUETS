from fastapi import APIRouter

import src.api.v1.chats as chats
import src.api.v1.courses as courses
import src.api.v1.professors as professors

router = APIRouter(prefix="/api/v1")
router.include_router(chats.router)
router.include_router(courses.router)
router.include_router(professors.router)
