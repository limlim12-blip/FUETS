from sqlmodel import Field, SQLModel, Relationship

from datetime import datetime, timezone

from sqlalchemy import DateTime
import uuid
from typing import List
from src.models.user import User


# NOTE: CHAT
# Shared properties
class ChatBase(SQLModel):
    title: str = Field(min_length=1, max_length=255)


# Properties to receive on item creation
class ChatCreate(ChatBase):
    pass


# Properties to receive on item update
class ChatUpdate(ChatBase):
    title: str | None = Field(default=None, min_length=1, max_length=255)  # type: ignore


# Database model, database table inferred from class name
class Chat(ChatBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    created_at: datetime | None = Field(
        default_factory=Field(default_factory=lambda: datetime.now(timezone.utc)),
        sa_type=DateTime(timezone=True),  # type: ignore
    )
    user_id: uuid.UUID = Field(
        foreign_key="user.id", nullable=False, ondelete="CASCADE"
    )
    user: User | None = Relationship(back_populates="chats")
    messages: List["Message"] = Relationship(back_populates="chat")


# Properties to return via API, id is always required
class ChatPublic(ChatBase):
    id: uuid.UUID


class ChatsPublic(SQLModel):
    data: list[ChatPublic]
    count: int


# NOTE: Message
# Shared properties
class MessageBase(SQLModel):
    content: str


# Properties to receive on item creation
class MessageCreate(MessageBase):
    pass


# Properties to receive on item update
class MessageUpdate(MessageBase):
    content: str | None = Field(default=None, min_length=1, max_length=255)  # type: ignore


# Database model, database table inferred from class name
class Message(MessageBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    created_at: datetime | None = Field(
        default_factory=Field(default_factory=lambda: datetime.now(timezone.utc)),
        sa_type=DateTime(timezone=True),  # type: ignore
    )
    chat_id: uuid.UUID = Field(
        foreign_key="chat.id", nullable=False, ondelete="CASCADE"
    )
    chat: List["Chat"] = Relationship(back_populates="messages")


# Properties to return via API, id is always required
class MessagePublic(MessageBase):
    id: uuid.UUID


class MessagesPublic(SQLModel):
    data: list[MessagePublic]
    count: int
