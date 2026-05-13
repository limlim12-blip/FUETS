from fastapi import APIRouter, HTTPException
import uuid
from sqlmodel import col, select
from sqlalchemy import func
from src.models.chat import *

from src.api.deps import CurrentUser, SessionDep
from typing import Any

router = APIRouter(prefix="/chat")
