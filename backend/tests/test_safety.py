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
