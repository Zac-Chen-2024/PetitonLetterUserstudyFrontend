"""Tests for CORS configuration."""
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


def test_allowed_origin_passes_preflight(monkeypatch, tmp_projects_dir):
    app = _reload_app(monkeypatch, ALLOWED_ORIGINS="https://plus.drziangchen.uk")
    c = TestClient(app)
    resp = c.options(
        "/api/health",
        headers={
            "Origin": "https://plus.drziangchen.uk",
            "Access-Control-Request-Method": "GET",
        },
    )
    assert resp.status_code in (200, 204)
    assert resp.headers.get("access-control-allow-origin") == "https://plus.drziangchen.uk"


def test_disallowed_origin_blocked(monkeypatch, tmp_projects_dir):
    app = _reload_app(monkeypatch, ALLOWED_ORIGINS="https://plus.drziangchen.uk")
    c = TestClient(app)
    resp = c.options(
        "/api/health",
        headers={
            "Origin": "https://evil.example.com",
            "Access-Control-Request-Method": "GET",
        },
    )
    # Starlette CORSMiddleware omits the allow-origin header for non-allowed origins
    headers_lower = {k.lower() for k in resp.headers}
    assert "access-control-allow-origin" not in headers_lower
