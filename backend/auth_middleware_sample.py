"""
PVG ERP — Auth Middleware Sample
=================================
Drop this file into any other ERP module (SIS, Fees, Placement, etc.) and use
`Depends(verify_pvg_token)` to gate your endpoints behind the Auth Module JWT.

Two verification strategies are provided — pick ONE:

  Strategy A (Recommended): Call Auth Module's /api/auth/verify endpoint.
      + Catches revoked tokens instantly (DB-checked server-side).
      - One network hop per request (~5ms on local network).

  Strategy B (Local decode): Decode the JWT locally using the shared secret.
      + Zero network hops — fastest.
      - Cannot detect revoked/logged-out tokens until expiry.

Usage example
-------------
    from auth_middleware_sample import verify_pvg_token, TokenPayload

    @router.get("/my-protected-route")
    def my_route(claims: TokenPayload = Depends(verify_pvg_token)):
        return {"user_id": claims.user_id, "role": claims.role}

Environment variables required in YOUR module's .env
-----------------------------------------------------
    JWT_SECRET=<same secret shared with Auth Module>
    JWT_ALGORITHM=HS256
    AUTH_MODULE_URL=https://automatic-certify-appointee.ngrok-free.dev
"""

from __future__ import annotations

import os
from typing import Optional

import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from pydantic import BaseModel

# ── Config ────────────────────────────────────────────────────────────────────
AUTH_MODULE_URL: str = os.getenv(
    "AUTH_MODULE_URL",
    "https://automatic-certify-appointee.ngrok-free.dev",
)
JWT_SECRET: str = os.getenv("JWT_SECRET", "")
JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{AUTH_MODULE_URL}/api/auth/login")


# ── Token payload shape (matches Auth Module JWT claims) ─────────────────────
class TokenPayload(BaseModel):
    sub: str  # email address
    email: str
    role: str  # canonical role string e.g. "Student", "Faculty", "admin"
    user_id: int
    username: str
    full_name: str
    exp: Optional[int] = None
    jti: Optional[str] = None


# ── Strategy A — Remote verify (recommended) ──────────────────────────────────
def verify_pvg_token(token: str = Depends(oauth2_scheme)) -> TokenPayload:
    """
    Calls POST /api/auth/verify on the Auth Module.
    Returns decoded claims on success, raises 401 on failure.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    service_exception = HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail="Auth service unavailable — try again shortly",
    )
    try:
        response = httpx.post(
            f"{AUTH_MODULE_URL}/api/auth/verify",
            json={"token": token},
            timeout=5.0,
        )
        if response.status_code != 200:
            raise credentials_exception
        data = response.json()
        payload = data.get("payload", {})
        return TokenPayload(**payload)
    except httpx.RequestError:
        raise service_exception


# ── Strategy B — Local decode (fast, no revocation check) ─────────────────────
def verify_pvg_token_local(token: str = Depends(oauth2_scheme)) -> TokenPayload:
    """
    Decodes the JWT locally using the shared JWT_SECRET.
    Fast but cannot detect revoked tokens until they expire.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=[JWT_ALGORITHM],
            options={"verify_aud": False},
        )
        return TokenPayload(**payload)
    except (JWTError, Exception):
        raise credentials_exception


# ── Role-gating helper ────────────────────────────────────────────────────────
def require_roles(*allowed_roles: str):
    """
    Factory that returns a dependency enforcing specific roles.

    Usage:
        @router.get("/admin-only")
        def admin_page(
            claims: TokenPayload = Depends(require_roles("admin", "principal"))
        ):
            ...
    """

    def _check(claims: TokenPayload = Depends(verify_pvg_token)) -> TokenPayload:
        if claims.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{claims.role}' is not permitted. Required: {list(allowed_roles)}",
            )
        return claims

    return _check
