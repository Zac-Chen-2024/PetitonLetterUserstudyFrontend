# Changelog

## Phase 1 — Security Hardening (2026-04-29)

### Security
- **CORS:** switched from wildcard `*` to env-driven whitelist
  (`ALLOWED_ORIGINS`, default covers prod domain + Vite dev server). Fixes the
  `allow_origins=["*"]` + `allow_credentials=True` spec violation. (S-2)
- **Errors:** replaced raw `str(exc)` leakage with a `request_id` payload;
  full traceback is now logged server-side with the same id for ops
  correlation. Explicit `HTTPException(...)` still passes through. (S-3)
- **PDF route:** `/api/documents/{project_id}/pdf/{exhibit_id}` now whitelists
  `exhibit_id` (`^[A-Za-z]+\d+$`) and resolves every candidate path under the
  project's `PDF/` root via a `safe_resolve` helper that defends against `..`
  and symlink escapes. (S-4)
- **API key:** optional `X-API-Key` middleware behind `API_KEY_REQUIRED=true`.
  Default state is no-op for backwards compatibility. `/` and `/api/health`
  remain open for liveness probes. Uses `hmac.compare_digest`. (S-1)

### Reliability
- **Atomic JSON writes:** new `app.core.atomic_io.atomic_write_json` wraps
  every persistent JSON write with `portalocker` exclusivity + temp file +
  `os.replace`. Migrated 18 call sites in `storage.py` and `snippets.py`. (D-1)
- **Known gap (D-1.5):** 28 additional raw `open(..., 'w')` writes remain in
  long-running pipeline services (`unified_extractor.py`, `entity_merger.py`,
  `legal_argument_organizer.py`, `data_importer.py`, etc.). These are
  lower-frequency single-tenant code paths; they will be migrated in a
  follow-up batch. Filed as a backlog item.

### Privacy
- **Frontend:** dropped the hardcoded beneficiary name (`'dehuan_liu'`) as
  the default project. The default is now controlled by
  `VITE_DEFAULT_PROJECT_ID`; when unset, the app fetches `/api/projects` and
  selects the first entry.

### Tooling
- **pytest:** added pytest scaffolding (`requirements-dev.txt`, `conftest.py`
  with `tmp_projects_dir` and `client` fixtures) and 20 baseline tests
  covering path safety, atomic IO, CORS, error handler, API key middleware,
  and the documents router. This is the first test infrastructure in the
  repo; it is the foundation that Phase 2 refactors will build on.

### Out of Scope (deferred to Phase 2 / 3)
- Module decomposition (`petition_writer_v3.py` 2.7k LOC, etc.)
- `useApp()` Context facade refactor
- Real auth (JWT/OAuth2)
- DB migration off file storage
- LLM caching + per-user quotas
- `archive.tar.gz` removal from git history (requires `git filter-repo`,
  user decision)
