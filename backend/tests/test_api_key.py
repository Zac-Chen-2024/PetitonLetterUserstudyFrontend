"""Tests for API Key middleware."""
import importlib

from fastapi.testclient import TestClient


def _reload_app(monkeypatch, **env):
    for k, v in env.items():
        monkeypatch.setenv(k, v)
    from app.core import config as config_mod
    importlib.reload(config_mod)
    from app import main as main_mod
    importlib.reload(main_mod)
    return main_mod.app


def test_no_key_required_when_disabled(monkeypatch, tmp_projects_dir):
    app = _reload_app(monkeypatch, API_KEY_REQUIRED="false")
    c = TestClient(app)
    assert c.get("/api/health").status_code == 200


def test_missing_key_blocked_when_required(monkeypatch, tmp_projects_dir):
    app = _reload_app(
        monkeypatch, API_KEY_REQUIRED="true", API_KEY="secret-token-123"
    )
    c = TestClient(app)
    # Hitting a real protected endpoint (not /api/health which is open)
    resp = c.get("/api/projects")
    assert resp.status_code == 401


def test_correct_key_allowed_when_required(monkeypatch, tmp_projects_dir):
    app = _reload_app(
        monkeypatch, API_KEY_REQUIRED="true", API_KEY="secret-token-123"
    )
    c = TestClient(app)
    resp = c.get("/api/projects", headers={"X-API-Key": "secret-token-123"})
    # Either 200 (empty list) or 200/500 depending on storage state — but NOT 401
    assert resp.status_code != 401


def test_wrong_key_blocked_when_required(monkeypatch, tmp_projects_dir):
    app = _reload_app(
        monkeypatch, API_KEY_REQUIRED="true", API_KEY="secret-token-123"
    )
    c = TestClient(app)
    resp = c.get("/api/projects", headers={"X-API-Key": "wrong-key"})
    assert resp.status_code == 401


def test_health_root_always_open(monkeypatch, tmp_projects_dir):
    """The literal '/' (banner) and /api/health stay open for liveness probes."""
    app = _reload_app(
        monkeypatch, API_KEY_REQUIRED="true", API_KEY="secret-token-123"
    )
    c = TestClient(app)
    assert c.get("/").status_code == 200
    assert c.get("/api/health").status_code == 200
