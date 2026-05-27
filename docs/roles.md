# PVG ERP — Role Taxonomy & Access Matrix

This document is the **single source of truth** for all role strings across the PVG ERP system.
The Auth Module issues all JWTs. Every other module must map their internal roles to these canonical strings.

> **Fetch live catalog:** `GET /api/roles/catalog` — returns the authoritative role list at runtime.
> Other modules should call this at startup and warn if their local enum drifts from this list.

---

## Canonical Role Strings

| Role String | Display Name | Description |
|---|---|---|
| `admin` | IT Admin / Admin | System administrator with full access |
| `principal` | Principal | College principal — read-all + role assignment up to HOD |
| `vice_principal` | Vice Principal | Same access as principal |
| `hod` | HOD | Head of Department — dept-scoped user management |
| `Faculty` | Class / Subject Teacher | Teaching faculty — own classes in Attendance + Academic Planning |
| `MOOC Coordinator` | MOOC Coordinator | Manages MOOC courses and certifications |
| `accountant` | Accountant / TPO | Finance access + placement officer |
| `Non-Teaching Staff` | Non-Teaching Staff | Administrative non-teaching staff |
| `Student` | Student | Enrolled student |
| `Guest` | Guest | Pre-enrollment — issued post-register, pre-enrollment |

---

## Role Hierarchy (for assignment enforcement)

```
admin (100) > principal (90) > vice_principal (80) > hod (70)
  > Faculty (60) > accountant / TPO (50) > Student (10) > Guest (0)
```

A user cannot assign a role **≥ their own level** (except `admin` who may assign anything).

---

## Auth Module Access Matrix

| Role | Allowed Endpoints in Auth Module |
|---|---|
| `Student` | `POST /auth/login`, `POST /auth/register`, `POST /auth/refresh`, `POST /auth/logout`, `GET /auth/me` |
| `Guest` | Same as Student (pre-login role doesn't matter; Guest is issued post-register) |
| `Faculty` | `GET /auth/me` + read-only `/users` filtered to own classes |
| `MOOC Coordinator` | `GET /auth/me` only |
| `accountant` | `GET /auth/me` only |
| `Non-Teaching Staff` | `GET /auth/me` only |
| `hod` | Read `/users` and `/users/{id}` for own department only; can assign roles below `admin` within own dept |
| `principal` | Full access: all `/users/*`, `/roles/*`, `/admin/*`, `/modules`, `/features`, `/permissions`, `/logs` |
| `vice_principal` | Same as `principal` |
| `admin` | Full access to everything including RBAC structure |

---

## Cross-Module Role Usage

| Role | Auth | SIS | Fees | Placement | Attendance | Academic Planning | Admission |
|---|---|---|---|---|---|---|---|
| `admin` | Full | Full | Full | Full | Full | Full | Full |
| `principal` | Full | Read-all | Read-all | Read-all | Read-all | Read-all | Read-all |
| `vice_principal` | Full | Read-all | Read-all | Read-all | Read-all | Read-all | Read-all |
| `hod` | Dept-scoped | Dept-scoped | — | — | Dept-scoped | Dept-scoped | — |
| `Faculty` | `/me` only | Own classes | — | — | Mark attendance | Own classes | — |
| `MOOC Coordinator` | `/me` only | — | — | — | — | MOOC management | — |
| `accountant` | `/me` only | — | Full | — | — | — | — |
| `Non-Teaching Staff` | `/me` only | — | — | — | — | — | — |
| `Student` | `/me` only | Own record | Own fees | Own placements | Own attendance | Own timetable | — |
| `Guest` | Login/Register | — | — | — | — | — | Apply |

---

## JWT Claim Shape (contract for other modules)

Every JWT issued by the Auth Module contains these claims:

```json
{
  "sub": "user@email.com",
  "email": "user@email.com",
  "role": "Student",
  "user_id": 123,
  "username": "student123",
  "full_name": "John Doe",
  "exp": 1234567890,
  "jti": "uuid4-unique-per-token"
}
```

**Rules:**
- `sub` and `exp` are standard JWT claims — never remove them.
- `jti` is unique per token — use it for replay detection.
- `role` is the canonical role string from this document — case-sensitive.
- No `aud` claim — modules do not need to configure audience verification.

---

## Verification Contract for Other Modules

Other modules have two options for verifying tokens:

### Option A — Remote Verify (Recommended)
```
POST /api/auth/verify
Body: { "token": "<jwt>" }
Response 200: { "valid": true, "payload": { ...claims } }
Response 401: Token invalid or revoked
```

### Option B — Local Decode
Use the shared `JWT_SECRET` with `python-jose`:
```python
from jose import jwt
payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"], options={"verify_aud": False})
```
See `backend/auth_middleware_sample.py` for the full copy-paste FastAPI `Depends()` snippet.
