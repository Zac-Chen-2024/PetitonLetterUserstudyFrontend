"""Unified exception handlers — clients get a request_id, logs get the detail."""
from __future__ import annotations

import logging
import uuid

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

logger = logging.getLogger(__name__)


def install(app: FastAPI) -> None:
    """Register the unified error handlers on ``app``."""

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException):
        # Pass-through for explicit HTTPException(...). detail is intentional.
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "success": False,
                "error": exc.detail if isinstance(exc.detail, str) else "Error",
                "detail": exc.detail if not isinstance(exc.detail, str) else None,
            },
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception):
        request_id = uuid.uuid4().hex[:12]
        logger.exception(
            "Unhandled exception (request_id=%s) %s %s",
            request_id, request.method, request.url.path,
        )
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": "Internal server error",
                "request_id": request_id,
            },
        )
