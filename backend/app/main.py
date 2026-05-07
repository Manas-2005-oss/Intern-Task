from __future__ import annotations

import logging
from typing import Any

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config.settings import get_settings
from app.database.mongo import close_mongo, init_mongo
from app.routes.auth import router as auth_router
from app.routes.colleges import router as colleges_router
from app.routes.compare import router as compare_router
from app.routes.users import router as users_router


logger = logging.getLogger("campusiq-backend")


def _format_http_exception(exc: HTTPException) -> JSONResponse:
    detail: Any = exc.detail
    if isinstance(detail, dict) and "message" in detail:
        payload = {"message": detail.get("message"), "details": {k: v for k, v in detail.items() if k != "message"}}
    else:
        payload = {"message": detail if isinstance(detail, str) else "Request failed"}
    return JSONResponse(status_code=exc.status_code, content=payload)


app = FastAPI(title="CampusIQ API", version="1.0.0")


@app.on_event("startup")
async def on_startup() -> None:
    settings = get_settings()
    logging.basicConfig(level=getattr(logging, settings.LOG_LEVEL, logging.INFO))

    # Initialize Mongo client once.
    await init_mongo()
    logger.info("Application startup complete")


@app.on_event("shutdown")
async def on_shutdown() -> None:
    await close_mongo()
    logger.info("Application shutdown complete")


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    return _format_http_exception(exc)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    return JSONResponse(
        status_code=422,
        content={"message": "Invalid request", "details": exc.errors()},
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled error: %s", exc)
    return JSONResponse(status_code=500, content={"message": "Internal server error"})


settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
api_prefix = settings.API_PREFIX

app.include_router(auth_router, prefix=api_prefix)
app.include_router(colleges_router, prefix=api_prefix)
app.include_router(compare_router, prefix=api_prefix)
app.include_router(users_router, prefix=api_prefix)

