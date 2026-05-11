from pydantic import BaseModel, ConfigDict
from typing import Optional, Union
from decimal import Decimal
import uuid


class Prof(BaseModel):
    prof_id: Union[str, None]
    prof_name: Union[str, None]
    university: Union[str, None]
    academic_rank: Union[str, None]
    average_rating: Union[Decimal, None]


class ProfRead(BaseModel):
    prof_id: uuid.UUID
