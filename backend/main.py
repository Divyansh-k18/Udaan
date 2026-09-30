from contextlib import asynccontextmanager

from fastapi import FastAPI

from fastapi.middleware.cors import (
    CORSMiddleware,
)

from database import (
    Base,
    SessionLocal,
    engine,
)

# Import models before create_all.
import models

from routes.sessions import (
    router as sessions_router,
    seed_demo_data,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create SQLite tables.
    Base.metadata.create_all(
        bind=engine
    )

    # Add demo exams/questions.
    db = SessionLocal()

    try:
        seed_demo_data(
            db
        )
    finally:
        db.close()

    yield


app = FastAPI(
    title="Udaan API",
    version="1.0.0",
    lifespan=lifespan,
)


# React Vite development servers.
app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",

        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],

    allow_credentials=True,

    allow_methods=[
        "GET",
        "POST",
        "PUT",
        "DELETE",
        "OPTIONS",
    ],

    allow_headers=[
        "*"
    ],
)


@app.get("/")
def root():
    return {
        "name": "Udaan API",
        "status": "running",
    }


@app.get("/health")
def health():
    return {
        "ok": True,
        "status": "ok",
        "service": "udaan-backend",
    }


app.include_router(
    sessions_router
)