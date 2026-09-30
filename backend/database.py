from pathlib import Path
import os

from sqlalchemy import create_engine, event
from sqlalchemy.orm import declarative_base, sessionmaker


BASE_DIR = Path(__file__).resolve().parent
DATABASE_FILE = BASE_DIR / "udaan.db"

DATABASE_URL = os.environ.get("UDAAN_DATABASE_URL", f"sqlite:///{DATABASE_FILE}")


engine = create_engine(
    DATABASE_URL,
    connect_args={
        "check_same_thread": False
    },
)


# SQLite does not enable foreign-key checks by default.
@event.listens_for(engine, "connect")
def enable_sqlite_foreign_keys(
    dbapi_connection,
    connection_record,
):
    cursor = dbapi_connection.cursor()

    cursor.execute(
        "PRAGMA foreign_keys=ON"
    )

    cursor.close()


SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


Base = declarative_base()


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()