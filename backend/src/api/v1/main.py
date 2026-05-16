from fastapi import APIRouter

import src.api.v1.chats as chats
import src.api.v1.courses as courses
import src.api.v1.professors as professors
import src.api.v1.login as login

router = APIRouter(prefix="/api/v1")
router.include_router(courses.router, tags=["courses"])
router.include_router(professors.router, tags=["professors"])
router.include_router(chats.router, tags=["chats"])
router.include_router(login.router, tags=["login"])
