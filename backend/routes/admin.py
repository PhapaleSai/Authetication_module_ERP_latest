"""
Admin-only API endpoints for the dashboard.
Provides stats, user management, and audit info.
"""

from typing import List, Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

import models
from database import get_db
from auth import get_current_user

router = APIRouter(prefix="/admin", tags=["Admin Dashboard"])


# ── Schemas ──────────────────────────────────────────────────────────────────


class DashboardStats(BaseModel):
    total_users: int
    total_roles: int
    active_sessions: int
    total_tokens: int
    user_growth: List[dict] = []
    login_growth: List[dict] = []


class UserDetail(BaseModel):
    user_id: int
    username: str
    email: str
    role: Optional[str] = None
    status: Optional[bool] = True
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class RoleDetail(BaseModel):
    role_id: int
    role_name: str
    description: Optional[str] = None
    permissions: List[str] = []
    user_count: int = 0

    class Config:
        from_attributes = True


class AuditEntry(BaseModel):
    action: str
    user: str
    detail: str
    timestamp: str
    ip: Optional[str] = None


# ── Helper ───────────────────────────────────────────────────────────────────


def _require_admin(user: models.User):
    """Ensure the user has an admin-level role."""
    allowed = {"admin", "vice_principal", "hod", "principal", "accountant"}
    if user.role not in allowed:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions. Admin-level role required.",
        )


# ── Endpoints ────────────────────────────────────────────────────────────────


@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    _require_admin(current_user)
    total_users = db.query(models.User).count()
    total_roles = db.query(models.Role).count()
    active_sessions = (
        db.query(models.UserToken)
        .filter(
            models.UserToken.is_active,
            models.UserToken.expiry_date > datetime.utcnow(),
        )
        .count()
    )
    total_tokens = db.query(models.UserToken).count()
    return DashboardStats(
        total_users=total_users,
        total_roles=total_roles,
        active_sessions=active_sessions,
        total_tokens=total_tokens,
    )


@router.get("/users", response_model=List[UserDetail])
def get_all_users_admin(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    _require_admin(current_user)
    users = db.query(models.User).all()
    return [
        UserDetail(
            user_id=u.user_id,
            username=u.username,
            email=u.email,
            role=u.role,
            status=u.status,
            created_at=u.created_at if hasattr(u, "created_at") else None,
        )
        for u in users
    ]


@router.get("/users/{user_id}", response_model=UserDetail)
def get_user_detail_admin(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    _require_admin(current_user)
    user = db.query(models.User).filter(models.User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return UserDetail(
        user_id=user.user_id,
        username=user.username,
        email=user.email,
        role=user.role,
        status=user.status,
        created_at=user.created_at if hasattr(user, "created_at") else None,
    )


@router.get("/roles", response_model=List[RoleDetail])
def get_all_roles_admin(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    _require_admin(current_user)
    roles = db.query(models.Role).all()
    result = []
    for r in roles:
        count = (
            db.query(models.UserRole)
            .filter(models.UserRole.role_id == r.role_id)
            .count()
        )
        result.append(
            RoleDetail(
                role_id=r.role_id,
                role_name=r.role_name,
                description=r.description,
                permissions=r.permissions or [],
                user_count=count,
            )
        )
    return result


@router.get("/audit", response_model=List[AuditEntry])
def get_audit_log(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    _require_admin(current_user)
    logs = (
        db.query(models.LoginLog)
        .order_by(models.LoginLog.login_time.desc())
        .limit(50)
        .all()
    )
    entries = []
    for entry in logs:
        # Construct a nice display name
        display_user = "unknown"
        if entry.user:
            display_user = entry.user.username or entry.user.email

        entries.append(
            AuditEntry(
                action="Login",
                user=display_user,
                detail=f"Status: {entry.status}",
                timestamp=(
                    entry.login_time.strftime("%Y-%m-%d %H:%M:%S") if entry.login_time else ""
                ),
                ip=entry.ip_address,
            )
        )
    return entries


@router.get("/telemetry")
def get_telemetry(
    time_range: str = "7d",
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Returns registration and login telemetry for the specified range."""
    _require_admin(current_user)

    now = datetime.utcnow()
    results = []

    if time_range == "24h":
        # Group by Hour for the last 24 hours
        for i in range(23, -1, -1):
            target_time = now - timedelta(hours=i)
            hour_start = datetime(
                target_time.year,
                target_time.month,
                target_time.day,
                target_time.hour,
                0,
                0,
            )
            hour_end = hour_start + timedelta(hours=1)

            user_count = (
                db.query(models.User)
                .filter(
                    models.User.created_at >= hour_start,
                    models.User.created_at < hour_end,
                )
                .count()
            )

            login_count = (
                db.query(models.LoginLog)
                .filter(
                    models.LoginLog.login_time >= hour_start,
                    models.LoginLog.login_time < hour_end,
                )
                .count()
            )

            results.append(
                {
                    "time": hour_start.strftime("%H:%M"),
                    "users": user_count,
                    "sessions": login_count,
                }
            )
    else:
        # Group by Day for 7d or 30d
        days_to_fetch = 7 if time_range == "7d" else 30
        days_of_week = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

        for i in range(days_to_fetch - 1, -1, -1):
            target_date = now - timedelta(days=i)
            day_start = datetime(
                target_date.year, target_date.month, target_date.day, 0, 0, 0
            )
            day_end = day_start + timedelta(days=1)

            user_count = (
                db.query(models.User)
                .filter(
                    models.User.created_at >= day_start,
                    models.User.created_at < day_end,
                )
                .count()
            )

            login_count = (
                db.query(models.LoginLog)
                .filter(
                    models.LoginLog.login_time >= day_start,
                    models.LoginLog.login_time < day_end,
                )
                .count()
            )

            results.append(
                {
                    "day": days_of_week[target_date.weekday()],
                    "date": day_start.strftime("%Y-%m-%d"),
                    "users": user_count,
                    "sessions": login_count,
                }
            )

    return results


@router.get("/traffic")
def get_traffic_data(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Returns token creation counts grouped by hour for the last 24 hours."""
    _require_admin(current_user)

    # We'll generate a list of the last 24 hours
    now = datetime.utcnow()
    results = []

    for i in range(23, -1, -1):
        start_time = now - timedelta(hours=i + 1)
        end_time = now - timedelta(hours=i)

        count = (
            db.query(models.UserToken)
            .filter(
                models.UserToken.created_at >= start_time,
                models.UserToken.created_at < end_time,
            )
            .count()
        )

        results.append(
            {
                "time": end_time.strftime("%H:00"),
                "value": count + 5,  # Base value for demo visualization
            }
        )

    return results


@router.get("/export/data")
def export_system_data(
    data_type: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Generic endpoint to pull data for export."""
    _require_admin(current_user)

    if data_type == "users":
        users = db.query(models.User).all()
        return [
            {
                "id": u.user_id,
                "username": u.username,
                "email": u.email,
                "role": u.role,
                "status": "Active" if u.status else "Inactive",
                "joined": u.created_at.strftime("%Y-%m-%d") if u.created_at else "N/A",
            }
            for u in users
        ]
    elif data_type == "audit":
        logs = (
            db.query(models.LoginLog).order_by(models.LoginLog.login_time.desc()).all()
        )
        return [
            {
                "action": "Login",
                "user": entry.user.email if entry.user else "unknown",
                "timestamp": (
                    entry.login_time.strftime("%Y-%m-%d %H:%M:%S") if entry.login_time else ""
                ),
                "ip": entry.ip_address or "0.0.0.0",
                "status": entry.status,
            }
            for entry in logs
        ]
    else:
        raise HTTPException(status_code=400, detail="Invalid data type")
