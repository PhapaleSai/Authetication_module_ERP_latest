from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import models
import schemas
from database import get_db
from auth import get_current_user

router = APIRouter(prefix="/roles", tags=["Authorization"])


@router.get("", response_model=List[schemas.RoleOut])
def get_roles(db: Session = Depends(get_db)):
    """
    Return all available roles.
    """
    roles = db.query(models.Role).all()
    return roles


@router.get("/catalog")
def get_roles_catalog(db: Session = Depends(get_db)):
    """
    Publish a definitive, canonical catalog of roles for all modules.
    Ensures 'faculty' exists as a core role.
    """
    roles = db.query(models.Role).all()
    role_names = [r.role_name.lower() for r in roles]

    # Ensure Faculty exists in the catalog as requested by other modules
    if "faculty" not in role_names:
        faculty_role = models.Role(
            role_name="faculty",
            description="Canonical role for Attendance and Academic Planning",
            created_by="system",
            created_from="auto-provision",
        )
        db.add(faculty_role)
        db.commit()
        db.refresh(faculty_role)
        roles.append(faculty_role)

    return {
        "catalog": [r.role_name for r in roles],
        "message": "Canonical role catalog for cross-module SSO mapping.",
    }


@router.post("/assign", response_model=schemas.AssignRoleResponse)
def assign_role(
    payload: schemas.AssignRoleRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    # ... (existing code stays)
    user = db.query(models.User).filter(models.User.user_id == payload.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    role = db.query(models.Role).filter(models.Role.role_name == payload.role).first()
    if not role:
        raise HTTPException(status_code=400, detail="Role not found")

    # Role Hierarchy Enforcement
    hierarchy = {
        "admin": 100,
        "principal": 90,
        "vice_principal": 80,
        "hod": 70,
        "faculty": 60,
        "accountant": 50,
        "tpo": 50,
        "student": 10,
        "guest": 0,
    }

    current_level = hierarchy.get(current_user.role.lower(), 0)
    target_level = hierarchy.get(role.role_name.lower(), 0)

    # You cannot assign a role higher or equal to your own, unless you are admin
    if current_user.role.lower() != "admin" and target_level >= current_level:
        raise HTTPException(
            status_code=403,
            detail="Forbidden: Cannot assign a role higher or equal to your own",
        )

    db.query(models.UserRole).filter(models.UserRole.user_id == user.user_id).delete()

    new_user_role = models.UserRole(
        user_id=user.user_id,
        role_id=role.role_id,
        created_by=current_user.email,
        token_expiry=getattr(current_user, "token_expiry", None),
    )
    db.add(new_user_role)
    db.commit()
    return {"message": "Role assigned successfully"}


@router.put("/{role_id}/permissions")
def update_role_permissions(
    role_id: int,
    payload: List[str],
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Update permissions for a specific role."""
    # Simple role check here since it's an admin operation
    if current_user.role not in ["admin", "vice_principal"]:
        raise HTTPException(status_code=403, detail="Forbidden")

    role = db.query(models.Role).filter(models.Role.role_id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")

    # Clear existing
    db.query(models.RolePermission).filter(
        models.RolePermission.role_id == role_id
    ).delete()

    # Add new
    for perm_name in payload:
        perm = (
            db.query(models.Permission)
            .filter(models.Permission.permission_name == perm_name)
            .first()
        )
        if perm:
            new_rp = models.RolePermission(
                role_id=role_id, permission_id=perm.permission_id
            )
            db.add(new_rp)

    role.updated_by = current_user.email
    db.commit()
    return {"message": "Permissions updated", "permissions": role.permissions}
