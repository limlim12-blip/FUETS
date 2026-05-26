from fastapi import APIRouter, HTTPException, Depends, dependencies
import uuid
from sqlmodel import col, select
from sqlalchemy import func
from src.models.schema import (
    Course,
    CourseCreate,
    CoursePublic,
    CoursesPublic,
    CourseUpdate,
)
from src.api.deps import CurrentUser, SessionDep, get_current_user
from typing import Any

router = APIRouter(prefix="/courses", dependencies=[Depends(get_current_user)])


@router.get("/", response_model=CoursesPublic)
async def read_courses(session: SessionDep, offset: int = 0, limit: int = 100) -> Any:
    count = session.exec(select(func.count()).select_from(Course)).one()
    courses = session.exec(
        select(Course).order_by(col(Course.name)).offset(offset).limit(limit)
    ).all()
    courses_public = [CoursePublic.model_validate(course) for course in courses]
    return CoursesPublic(data=courses_public, count=count)


@router.get("/{id}", response_model=CoursePublic)
async def read_course(session: SessionDep, id: uuid.UUID) -> Any:
    course = session.get(Course, id)
    if not course:
        raise HTTPException(status_code=404, detail="Item not found")
    return course


@router.post("/", response_model=CoursePublic)
async def create_course(
    *, session: SessionDep, current_user: CurrentUser, item_in: CourseCreate
) -> Any:
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    course = Course.model_validate(item_in)
    session.add(course)
    session.commit()
    session.refresh(course)
    pass


@router.put("/{id}", response_model=CoursePublic)
async def update_course(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID,
    item_in: CourseUpdate,
) -> Any:
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    course = session.get(Course, id)
    if not course:
        raise HTTPException(status_code=404, detail="Item not found")
    update_dict = item_in.model_dump(exclude_unset=True)
    course.sqlmodel_update(update_dict)
    session.add(course)
    session.commit()
    session.refresh(course)
    return course


@router.delete("/{id}")
async def delete_course(
    session: SessionDep, current_user: CurrentUser, id: uuid.UUID
) -> Any:
    course = session.get(Course, id)
    if not course:
        raise HTTPException(status_code=404, detail="Item not found")
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    session.delete(course)
    session.commit()
