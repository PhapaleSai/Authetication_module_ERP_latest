from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import models
import schemas
from database import get_db
from auth import oauth2_scheme

router = APIRouter(prefix="/modules", tags=["Modules"])


@router.get("", response_model=List[schemas.ModuleOut])
def get_modules(db: Session = Depends(get_db)):
    """Get Modules"""
    return db.query(models.Module).all()


@router.post("", response_model=schemas.ModuleOut)
def create_module(
    payload: schemas.ModuleCreate,
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme),
):
    """Create Module"""
    new_module = models.Module(**payload.dict())
    db.add(new_module)
    db.commit()
    db.refresh(new_module)
    return new_module


@router.delete("/{module_id}")
def delete_module(
    module_id: int, db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)
):
    """Delete Module"""
    module = (
        db.query(models.Module).filter(models.Module.module_id == module_id).first()
    )
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")

    if module.features:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete this module because it has features attached to it. Please delete the associated features first.",
        )

    db.delete(module)
    db.commit()
    return {"message": "Module deleted"}
