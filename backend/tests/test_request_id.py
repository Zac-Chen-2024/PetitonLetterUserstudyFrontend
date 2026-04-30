"""Tests for request_id correlation across middleware, logger, and error response."""
import importlib
import json
import logging

from fastapi.testclient import TestClient


def _fresh_app(monkeypatch, tmp_projects_dir):
    from app.core import config as config_mod
    importlib.reload(config_mod)
    from app import main as main_mod
    importlib.reload(main_mod)
    return main_mod.app


def test_response_header_carries_request_id(monkeypatch, tmp_projects_dir):
    app = _fresh_app(monkeypatch, tmp_projects_dir)
    c = TestClient(app)
    resp = c.get("/api/health")
    assert resp.status_code == 200
    rid = resp.headers.get("X-Request-ID")
    assert rid and len(rid) >= 8, f"missing/short request id: {rid!r}"


def test_client_supplied_request_id_is_preserved(monkeypatch, tmp_projects_dir):
    """If the client passes X-Request-ID we keep it (lets ops correlate end-to-end)."""
    app = _fresh_app(monkeypatch, tmp_projects_dir)
    c = TestClient(app)
    resp = c.get("/api/health", headers={"X-Request-ID": "my-trace-abc-123"})
    assert resp.headers["X-Request-ID"] == "my-trace-abc-123"


def test_500_response_request_id_matches_response_header(monkeypatch, tmp_projects_dir):
    app = _fresh_app(monkeypatch, tmp_projects_dir)

    @app.get("/__test_boom_2b")
    def boom():
        raise RuntimeError("intentional")

    c = TestClient(app, raise_server_exceptions=False)
    resp = c.get("/__test_boom_2b")
    assert resp.status_code == 500
    body = resp.json()
    assert body["request_id"] == resp.headers["X-Request-ID"]


def test_log_lines_during_request_carry_request_id(monkeypatch, tmp_projects_dir, caplog):
    """A logger call inside a request handler must include request_id in the record."""
    app = _fresh_app(monkeypatch, tmp_projects_dir)

    test_logger = logging.getLogger("app.tests.requestid_probe")

    @app.get("/__test_log_probe")
    def probe():
        test_logger.info("hello from inside handler")
        return {"ok": True}

    c = TestClient(app)
    with caplog.at_level(logging.INFO, logger="app.tests.requestid_probe"):
        resp = c.get("/__test_log_probe", headers={"X-Request-ID": "trace-xyz"})

    rid = resp.headers["X-Request-ID"]
    assert rid == "trace-xyz"

    matched = [
        r for r in caplog.records
        if r.name == "app.tests.requestid_probe" and "hello from inside handler" in r.getMessage()
    ]
    assert matched, "expected to capture the handler log line"
    record = matched[0]
    # The injected attribute is what processors / formatters key off of:
    assert getattr(record, "request_id", None) == rid, (
        f"log record missing request_id={rid}; saw {getattr(record, 'request_id', None)!r}"
    )


def test_log_lines_outside_request_have_no_request_id(monkeypatch, tmp_projects_dir, caplog):
    """contextvar must be empty (or 'none') outside any request."""
    _fresh_app(monkeypatch, tmp_projects_dir)
    outer_logger = logging.getLogger("app.tests.requestid_outer")
    with caplog.at_level(logging.INFO, logger="app.tests.requestid_outer"):
        outer_logger.info("from outside any request")
    matched = [r for r in caplog.records if r.name == "app.tests.requestid_outer"]
    assert matched
    rid = getattr(matched[0], "request_id", None)
    # Either absent or a sentinel; never a leaked id from a previous request.
    assert rid in (None, "", "-", "none"), f"unexpected outside-request rid: {rid!r}"
