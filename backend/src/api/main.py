from fastapi import APIRouter

import src.api.v1.chats as chats
import src.api.v1.courses as courses
import src.api.v1.professors as professors
import src.api.v1.login as login
import src.api.v1.documents as documents
import src.api.v1.reviews as reviews
import src.api.v1.r2_client as storage
import src.api.v1.document_files as document_files
import src.api.v1.users as users

router = APIRouter(prefix="/api/v1")
router.include_router(documents.router, tags=["documents"])
router.include_router(courses.router, tags=["courses"])
router.include_router(professors.router, tags=["professors"])
router.include_router(chats.router, tags=["chats"])
router.include_router(login.router, tags=["login"])
router.include_router(reviews.router, tags=["reviews"])
router.include_router(storage.router, tags=["storage"])
router.include_router(document_files.router, tags=["documents"])
router.include_router(users.router, tags=["user"])
