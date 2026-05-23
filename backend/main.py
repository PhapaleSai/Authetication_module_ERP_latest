import uuid
import logging
import time
from pythonjsonlogger import jsonlogger
from fastapi import FastAPI, Request
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


app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Allow React dev server and production nginx
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allowed all for easy localtunnel access
    allow_credentials=False,  # MUST be False when allow_origins is '*'
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
