from sqlmodel import Session, SQLModel, create_engine  # type:ignore
from src.core.config import config
# from src.models.chat import Chat, Message
# from src.models.user import User
# from src.models.documents import Documents, DocumentFile
# from src.models.schema import Professor, Course, Review

DATABASE_URL = config.DB_URL
engine = create_engine(DATABASE_URL, pool_pre_ping=True)


def init_db():
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session
