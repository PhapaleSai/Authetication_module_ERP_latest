from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import models
import schemas
from database import get_db
from auth import oauth2_scheme, get_current_user

router = APIRouter(prefix="/features", tags=["Features"], dependencies=[Depends(get_current_user)])


@router.get("", response_model=List[schemas.FeatureOut])
def get_features(db: Session = Depends(get_db)):
    """Get Features"""
    return db.query(models.Feature).all()


@router.post("", response_model=schemas.FeatureOut)
def create_feature(
    payload: schemas.FeatureCreate,
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme),
):
    """Create Feature"""
    new_feature = models.Feature(**payload.dict())
    db.add(new_feature)
    db.commit()
    db.refresh(new_feature)
    return new_feature


@router.delete("/{feature_id}")
def delete_feature(
    feature_id: int, db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)
):
    """Delete Feature"""
    feature = (
        db.query(models.Feature).filter(models.Feature.feature_id == feature_id).first()
    )
    if not feature:
        raise HTTPException(status_code=404, detail="Feature not found")

    if feature.permissions:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete this feature because permissions are attached to it. Please delete the associated permissions first.",
        )

    db.delete(feature)
    db.commit()
    return {"message": "Feature deleted"}
