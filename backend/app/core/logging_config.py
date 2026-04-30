"""Structured logging configuration with request_id correlation.

A single contextvar holds the current request's id. A logging filter copies
that id onto every LogRecord, so any `logging.getLogger(__name__).info(...)`
emitted while serving a request automatically carries it — without anyone
having to thread it through call signatures.
"""
from __future__ import annotations

import logging
import sys
from contextvars import ContextVar
from typing import Optional

import structlog

# Empty string means "no request in scope" — easier to grep than None.
_request_id_var: ContextVar[str] = ContextVar("request_id", default="")


def get_request_id() -> str:
    return _request_id_var.get()


def set_request_id(value: str) -> None:
    _request_id_var.set(value)


def reset_request_id() -> None:
    _request_id_var.set("")


class _RequestIdFilter(logging.Filter):
    """Stamps the active request_id onto each LogRecord as `record.request_id`."""

    def filter(self, record: logging.LogRecord) -> bool:
        rid = _request_id_var.get()
        record.request_id = rid if rid else "-"
        return True


def configure_logging(level: int = logging.INFO) -> None:
    """Idempotent setup: stdlib logging routed through structlog, JSON output."""
    timestamper = structlog.processors.TimeStamper(fmt="iso")

    shared_processors = [
        structlog.contextvars.merge_contextvars,
        structlog.stdlib.add_log_level,
        structlog.stdlib.add_logger_name,
        timestamper,
    ]

    structlog.configure(
        processors=shared_processors + [
            structlog.stdlib.ProcessorFormatter.wrap_for_formatter,
        ],
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.make_filtering_bound_logger(level),
        cache_logger_on_first_use=True,
    )

    formatter = structlog.stdlib.ProcessorFormatter(
        foreign_pre_chain=shared_processors,
        processors=[
            _inject_request_id_kv,
            structlog.stdlib.ProcessorFormatter.remove_processors_meta,
            structlog.processors.JSONRenderer(),
        ],
    )

    handler = logging.StreamHandler(stream=sys.stdout)
    handler.setFormatter(formatter)
    handler.addFilter(_RequestIdFilter())
    # Tag our handler so we can identify and remove it on re-configure.
    handler._is_structlog_handler = True  # type: ignore[attr-defined]

    root = logging.getLogger()
    # Avoid duplicate handlers if configure_logging() runs twice (tests), but
    # preserve any handlers we didn't create (e.g., pytest caplog handler).
    for h in list(root.handlers):
        if getattr(h, "_is_structlog_handler", False):
            root.removeHandler(h)
    root.addHandler(handler)
    root.setLevel(level)

    # uvicorn ships its own loggers with their own StreamHandlers and
    # propagate=False, which would bypass our root-level JSON formatter.
    # Strip those handlers so the records bubble up to root and get
    # re-formatted as JSON (with request_id stamped on by the filter).
    for name in ("uvicorn", "uvicorn.error", "uvicorn.access"):
        ulog = logging.getLogger(name)
        for h in list(ulog.handlers):
            ulog.removeHandler(h)
        ulog.propagate = True
        ulog.setLevel(level)


def _inject_request_id_kv(logger, method_name, event_dict):
    """Copy record.request_id (set by _RequestIdFilter) into the JSON payload."""
    rec: Optional[logging.LogRecord] = event_dict.get("_record")
    if rec is not None:
        rid = getattr(rec, "request_id", "-")
        if rid and rid != "-":
            event_dict["request_id"] = rid
    return event_dict
