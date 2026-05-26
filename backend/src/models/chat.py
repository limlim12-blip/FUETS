from sqlmodel import Field, SQLModel, Relationship, DateTime, Column, Enum
from sqlalchemy import text


from datetime import datetime, timezone

import uuid
from typing import List
import enum
from src.models.user import User


# NOTE: CHAT
# Shared properties
class ChatBase(SQLModel):
    title: str = Field(min_length=1)


# Properties to receive on item creation
class ChatCreate(ChatBase):
    pass


# Properties to receive on item update
class ChatUpdate(ChatBase):
    title: str | None = Field(default=None, min_length=1)  # type: ignore
    pinned: bool | None = Field(default=None)


# Database model, database table inferred from class name
class Chat(ChatBase, table=True):
    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
        index=True,
        sa_column_kwargs={"server_default": text("gen_random_uuid()")},
    )
    user_id: uuid.UUID = Field(
        foreign_key="user.id", nullable=False, ondelete="CASCADE"
    )
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column_kwargs={"server_default": text("CURRENT_TIMESTAMP")},
    )

    user: User = Relationship(back_populates="chats")
    pinned: bool = Field(default=False)
    messages: List["Message"] = Relationship(
        back_populates="chat",
        cascade_delete=True,
    )


# Properties to return via API, id is always required
class ChatPublic(ChatBase):
    id: uuid.UUID
    pinned: bool
    created_at: datetime | None = None
    total_messages: int = 0


class ChatsPublic(SQLModel):
    data: list[ChatPublic]
    count: int


# NOTE: Message
# Shared properties
class MessageRole(str, enum.Enum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


class MessageBase(SQLModel):
    content: str
    role: MessageRole = Field(
        default=MessageRole.USER, sa_column=Column(Enum(MessageRole))
    )


# Properties to receive on item creation
class MessageCreate(MessageBase):
    pass


# Properties to receive on item update
class MessageUpdate(MessageBase):
    content: str | None = Field(default=None, min_length=1)  # type: ignore


# Database model, database table inferred from class name
class Message(MessageBase, table=True):
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
    chat_id: uuid.UUID = Field(
        foreign_key="chat.id", nullable=False, ondelete="CASCADE"
    )
    chat: Chat = Relationship(back_populates="messages")


# Properties to return via API, id is always required
class MessagePublic(MessageBase):
    id: uuid.UUID
    created_at: datetime | None = None


class MessagesPublic(SQLModel):
    data: list[MessagePublic]
    count: int | None
    page: int | None
    page_size: int | None
    total_pages: int | None
