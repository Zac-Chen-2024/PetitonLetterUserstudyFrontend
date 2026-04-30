"""Generates / accepts an X-Request-ID per request and binds it to a contextvar.

If the client sends `X-Request-ID`, we trust it (lets upstream/edge tracing
correlate end-to-end). Otherwise we mint a 12-hex one. Either way, the value
is exposed on:

  - ``request.state.request_id``  (so route handlers / exception handlers can
                                    read the same id without re-deriving it)
  - the response header ``X-Request-ID``  (so the client can echo it in a
                                            bug report)
  - a contextvar surfaced by ``app.core.logging_config.get_request_id``
    (so every ``logging.getLogger(__name__).info(...)`` inside the request
    is stamped automatically)

Implementation note: we use a raw ASGI middleware (not BaseHTTPMiddleware) so
we can inject the X-Request-ID header at the ``http.response.start`` level.
BaseHTTPMiddleware does not see the response when ServerErrorMiddleware
re-raises after calling the 500 error handler; raw ASGI does.
"""
from __future__ import annotations

import re
import uuid

from starlette.datastructures import MutableHeaders
from starlette.types import ASGIApp, Message, Receive, Scope, Send

from app.core.logging_config import reset_request_id, set_request_id

# Trim/sanitise inbound ids — accept printable, drop control chars and trim
# anything pathological. Matches what reasonable tracers send (uuid, hex,
# slug-style ids).
_ALLOWED_RID = re.compile(r"^[A-Za-z0-9._:-]{1,128}$")


def _new_request_id() -> str:
    return uuid.uuid4().hex[:12]


class RequestIdMiddleware:
    """Pure ASGI middleware: mint/accept X-Request-ID, stamp every log line."""

    def __init__(self, app: ASGIApp) -> None:
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        from starlette.requests import Request
        request = Request(scope, receive)

        incoming = request.headers.get("X-Request-ID", "")
        rid = incoming if _ALLOWED_RID.fullmatch(incoming) else _new_request_id()

        set_request_id(rid)
        scope.setdefault("state", {})["request_id"] = rid  # expose on request.state

        async def send_with_request_id(message: Message) -> None:
            if message["type"] == "http.response.start":
                headers = MutableHeaders(scope=message)
                headers.append("X-Request-ID", rid)
            await send(message)

        try:
            await self.app(scope, receive, send_with_request_id)
        finally:
            reset_request_id()
