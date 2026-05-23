from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import models
import schemas
from database import get_db
from auth import oauth2_scheme

router = APIRouter(prefix="/permissions", tags=["Permissions"])


@router.get("", response_model=List[schemas.PermissionOut])
def get_permissions(db: Session = Depends(get_db)):
    """Get Permissions"""
    return db.query(models.Permission).all()


@router.post("", response_model=schemas.PermissionOut)
def create_permission(
    payload: schemas.PermissionCreate,
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme),
):
    """Create Permission"""
    # Verify feature exists
    feature = (
        db.query(models.Feature)
        .filter(models.Feature.feature_id == payload.feature_id)
        .first()
    )
    if not feature:
        raise HTTPException(status_code=400, detail="Feature not found")

    new_permission = models.Permission(**payload.dict())
    db.add(new_permission)
    db.commit()
    db.refresh(new_permission)
    return new_permission


@router.delete("/{permission_id}")
def delete_permission(
    permission_id: int,
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme),
):
    """Delete Permission"""
    permission = (
        db.query(models.Permission)
        .filter(models.Permission.permission_id == permission_id)
        .first()
    )
    if not permission:
        raise HTTPException(status_code=404, detail="Permission not found")

    if permission.role_permissions:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete this permission because it is assigned to one or more roles. Please unassign it first.",
        )

    db.delete(permission)
    db.commit()
    return {"message": "Permission deleted"}
