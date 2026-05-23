from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class AuditMixin:
    """
    Mixin to add audit fields to models.
    """

    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    created_by = Column(String(150), nullable=True)
    updated_by = Column(String(150), nullable=True)
    created_from = Column(String(100), nullable=True)
    token_expiry = Column(DateTime, nullable=True)


class TimestampMixin:
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())


class Module(Base, TimestampMixin):
    __tablename__ = "modules"

    module_id = Column(Integer, primary_key=True, index=True)
    module_name = Column(String(100), nullable=False)
    description = Column(String, nullable=True)

    features = relationship("Feature", back_populates="module")


class Feature(Base, TimestampMixin):
    __tablename__ = "features"

    feature_id = Column(Integer, primary_key=True, index=True)
    feature_name = Column(String(100), nullable=False)
    description = Column(String, nullable=True)
    module_id = Column(Integer, ForeignKey("modules.module_id"))

    module = relationship("Module", back_populates="features")
    permissions = relationship("Permission", back_populates="feature")


class Permission(Base, TimestampMixin):
    __tablename__ = "permissions"

    permission_id = Column(Integer, primary_key=True, index=True)
    permission_name = Column(String(150), nullable=False)
    action = Column(String(50), nullable=True)
    feature_id = Column(Integer, ForeignKey("features.feature_id"))

    feature = relationship("Feature", back_populates="permissions")
    role_permissions = relationship("RolePermission", back_populates="permission")


class RolePermission(Base, TimestampMixin):
    __tablename__ = "role_permissions"

    role_permission_id = Column(Integer, primary_key=True, index=True)
    role_id = Column(Integer, ForeignKey("roles.role_id"))
    permission_id = Column(Integer, ForeignKey("permissions.permission_id"))

    role = relationship("Role", back_populates="role_permissions")
    permission = relationship("Permission", back_populates="role_permissions")


class Role(Base, AuditMixin):
    __tablename__ = "roles"

    role_id = Column(Integer, primary_key=True, index=True)
    role_name = Column(String(100), unique=True, nullable=False)
    description = Column(String, nullable=True)

    # Relationships
    user_roles = relationship("UserRole", back_populates="role")
    role_permissions = relationship("RolePermission", back_populates="role")

    @property
    def permissions(self):
        return list(
            set(
                rp.permission.permission_name
                for rp in self.role_permissions
                if rp.permission
            )
        )


class User(Base, AuditMixin):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False)
    full_name = Column(String(150), nullable=True)
    email = Column(String(150), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    status = Column(Boolean, default=True)
    department = Column(String(100), nullable=True)
    phone_number = Column(String(20), nullable=True)

    # Relationship to user_roles
    user_roles = relationship("UserRole", back_populates="user")
    # Relationship to user_tokens
    tokens = relationship("UserToken", back_populates="user")

    @property
    def role(self):
        roles = [ur.role.role_name for ur in self.user_roles if ur.role]
        return roles[0] if roles else "Guest"


class UserRole(Base, AuditMixin):
    __tablename__ = "user_roles"

    user_role_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"))
    role_id = Column(Integer, ForeignKey("roles.role_id"))

    user = relationship("User", back_populates="user_roles")
    role = relationship("Role", back_populates="user_roles")


class UserToken(Base, AuditMixin):
    __tablename__ = "user_tokens"

    token_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"))
    token = Column(String, unique=True, index=True, nullable=False)
    refresh_token = Column(
        String, unique=True, index=True, nullable=True
    )  # Added refresh token
    expiry_date = Column(DateTime, nullable=False)
    refresh_token_expiry = Column(DateTime, nullable=True)  # Added refresh token expiry
    is_active = Column(Boolean, default=True)

    user = relationship("User", back_populates="tokens")


class LoginLog(Base, AuditMixin):
    __tablename__ = "login_log"

    login_log_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"))
    ip_address = Column(String(50), nullable=True)
    device_info = Column(String(255), nullable=True)
    status = Column(String(50), nullable=True)
    login_time = Column(DateTime, default=func.now())

    user = relationship("User")


# Keep the old Student model so existing root APIs don't break
class Student(Base, AuditMixin):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=True)
    phone = Column(String(15), nullable=False)
    username = Column(String(50), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
