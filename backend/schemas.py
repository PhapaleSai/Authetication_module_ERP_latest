from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, EmailStr


# ── Auth ────────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str
    role: str
    user_id: int
    username: str
    full_name: Optional[str] = None
    permissions: List[str] = []
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class LogoutResponse(BaseModel):
    message: str


class TokenRefreshRequest(BaseModel):
    refresh_token: str


# ── System ──────────────────────────────────────────────────────────────────

class ModuleCreate(BaseModel):
    module_name: str
    description: Optional[str] = None


class ModuleOut(BaseModel):
    module_id: int
    module_name: str
    description: Optional[str] = None

    class Config:
        from_attributes = True


class FeatureCreate(BaseModel):
    feature_name: str
    description: Optional[str] = None
    module_id: int


class FeatureOut(BaseModel):
    feature_id: int
    feature_name: str
    description: Optional[str] = None
    module_id: Optional[int] = None

    class Config:
        from_attributes = True


class PermissionCreate(BaseModel):
    permission_name: str
    action: str
    feature_id: int


class PermissionOut(BaseModel):
    permission_id: int
    permission_name: str
    action: Optional[str] = None
    feature_id: Optional[int] = None

    class Config:
        from_attributes = True


class RolePermissionOut(BaseModel):
    role_permission_id: int
    role_id: int
    permission_id: int

    class Config:
        from_attributes = True


class LoginLogOut(BaseModel):
    login_log_id: int
    user_id: Optional[int] = None
    ip_address: Optional[str] = None
    device_info: Optional[str] = None
    status: Optional[str] = None
    login_time: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Roles ───────────────────────────────────────────────────────────────────

class RoleOut(BaseModel):
    role_id: int
    role_name: str

    class Config:
        from_attributes = True


class AssignRoleRequest(BaseModel):
    user_id: int
    role: str


class AssignRoleResponse(BaseModel):
    message: str


# ── Users ───────────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    username: str
    full_name: Optional[str] = None
    email: EmailStr
    password: str
    department: Optional[str] = None
    phone_number: Optional[str] = None

class UserOut(BaseModel):
    user_id: int
    username: str
    full_name: Optional[str] = None
    email: str
    department: Optional[str] = None
    phone_number: Optional[str] = None
    role: Optional[str] = None
    permissions: List[str] = []
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Legacy schemas (kept for backward compatibility) ─────────────────────────

class StudentCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class StudentOut(BaseModel):
    id: int
    name: str
    email: Optional[str] = None
    phone: str
    username: str

    class Config:
        from_attributes = True
