from sqlmodel import Session, select
from src.models.schema import Professor
import uuid


class ProfService:
    def __init__(self, session: Session):
        self._db = session

    def list_profs(self) -> list[Professor]:
        return self._db.exec(select(Professor)).all()

    def read_prof(self, prof_id: uuid.UUID) -> Professor | None:
        return self._db.get(Professor, prof_id)

    def create_prof(self, prof_data: Professor) -> Professor:
        # Chuyển đổi từ Pydantic sang SQLModel cực nhanh
        prof = Professor.model_validate(prof_data)
        self._db.add(prof)
        self._db.commit()
        self._db.refresh(prof)
        return prof

    def update_prof(self, prof_id: uuid.UUID, prof_data: Professor) -> Professor | None:
        prof = self.read_prof(prof_id)
        if not prof:
            return None
        update_data = prof_data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(prof, key, value)
        self._db.add(prof)
        self._db.commit()
        self._db.refresh(prof)
        return prof
