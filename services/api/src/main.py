from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.engine import create_engine
from sqlalchemy import URL
import pandas as pd
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from sqlalchemy import text

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For testing only
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/status")
async def get_status():
    return {"message": "Hello from FastAPI!", "connection": "Success"}


SQLALCHEMY_DATABASE_URL = "postgresql://root:root@db:5432/test_db"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/professors")
def read_professors(db: Session = Depends(get_db)):
    df = pd.read_sql_query("SELECT prof_name, university FROM professors", engine)
    json_output = df.to_json(orient="records")

    print(json_output)
    return json_output


@app.get("/search-prof")
def search_professor(name: str, db: Session = Depends(get_db)):
    # Query có điều kiện (Tương đương SELECT * FROM professors WHERE name = ...)
    # prof = db.query(models.Professor).filter(models.Professor.name == name).first()
    return {"result": "Logic search ở đây"}
