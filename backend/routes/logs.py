from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

import models
import schemas
from database import get_db
from auth import get_current_user

router = APIRouter(prefix="/logs", tags=["Logs"], dependencies=[Depends(get_current_user)])


@router.get("", response_model=List[schemas.LoginLogOut])
def get_logs(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Get Logs"""
    allowed = {"admin", "vice_principal", "hod", "principal", "accountant"}
    user_role = (current_user.role or "").lower().replace(" ", "_")
    allowed_normalized = {role.lower().replace(" ", "_") for role in allowed}
    if user_role not in allowed_normalized:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions. Admin-level role required.",
        )
    return (
        db.query(models.LoginLog)
        .order_by(models.LoginLog.login_time.desc())
        .limit(100)
        .all()
    )
