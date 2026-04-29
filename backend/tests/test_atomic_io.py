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
