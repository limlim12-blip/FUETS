from sqlmodel import Field, SQLModel, Relationship
from sqlalchemy import text

from datetime import datetime, timezone

from decimal import Decimal
import uuid
from typing import List, Any


# NOTE: PROFESSOR
# Shared properties
class ProfBase(SQLModel):
    name: str = Field(index=True)
    university: str | None
    academic_rank: str | None
    average_rating: Decimal | None = Field(
        default=0, max_digits=1, decimal_places=2, ge=1.0, le=5.0
    )


# Properties to receive on item creation
class ProfCreate(ProfBase):
    pass


# Properties to receive on item update
class ProfUpdate(ProfBase):
    name: str | None = Field(index=True)  # type:ignore


# Database model, database table inferred from class name
class Professor(ProfBase, table=True):
    __tablename__: Any = "professors"
    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
        index=True,
        sa_column_kwargs={"server_default": text("gen_random_uuid()")},
    )
    reviews: List["Review"] = Relationship(back_populates="professor")


# Properties to return via API, id is always required
class ProfPublic(ProfBase):
    id: uuid.UUID


class ProfsPublic(SQLModel):
    data: list[ProfPublic]
    count: int


# NOTE: COURSES
# Shared properties
class CourseBase(SQLModel):
    code: str | None
    name: str = Field(index=True)


# Properties to receive on item creation
class CourseCreate(CourseBase):
    pass


# Properties to receive on item update
class CourseUpdate(CourseBase):
    name: str | None = Field(index=True)  # type:ignore


# Database model, database table inferred from class name
class Course(CourseBase, table=True):
    __tablename__: Any = "courses"
    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
        index=True,
        sa_column_kwargs={"server_default": text("gen_random_uuid()")},
    )
    reviews: List["Review"] = Relationship(back_populates="course")


# Properties to return via API, id is always required
class CoursePublic(CourseBase):
    id: uuid.UUID


class CoursesPublic(SQLModel):
    data: list[CoursePublic]
    count: int


# NOTE: REVIEWS
# Shared properties
class ReviewBase(SQLModel):
    rating: int = Field(default=2, ge=1, le=5)
    content: str | None
    course_id: uuid.UUID | None = Field(default=None, foreign_key="courses.id")
    prof_id: uuid.UUID | None = Field(default=None, foreign_key="professors.id")


# Properties to receive on item creation
class ReviewCreate(ReviewBase):
    pass


# Properties to receive on item update
class ReviewUpdate(ReviewBase):
    title: str | None = Field(default=None, min_length=1, max_length=255)  # type: ignore[assignment]


# Database model, database table inferred from class name
class Review(ReviewBase, table=True):
    __tablename__: Any = "reviews"
    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
        index=True,
        sa_column_kwargs={"server_default": text("gen_random_uuid()")},
    )
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column_kwargs={"server_default": text("CURRENT_TIMESTAMP")},
    )
    course: Course = Relationship(back_populates="reviews")
    professor: Professor = Relationship(back_populates="reviews")


# Properties to return via API, id is always required
class ReviewPublic(ReviewBase):
    id: uuid.UUID
    prof_name: str | None = None
    course_name: str | None = None
    course_code: str | None = None
    created_at: datetime | None = None


class ReviewsPublic(SQLModel):
    data: list[ReviewPublic]
    count: int | None
    page: int | None
    page_size: int | None
    total_pages: int | None
