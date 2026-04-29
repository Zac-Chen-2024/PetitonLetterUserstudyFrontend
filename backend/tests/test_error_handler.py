"""Tests for the unified error handler."""
import importlib

from fastapi.testclient import TestClient


def _fresh_app(monkeypatch, tmp_projects_dir):
    """Reload app modules so a freshly-registered test route works under TestClient."""
    from app.core import config as config_mod
    importlib.reload(config_mod)
    from app import main as main_mod
    importlib.reload(main_mod)
    return main_mod.app


def test_500_returns_request_id_not_raw_exception(monkeypatch, tmp_projects_dir):
    """Unhandled exceptions must NOT leak str(exc) to clients."""
    app = _fresh_app(monkeypatch, tmp_projects_dir)

    @app.get("/__test_boom")
    def boom():
        raise RuntimeError("super-secret-internal-detail-XYZ")

    c = TestClient(app, raise_server_exceptions=False)
    resp = c.get("/__test_boom")
    assert resp.status_code == 500
    body = resp.json()
    assert body["success"] is False
    assert "request_id" in body
    assert body["error"] == "Internal server error"
    # The secret string MUST NOT appear in the body
    assert "super-secret" not in resp.text


def test_http_exception_passes_through(client):
    """Explicit HTTPException(404, ...) should still be returned as-is."""
    # /api/projects/{project_id} returns 404 when meta.json is missing.
    resp = client.get("/api/projects/does-not-exist")
    assert resp.status_code == 404
