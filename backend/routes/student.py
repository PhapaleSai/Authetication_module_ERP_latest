from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import schemas
from auth import get_current_student
from database import get_db
import models

router = APIRouter(prefix="/api", tags=["student"])


class LegacyLoginRequest(schemas.BaseModel):
    username: str
    password: str


@router.post("/signup", response_model=schemas.StudentOut, status_code=201)
def signup(student: schemas.StudentCreate, db: Session = Depends(get_db)):
    from sqlalchemy import or_

    # Check if student already exists by username or email
    db_student = (
        db.query(models.Student)
        .filter(
            or_(
                models.Student.username == student.username,
                models.Student.email == student.email,
            )
        )
        .first()
    )
    if db_student:
        raise HTTPException(
            status_code=400, detail="Username or email already registered"
        )

    # Auto-provision check in user table too
    existing_user = (
        db.query(models.User)
        .filter(
            or_(
                models.User.username == student.username,
                models.User.email == student.email,
            )
        )
        .first()
    )
    if existing_user:
        raise HTTPException(
            status_code=400, detail="Username or email already registered"
        )

    from auth import (
        get_password_hash,
        create_access_token,
        create_refresh_token,
        ACCESS_TOKEN_EXPIRE_MINUTES,
        REFRESH_TOKEN_EXPIRE_DAYS,
    )
    from datetime import datetime, timedelta

    new_student = models.Student(
        name=student.name,
        email=student.email,
        phone=student.phone,
        username=student.username,
        password_hash=get_password_hash(student.password),
    )
    db.add(new_student)

    # Create user in new users table
    new_user = models.User(
        username=student.username,
        full_name=student.name,
        email=student.email,
        password_hash=get_password_hash(student.password),
        created_by="system",
        created_from="signup",
    )
    db.add(new_user)
    db.flush()

    student_role = (
        db.query(models.Role).filter(models.Role.role_name == "Student").first()
    )
    if not student_role:
        student_role = models.Role(
            role_name="Student", created_by="system", created_from="signup"
        )
        db.add(student_role)
        db.flush()

    db.add(
        models.UserRole(
            user_id=new_user.user_id,
            role_id=student_role.role_id,
            created_by="system",
            created_from="signup",
            token_expiry=datetime.utcnow() + timedelta(days=365),
        )
    )

    db.commit()
    db.refresh(new_student)
    db.refresh(new_user)

    # Generate access and refresh tokens
    access_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={
            "sub": new_user.email,
            "email": new_user.email,
            "role": "Student",
            "user_id": new_user.user_id,
            "username": new_user.username,
            "full_name": new_user.full_name,
        },
        expires_delta=access_expires,
    )

    refresh_expires = timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    refresh_token = create_refresh_token(data={"sub": new_user.email})

    # Clean up existing tokens for user
    db.query(models.UserToken).filter(
        models.UserToken.user_id == new_user.user_id
    ).delete()

    # Store token in DB so it's active
    now = datetime.utcnow()
    db_token = models.UserToken(
        user_id=new_user.user_id,
        token=access_token,
        refresh_token=refresh_token,
        expiry_date=now + access_expires,
        refresh_token_expiry=now + refresh_expires,
        is_active=True,
        created_at=now,
        updated_at=now,
        created_by=new_user.email,
        created_from="signup",
        token_expiry=now + access_expires,
    )
    db.add(db_token)
    db.commit()

    return {
        "id": new_student.id,
        "name": new_student.name,
        "email": new_student.email,
        "phone": new_student.phone,
        "username": new_student.username,
        "access_token": access_token,
    }


@router.post("/login")
def login(payload: LegacyLoginRequest, db: Session = Depends(get_db)):
    from sqlalchemy import or_

    db_student = (
        db.query(models.Student)
        .filter(
            or_(
                models.Student.username == payload.username,
                models.Student.email == payload.username,
            )
        )
        .first()
    )

    from auth import verify_password, create_access_token

    if not db_student or not verify_password(
        payload.password, db_student.password_hash
    ):
        raise HTTPException(status_code=401, detail="Incorrect username or password")

    # Generate token matching the user email if available
    token_sub = db_student.email if db_student.email else db_student.username
    access_token = create_access_token({"sub": token_sub})
    return {"access_token": access_token, **db_student.__dict__}


@router.get("/me", response_model=schemas.StudentOut)
def get_me(current_student: models.Student = Depends(get_current_student)):
    return current_student


@router.get("/students", response_model=List[schemas.StudentOut])
def get_all_students(db: Session = Depends(get_db)):
    """Admin endpoint — returns all registered students."""
    return db.query(models.Student).all()
