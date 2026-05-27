from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import models
import schemas
from database import get_db
from auth import get_current_user

router = APIRouter(prefix="/roles", tags=["Authorization"])


@router.get("", response_model=List[schemas.RoleOut])
def get_roles(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """
    Return all available roles.
    """
    roles = db.query(models.Role).all()
    return roles


@router.get("/catalog")
def get_roles_catalog(db: Session = Depends(get_db)):
    """
    Publish a definitive, canonical catalog of roles for all modules.
    Ensures all 9 canonical roles exist in the database.
    """
    canonical_roles = {
        "admin": "System administrator with full access",
        "principal": "Head of the institution",
        "vice_principal": "Deputy head of the institution",
        "hod": "Head of Department",
        "faculty": "Teaching staff",
        "accountant": "Fees & Finance",
        "tpo": "Placement Officer",
        "student": "Enrolled student",
        "guest": "Unenrolled / Pre-signup"
    }

    roles = db.query(models.Role).all()
    role_names = [r.role_name.lower() for r in roles]

    for rname, desc in canonical_roles.items():
        if rname not in role_names:
            new_role = models.Role(
                role_name=rname,
                description=desc,
                created_by="system",
                created_from="auto-provision",
            )
            db.add(new_role)
            db.commit()
            db.refresh(new_role)
            roles.append(new_role)

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
