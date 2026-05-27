import pandas as pd
from sqlmodel import create_engine


NEON_DB_URL = ""


def prof_2_sql():
    df = pd.read_csv("prof.csv")
    df.rename(columns={"prof_name": "name"}, inplace=True)
    df = df[["name", "university", "academic_rank"]]
    engine = create_engine(NEON_DB_URL)
    df.to_sql("professors", con=engine, if_exists="append", index=False)


def review_2_sql():
    df_reviews = pd.read_csv("review.csv")
    df_profs = pd.read_csv("professors.csv")
    df_courses = pd.read_csv("courses.csv")
    df_reviews["course_name"] = df_reviews["course_name"].str.strip()
    df_reviews["professor_name"] = df_reviews["professor_name"].str.strip()

    df = pd.merge(
        df_reviews,
        df_profs[["name", "id"]],
        left_on="professor_name",
        right_on="name",
        how="left",
    )
    df.rename(columns={"id": "prof_id"}, inplace=True)
    df = pd.merge(
        df,
        df_courses[["name", "id"]],
        left_on="course_name",
        right_on="name",
        how="left",
    )
    df.rename(columns={"id": "course_id"}, inplace=True)
    df["created_at"] = pd.to_datetime(df["created_at"], format="mixed", utc=True)
    df["rating"] = df["rating"].fillna(2).astype(int)
    df = df[["rating", "content", "course_id", "prof_id", "created_at"]]
    engine = create_engine(NEON_DB_URL)
    df.to_sql("reviews", con=engine, if_exists="append", index=False)


def course_2_sql():
    df = pd.read_csv("course.csv")
    df = df[["name", "code"]]

    engine = create_engine(NEON_DB_URL)
    df.to_sql("courses", con=engine, if_exists="append", index=False)


def doc_2_sql():
    df = pd.read_csv("doc.csv")
    df.rename(
        columns={
            "name": "title",
            "tag": "category",
            "date": "created_at",
            "link": "original_link",
        },
        inplace=True,
    )
    df = df[["title", "created_at", "category", "original_link"]]
    df["type"] = "unkown"
    df["size"] = 0
    df["url_obj"] = "\\"
    df["created_at"] = pd.to_datetime(df["created_at"], format="%d/%m/%Y", utc=True)
    engine = create_engine(NEON_DB_URL)
    df.to_sql("documents", con=engine, if_exists="append", index=False)


if __name__ == "__main__":
    course_2_sql()
    doc_2_sql()
    prof_2_sql()
    review_2_sql()
