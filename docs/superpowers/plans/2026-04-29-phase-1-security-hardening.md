# Phase 1 安全加固实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 2 周内消除 P0 级安全/数据完整性风险，使系统达到「内部用户研究可放心部署」门槛。

**Architecture:**
- 不改变业务建模，纯防御性硬化：输入校验、原子写入、错误屏蔽、来源限制、可选鉴权。
- 新增小工具模块（`app/core/safety.py`、`app/core/atomic_io.py`）承载共享逻辑，避免散落在 router/service。
- 引入最小测试基线（pytest + 关键路径单测），为 Phase 2 大重构铺路。
- 前端仅做最小改动（解除 PII 硬编码），不触碰 Context/组件结构。

**Tech Stack:** FastAPI 0.115 / pydantic 2.9 / portalocker 2.10（已有依赖）/ pytest 8.x（新增 dev 依赖）/ httpx 0.27（已有，用于 TestClient）。

---

## File Structure

**新增文件**
- `backend/app/core/safety.py` — 路径白名单、安全 resolve helper
- `backend/app/core/atomic_io.py` — 原子写 + portalocker 包装
- `backend/app/core/error_handlers.py` — 统一异常 handler，request_id 注入
- `backend/app/middleware/__init__.py` — middleware 包初始化
- `backend/app/middleware/api_key.py` — API Key middleware
- `backend/requirements-dev.txt` — pytest + httpx[testclient]
- `backend/tests/__init__.py`
- `backend/tests/conftest.py` — TestClient fixture
- `backend/tests/test_safety.py`
- `backend/tests/test_atomic_io.py`
- `backend/tests/test_documents_router.py`
- `backend/tests/test_cors.py`
- `backend/tests/test_error_handler.py`
- `backend/tests/test_api_key.py`

**修改文件**
- `backend/app/main.py` — CORS 白名单 + 异常 handler 替换 + middleware 挂载
- `backend/app/core/config.py` — 新增 `allowed_origins`、`api_key`、`api_key_required` 配置项
- `backend/app/routers/documents.py` — 用 `safety.py` 替换原裸路径拼接
- `backend/app/services/storage.py` — 替换所有 `open(..., 'w')` 为 `atomic_write_json`
- `frontend/src/context/ProjectContext.tsx` — 解除 `dehuan_liu` 硬编码

**不改文件（本期跳过）**
- 三个 2k+ 行模块拆分 → Phase 2
- Context facade 重构 → Phase 2
- archive.tar.gz 出仓 → 单独决策（涉及 git 历史改写，需用户确认）

---

## Task 1: 测试基础设施

**Files:**
- Create: `backend/requirements-dev.txt`
- Create: `backend/tests/__init__.py`
- Create: `backend/tests/conftest.py`

- [ ] **Step 1: 写 dev 依赖文件**

Create `backend/requirements-dev.txt`:

```
-r requirements.txt
pytest==8.3.3
pytest-asyncio==0.24.0
```

- [ ] **Step 2: 安装 dev 依赖**

Run: `cd backend && pip install -r requirements-dev.txt`
Expected: pytest 安装成功，无依赖冲突。

- [ ] **Step 3: 写空的 tests 包初始化**

Create `backend/tests/__init__.py` (empty file).

- [ ] **Step 4: 写 conftest.py**

Create `backend/tests/conftest.py`:

```python
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
```

- [ ] **Step 5: 验证 pytest 能发现并跑空集合**

Run: `cd backend && pytest tests/ -v`
Expected: `collected 0 items` 不报错。

- [ ] **Step 6: Commit**

```bash
git add backend/requirements-dev.txt backend/tests/__init__.py backend/tests/conftest.py
git commit -m "test: add pytest scaffolding (conftest, dev requirements)"
```

---

## Task 2: 路径安全工具 (S-4 基础)

**Files:**
- Create: `backend/app/core/safety.py`
- Create: `backend/tests/test_safety.py`

- [ ] **Step 1: 写失败测试**

Create `backend/tests/test_safety.py`:

```python
"""Tests for path safety helpers."""
from pathlib import Path

import pytest

from app.core.safety import EXHIBIT_ID_RE, safe_resolve


def test_exhibit_id_accepts_letter_digit():
    assert EXHIBIT_ID_RE.fullmatch("A1")
    assert EXHIBIT_ID_RE.fullmatch("B10")
    assert EXHIBIT_ID_RE.fullmatch("AA3")


def test_exhibit_id_rejects_traversal_and_garbage():
    bad = ["", "../etc/passwd", "A", "1A", "A-1", "A.1", "A1/B", " A1", "A1 "]
    for s in bad:
        assert EXHIBIT_ID_RE.fullmatch(s) is None, f"should reject: {s!r}"


def test_safe_resolve_inside_root(tmp_path):
    root = tmp_path / "root"
    root.mkdir()
    (root / "ok.pdf").write_bytes(b"%PDF")
    assert safe_resolve(root / "ok.pdf", root) == (root / "ok.pdf").resolve()


def test_safe_resolve_outside_root_returns_none(tmp_path):
    root = tmp_path / "root"
    outside = tmp_path / "outside"
    root.mkdir()
    outside.mkdir()
    (outside / "secret").write_bytes(b"x")
    assert safe_resolve(root / ".." / "outside" / "secret", root) is None


def test_safe_resolve_symlink_escape_blocked(tmp_path):
    root = tmp_path / "root"
    outside = tmp_path / "outside"
    root.mkdir()
    outside.mkdir()
    target = outside / "secret"
    target.write_bytes(b"x")
    link = root / "link"
    link.symlink_to(target)
    assert safe_resolve(link, root) is None
```

- [ ] **Step 2: 跑测试确认失败**

Run: `cd backend && pytest tests/test_safety.py -v`
Expected: ImportError / ModuleNotFoundError on `app.core.safety`.

- [ ] **Step 3: 实现 safety.py**

Create `backend/app/core/safety.py`:

```python
"""Filesystem-related safety helpers (path validation, traversal defence)."""
from __future__ import annotations

import re
from pathlib import Path
from typing import Optional

# Exhibit IDs are letter(s) followed by digits: "A1", "B10", "AA3".
# Anything else is rejected before it touches the filesystem.
EXHIBIT_ID_RE = re.compile(r"^[A-Za-z]+\d+$")


def safe_resolve(candidate: Path, root: Path) -> Optional[Path]:
    """Resolve ``candidate`` and return it iff it lives under ``root``.

    Defends against ``..`` and symlink escapes by comparing the fully-resolved
    real paths. Returns ``None`` when the candidate escapes ``root`` or the
    filesystem refuses to resolve it.
    """
    try:
        resolved = candidate.resolve(strict=False)
        root_resolved = root.resolve(strict=False)
    except OSError:
        return None
    try:
        resolved.relative_to(root_resolved)
    except ValueError:
        return None
    return resolved
```

- [ ] **Step 4: 跑测试确认通过**

Run: `cd backend && pytest tests/test_safety.py -v`
Expected: 5 passed.

- [ ] **Step 5: Commit**

```bash
git add backend/app/core/safety.py backend/tests/test_safety.py
git commit -m "feat(core): add path safety helpers (exhibit_id whitelist + safe_resolve)"
```

---

## Task 3: documents.py 接入路径校验 (S-4 应用)

**Files:**
- Modify: `backend/app/routers/documents.py`
- Create: `backend/tests/test_documents_router.py`

- [ ] **Step 1: 写失败测试**

Create `backend/tests/test_documents_router.py`:

```python
"""Tests for /api/documents path-traversal hardening."""
import json
from pathlib import Path


def _bootstrap_project(projects_dir: Path, source_dir: Path) -> str:
    pid = "proj-test"
    pdir = projects_dir / pid
    pdir.mkdir(parents=True, exist_ok=True)
    meta = {
        "id": pid,
        "name": "Test",
        "sourcePath": str(source_dir),
        "projectType": "EB-1A",
    }
    (pdir / "meta.json").write_text(json.dumps(meta))
    (pdir / "documents.json").write_text(json.dumps([
        {"exhibit_id": "A1", "page_count": 1}
    ]))
    return pid


def test_pdf_route_serves_legit_exhibit(client, tmp_projects_dir, tmp_path):
    source = tmp_path / "source"
    (source / "PDF" / "A").mkdir(parents=True)
    pdf = source / "PDF" / "A" / "A1.pdf"
    pdf.write_bytes(b"%PDF-1.4\n")
    pid = _bootstrap_project(tmp_projects_dir, source)

    resp = client.get(f"/api/documents/{pid}/pdf/A1")
    assert resp.status_code == 200
    assert resp.headers["content-type"] == "application/pdf"


def test_pdf_route_rejects_traversal(client, tmp_projects_dir, tmp_path):
    source = tmp_path / "source"
    source.mkdir()
    pid = _bootstrap_project(tmp_projects_dir, source)

    # FastAPI normalises ".." in the path itself; we still want to verify the
    # whitelist rejects malformed IDs.
    for bad_id in ["A", "1A", "A-1", "A%2E1"]:
        resp = client.get(f"/api/documents/{pid}/pdf/{bad_id}")
        assert resp.status_code in (400, 404), f"{bad_id} should be rejected"


def test_pdf_route_404_when_pdf_missing(client, tmp_projects_dir, tmp_path):
    source = tmp_path / "source"
    (source / "PDF" / "A").mkdir(parents=True)
    pid = _bootstrap_project(tmp_projects_dir, source)

    resp = client.get(f"/api/documents/{pid}/pdf/A99")
    assert resp.status_code == 404
```

- [ ] **Step 2: 跑测试确认失败**

Run: `cd backend && pytest tests/test_documents_router.py -v`
Expected: 至少 `test_pdf_route_rejects_traversal` 失败（当前实现会返回 404 即偶尔 200 而非 400 一致行为；同时 `A%2E1` 也未被显式 reject）。

- [ ] **Step 3: 修改 documents.py**

Edit `backend/app/routers/documents.py`:

替换文件头部（imports 后）+ `get_exhibit_pdf` 函数。完整替换段：

```python
import json
import logging
import re
from pathlib import Path

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from app.core.safety import EXHIBIT_ID_RE, safe_resolve
from app.services import storage

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/documents", tags=["documents"])


def _get_source_path(project_id: str) -> Path:
    """Read sourcePath from project meta.json, raise 404 on failure."""
    meta_file = storage.get_project_file(project_id, "meta.json")
    if not meta_file.exists():
        raise HTTPException(status_code=404, detail="Project meta.json not found")

    with open(meta_file, "r", encoding="utf-8") as f:
        meta = json.load(f)

    source_path = meta.get("sourcePath", "")
    if not source_path:
        raise HTTPException(
            status_code=404, detail="No sourcePath in project meta.json"
        )
    return Path(source_path)


def _exhibit_to_frontend(project_id: str, exhibit: dict) -> dict:
    eid = exhibit.get("exhibit_id", "")
    category = eid[0].upper() if eid else "?"
    return {
        "id": eid,
        "name": eid,
        "category": category,
        "pdf_url": f"/api/documents/{project_id}/pdf/{eid}",
        "page_count": exhibit.get("page_count", 0),
    }


@router.get("/{project_id}/exhibits")
def list_exhibits(project_id: str):
    """List all exhibit documents for a project."""
    project_dir = storage.get_project_dir(project_id)

    raw_exhibits = []
    docs_file = project_dir / "documents.json"
    if docs_file.exists():
        with open(docs_file, "r", encoding="utf-8") as f:
            data = json.load(f)
        if isinstance(data, list) and len(data) > 0:
            raw_exhibits = data

    if not raw_exhibits:
        raise HTTPException(status_code=404, detail="No exhibits found for project")

    exhibits = [_exhibit_to_frontend(project_id, e) for e in raw_exhibits]
    return {"project_id": project_id, "total": len(exhibits), "exhibits": exhibits}


@router.get("/{project_id}/pdf/{exhibit_id}")
def get_exhibit_pdf(project_id: str, exhibit_id: str):
    """Serve exhibit PDF, with strict whitelist + path-traversal defence."""
    if not EXHIBIT_ID_RE.fullmatch(exhibit_id):
        raise HTTPException(status_code=400, detail="Invalid exhibit_id format")

    source = _get_source_path(project_id)
    pdf_root = source / "PDF"
    letter = exhibit_id[0].upper()

    # Build dash-separated variant: "A1" -> "A-1", "B10" -> "B-10"
    dash_id = re.sub(r"([A-Za-z])(\d)", r"\1-\2", exhibit_id)

    raw_candidates = [
        pdf_root / letter / f"{exhibit_id}.pdf",
        pdf_root / letter / f"{exhibit_id.lower()}.pdf",
        pdf_root / letter / f"{exhibit_id.upper()}.pdf",
        pdf_root / letter / f"{dash_id}.pdf",
        pdf_root / letter / f"{dash_id.lower()}.pdf",
        pdf_root / letter / f"{dash_id.upper()}.pdf",
    ]

    for cand in raw_candidates:
        resolved = safe_resolve(cand, pdf_root)
        if resolved is not None and resolved.exists():
            return FileResponse(
                path=str(resolved),
                media_type="application/pdf",
                filename=f"{exhibit_id}.pdf",
            )

    raise HTTPException(status_code=404, detail=f"PDF not found: {exhibit_id}")
```

- [ ] **Step 4: 跑测试确认通过**

Run: `cd backend && pytest tests/test_documents_router.py -v`
Expected: 3 passed.

- [ ] **Step 5: Commit**

```bash
git add backend/app/routers/documents.py backend/tests/test_documents_router.py
git commit -m "fix(docs-router): whitelist exhibit_id and resolve PDF paths under PDF root only"
```

---

## Task 4: CORS 白名单 (S-2)

**Files:**
- Modify: `backend/app/core/config.py`
- Modify: `backend/app/main.py`
- Create: `backend/tests/test_cors.py`

- [ ] **Step 1: 写失败测试**

Create `backend/tests/test_cors.py`:

```python
"""Tests for CORS configuration."""


def test_allowed_origin_passes_preflight(client, monkeypatch):
    monkeypatch.setenv("ALLOWED_ORIGINS", "https://plus.drziangchen.uk")
    # Re-import app so settings reload
    import importlib
    from app import main as main_mod
    importlib.reload(main_mod)
    from fastapi.testclient import TestClient
    c = TestClient(main_mod.app)

    resp = c.options(
        "/api/health",
        headers={
            "Origin": "https://plus.drziangchen.uk",
            "Access-Control-Request-Method": "GET",
        },
    )
    assert resp.status_code in (200, 204)
    assert resp.headers.get("access-control-allow-origin") == "https://plus.drziangchen.uk"


def test_disallowed_origin_blocked(client, monkeypatch):
    monkeypatch.setenv("ALLOWED_ORIGINS", "https://plus.drziangchen.uk")
    import importlib
    from app import main as main_mod
    importlib.reload(main_mod)
    from fastapi.testclient import TestClient
    c = TestClient(main_mod.app)

    resp = c.options(
        "/api/health",
        headers={
            "Origin": "https://evil.example.com",
            "Access-Control-Request-Method": "GET",
        },
    )
    # FastAPI/Starlette returns 400 or omits the allow-origin header
    assert "access-control-allow-origin" not in {k.lower() for k in resp.headers}
```

- [ ] **Step 2: 跑测试确认失败**

Run: `cd backend && pytest tests/test_cors.py -v`
Expected: FAIL — 当前 `allow_origins=["*"]` 让 `evil.example.com` 也通过。

- [ ] **Step 3: 修改 config.py 增加 allowed_origins**

Edit `backend/app/core/config.py`，整体替换为：

```python
from typing import List

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # DeepSeek API (default provider)
    deepseek_api_key: str = ""
    deepseek_api_base: str = "https://api.deepseek.com/v1"

    # OpenAI API (alternative)
    openai_api_key: str = ""
    openai_api_base: str = "https://api.openai.com/v1"

    # LLM Provider: "deepseek" (default) or "openai"
    llm_provider: str = "deepseek"

    # CORS — comma-separated list. Default covers prod domain + Vite dev server.
    # Set to "*" only for explicit local-debug situations.
    allowed_origins: str = (
        "https://plus.drziangchen.uk,http://localhost:5173,http://localhost:4173"
    )

    # API Key gate (Phase 1: optional; Phase 3: required)
    api_key: str = ""
    api_key_required: bool = False

    @property
    def allowed_origins_list(self) -> List[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
```

- [ ] **Step 4: 修改 main.py CORS 配置**

In `backend/app/main.py`，替换 CORS 段：

```python
# CORS — 白名单驱动。带凭证时不能用 "*"。
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)
```

并在 main.py 顶部加上 `from app.core.config import settings`（如已有则跳过）。

- [ ] **Step 5: 跑测试确认通过**

Run: `cd backend && pytest tests/test_cors.py -v`
Expected: 2 passed.

- [ ] **Step 6: Commit**

```bash
git add backend/app/core/config.py backend/app/main.py backend/tests/test_cors.py
git commit -m "fix(main): switch CORS from wildcard to env-driven whitelist"
```

---

## Task 5: 统一异常处理 + request_id (S-3)

**Files:**
- Create: `backend/app/core/error_handlers.py`
- Modify: `backend/app/main.py`
- Create: `backend/tests/test_error_handler.py`

- [ ] **Step 1: 写失败测试**

Create `backend/tests/test_error_handler.py`:

```python
"""Tests for the unified error handler."""


def test_500_returns_request_id_not_raw_exception(client, monkeypatch):
    """Unhandled exceptions must NOT leak str(exc) to clients."""
    from app.main import app

    @app.get("/__test_boom")
    def boom():
        raise RuntimeError("super-secret-internal-detail-XYZ")

    resp = client.get("/__test_boom")
    assert resp.status_code == 500
    body = resp.json()
    assert body["success"] is False
    assert "request_id" in body
    assert body["error"] == "Internal server error"
    # The secret string MUST NOT appear in the body
    assert "super-secret" not in resp.text


def test_http_exception_passes_through(client):
    """Explicit HTTPException(404, "...") should still be returned as-is."""
    resp = client.get("/api/projects/does-not-exist")
    # storage.get_project returns None → router raises HTTPException(404)
    assert resp.status_code == 404
```

- [ ] **Step 2: 跑测试确认失败**

Run: `cd backend && pytest tests/test_error_handler.py -v`
Expected: `test_500_returns_request_id_not_raw_exception` 失败（当前 handler 返回 `str(exc)`）。

- [ ] **Step 3: 实现 error_handlers.py**

Create `backend/app/core/error_handlers.py`:

```python
"""Unified exception handlers — clients get a request_id, logs get the detail."""
from __future__ import annotations

import logging
import uuid

from fastapi import FastAPI, HTTPException, Request
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
```

- [ ] **Step 4: 修改 main.py 使用新 handler**

In `backend/app/main.py`，删除原 `@app.exception_handler(Exception)` 块，替换为：

```python
from app.core.error_handlers import install as install_error_handlers
install_error_handlers(app)
```

放在 `app = FastAPI(...)` 之后、CORS middleware 之前即可。

- [ ] **Step 5: 跑测试确认通过**

Run: `cd backend && pytest tests/test_error_handler.py -v`
Expected: 2 passed.

- [ ] **Step 6: Commit**

```bash
git add backend/app/core/error_handlers.py backend/app/main.py backend/tests/test_error_handler.py
git commit -m "fix(errors): replace raw str(exc) with request_id; log details server-side"
```

---

## Task 6: 原子写工具 (D-1 基础)

**Files:**
- Create: `backend/app/core/atomic_io.py`
- Create: `backend/tests/test_atomic_io.py`

- [ ] **Step 1: 写失败测试**

Create `backend/tests/test_atomic_io.py`:

```python
"""Tests for atomic_write_json."""
import json
import threading
from pathlib import Path

from app.core.atomic_io import atomic_write_json


def test_writes_and_reads_back(tmp_path: Path):
    target = tmp_path / "data.json"
    atomic_write_json(target, {"a": 1})
    assert json.loads(target.read_text()) == {"a": 1}


def test_no_partial_file_on_serialization_failure(tmp_path: Path):
    target = tmp_path / "data.json"
    target.write_text(json.dumps({"old": True}))
    # Non-serialisable value
    try:
        atomic_write_json(target, {"bad": object()})
    except TypeError:
        pass
    # Original content must survive
    assert json.loads(target.read_text()) == {"old": True}


def test_concurrent_writers_dont_corrupt(tmp_path: Path):
    target = tmp_path / "data.json"
    target.write_text("{}")

    def writer(n: int):
        for i in range(20):
            atomic_write_json(target, {"writer": n, "i": i})

    threads = [threading.Thread(target=writer, args=(n,)) for n in range(4)]
    for t in threads: t.start()
    for t in threads: t.join()

    # File must still parse — last write wins is fine, corruption is not.
    parsed = json.loads(target.read_text())
    assert "writer" in parsed and "i" in parsed
```

- [ ] **Step 2: 跑测试确认失败**

Run: `cd backend && pytest tests/test_atomic_io.py -v`
Expected: ImportError on `app.core.atomic_io`.

- [ ] **Step 3: 实现 atomic_io.py**

Create `backend/app/core/atomic_io.py`:

```python
"""Atomic JSON writes — temp file + os.replace, with portalocker exclusivity."""
from __future__ import annotations

import json
import os
import tempfile
from pathlib import Path
from typing import Any

import portalocker


def atomic_write_json(target: Path, data: Any, *, indent: int = 2) -> None:
    """Write ``data`` to ``target`` atomically.

    Strategy:
    1. Serialize first (so a TypeError leaves the existing file untouched).
    2. Write to a temp file in the same directory (so os.replace is rename-only).
    3. Acquire an exclusive lock on a sibling ``.lock`` file to serialise
       concurrent writers in the same process group.
    4. ``os.replace`` is atomic on POSIX and Windows for same-filesystem moves.
    """
    target = Path(target)
    target.parent.mkdir(parents=True, exist_ok=True)

    payload = json.dumps(data, ensure_ascii=False, indent=indent)

    lock_path = target.with_suffix(target.suffix + ".lock")
    with portalocker.Lock(str(lock_path), mode="a", flags=portalocker.LOCK_EX):
        fd, tmp_path = tempfile.mkstemp(
            prefix=f".{target.name}.", suffix=".tmp", dir=str(target.parent)
        )
        try:
            with os.fdopen(fd, "w", encoding="utf-8") as f:
                f.write(payload)
                f.flush()
                os.fsync(f.fileno())
            os.replace(tmp_path, target)
        except Exception:
            # Best-effort cleanup of orphaned temp file
            try:
                os.unlink(tmp_path)
            except OSError:
                pass
            raise
```

- [ ] **Step 4: 跑测试确认通过**

Run: `cd backend && pytest tests/test_atomic_io.py -v`
Expected: 3 passed.

- [ ] **Step 5: Commit**

```bash
git add backend/app/core/atomic_io.py backend/tests/test_atomic_io.py
git commit -m "feat(core): atomic_write_json with temp-file + os.replace + portalocker"
```

---

## Task 7: storage.py 改造 — 第一批（meta + documents）

**Files:**
- Modify: `backend/app/services/storage.py`

> **Why split into batches?** `storage.py` 有 ~30 处 `open(..., 'w')`，一次性替换风险大。本任务先迁移 meta + documents（最高频写入路径），验证后再继续。

- [ ] **Step 1: 跑现有的 documents 路由测试做基线**

Run: `cd backend && pytest tests/test_documents_router.py -v`
Expected: 3 passed (Task 3 已通过)。

- [ ] **Step 2: 在 storage.py 顶部加 import**

Edit `backend/app/services/storage.py:1-15`，在 import 块加上：

```python
from app.core.atomic_io import atomic_write_json
```

- [ ] **Step 3: 替换 create_project 中的 meta 写入**

Edit `storage.py:115-120`，替换：

```python
    with open(project_dir / "meta.json", 'w', encoding='utf-8') as f:
        json.dump(meta, f, ensure_ascii=False, indent=2)
```

为：

```python
    atomic_write_json(project_dir / "meta.json", meta)
```

并替换同函数 documents 写入（`storage.py:119-120`）：

```python
    atomic_write_json(project_dir / "documents.json", [])
```

- [ ] **Step 4: 替换 update_project_meta 中写入** (`storage.py:164-165`)

```python
    atomic_write_json(meta_file, meta)
```

- [ ] **Step 5: 替换 save_documents** (`storage.py:188-189`)

```python
    atomic_write_json(docs_file, documents)
```

- [ ] **Step 6: 替换 _update_project_time** (`storage.py:1152-1153`)

```python
    atomic_write_json(meta_file, meta)
```

- [ ] **Step 7: 跑全部已有测试**

Run: `cd backend && pytest -v`
Expected: 全绿，create_project / update_project / list_exhibits 等路径不破。

- [ ] **Step 8: Commit**

```bash
git add backend/app/services/storage.py
git commit -m "refactor(storage): atomic write for meta + documents (D-1 batch 1)"
```

---

## Task 8: storage.py 改造 — 第二批（analysis + relationship + writing + l1）

**Files:**
- Modify: `backend/app/services/storage.py`

- [ ] **Step 1: 替换 save_analysis** (`storage.py:232-234`)

```python
    atomic_write_json(analysis_dir / filename, version_data)
```

- [ ] **Step 2: 替换 save_relationship** (`storage.py:300-302`)

```python
    atomic_write_json(rel_dir / filename, version_data)
```

- [ ] **Step 3: 替换 save_quote_index_map** (`storage.py:332-333`)

```python
    atomic_write_json(rel_dir / filename, data)
```

- [ ] **Step 4: 替换 create_relationship_snapshot 与 rollback_to_snapshot 中的两处 snapshots 写入** (`storage.py:492-493` 与 `storage.py:541-542`)

```python
    atomic_write_json(snapshots_file, snapshots_data)
```

- [ ] **Step 5: 替换 save_writing** (`storage.py:698-699`)

```python
    atomic_write_json(writing_dir / filename, version_data)
```

- [ ] **Step 6: 替换 save_chunks / save_l1_analysis / save_l1_summary**

`storage.py:816-817`:
```python
    atomic_write_json(chunks_dir / filename, chunk_data)
```

`storage.py:854-855`:
```python
    atomic_write_json(l1_dir / filename, analysis_data)
```

`storage.py:969-970`:
```python
    atomic_write_json(l1_dir / filename, summary)
```

- [ ] **Step 7: 替换 save_ocr_page** (`storage.py:1330-1332`)

```python
    atomic_write_json(filepath, page_result)
```

- [ ] **Step 8: 替换 style template 三处** (`storage.py:1210-1211`, `1424-1425`, 等)

```python
    atomic_write_json(filepath, template_data)
```
和 update_style_template 中：
```python
    atomic_write_json(filepath, template)
```

- [ ] **Step 9: 跑全部测试**

Run: `cd backend && pytest -v`
Expected: 全绿。

- [ ] **Step 10: 验证仓库内不再有 raw json.dump 写入**

Run: `cd backend && grep -nE "with open\(.*'w'.*\).*json\.dump|json\.dump\(.+,\s*f," app/services/storage.py`
Expected: 无输出（或只剩二进制写入，例如 `save_uploaded_file` 用的是 `open(..., 'wb')`，不应被替换）。

- [ ] **Step 11: Commit**

```bash
git add backend/app/services/storage.py
git commit -m "refactor(storage): atomic write for analysis/relationship/writing/l1/style (D-1 batch 2)"
```

---

## Task 9: 兜底 — snippets router 中的裸写入

**Files:**
- Modify: `backend/app/routers/snippets.py`

- [ ] **Step 1: 替换 combined_extraction.json 写入**

Edit `backend/app/routers/snippets.py:78-80`：

```python
            from app.core.atomic_io import atomic_write_json
            combined_file = get_extraction_dir(project_id) / "combined_extraction.json"
            atomic_write_json(combined_file, combined)
```

> **不在文件顶部 import 是有意为之**：避免 router 模块的循环依赖风险，且这里只用一次。

- [ ] **Step 2: 跑测试**

Run: `cd backend && pytest -v`
Expected: 全绿。

- [ ] **Step 3: Commit**

```bash
git add backend/app/routers/snippets.py
git commit -m "refactor(snippets): use atomic_write_json for combined_extraction sync"
```

---

## Task 10: API Key middleware (S-1)

**Files:**
- Create: `backend/app/middleware/__init__.py`
- Create: `backend/app/middleware/api_key.py`
- Modify: `backend/app/main.py`
- Create: `backend/tests/test_api_key.py`

- [ ] **Step 1: 写失败测试**

Create `backend/tests/test_api_key.py`:

```python
"""Tests for API Key middleware."""
import importlib


def _reload_app(monkeypatch, **env):
    for k, v in env.items():
        monkeypatch.setenv(k, v)
    from app import main as main_mod
    importlib.reload(main_mod)
    return main_mod.app


def test_no_key_required_when_disabled(monkeypatch, tmp_projects_dir):
    from fastapi.testclient import TestClient
    app = _reload_app(monkeypatch, API_KEY_REQUIRED="false")
    c = TestClient(app)
    assert c.get("/api/health").status_code == 200


def test_missing_key_blocked_when_required(monkeypatch, tmp_projects_dir):
    from fastapi.testclient import TestClient
    app = _reload_app(
        monkeypatch, API_KEY_REQUIRED="true", API_KEY="secret-token-123"
    )
    c = TestClient(app)
    assert c.get("/api/health").status_code == 401


def test_correct_key_allowed_when_required(monkeypatch, tmp_projects_dir):
    from fastapi.testclient import TestClient
    app = _reload_app(
        monkeypatch, API_KEY_REQUIRED="true", API_KEY="secret-token-123"
    )
    c = TestClient(app)
    resp = c.get("/api/health", headers={"X-API-Key": "secret-token-123"})
    assert resp.status_code == 200


def test_health_root_always_open(monkeypatch, tmp_projects_dir):
    """The literal '/' (version banner) stays open for liveness probes."""
    from fastapi.testclient import TestClient
    app = _reload_app(
        monkeypatch, API_KEY_REQUIRED="true", API_KEY="secret-token-123"
    )
    c = TestClient(app)
    assert c.get("/").status_code == 200
```

- [ ] **Step 2: 跑测试确认失败**

Run: `cd backend && pytest tests/test_api_key.py -v`
Expected: ImportError / 401 测试失败（middleware 不存在）。

- [ ] **Step 3: 实现 middleware**

Create `backend/app/middleware/__init__.py` (empty file).

Create `backend/app/middleware/api_key.py`:

```python
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
```

- [ ] **Step 4: 在 main.py 挂载**

In `backend/app/main.py`，在 CORS middleware 后添加：

```python
from app.middleware.api_key import APIKeyMiddleware

app.add_middleware(
    APIKeyMiddleware,
    required=settings.api_key_required,
    expected_key=settings.api_key,
)
```

- [ ] **Step 5: 跑测试确认通过**

Run: `cd backend && pytest tests/test_api_key.py -v`
Expected: 4 passed.

- [ ] **Step 6: Commit**

```bash
git add backend/app/middleware/ backend/app/main.py backend/tests/test_api_key.py
git commit -m "feat(security): add optional API key middleware (X-API-Key header)"
```

---

## Task 11: 前端解除 PII 硬编码

**Files:**
- Modify: `frontend/src/context/ProjectContext.tsx`

- [ ] **Step 1: 修改 DEFAULT_PROJECT_ID**

Edit `frontend/src/context/ProjectContext.tsx:13-15`，替换：

```typescript
const STORAGE_KEY_LLM_PROVIDER = 'evidence-system-llm-provider';
const STORAGE_KEY_PROJECT_ID = 'evidence-system-project-id';
const DEFAULT_PROJECT_ID = 'dehuan_liu';
```

为：

```typescript
const STORAGE_KEY_LLM_PROVIDER = 'evidence-system-llm-provider';
const STORAGE_KEY_PROJECT_ID = 'evidence-system-project-id';
// Configurable via Vite env (VITE_DEFAULT_PROJECT_ID); empty string means
// "let the user pick from /api/projects on first load" rather than hard-coding
// a real beneficiary's name.
const DEFAULT_PROJECT_ID = import.meta.env.VITE_DEFAULT_PROJECT_ID ?? '';
```

- [ ] **Step 2: 调整 useState 初始化处理空值**

Edit 同文件第 41-43 行，替换：

```typescript
  const [projectId, setProjectIdState] = useState<string>(() => {
    return projectIdOverride || localStorage.getItem(STORAGE_KEY_PROJECT_ID) || DEFAULT_PROJECT_ID;
  });
```

为：

```typescript
  const [projectId, setProjectIdState] = useState<string>(() => {
    const initial = projectIdOverride
      || localStorage.getItem(STORAGE_KEY_PROJECT_ID)
      || DEFAULT_PROJECT_ID;
    return initial;
  });
```

(本质未变，但显式留出未来「空 → 拉 /api/projects 取首个」的接入点；实际逻辑变更见 Step 3。)

- [ ] **Step 3: 让 effect 在 projectId 为空时拉取首个项目**

Edit 同文件 `useEffect` 块（第 84 行起），在 `loadProjectData` 函数顶部加：

```typescript
    async function loadProjectData() {
      // 0. If no projectId is set yet, pick the first one from the backend.
      if (!projectId) {
        try {
          const list = await apiClient.get<Array<{ id: string }>>('/projects');
          if (!cancelled && Array.isArray(list) && list.length > 0) {
            setProjectIdState(list[0].id);
            localStorage.setItem(STORAGE_KEY_PROJECT_ID, list[0].id);
          }
        } catch {
          // No projects; user will see an empty state. Don't crash.
        }
        return;
      }
      // ... existing project-detail / standards loading below
```

- [ ] **Step 4: 类型检查**

Run: `cd frontend && npx tsc --noEmit`
Expected: 无新增 error。

- [ ] **Step 5: lint**

Run: `cd frontend && npx eslint src/context/ProjectContext.tsx`
Expected: 无新增 error。

- [ ] **Step 6: Commit**

```bash
git add frontend/src/context/ProjectContext.tsx
git commit -m "fix(frontend): drop hardcoded beneficiary name; pick first project from API"
```

---

## Task 12: 整体验收

**Files:** none (验证步骤)

- [ ] **Step 1: 跑全部后端测试**

Run: `cd backend && pytest -v`
Expected: 所有测试通过；至少 16 个 case（safety 5 + atomic_io 3 + documents 3 + cors 2 + error 2 + api_key 4，共 19 个）。

- [ ] **Step 2: 启动后端确认无 import 错误**

Run: `cd backend && timeout 5 uvicorn app.main:app --port 18000 || true`
Expected: 启动 banner 出现，5 秒后被 timeout 杀掉，无 stack trace。

- [ ] **Step 3: 前端构建验证**

Run: `cd frontend && npm run build`
Expected: 构建成功，无 TS 错误。

- [ ] **Step 4: 跑 ESLint**

Run: `cd frontend && npm run lint`
Expected: 无新增 error（已存在 warning 不阻塞）。

- [ ] **Step 5: 手工 smoke test**

启动后端 `cd backend && uvicorn app.main:app --port 18000`，另一终端：

```bash
# 健康检查（不需要 key）
curl -i http://localhost:18000/api/health
# 期望: 200 {"status":"ok"}

# 路径穿越被拒
curl -i 'http://localhost:18000/api/documents/dehuan_liu/pdf/A-1-2'
# 期望: 400 Invalid exhibit_id format

# 错误信息不再泄漏内部细节（无对应 project 时）
curl -i 'http://localhost:18000/api/projects/no-such-project'
# 期望: 404，body 中只有 error/detail，没有 traceback
```

- [ ] **Step 6: 写 CHANGELOG / 收尾 commit**

Create or append `CHANGELOG.md`:

```markdown
## Phase 1 — Security Hardening (2026-04-29)

### Security
- CORS: switch from wildcard to env-driven whitelist (S-2)
- Errors: replace raw `str(exc)` leakage with `request_id` + server-side logs (S-3)
- PDF route: whitelist `exhibit_id` and resolve under `PDF/` only (S-4)
- API: optional `X-API-Key` middleware behind `API_KEY_REQUIRED=true` (S-1)

### Reliability
- Storage: all JSON writes are atomic (`temp file` + `os.replace`) and `portalocker`-serialised (D-1)

### Privacy
- Frontend: drop hardcoded beneficiary name as default project (use `VITE_DEFAULT_PROJECT_ID` or first project from API)

### Tooling
- Add pytest scaffolding + 19 baseline tests (path safety, atomic IO, CORS, errors, API key, documents router)
```

```bash
git add CHANGELOG.md
git commit -m "docs: add Phase 1 changelog entry"
```

---

## 不在本计划范围（明确记录以避免范围蔓延）

- archive.tar.gz 出仓 + 历史改写 — 需用户确认
- 三个 2k+ 行模块拆分 — Phase 2
- `useApp()` facade 重构 — Phase 2
- 真正的鉴权（JWT/OAuth）— Phase 3
- 数据库迁移 — Phase 3
- LLM 缓存 + 配额 — Phase 3
