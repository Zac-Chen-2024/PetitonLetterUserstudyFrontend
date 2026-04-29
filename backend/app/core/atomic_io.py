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
