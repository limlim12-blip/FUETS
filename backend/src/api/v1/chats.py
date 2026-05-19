import uuid
from typing import Annotated

from typing import Any

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy import func
from sqlmodel import col, select
from src.api.deps import CurrentUser, SessionDep
from src.models.chat import (
    MessageRole,
    MessageCreate,
    ChatsPublic,
    MessagesPublic,
    MessagePublic,
    Chat,
    ChatPublic,
    ChatCreate,
    ChatUpdate,
    Message,
)

router = APIRouter(prefix="/chats")


@router.get("/", response_model=ChatsPublic)
def read_chats(
    session: SessionDep, current_user: CurrentUser, offset: int = 0, limit: int = 20
) -> Any:
    if current_user.is_superuser:
        count = session.exec(select(func.count()).select_from(Chat)).one()
        chats = session.exec(
            select(Chat).order_by(col(Chat.created_at)).offset(offset).limit(limit)
        ).all()

    else:
        count = session.exec(
            select(func.count())
            .select_from(Chat)
            .where(Chat.user_id == current_user.id)
        ).one()
        chats = session.exec(
            select(Chat)
            .where(Chat.user_id == current_user.id)
            .order_by(col(Chat.created_at).desc())
            .offset(offset)
            .limit(limit)
        ).all()
    courses_public = [ChatPublic.model_validate(chat) for chat in chats]
    return ChatsPublic(data=courses_public, count=count)


@router.get("/{id}", response_model=ChatPublic)
def read_chat(session: SessionDep, id: uuid.UUID) -> Any:
    chat = session.get(Chat, id)
    if not chat:
        raise HTTPException(status_code=404, detail="Message not found")
    return chat


@router.post("/", response_model=ChatPublic)
def create_chat(
    *, session: SessionDep, current_user: CurrentUser, item_in: ChatCreate
) -> Any:
    chat = Chat.model_validate(item_in, update={"user_id": current_user.id})
    session.add(chat)
    session.commit()
    session.refresh(chat)
    return chat


@router.put("/{id}", response_model=ChatPublic)
def update_chat(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID,
    item_in: ChatUpdate,
) -> Any:
    chat = session.get(Chat, id)
    if not chat:
        raise HTTPException(status_code=404, detail="Message not found")
    if not current_user.is_superuser and chat.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    update_dict = item_in.model_dump(exclude_unset=True)
    chat.sqlmodel_update(update_dict)
    session.add(chat)
    session.commit()
    session.refresh(chat)
    return chat


@router.delete("/{id}")
def delete_chat(session: SessionDep, current_user: CurrentUser, id: uuid.UUID) -> Any:
    chat = session.get(Chat, id)
    if not chat:
        raise HTTPException(status_code=404, detail="Message not found")
    if not current_user.is_superuser and chat.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    session.delete(chat)
    session.commit()


@router.get("/{id}/messages", response_model=MessagesPublic)
def read_messages(
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID,
    skip: int = 0,
    limit: int = 20,
) -> Any:
    if current_user.is_superuser:
        count_statement = select(func.count()).select_from(Message)
        count = session.exec(count_statement).one()
        statement = (
            select(Message)
            .order_by(col(Message.created_at).desc())
            .offset(skip)
            .limit(limit)
        )
        items = session.exec(statement).all()
    else:
        count_statement = (
            select(func.count()).select_from(Message).where(Message.chat_id == id)
        )
        count = session.exec(count_statement).one()
        statement = (
            select(Message)
            .where(Message.chat_id == id)
            .order_by(col(Message.created_at).asc())
            .offset(skip)
            .limit(limit)
        )
        items = session.exec(statement).all()

    items_public = [MessagePublic.model_validate(item) for item in items]
    return MessagesPublic(data=items_public, count=count)


@router.post("/{id}", response_model=MessagePublic)
def create_message(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    item_in: MessageCreate,
    id: uuid.UUID,
) -> Any:
    message = Message.model_validate(item_in, update={"chat_id": id})
    session.add(message)
    session.commit()
    session.refresh(message)
    ai_text = "This is a placeholder AI response"

    ai_message = Message(content=ai_text, role=MessageRole.ASSISTANT, chat_id=id)
    session.add(ai_message)
    session.commit()
    session.refresh(ai_message)
    return ai_message
