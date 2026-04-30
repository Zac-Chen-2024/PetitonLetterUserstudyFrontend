"""Integration tests for the provenance index builder in petition_writer_v3.

The Python implementation (build_provenance_index) takes a structured
`validated_output` dict and a `context` dict, whereas the TypeScript version
takes a flat list of sentence-like objects.  These tests exercise the Python
signature directly, mirroring the logical assertions in
frontend/src/utils/provenance.test.ts.

We do NOT exercise resolve_provenance / resolve_reverse_provenance here
because those functions reach into snippet_registry and unified_extractor
(which in turn touch PROJECTS_DIR from __file__ rather than PETITON_PROJECTS_DIR).
Isolating them is tracked separately; skipping keeps the suite clean.
"""
import pytest
from app.services.petition_writer_v3 import build_provenance_index


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_output(
    argument_id: str = "",
    opening_text: str = "",
    subarg_paragraphs: list = None,
    closing_text: str = "",
) -> dict:
    """Build a minimal validated_output structure."""
    return {
        "argument_id": argument_id,
        "opening_sentence": {"text": opening_text},
        "subargument_paragraphs": subarg_paragraphs or [],
        "closing_sentence": {"text": closing_text},
    }


def _para(subarg_id: str, sentences: list) -> dict:
    """Shorthand to build a subargument paragraph."""
    return {
        "subargument_id": subarg_id,
        "sentences": sentences,
    }


def _sent(text: str, snippet_ids: list = None) -> dict:
    return {"text": text, "snippet_ids": snippet_ids or []}


# ---------------------------------------------------------------------------
# Tests mirroring provenance.test.ts
# ---------------------------------------------------------------------------

def test_empty_input_returns_empty_index():
    """Empty validated_output → all three dicts empty (no opening/closing text)."""
    result = build_provenance_index(_make_output(), context={})
    assert result == {"by_subargument": {}, "by_argument": {}, "by_snippet": {}}


def test_skips_missing_snippet_ids_gracefully():
    """Sentences without snippet_ids do not raise and don't populate by_snippet."""
    output = _make_output(
        argument_id="a1",
        subarg_paragraphs=[
            _para("sa1", [_sent("No snippets here.")])
        ],
    )
    result = build_provenance_index(output, context={})
    assert result["by_snippet"] == {}
    assert result["by_subargument"] == {"sa1": [0]}


def test_groups_indices_by_subargument_argument_and_snippet():
    """Core grouping: mirrors the 'groups indices by …' test in the TS suite."""
    output = _make_output(
        argument_id="a1",
        subarg_paragraphs=[
            _para("sa1", [
                _sent("First sentence.", ["s1", "s2"]),
                _sent("Second sentence.", ["s2"]),
            ]),
            _para("sa2", [
                _sent("Third sentence.", ["s3"]),
            ]),
        ],
    )
    result = build_provenance_index(output, context={})

    # subargument grouping (opening/closing absent → indices start at 0)
    assert result["by_subargument"]["sa1"] == [0, 1]
    assert result["by_subargument"]["sa2"] == [2]

    # argument grouping covers all body sentences
    assert result["by_argument"]["a1"] == [0, 1, 2]

    # snippet grouping
    assert result["by_snippet"]["s1"] == [0]
    assert result["by_snippet"]["s2"] == [0, 1]
    assert result["by_snippet"]["s3"] == [2]


def test_preserves_sentence_order_in_index_arrays():
    """Three sentences sharing the same subarg/snippet stay in order."""
    output = _make_output(
        argument_id="ax",
        subarg_paragraphs=[
            _para("sx", [
                _sent("One.", ["z"]),
                _sent("Two.", ["z"]),
                _sent("Three.", ["z"]),
            ]),
        ],
    )
    result = build_provenance_index(output, context={})
    assert result["by_subargument"]["sx"] == [0, 1, 2]
    assert result["by_snippet"]["z"] == [0, 1, 2]


def test_opening_sentence_counted_in_by_argument():
    """Opening sentence is index 0 and increments the counter for body sentences."""
    output = _make_output(
        argument_id="a1",
        opening_text="Opening line.",
        subarg_paragraphs=[
            _para("sa1", [_sent("Body sentence.", ["snp1"])]),
        ],
    )
    result = build_provenance_index(output, context={})

    # Opening is index 0 in by_argument; body sentence is index 1
    assert 0 in result["by_argument"]["a1"]
    assert 1 in result["by_argument"]["a1"]

    # Opening has no snippet_ids, so only body sentence appears in by_snippet
    assert result["by_snippet"]["snp1"] == [1]

    # Subargument only covers the body sentence (index 1)
    assert result["by_subargument"]["sa1"] == [1]


def test_closing_sentence_appended_to_by_argument():
    """Closing sentence is appended to by_argument after all body sentences."""
    output = _make_output(
        argument_id="a1",
        subarg_paragraphs=[
            _para("sa1", [_sent("Body.", ["snp1"])]),
        ],
        closing_text="In conclusion…",
    )
    result = build_provenance_index(output, context={})

    # Body is index 0; closing is index 1
    arg_indices = result["by_argument"]["a1"]
    assert 0 in arg_indices
    assert 1 in arg_indices
    # Closing does NOT appear in by_subargument
    assert 1 not in result["by_subargument"].get("sa1", [])


def test_multiple_subarguments_each_get_own_index_list():
    """Multiple sub-arguments accumulate independent index lists."""
    output = _make_output(
        argument_id="a2",
        subarg_paragraphs=[
            _para("sa1", [_sent("A.", ["s1"])]),
            _para("sa2", [_sent("B.", ["s2"])]),
            _para("sa3", [_sent("C.", ["s3"])]),
        ],
    )
    result = build_provenance_index(output, context={})

    assert result["by_subargument"]["sa1"] == [0]
    assert result["by_subargument"]["sa2"] == [1]
    assert result["by_subargument"]["sa3"] == [2]
    assert result["by_argument"]["a2"] == [0, 1, 2]
    assert result["by_snippet"] == {"s1": [0], "s2": [1], "s3": [2]}


def test_sentence_with_multiple_snippet_ids():
    """A sentence referencing multiple snippets registers in all snippet lists."""
    output = _make_output(
        argument_id="a1",
        subarg_paragraphs=[
            _para("sa1", [_sent("Multi-ref sentence.", ["snp1", "snp2", "snp3"])]),
        ],
    )
    result = build_provenance_index(output, context={})
    assert result["by_snippet"]["snp1"] == [0]
    assert result["by_snippet"]["snp2"] == [0]
    assert result["by_snippet"]["snp3"] == [0]


def test_empty_subargument_paragraphs_list():
    """Only opening and closing present — no body content."""
    output = _make_output(
        argument_id="a1",
        opening_text="Only opening.",
        closing_text="Only closing.",
        subarg_paragraphs=[],
    )
    result = build_provenance_index(output, context={})

    # Two sentences (indices 0 and 1) for opening + closing
    assert sorted(result["by_argument"]["a1"]) == [0, 1]
    assert result["by_subargument"] == {}
    assert result["by_snippet"] == {}
