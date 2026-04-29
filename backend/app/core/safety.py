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
