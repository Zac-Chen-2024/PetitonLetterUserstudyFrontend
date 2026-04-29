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

    # The whitelist must reject malformed IDs *before* touching the filesystem
    # — an explicit 400, not an incidental 404 from a missing file. Note
    # "A%2E1" is excluded because FastAPI URL-decodes it to "A.1" and the
    # path-segment regex still rejects, but we'd rather assert on shapes that
    # remain malformed regardless of router-level normalisation.
    for bad_id in ["A", "1A", "A-1", "A.1", "foo"]:
        resp = client.get(f"/api/documents/{pid}/pdf/{bad_id}")
        assert resp.status_code == 400, f"{bad_id} should return 400, got {resp.status_code}"


def test_pdf_route_404_when_pdf_missing(client, tmp_projects_dir, tmp_path):
    source = tmp_path / "source"
    (source / "PDF" / "A").mkdir(parents=True)
    pid = _bootstrap_project(tmp_projects_dir, source)

    resp = client.get(f"/api/documents/{pid}/pdf/A99")
    assert resp.status_code == 404
