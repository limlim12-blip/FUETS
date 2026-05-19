import uuid
from sqlalchemy import text
from datetime import datetime, timezone
from typing import List, Optional
from sqlmodel import Field, SQLModel, Relationship


class DocumentBase(SQLModel):
    title: str = Field(min_length=1, max_length=255, index=True)
    category: Optional[str] = Field(default=None, index=True)
    original_link: str = Field(default="/")


class DocumentCreate(DocumentBase):
    pass


class DocumentUpdate(SQLModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    category: str | None = Field(default=None)


class Documents(DocumentBase, table=True):
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
    files: List["DocumentFile"] = Relationship(
        back_populates="group", cascade_delete=True
    )


class DocumentPublic(DocumentBase):
    id: uuid.UUID
    created_at: datetime


class Documentspublic(SQLModel):
    data: List[DocumentPublic]
    count: int | None
    page: int | None
    page_size: int | None
    total_pages: int | None


class DocumentFileBase(SQLModel):
    filename: str = Field(max_length=255)
    url_obj: str = Field(unique=True)
    type: str = Field(max_length=50)
    size: str = Field(default="0 KB")


class DocumentFile(DocumentFileBase, table=True):
    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
        index=True,
        sa_column_kwargs={"server_default": text("gen_random_uuid()")},
    )
    group_id: uuid.UUID = Field(foreign_key="documents.id", ondelete="CASCADE")

    group: Documents = Relationship(back_populates="files")


class DocumentFilePublic(DocumentBase):
    id: uuid.UUID
    created_at: datetime


class DocumentFilespublic(SQLModel):
    data: List[DocumentPublic]
    count: int | None
    page: int | None
    page_size: int | None
    total_pages: int | None
