import math
import uuid
from typing import Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import selectinload
from sqlmodel import asc, col, desc, func, select

from src.api.deps import CurrentUser, SessionDep, get_current_user
from src.models.schema import (
    Course,
    Professor,
    Review,
    ReviewCreate,
    ReviewPublic,
    ReviewsPublic,
    ReviewUpdate,
)

router = APIRouter(prefix="/reviews", dependencies=[Depends(get_current_user)])


@router.get("/", response_model=ReviewsPublic)
async def read_reviews(
    session: SessionDep,
    page: int = Query(1, ge=1),
    page_size: int = Query(15, ge=1, le=100),
    sort_by: Optional[str] = Query(None),
    order: Optional[str] = Query("asc"),
    professor_name: Optional[str] = Query(None),
    course_name: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
) -> Any:
    query = select(Review)

    if search:
        query = query.where(col(Review.content).ilike(f"%{search}%"))

    if course_name:
        query = query.join(Course).where(col(Course.name) == course_name)

    if professor_name:
        query = query.join(Professor).where(col(Professor.name) == professor_name)

    if sort_by:
        sort_column = getattr(Review, sort_by)
        query = query.order_by(
            desc(sort_column) if order == "desc" else asc(sort_column)
        )
    count_query = select(func.count()).select_from(query.subquery())
    total = session.exec(count_query).one()

    offset = (page - 1) * page_size
    reviews = session.exec(
        query.order_by(col(Review.created_at).desc())
        .offset(offset)
        .limit(page_size)
        .options(selectinload(Review.course))
        .options(selectinload(Review.professor))
    ).all()

    total_pages = math.ceil(total / page_size) if total > 0 else 1
    return ReviewsPublic(
        data=[
            ReviewPublic.model_validate(
                doc,
                update={
                    "prof_name": doc.professor and doc.professor.name,
                    "course_name": doc.course and doc.course.name,
                    "course_code": doc.course and doc.course.code,
                },
            )
            for doc in reviews
        ],
        count=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/{id}", response_model=ReviewPublic)
async def read_review(session: SessionDep, id: uuid.UUID) -> Any:
    statement = (
        select(Review)
        .where(Review.id == id)
        .options(selectinload(Review.course))
        .options(selectinload(Review.professor))
    )

    review = session.exec(statement).first()
    if not review:
        raise HTTPException(status_code=404, detail="Item not found")

    review = ReviewPublic.model_validate(
        review,
        update={
            "prof_name": review.professor and review.professor.name,
            "course_name": review.course and review.course.name,
            "course_code": review.course and review.course.code,
        },
    )
    return review


@router.post("/", response_model=ReviewPublic)
async def create_review(
    *, session: SessionDep, current_user: CurrentUser, item_in: ReviewCreate
) -> Any:
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    review = Review.model_validate(item_in)
    session.add(review)
    session.commit()
    session.refresh(review)
    return review


@router.put("/{id}", response_model=ReviewPublic)
async def update_review(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID,
    item_in: ReviewUpdate,
) -> Any:
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    review = session.get(Review, id)
    if not review:
        raise HTTPException(status_code=404, detail="Item not found")

    update_dict = item_in.model_dump(exclude_unset=True)
    review.sqlmodel_update(update_dict)

    session.add(review)
    session.commit()
    session.refresh(review)
    return review


@router.delete("/{id}")
async def delete_review(
    session: SessionDep, current_user: CurrentUser, id: uuid.UUID
) -> Any:
    review = session.get(Review, id)
    if not review:
        raise HTTPException(status_code=404, detail="Item not found")
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    session.delete(review)
    session.commit()
    return {"status": "success"}
