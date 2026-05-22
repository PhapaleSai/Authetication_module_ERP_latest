from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

import models
import schemas
from database import get_db
from auth import get_current_user

router = APIRouter(prefix="/users", tags=["User Management"])


@router.get("/me", response_model=schemas.UserOut)
def get_user_me(current_user: models.User = Depends(get_current_user)):
    """
    Return the authenticated user's profile, including role and permissions.
    """
    permissions = []
    for ur in current_user.user_roles:
        if ur.role and ur.role.permissions:
            permissions.extend(ur.role.permissions)

    return {
        "user_id": current_user.user_id,
        "username": current_user.username,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "role": current_user.role,
        "permissions": list(set(permissions)),
        "created_at": current_user.created_at,
        "updated_at": current_user.updated_at,
    }


from typing import Optional

@router.get("", response_model=List[schemas.UserOut])
def get_all_users(
    role: Optional[str] = None,
    department: Optional[str] = None,
    email: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Return a list of registered users. Supports filtering by role, department, and email.
    """
    query = db.query(models.User)

    if email:
        query = query.filter(models.User.email == email)
    if department:
        query = query.filter(models.User.department == department)
    if role:
        # Join UserRole and Role to filter by role_name
        query = query.join(models.UserRole).join(models.Role).filter(models.Role.role_name == role)

    users = query.all()
    return users


@router.get("/{user_id}", response_model=schemas.UserOut)
def get_user_by_id(user_id: int, db: Session = Depends(get_db)):
    """
    Return a single user by their user_id.
    """
    user = db.query(models.User).filter(models.User.user_id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {user_id} not found",
        )
    return user
