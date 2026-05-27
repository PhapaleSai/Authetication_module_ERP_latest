import uuid
import logging
import time
import os
import json
import math
from pythonjsonlogger import jsonlogger
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from database import engine
import models
from routes import (
    auth,
    student,
    roles,
    users,
    admin,
    modules,
    features,
    permissions,
    logs,
)
from auth import limiter

# Create all tables on startup (including new users & roles tables)
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="PVG College Auth API",
    version="2.0.0",
    description="Authentication & Authorization API with User Management",
)

# ── Logging Setup ────────────────────────────────────────────────────────────
logger = logging.getLogger("pvg_auth")
logger.setLevel(logging.INFO)
logHandler = logging.StreamHandler()
formatter = jsonlogger.JsonFormatter("%(asctime)s %(levelname)s %(name)s %(message)s")
logHandler.setFormatter(formatter)
if not logger.handlers:
    logger.addHandler(logHandler)


# ── Middleware ───────────────────────────────────────────────────────────────
@app.middleware("http")
async def request_id_and_logging_middleware(request: Request, call_next):
    request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
    request.state.request_id = request_id

    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time

    logger.info(
        "request_completed",
        extra={
            "request_id": request_id,
            "method": request.method,
            "url": str(request.url),
            "status_code": response.status_code,
            "process_time_ms": round(process_time * 1000, 2),
        },
    )

    response.headers["X-Request-ID"] = request_id
    return response


def custom_rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded) -> JSONResponse:
    retry_after = getattr(exc, "retry_after", 60)
    if retry_after is not None:
        retry_after = math.ceil(retry_after)
    else:
        retry_after = 60
    
    response = JSONResponse(
        status_code=429,
        content={"detail": f"Rate limit exceeded: {exc.detail}"}
    )
    response.headers["Retry-After"] = str(retry_after)
    return response

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, custom_rate_limit_exceeded_handler)

@app.middleware("http")
async def rate_limit_email_extractor(request: Request, call_next):
    path = request.url.path
    if path in ["/api/auth/login", "/api/auth/register", "/api/auth/refresh", "/api/login", "/api/signup"]:
        try:
            body = await request.body()
            request._body = body
            
            email = None
            try:
                data = json.loads(body)
                email = data.get("email") or data.get("username")
            except json.JSONDecodeError:
                import urllib.parse
                form_data = urllib.parse.parse_qs(body.decode("utf-8"))
                email_list = form_data.get("username") or form_data.get("email")
                if email_list:
                    email = email_list[0]
            
            if email:
                request.state.email = email
        except Exception:
            pass
            
    return await call_next(request)

allowed_origins_raw = os.getenv("ALLOWED_CALLBACK_URLS", "")
allowed_origins = [origin.strip() for origin in allowed_origins_raw.split(",") if origin.strip()]
if not allowed_origins:
    allowed_origins = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5176",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── New routers (spec endpoints) ──────────────────────────────────────────────
app.include_router(
    auth.router, prefix="/api"
)  # POST /api/auth/login, POST /api/auth/logout
app.include_router(
    roles.router, prefix="/api"
)  # GET /api/roles, POST /api/roles/assign
app.include_router(
    users.router, prefix="/api"
)  # GET /api/users, GET /api/users/{user_id}
app.include_router(
    admin.router, prefix="/api"
)  # GET /api/admin/stats, /users, /roles, /audit
app.include_router(modules.router, prefix="/api")  # GET, POST, DELETE /api/modules
app.include_router(features.router, prefix="/api")  # GET, POST, DELETE /api/features
app.include_router(
    permissions.router, prefix="/api"
)  # GET, POST, DELETE /api/permissions
app.include_router(logs.router, prefix="/api")  # GET /api/logs

# ── Legacy routers ────────────────────────────────────────────────────────────
app.include_router(
    student.router
)  # /api/signup, /api/login (old), /api/me, /api/students


@app.get("/")
def root():
    return {
        "message": "PVG College Auth API v2 is running — visit /docs for the interactive API docs"
    }


@app.get("/healthz", tags=["Observability"])
def healthz():
    """Liveness probe"""
    return {"status": "ok"}


@app.get("/readyz", tags=["Observability"])
def readyz():
    """Readiness probe"""
    from sqlalchemy import text

    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"status": "ready"}
    except Exception as e:
        logger.error("db_not_ready", extra={"error": str(e)})
        from fastapi import HTTPException

        raise HTTPException(status_code=503, detail="Database not ready")
