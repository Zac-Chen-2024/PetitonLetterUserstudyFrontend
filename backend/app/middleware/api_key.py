"""Minimal API Key middleware.

- When ``api_key_required`` is False → no-op (allows every request, useful for
  user studies / local dev).
- When True and ``api_key`` is set → require ``X-API-Key`` header to match.
- Always allows ``/`` (banner) and ``/api/health`` so liveness checks work.
"""
from __future__ import annotations

import hmac

from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

OPEN_PATHS = frozenset({"/", "/api/health"})


class APIKeyMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, *, required: bool, expected_key: str):
        super().__init__(app)
        self.required = required
        self.expected_key = expected_key

    async def dispatch(self, request: Request, call_next):
        if not self.required or request.url.path in OPEN_PATHS:
            return await call_next(request)

        if not self.expected_key:
            # Misconfiguration: required but no key set. Fail closed.
            return JSONResponse(
                status_code=503,
                content={"success": False, "error": "API key not configured"},
            )

        provided = request.headers.get("X-API-Key", "")
        if not hmac.compare_digest(provided, self.expected_key):
            return JSONResponse(
                status_code=401,
                content={"success": False, "error": "Unauthorized"},
            )
        return await call_next(request)
