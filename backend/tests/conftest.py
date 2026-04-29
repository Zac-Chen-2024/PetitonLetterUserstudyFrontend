"""Shared pytest fixtures."""
import os
import tempfile
from pathlib import Path

import pytest
from fastapi.testclient import TestClient


@pytest.fixture
def tmp_projects_dir(monkeypatch):
    """Isolated PROJECTS_DIR for each test, cleaned up automatically."""
    with tempfile.TemporaryDirectory() as td:
        monkeypatch.setenv("PETITON_PROJECTS_DIR", td)
        # Reload storage so it picks up the new env var
        import importlib
        from app.services import storage
        importlib.reload(storage)
        yield Path(td)


@pytest.fixture
def client(tmp_projects_dir):
    """FastAPI TestClient with isolated storage."""
    from app.main import app
    return TestClient(app)
