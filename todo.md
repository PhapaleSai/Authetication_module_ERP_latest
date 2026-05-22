# Auth Module — TODO

Your module is the **identity provider** for the entire PVG ERP. Every other module depends on you. See `docs/PROJECT_CONTEXT.md` for the full system map.

## 🔴 Red — Project Hygiene (Common Standards — do first)

These items are **the same for every module**. See `docs/PROJECT_CONTEXT.md` for full specs.

### H1. Adopt the canonical folder structure
**Why:** Your repo currently has 25+ files at the root including binaries, .bat scripts, dev artifacts, and docs all mixed with code. New contributors can't tell what's source vs. what's leftover.
**Change for this module:**
- **Delete from git** (binaries / dev artifacts don't belong here): `flickering_video.mp4`, `ngrok-v3-stable-windows-amd64 (1).zip`, `ngrok_bin/`, `scratch/`, `temp_theme/`.
- **Move to `docs/`:** `ALL_APIS_LIVE_TEST_REPORT.md`, `AUTH_INTEGRATION_PROMPT_with_sis.md`, `ERP_Documentation.md`, `MEETING_AUTH_INSTRUCTIONS.md`, `PVG_Auth_API_Postman_Collection.json`, `implementation_plan_sis_and_auth_module_integration.md`, `database_schema.txt`.
- **Move to `backend/scripts/`:** `setup_auth_tables.sql` (or delete if Alembic migrations cover it).
- **Delete all `.bat` files and ngrok configs** (replaced by `run.sh`/`run.ps1`): `hybrid_tunnel.bat`, `ngrok_backend.bat`, `ngrok_dual_start.bat`, `ngrok_erp.bat`, `run_both_ngrok.bat`, `start_erp.bat`, `tunnel_erp.bat`, `ngrok_dual.yml`.
- **Investigate `bin/`** — if ngrok binary, delete (each dev installs ngrok separately). If anything else, document.
- **Root `package.json` + `package-lock.json`:** If root has no JS code, delete both. Frontend's `package.json` is the only one needed.
- **Add `.gitignore` lines:** `*.zip`, `*.mp4`, `ngrok*`, `__pycache__/`, `.env`, `node_modules/`, `.venv/`, `dist/`, `build/`, `bin/`, `scratch/`, `temp_*/`.

After cleanup, root should contain ONLY: `README.md`, `run.sh`, `run.ps1`, `.env.example`, `.gitignore`, `docs/`, `backend/`, `frontend/`.

### H2. Add `run.sh` and `run.ps1`
**Why:** You have 7+ `.bat` files duct-taping startup. Replace with two universal scripts.
**Change:**
- Create `run.sh` (bash) and `run.ps1` (PowerShell) at repo root — follow the contract in `docs/PROJECT_CONTEXT.md`.
- Must: check Python 3.10+ / Node 18+ / Postgres 14+, install missing deps with prompt, create venv, `pip install -r requirements.txt`, `npm install`, copy `.env.example`→`.env`, run `alembic upgrade head`, start backend on **port 8001** + frontend on **port 5173**.
- Print both URLs on startup. Trap Ctrl-C to clean up both processes.

### H3. Frontend AuthGate — verify every page render
**Why:** You're the auth provider, but your OWN frontend still needs to gate pages — admin dashboards must verify the logged-in user is admin on every render, not on login only.
**Change:**
- `frontend/src/auth/AuthGate.jsx` (new) — wraps router. On mount: `GET /api/auth/me` on your own backend. 401 → redirect to `${VITE_AUTH_URL}/login?redirect=<current-url>` (which is your own login page; loops are fine — login itself is the only public route).
- `backend/routes/auth.py` → add `GET /api/auth/me` — return current user from JWT.
- `frontend/src/api/client.js` (new) — axios w/ auth interceptor.
- **Forbidden:** `?role=...` URL params anywhere. No role in localStorage.
- Per-route role gating: `<AuthGate allowedRoles={['admin','vice_principal','principal']}>` for admin pages.

### H4. Be the role authority for the whole system
**Why:** You issue the JWTs that other 8 modules trust. If any module's local role enum drifts from yours, users get cryptic 403s that no one can debug.
**Change:**
- **Add `Faculty` as a 9th canonical role** in the `Role` table (and any role-string enums) — Attendance and Academic Planning both need it.
- **Add `GET /api/roles/catalog`** — returns the canonical role list as JSON:
  ```json
  { "version": "2026.1", "roles": [
      {"name": "Student", "description": "Enrolled student"},
      {"name": "Guest", "description": "Pre-enrollment / unauthenticated"},
      {"name": "admin", "description": "System administrator"},
      ...
  ]}
  ```
  Other modules should fetch this at startup and warn on drift between their local enum and your list.
- **Enforce role hierarchy on assignment endpoints:** prevent role escalation. A Student calling `POST /roles/assign` to assign themselves admin must get 403. Only `admin` / `principal` may assign roles, and they may NOT assign higher-than-self.
- **Document the role taxonomy** in `docs/roles.md` — for each role, list which modules it can access, what it can do in each.

**This module's role matrix:**

| Role | Access in Auth module |
|---|---|
| Student | `POST /auth/login`, `POST /auth/register`, `POST /auth/refresh`, `POST /auth/logout`, `GET /auth/me` only |
| Guest | Same as Student (pre-login the role doesn't matter; `Guest` is what they're issued post-register, pre-enrollment) |
| admin | Full: all `/users/*`, `/roles/*`, `/admin/*`, `/modules`, `/features`, `/permissions`, `/logs` |
| principal | Same as admin |
| vice_principal | Same as admin |
| hod | Read `/users` and `/users/{id}` for users in **own department only**; can assign roles below admin within own dept; cannot edit RBAC structure |
| accountant | `/auth/me` only — no user/role management |
| TPO | `/auth/me` only — no user/role management |
| Faculty *(pending)* | `/auth/me` + read-only `/users` filtered to own classes (when added) |

### H5. Naming consistency (rename to canonical)
**Why:** Your repo name has a typo (`Authetication`), a redundant suffix (`_latest`), and mixed-case + snake_case in one string. Other modules can't even spell-check `git clone <your-url>` correctly. See full naming rules in `docs/PROJECT_CONTEXT.md`.

**Renames to apply:**

| Current | Target | Notes |
|---|---|---|
| **Repo:** `Authetication_module_ERP_latest` | `pvg-auth` | Fixes typo + drops `_latest` + matches `pvg-*` convention |
| `backend/models.py` → table `users` | (keep, but check PK column) | PK should be `user_id` not bare `id` |
| `UserToken.token` | `UserToken.access_token` | Disambiguates from `refresh_token` |
| `LoginLog` | `login_logs` table | Plural for table; class name `LoginLog` stays singular |
| `RolePermission` join | `role_permissions` table | Plural |
| Legacy `Student` model | (delete after migration — see Module-Specific #10) | |

**JWT claim names — these are public contract; coordinate before changing:**
- Current claims: `sub`, `email`, `role`, `user_id`, `username`, `full_name`, `exp`. All snake_case ✓.
- **Keep `sub` and `exp`** (JWT standard claim names).
- **Add `aud` claim** with target module name (`pvg-sis`, `pvg-fees`, etc.) so other modules can verify the token is intended for them — prevents cross-module replay.

**Role string values are the documented exception** (mixed case allowed): `Student`, `Guest`, `admin`, `principal`, `vice_principal`, `hod`, `accountant`, `TPO`, and the new `Faculty`. Don't lowercase these — other modules already key on them.

**Env vars to standardize** (in `.env.example`):
- `JWT_SECRET` (not `SECRET_KEY` — too generic)
- `JWT_ALGORITHM` (not `ALGORITHM`)
- `DATABASE_URL`
- `AUTH_PORT=8001`
- `ALLOWED_CALLBACK_URLS` (comma-separated)

### H6. Code quality bar (lint, type-check, test)
**Why:** Auth handles secrets and tokens — bugs are security incidents. Automated checks catch what reviewers miss.
**Change:**
- `.pre-commit-config.yaml` at repo root — pin `black`, `ruff` (Python); `prettier`, `eslint` (JS/TS). `pre-commit install` runs in `run.sh`.
- `backend/pyproject.toml` — `ruff` config + `mypy --strict` + `pytest` (coverage threshold 80% — higher for auth module).
- `frontend/.eslintrc.cjs`, `frontend/.prettierrc.json`, `frontend/tsconfig.json` (strict).
- `.editorconfig` at repo root.
- `.github/workflows/ci.yml` — runs lint + type-check + tests + coverage on every PR. Block merge below 80% backend coverage.
- Bonus: SAST (`bandit`) for Python security issues; `npm audit` in frontend CI.

### H7. Observability (health, logging, request IDs)
**Why:** Auth is the most-called module. Every other module hits `/api/auth/verify` (or decodes locally with shared secret). When auth is slow or down, the whole system is. You need instant visibility.
**Change:**
- `GET /healthz` — 200 if process up. No auth.
- `GET /readyz` — 200 if DB reachable. No auth.
- **Structured JSON logging** — replace `print`/`logger.info(str)` with `logger.info("event_name", extra={...})`. Use `python-json-logger`.
- **Request ID middleware** — `backend/app/middleware/request_id.py`: read `X-Request-ID` or generate UUID4; attach to `request.state.request_id`; include in every log line; echo as response header.
- **Sentry stub** — init in `main.py` if `SENTRY_DSN` set.
- **Login + token-revocation events** — log every login (success/fail), every refresh, every revocation with user_id + request_id + IP. Already partially done in `LoginLog`; standardize and expose via `/api/v1/admin/audit-stream`.

### H8. Rate limiting (brute-force defense)
**Why:** You're the auth front door — `/login`, `/register`, `/refresh` are the first targets for credential stuffing and brute force. Without rate limits, attackers can iterate the password space; your DB buckles under the read load.
**Change:**
- Use `slowapi` (FastAPI integration of `limits`). Configure with Redis backend (per umbrella docker-compose Redis).
- Per-IP + per-target limits:
  - `POST /auth/login`: **5/min, 20/hour** (key = `ip + email` — slows targeted attacks; doesn't punish legitimate users behind shared NAT)
  - `POST /auth/register`: **3/min, 10/hour** per IP
  - `POST /auth/refresh`: **30/min** per `refresh_token`
  - `POST /auth/verify` (called by other modules): higher limit, **1000/min** per IP — but only allowlisted module IPs/keys can call.
- Return `429 Too Many Requests` with `Retry-After` header, body `{"code": "rate_limit_exceeded", "retry_after": <seconds>}`.
- Log every rate-limit hit; if >100 hits/24h from same IP, fire to Notify with `AUTH_KEY_2026` (`event_type: alert, priority: high`).

---

## 🔴 Red — Module-Specific (do after hygiene)

### 1. Publish a clear JWT verification contract
**Why:** Other 8 modules need to verify your tokens. Today only some do; some trust URL params (insecure).
**Change:**
- Add a `/api/auth/verify` POST endpoint that accepts `{token}` and returns claims if valid, 401 otherwise.
- Document the exact JWT claim shape in `README.md` so other modules can decode locally with the shared `SECRET_KEY`.
- Files: `backend/routes/auth.py` (add endpoint), `backend/auth.py` (extract `verify_token` helper)

### 2. Provide a reusable middleware snippet
**Why:** Each module currently writes its own auth check. They drift.
**Change:**
- Create `backend/auth_middleware_sample.py` — a copy-paste FastAPI `Depends()` that other modules can drop in. It should:
  - Extract `Authorization: Bearer <token>` header
  - Decode with shared `SECRET_KEY` + `ALGORITHM`
  - Return user claims OR raise 401
- Publish in your README. (Or extract to a tiny PyPI package later.)

### 3. Move `SECRET_KEY` and DB creds to env
**Why:** If `SECRET_KEY` ends up in git, every module's auth is compromised.
**Change:**
- `backend/auth.py` and `backend/database.py` — read `SECRET_KEY`, `ALGORITHM`, `DATABASE_URL` from `os.environ` with no fallback default.
- Add `.env.example` with placeholders. Add `.env` to `.gitignore`.

## 🟠 Orange — Important

### 4. Consolidate package.json files
**Why:** You have 3 `package.json` files (root, `frontend/`, `frontend/admin/`). Confusing for contributors.
**Change:** Decide on one frontend layout — either single SPA or monorepo with explicit workspaces. Document in README.

### 5. Configurable callback URLs
**Why:** Logout currently redirects to a hardcoded ngrok URL in some module frontends.
**Change:**
- `backend/routes/auth.py` — accept `redirect_uri` param on login, validate against an allow-list from env (`ALLOWED_CALLBACK_URLS`).
- Frontend logout button should call your API to get the redirect target rather than hardcoding it.

### 6. Add refresh token rotation tests
**Why:** Refresh token rotation is the riskiest auth feature — if it breaks, users get logged out silently.
**Change:** Add `backend/tests/test_refresh_flow.py` covering: refresh→new pair→old refresh rejected.

## 🟡 Yellow — Polish

### 7. Add `college-erp-theme ^1.1.0` dependency
**Why:** You have 1242 ERP token references but no declared dep — relying on transitive resolution.
**Change:** `frontend/package.json` and `frontend/admin/package.json` — add `"college-erp-theme": "^1.1.0"` explicitly.

### 8. Align FastAPI version to 0.135.x
**Why:** You're on 0.110.0 — others are on 0.135.x/0.136.x. Causes pydantic v1↔v2 friction when sharing code.
**Change:** `backend/requirements.txt` — bump `fastapi==0.135.2`, run tests.

### 9. Document the role taxonomy
**Why:** Roles `Student`, `admin`, `vice_principal`, `principal`, `hod`, `accountant`, `TPO` are scattered in code. Other modules don't know which values to expect.
**Change:** Add `docs/roles.md` listing canonical role strings + which module each is used in.

### 10. Remove legacy `Student` model
**Why:** Backward-compat code is JIT-migrating legacy students on login. Once migrated, this becomes dead weight.
**Change:** Once production confirms all students migrated, delete legacy `Student` model and `/api/signup`, `/api/login`, `/api/me`, `/api/students` routes.
