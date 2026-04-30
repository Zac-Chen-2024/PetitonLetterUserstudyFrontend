# Phase 2D + 2E: Decomposition Plan

**Date:** 2026-04-30
**Author:** Claude (Opus 4.7)
**Governing rules:** `Rules&Docs/Rules/DeveRule`

## Background

Five files exceed the project's reasonable file-size budget, and 14 components couple to a single `useApp()` omnibus hook:

| Target | Lines | Phase |
| --- | ---: | --- |
| `frontend/src/components/ArgumentGraph.tsx` | 2823 | 2D |
| `backend/app/services/petition_writer_v3.py` | 2783 | 2D |
| `backend/app/services/legal_argument_organizer.py` | 2578 | 2D |
| `backend/app/services/unified_extractor.py` | 1849 | 2D |
| `frontend/src/components/LetterPanel.tsx` | 946 | 2D |
| `frontend/src/context/AppContext.tsx` (14 callsites) | 423 | 2E |

Per **DeveRule §10 #1** (large-scale refactoring) and **#5** (deleting legacy logic), this work cannot proceed silently. This document is the explicit scope agreement.

## Guiding constraints

- **Rule 4 — smallest change:** every step ≤ ~500 LOC diff, single category.
- **Rule 14 — no duplicate implementations:** prefer "extract & re-export" so existing callers keep working without edits in the same commit.
- **Rule 28 — atomic commits:** one step = one commit, one category.
- **Rule 23 — self-check:** every step verified locally (`pytest`, `npx vitest run`, `npx tsc --noEmit`, `npm run build`) before commit.
- **Rule 30 — verified-only completion claims:** the completion report for each step quotes the verification output.
- **Rule 18 — no drive-by formatting:** moves preserve indentation/comments verbatim.

## Risk-ordered step list

Ordered lowest-risk → highest-risk so we build confidence and have an off-ramp at any step.

### Phase 2D — module decomposition

**Step 2D-1 · backend · extract pure helpers from `unified_extractor.py`**

- **Goal:** isolate the file's pure-Python helpers (regex utilities, formatters, date/text normalizers) into `backend/app/services/_unified_extractor_helpers.py`; the main module imports them back.
- **Scope:** ~200 LOC moved; original public API unchanged; no behavior change.
- **Won't change:** any function signature exposed to other modules; any router; any test.
- **Risks:** low — helpers tend to be self-contained; backend has 50 tests as safety net.
- **Verification:** `cd backend && pytest -v` green.

**Step 2D-2 · backend · extract template/section builders from `petition_writer_v3.py`**

- **Goal:** move the per-section "build_X_section" / "format_X" functions (cohesive group already grep-able) into a sibling `_petition_writer_sections.py`; main module re-exports.
- **Scope:** ~400-600 LOC moved.
- **Won't change:** entry-point function used by routers (likely `write_petition` / `generate_section`).
- **Risks:** medium — provenance bookkeeping is interleaved with text generation; need to keep state passed explicitly, not via module globals.
- **Verification:** `pytest -v` green; `pytest tests/test_provenance_engine.py -v` green; smoke-test one /writing endpoint via TestClient if fixture allows.

**Step 2D-3 · backend · extract clustering/grouping logic from `legal_argument_organizer.py`**

- **Goal:** the argument clustering / dedup / scoring routines split into `_legal_argument_clustering.py`; orchestrator stays put.
- **Scope:** ~500-700 LOC moved.
- **Risks:** medium-high — likely uses LLM calls, so determinism depends on inputs we don't control; tests may need to mock.
- **Verification:** `pytest -v` green. If existing tests don't cover this code path, flag and confirm scope before proceeding.

**Step 2D-4 · frontend · split `LetterPanel.tsx` into 2-3 child components**

- **Goal:** lift sub-views (likely a section-list, a sentence-editor, and a toolbar) into `frontend/src/components/LetterPanel/` directory; `LetterPanel.tsx` becomes the composition root.
- **Scope:** ~946 LOC redistributed across 3-4 files.
- **Won't change:** props received from parent; behavior; styling.
- **Risks:** medium — tight coupling to WritingContext means we must thread state via the existing context, not via prop drilling.
- **Verification:** `npx tsc --noEmit`, `npx vitest run`, `npm run build`, plus manual UI check on the dev server (golden-path: open project → letter panel → edit a sentence).

**Step 2D-5 · frontend · split `ArgumentGraph.tsx`** (highest risk — gated)

- **Goal:** isolate (a) layout/sankey computation, (b) node/edge renderers, (c) interaction handlers into separate modules under `frontend/src/components/ArgumentGraph/`.
- **Scope:** ~2823 LOC redistributed; this one likely needs 2-3 sub-commits, not one.
- **Risks:** high — visual regressions, hover/selection state, d3 imperative bits.
- **Gate:** before starting 2D-5, confirm (i) 2D-4 went smoothly, (ii) we have visual smoke-test instructions, (iii) you explicitly authorize. Otherwise skip.

### Phase 2E — useApp() facade migration

`AppContext.tsx` re-exports state from 5 underlying contexts (Project / UI / Arguments / Snippets / Writing). 14 components call `useApp()` and pull broad slices, causing avoidable re-renders.

**Step 2E-1 · introduce fine-grained hooks alongside, no callsite migration**

- **Goal:** ensure `useProject()`, `useUI()`, `useArguments()`, `useSnippets()`, `useWriting()` are exported from their respective contexts (most already are). Add no new files unless missing.
- **Scope:** purely additive; `useApp()` and all 14 callsites untouched.
- **Won't change:** behavior, render counts, types of consumed values.
- **Risks:** very low.
- **Verification:** `tsc`, `vitest`, `build` green.

**Step 2E-2..N · migrate callsites in batches of 2-3 components per commit**

- **Goal per batch:** convert 2-3 components from `useApp()` to fine-grained hooks; verify behavior unchanged.
- **Won't change:** prop interfaces, rendering output, observed UX.
- **Risks per batch:** low (each batch reverts cleanly).
- **Verification per batch:** `tsc`, `vitest`, `build`, manual click-through of the touched component(s).
- **Final cleanup step (gated):** once all 14 components are migrated, delete `useApp()` and `AppContext` if nothing else references them. Per DeveRule §10 #5, this deletion requires explicit authorization at that point, not now.

## Out-of-scope

- The known `snippet_recommender.py:21-22` `PETITON_PROJECTS_DIR` isolation bug (tracked in `backlog_test_isolation.md`). Will fix opportunistically only if 2D-3 touches that surface.
- `WritingContext.tsx` (963 LOC) — we already trimmed it 79 lines in Phase 2A; further decomposition not in scope until you ask.
- Any dependency upgrades, build-config changes, or API contract changes (DeveRule §10 #2-7).

## Approval gate

I will **not** start any step until you reply with one of:

- `2D-1 go` — start step 2D-1 only; report back; wait again.
- `2D all` — chain 2D-1 → 2D-4, stopping before 2D-5; one commit per step.
- `2E-1 go` / `2E all` — start the facade migration instead.
- A specific reordering / skip list.

Default if you say only "继续": **start with 2D-1 only, stop, report, wait.**
