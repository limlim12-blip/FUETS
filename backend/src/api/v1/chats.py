import uuid
from typing import Annotated
import math

from typing import Any
from src.core.llm import invoke, change_chat_title

from fastapi import APIRouter, Depends, HTTPException, Query
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
async def read_chats(
    session: SessionDep, current_user: CurrentUser, offset: int = 0, limit: int = 20
) -> Any:
    # if current_user.is_superuser:
    #     count = session.exec(select(func.count()).select_from(Chat)).one()
    #     chats = session.exec(
    #         select(Chat).order_by(col(Chat.created_at)).offset(offset).limit(limit)
    #     ).all()
    #
    # else:
    count = session.exec(
        select(func.count()).select_from(Chat).where(Chat.user_id == current_user.id)
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
async def read_chat(
    session: SessionDep, current_user: CurrentUser, id: uuid.UUID
) -> Any:
    chat = session.get(Chat, id)
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    if not current_user.is_superuser and chat.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Cút!")
    return chat


@router.post("/", response_model=ChatPublic)
async def create_chat(
    *, session: SessionDep, current_user: CurrentUser, item_in: ChatCreate
) -> Any:
    chat = Chat.model_validate(item_in, update={"user_id": current_user.id})
    session.add(chat)
    session.commit()
    session.refresh(chat)
    return chat


@router.put("/{id}", response_model=ChatPublic)
async def update_chat(
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
async def delete_chat(
    session: SessionDep, current_user: CurrentUser, id: uuid.UUID
) -> Any:
    chat = session.get(Chat, id)
    if not chat:
        raise HTTPException(status_code=404, detail="Message not found")
    if not current_user.is_superuser and chat.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    session.delete(chat)
    session.commit()


@router.get("/{id}/messages", response_model=MessagesPublic)
async def read_messages(
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID,
    page: int = Query(1, ge=1),
    page_size: int = Query(15, ge=1, le=100),
) -> Any:
    offset = (page - 1) * page_size

    count_statement = (
        select(func.count()).select_from(Message).where(Message.chat_id == id)
    )
    count = session.exec(count_statement).one()
    statement = (
        select(Message)
        .where(Message.chat_id == id)
        .order_by(col(Message.created_at).desc())
        .offset(offset)
        .limit(page_size)
    )
    items = session.exec(statement).all()

    items_public = [MessagePublic.model_validate(item) for item in items]
    total_pages = math.ceil(count / page_size) if count > 0 else 1

    return MessagesPublic(
        data=items_public,
        count=count,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.post("/{id}", response_model=MessagePublic)
async def create_message(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    item_in: MessageCreate,
    id: uuid.UUID,
) -> Any:
    chat = session.get(Chat, id)
    if not chat or (not current_user.is_superuser and chat.user_id != current_user.id):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    message = Message.model_validate(item_in, update={"chat_id": id})
    if len(chat.messages) == 0:
        first_chat_title = str(change_chat_title(message=str(message.content)))
        if not first_chat_title:
            first_chat_title = "New Chat"

        chat.title = first_chat_title
        session.add(chat)
        session.commit()
        session.refresh(chat)

    session.add(message)
    session.commit()
    session.refresh(message)
    past_messages = session.exec(
        select(Message)
        .where(Message.chat_id == id)
        .where(Message.id != message.id)
        .order_by(col(Message.created_at).asc())
        .limit(10)
    ).all()
    history_str = ""
    for m in past_messages:
        role_name = "User" if m.role == MessageRole.USER else MessageRole.ASSISTANT
        history_str += f"{role_name}: {m.content}\n"
    ai_text = invoke(user_question=message.content, history=history_str)

    ai_message = Message(content=ai_text, role=MessageRole.ASSISTANT, chat_id=id)
    session.add(ai_message)
    session.commit()
    session.refresh(ai_message)
    return ai_message
