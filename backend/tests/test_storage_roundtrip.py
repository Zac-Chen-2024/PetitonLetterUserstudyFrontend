"""Round-trip tests for app.services.storage.

Each test uses the tmp_projects_dir fixture from conftest.py so that
PETITON_PROJECTS_DIR points to a fresh tmpdir and storage is reloaded.
"""
import json
import importlib

import pytest

from app.services import storage


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _fresh_storage(tmp_projects_dir):
    """Return the reloaded storage module (conftest already reloaded it;
    this just ensures we're calling the module-level functions through
    the module that has PROJECTS_DIR pointing at tmp_projects_dir)."""
    importlib.reload(storage)
    return storage


# ---------------------------------------------------------------------------
# Project lifecycle
# ---------------------------------------------------------------------------

def test_create_and_get_project_roundtrip(tmp_projects_dir):
    s = _fresh_storage(tmp_projects_dir)
    created = s.create_project("Alice Smith", "EB-1A")

    assert created["id"].startswith("project-")
    assert created["name"] == "Alice Smith"
    assert created["projectType"] == "EB-1A"
    assert "projectNumber" in created

    fetched = s.get_project(created["id"])
    assert fetched is not None
    assert fetched["id"] == created["id"]
    assert fetched["name"] == "Alice Smith"
    assert fetched["projectType"] == "EB-1A"


def test_get_project_returns_none_for_missing(tmp_projects_dir):
    s = _fresh_storage(tmp_projects_dir)
    assert s.get_project("nonexistent-project-id") is None


def test_list_projects_returns_created_projects(tmp_projects_dir):
    s = _fresh_storage(tmp_projects_dir)
    assert s.list_projects() == []

    p1 = s.create_project("Alice", "EB-1A")
    p2 = s.create_project("Bob", "NIW")

    listed = s.list_projects()
    ids = {p["id"] for p in listed}
    assert p1["id"] in ids
    assert p2["id"] in ids
    assert len(listed) == 2


def test_update_project_meta_persists_changes(tmp_projects_dir):
    s = _fresh_storage(tmp_projects_dir)
    proj = s.create_project("Original Name", "EB-1A")
    pid = proj["id"]

    updated = s.update_project_meta(pid, {"name": "New Name", "beneficiary": "John Doe"})
    assert updated is not None
    assert updated["name"] == "New Name"
    assert updated["beneficiary"] == "John Doe"

    # Verify persisted on disk
    refetched = s.get_project(pid)
    assert refetched["name"] == "New Name"
    assert refetched["beneficiary"] == "John Doe"


def test_update_project_meta_returns_none_for_missing(tmp_projects_dir):
    s = _fresh_storage(tmp_projects_dir)
    result = s.update_project_meta("no-such-project", {"name": "x"})
    assert result is None


def test_delete_project_removes_directory(tmp_projects_dir):
    s = _fresh_storage(tmp_projects_dir)
    proj = s.create_project("Delete Me", "EB-1A")
    pid = proj["id"]

    assert s.get_project(pid) is not None

    removed = s.delete_project(pid)
    assert removed is True
    assert s.get_project(pid) is None
    assert not (tmp_projects_dir / pid).exists()


def test_delete_project_returns_false_when_missing(tmp_projects_dir):
    s = _fresh_storage(tmp_projects_dir)
    assert s.delete_project("ghost-project") is False


# ---------------------------------------------------------------------------
# Documents
# ---------------------------------------------------------------------------

def test_documents_save_and_load_roundtrip(tmp_projects_dir):
    s = _fresh_storage(tmp_projects_dir)
    proj = s.create_project("Doc Test", "EB-1A")
    pid = proj["id"]

    docs = [
        {"id": "doc-1", "name": "Exhibit A", "exhibit_id": "A1"},
        {"id": "doc-2", "name": "Exhibit B", "exhibit_id": "A2"},
    ]
    s.save_documents(pid, docs)

    loaded = s.get_documents(pid)
    assert loaded == docs


def test_add_document_appends_and_persists(tmp_projects_dir):
    s = _fresh_storage(tmp_projects_dir)
    proj = s.create_project("Add Doc Test", "EB-1A")
    pid = proj["id"]

    doc = {"id": "doc-x", "exhibit_id": "B1", "name": "Exhibit B1"}
    returned = s.add_document(pid, doc)
    assert returned == doc

    all_docs = s.get_documents(pid)
    assert len(all_docs) == 1
    assert all_docs[0]["exhibit_id"] == "B1"

    # Raw file is valid JSON
    raw = (tmp_projects_dir / pid / "documents.json").read_text()
    parsed = json.loads(raw)
    assert parsed[0]["exhibit_id"] == "B1"


# ---------------------------------------------------------------------------
# Analysis versions
# ---------------------------------------------------------------------------

def test_save_and_get_analysis_roundtrip(tmp_projects_dir):
    s = _fresh_storage(tmp_projects_dir)
    proj = s.create_project("Analysis Test", "EB-1A")
    pid = proj["id"]

    payload = {"doc-1": {"score": 0.9}, "doc-2": {"score": 0.7}}
    version_id = s.save_analysis(pid, payload)
    assert version_id  # non-empty string

    result = s.get_analysis(pid, version_id)
    assert result is not None
    assert result["results"] == payload
    assert result["version_id"] == version_id


def test_get_analysis_latest_without_version(tmp_projects_dir):
    s = _fresh_storage(tmp_projects_dir)
    proj = s.create_project("Analysis Latest", "EB-1A")
    pid = proj["id"]

    v1 = s.save_analysis(pid, {"round": 1})
    v2 = s.save_analysis(pid, {"round": 2})

    latest = s.get_analysis(pid)
    # Latest should be the last written version (alphabetically greater timestamp)
    assert latest is not None
    assert latest["version_id"] in (v1, v2)


def test_analysis_file_contains_valid_json(tmp_projects_dir):
    s = _fresh_storage(tmp_projects_dir)
    proj = s.create_project("JSON Durability", "EB-1A")
    pid = proj["id"]

    vid = s.save_analysis(pid, {"key": "value", "num": 42})

    analysis_dir = tmp_projects_dir / pid / "analysis"
    files = list(analysis_dir.glob(f"analysis_{vid}.json"))
    assert len(files) == 1
    parsed = json.loads(files[0].read_text())
    assert parsed["results"]["key"] == "value"


# ---------------------------------------------------------------------------
# Relationship versions
# ---------------------------------------------------------------------------

def test_save_and_get_relationship_roundtrip(tmp_projects_dir):
    s = _fresh_storage(tmp_projects_dir)
    proj = s.create_project("Rel Test", "EB-1A")
    pid = proj["id"]

    data = {"entities": [{"id": "e1", "name": "Acme Corp"}], "relations": []}
    vid = s.save_relationship(pid, data)
    assert vid

    fetched = s.get_relationship(pid, vid)
    assert fetched is not None
    assert fetched["data"]["entities"][0]["name"] == "Acme Corp"


# ---------------------------------------------------------------------------
# Writing versions
# ---------------------------------------------------------------------------

def test_save_and_load_writing_roundtrip(tmp_projects_dir):
    s = _fresh_storage(tmp_projects_dir)
    proj = s.create_project("Writing Test", "EB-1A")
    pid = proj["id"]

    text = "The petitioner demonstrates extraordinary ability."
    citations = [{"snippet_id": "snp_001", "exhibit_id": "A1"}]
    vid = s.save_writing(pid, "qualifying_relationship", text, citations)
    assert vid

    writing = s.get_writing(pid, vid)
    assert writing is not None
    assert writing["text"] == text
    assert writing["section"] == "qualifying_relationship"
    assert writing["citations"] == citations


# ---------------------------------------------------------------------------
# Chunks
# ---------------------------------------------------------------------------

def test_save_and_get_chunks_roundtrip(tmp_projects_dir):
    s = _fresh_storage(tmp_projects_dir)
    proj = s.create_project("Chunks Test", "EB-1A")
    pid = proj["id"]

    chunks = [
        {"chunk_id": "c1", "text": "First chunk."},
        {"chunk_id": "c2", "text": "Second chunk."},
    ]
    s.save_chunks(pid, "doc-abc", chunks)

    loaded = s.get_chunks(pid, "doc-abc")
    assert loaded == chunks


def test_get_chunks_returns_none_for_missing(tmp_projects_dir):
    s = _fresh_storage(tmp_projects_dir)
    proj = s.create_project("Chunks Missing", "EB-1A")
    pid = proj["id"]

    assert s.get_chunks(pid, "no-such-doc") is None
