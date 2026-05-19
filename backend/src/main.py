from fastapi import FastAPI
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from src.core.db import init_db
from src.core.logger import setup_logging
from src.api.main import router


@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging()
    init_db()
    yield


app = FastAPI(
    lifespan=lifespan,
)
app.include_router(router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For testing only
    allow_methods=["*"],
    allow_headers=["*"],
)
