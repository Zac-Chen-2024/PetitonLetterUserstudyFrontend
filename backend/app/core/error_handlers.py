"""Unified exception handlers — clients get a request_id, logs get the detail.

The request_id is looked up from ``request.state`` (set by RequestIdMiddleware)
so the value matches the X-Request-ID response header and any in-request log
lines.
"""
from __future__ import annotations

import logging
import uuid

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

logger = logging.getLogger(__name__)


def _request_id(request: Request) -> str:
    return getattr(request.state, "request_id", None) or uuid.uuid4().hex[:12]


def install(app: FastAPI) -> None:
    """Register the unified error handlers on ``app``."""

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException):
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
        request_id = _request_id(request)
        logger.exception(
            "Unhandled exception (request_id=%s) %s %s",
            request_id, request.method, request.url.path,
        )
        response = JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": "Internal server error",
                "request_id": request_id,
            },
        )
        # Also stamp the header here so it's present even when the response is
        # sent directly by ServerErrorMiddleware (which wraps our middleware).
        response.headers["X-Request-ID"] = request_id
        return response
